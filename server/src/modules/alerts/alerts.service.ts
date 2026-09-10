import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Alert, AlertDocument } from '../../database/schemas/alert.schema';
import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { Relationship, RelationshipDocument } from '../../database/schemas/relationship.schema';
import { Transaction, TransactionDocument } from '../../database/schemas/transaction.schema';
import { Communication, CommunicationDocument } from '../../database/schemas/communication.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly logger = new Logger(AlertsService.name);
  private mlUrl: string;
  private mlSecret: string;

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    @InjectModel(Relationship.name) private relModel: Model<RelationshipDocument>,
    @InjectModel(Transaction.name) private txnModel: Model<TransactionDocument>,
    @InjectModel(Communication.name) private commModel: Model<CommunicationDocument>,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {
    this.mlUrl = this.configService.get<string>('mlService.url') || 'http://localhost:8001';
    this.mlSecret = this.configService.get<string>('mlService.secret') || 'dev-secret-internal-service-key-2026';
  }

  async onModuleInit() {
    try {
      await this.seedDemoAlerts();
    } catch (err: any) {
      this.logger.warn(`Could not seed demo alerts (DB may be offline): ${err.message}`);
    }
  }

  async seedDemoAlerts() {
    const count = await this.alertModel.countDocuments();
    if (count === 0) {
      this.logger.log('Seeding demo anomaly alerts...');
      await this.alertModel.create([
        {
          alertId: 'ALT-PT-001',
          detectorName: 'pass_through',
          severity: 'critical',
          title: 'Pass-Through Mule Account Identified: Dinesh Kulkarni',
          explanation: 'Account received ₹650,000 from Vikram Rathore and forwarded ₹600,000 (92.3%) to NorthStar Logistics within 4 hours.',
          confidence: 0.94,
          status: 'open',
          entities: [{ id: 'P-0002', type: 'person', label: 'Dinesh Kulkarni' }],
          evidenceIds: ['TX-001', 'TX-002'],
          caseId: 'CR-2026-00124',
          methodology: 'Monitors rapid turnover pass-through behavior (>75% forwarded within 72h).',
        },
        {
          alertId: 'ALT-ODD-001',
          detectorName: 'odd_hour_communications',
          severity: 'medium',
          title: 'Odd-Hour Communication Surge (+919876543210)',
          explanation: 'Target number registered repeated calls at 02:45 AM, characteristic of covert burner phone coordination.',
          confidence: 0.88,
          status: 'open',
          entities: [{ id: 'PH-0001', type: 'phone', label: '+919876543210' }],
          evidenceIds: ['C-001'],
          caseId: 'CR-2026-00124',
          methodology: 'Detects communications concentrated between 00:00 and 05:00.',
        },
      ]);
      this.logger.log('Demo alerts seeded.');
    }
  }

  async findAll(caseId?: string, severity?: string, status?: string) {
    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    return this.alertModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(alertId: string): Promise<Alert> {
    const alert = await this.alertModel.findOne({ alertId }).exec();
    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }
    return alert;
  }

  async updateStatus(alertId: string, status: string, user: any): Promise<Alert> {
    const alert = await this.alertModel
      .findOneAndUpdate({ alertId }, { $set: { status } }, { new: true })
      .exec();

    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE_ALERT_STATUS',
      resourceType: 'alert',
      resourceId: alertId,
      details: { newStatus: status },
    });

    return alert;
  }

  async triggerRefresh(caseId?: string, user?: any) {
    const entityFilter = caseId ? { cases: caseId } : {};
    const relFilter = caseId ? { caseId } : {};
    const txnFilter = caseId ? { caseId } : {};
    const commFilter = caseId ? { caseId } : {};

    const entities = await this.entityModel.find(entityFilter).lean().exec();
    const relationships = await this.relModel.find(relFilter).lean().exec();
    const transactions = await this.txnModel.find(txnFilter).lean().exec();
    const communications = await this.commModel.find(commFilter).lean().exec();

    const payload = {
      nodes: entities.map((e) => ({
        id: e.entityId,
        label: e.label,
        entity_type: e.type,
        risk_flag: e.riskFlag || false,
        properties: e.properties || {},
      })),
      edges: relationships.map((r) => ({
        source: r.sourceId,
        target: r.targetId,
        rel_type: r.relType,
        count: r.weight || 1,
        total_amount: r.totalAmount || 0,
        confidence: r.confidence || 1.0,
        source_type: r.sourceType || 'explicit',
        properties: r.properties || {},
      })),
      transactions: transactions.map((t) => ({
        id: t.transactionId,
        from_type: t.fromType,
        from_id: t.fromId,
        to_type: t.toType,
        to_id: t.toId,
        amount: t.amount,
        timestamp: t.timestamp.toISOString(),
        channel: t.channel,
        is_flagged: t.isFlagged,
      })),
      communications: communications.map((c) => ({
        id: c.communicationId,
        from_number: c.fromNumber,
        to_number: c.toNumber,
        timestamp: c.timestamp.toISOString(),
        duration_seconds: c.durationSeconds,
        tower_id: c.towerId,
        from_person_id: c.fromPersonId,
        to_person_id: c.toPersonId,
      })),
    };

    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/detect-anomalies`,
        payload,
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 10000 },
      );

      const detected = response.data.alerts || [];

      for (const a of detected) {
        await this.alertModel.updateOne(
          { alertId: a.id },
          {
            $set: {
              alertId: a.id,
              detectorName: a.detector_name,
              severity: a.severity,
              title: a.title,
              explanation: a.explanation,
              confidence: a.confidence,
              entities: a.entities,
              evidenceIds: a.evidence_ids,
              caseId: caseId || a.case_id,
              methodology: a.methodology,
            },
          },
          { upsert: true },
        );
      }

      await this.auditService.log({
        userId: user?.userId || 'system',
        userEmail: user?.email || 'system',
        action: 'REFRESH_ANOMALIES',
        resourceType: 'alert',
        resourceId: caseId || 'all',
        details: { detectedCount: detected.length },
      });

      return {
        refreshed: true,
        detectedCount: detected.length,
        alerts: detected,
      };
    } catch (err) {
      this.logger.error(`Error refreshing anomalies with Python ML: ${err.message}`);
      return {
        refreshed: false,
        error: err.message,
      };
    }
  }
}
