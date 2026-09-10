import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { CreateEntityDto } from './dto/create-entity.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EntitiesService implements OnModuleInit {
  private readonly logger = new Logger(EntitiesService.name);

  constructor(
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDemoEntities();
    } catch (err: any) {
      this.logger.warn(`Could not seed demo entities (DB may be offline): ${err.message}`);
    }
  }

  async seedDemoEntities() {
    const count = await this.entityModel.countDocuments();
    if (count < 10) {
      this.logger.log('Seeding enterprise intelligence entities...');
      const entitiesToSeed = [
        // Case CR-2026-00124 (Operation Nightfall)
        {
          entityId: 'P-0001',
          type: 'person',
          label: 'Vikram Rathore',
          aliases: ['Vicky', 'VR'],
          riskFlag: true,
          influenceScore: 92.5,
          cases: ['CR-2026-00124'],
          properties: { designation: 'Primary Syndicate Coordinator', nationality: 'Indian' },
        },
        {
          entityId: 'P-0002',
          type: 'person',
          label: 'Sunil Verma',
          aliases: ['SV', 'Pandit'],
          riskFlag: true,
          influenceScore: 84.2,
          cases: ['CR-2026-00124'],
          properties: { designation: 'Mule & Cash Transit Courier' },
        },
        {
          entityId: 'P-0003',
          type: 'person',
          label: 'Karan Malhotra',
          aliases: ['KM', 'Broker'],
          riskFlag: true,
          influenceScore: 76.0,
          cases: ['CR-2026-00124'],
          properties: { designation: 'Financial Broker & Pass-through Controller' },
        },
        {
          entityId: 'O-0001',
          type: 'organization',
          label: 'NorthStar Logistics Pvt Ltd',
          aliases: ['NorthStar'],
          riskFlag: true,
          influenceScore: 78.9,
          cases: ['CR-2026-00124'],
          properties: { jurisdiction: 'Mumbai', regNo: 'U72900MH2021PTC332211' },
        },
        {
          entityId: 'PH-0001',
          type: 'phone',
          label: '+919876543210',
          aliases: [],
          riskFlag: true,
          influenceScore: 65.0,
          cases: ['CR-2026-00124'],
          properties: { carrier: 'Airtel', circle: 'Delhi-NCR' },
        },
        {
          entityId: 'V-0001',
          type: 'vehicle',
          label: 'MH02CD9988',
          aliases: [],
          riskFlag: true,
          influenceScore: 55.0,
          cases: ['CR-2026-00124'],
          properties: { make: 'Toyota', model: 'Fortuner', color: 'Black' },
        },

        // Case CR-2026-00842 (Operation Goldcrest)
        {
          entityId: 'P-0004',
          type: 'person',
          label: 'Rashid Al-Mansoor',
          aliases: ['Sheikh Rashid', 'The Goldsmith'],
          riskFlag: true,
          influenceScore: 94.0,
          cases: ['CR-2026-00842'],
          properties: { designation: 'Gulf Bullion Broker & Token Issuer', nationality: 'Emirati' },
        },
        {
          entityId: 'P-0005',
          type: 'person',
          label: 'Rajesh Singhania',
          aliases: ['Sethji', 'RS Vault'],
          riskFlag: true,
          influenceScore: 88.5,
          cases: ['CR-2026-00842'],
          properties: { designation: 'Karol Bagh Vault Operator' },
        },
        {
          entityId: 'O-0002',
          type: 'organization',
          label: 'Apex Bullion DMCC',
          aliases: ['Apex Bullion'],
          riskFlag: true,
          influenceScore: 89.0,
          cases: ['CR-2026-00842'],
          properties: { jurisdiction: 'Dubai DMCC', license: 'DMCC-99412' },
        },
        {
          entityId: 'O-0003',
          type: 'organization',
          label: 'Golden Horizon Traders',
          aliases: ['Golden Horizon'],
          riskFlag: true,
          influenceScore: 81.0,
          cases: ['CR-2026-00842'],
          properties: { jurisdiction: 'New Delhi', regNo: 'DL-COM-8831' },
        },
        {
          entityId: 'V-0002',
          type: 'vehicle',
          label: 'DL01AB1234',
          aliases: [],
          riskFlag: true,
          influenceScore: 58.0,
          cases: ['CR-2026-00842'],
          properties: { make: 'Mercedes-Benz', model: 'S-Class', color: 'Silver' },
        },
        {
          entityId: 'PH-0002',
          type: 'phone',
          label: '+971508842190',
          aliases: [],
          riskFlag: true,
          influenceScore: 72.0,
          cases: ['CR-2026-00842'],
          properties: { carrier: 'Etisalat', circle: 'Dubai' },
        },

        // Case CR-2026-00315 (Operation Red Sand)
        {
          entityId: 'P-0006',
          type: 'person',
          label: 'Sameer Khan',
          aliases: ['Bhaijaan', 'Sam Logistics'],
          riskFlag: true,
          influenceScore: 86.0,
          cases: ['CR-2026-00315'],
          properties: { designation: 'South Logistics & Fleet Coordinator' },
        },
        {
          entityId: 'P-0007',
          type: 'person',
          label: 'Dinesh Kulkarni',
          aliases: ['DK'],
          riskFlag: true,
          influenceScore: 80.0,
          cases: ['CR-2026-00315'],
          properties: { designation: 'Interstate Escort Lead' },
        },
        {
          entityId: 'O-0004',
          type: 'organization',
          label: 'Royal Freight Carriers',
          aliases: ['RFC Fleet'],
          riskFlag: true,
          influenceScore: 75.0,
          cases: ['CR-2026-00315'],
          properties: { jurisdiction: 'Karnataka', permit: 'All-India Heavy Permit' },
        },
        {
          entityId: 'V-0003',
          type: 'vehicle',
          label: 'KA03NM7788',
          aliases: [],
          riskFlag: true,
          influenceScore: 52.0,
          cases: ['CR-2026-00315'],
          properties: { make: 'Tata Motors', model: 'Multi-Axle Heavy Container', color: 'Blue' },
        },

        // Case CR-2026-00489 (Project Phantom)
        {
          entityId: 'P-0008',
          type: 'person',
          label: 'Priya Sharma',
          aliases: ['PS Gateway'],
          riskFlag: true,
          influenceScore: 82.0,
          cases: ['CR-2026-00489'],
          properties: { designation: 'Mule Account & UPI Gateway Controller' },
        },
        {
          entityId: 'P-0009',
          type: 'person',
          label: 'Tariq Mahmood',
          aliases: ['TM Crypto'],
          riskFlag: true,
          influenceScore: 85.0,
          cases: ['CR-2026-00489'],
          properties: { designation: 'Crypto OTC Liquidator' },
        },
        {
          entityId: 'O-0005',
          type: 'organization',
          label: 'NexaPay Solutions',
          aliases: ['NexaPay'],
          riskFlag: true,
          influenceScore: 87.0,
          cases: ['CR-2026-00489'],
          properties: { jurisdiction: 'Gurugram', type: 'FinTech Payment Aggregator' },
        },
        {
          entityId: 'V-0004',
          type: 'vehicle',
          label: 'HR26DK4091',
          aliases: [],
          riskFlag: true,
          influenceScore: 50.0,
          cases: ['CR-2026-00489'],
          properties: { make: 'Toyota', model: 'Innova Crysta', color: 'Grey' },
        },

        // Case CR-2026-00712 (Operation Eastern Corridor)
        {
          entityId: 'P-0010',
          type: 'person',
          label: 'Amitabh Sen',
          aliases: ['Sen Babu'],
          riskFlag: true,
          influenceScore: 68.0,
          cases: ['CR-2026-00712'],
          properties: { designation: 'Rail Cargo Handler & Forwarder' },
        },
        {
          entityId: 'P-0011',
          type: 'person',
          label: 'Devendra Yadav',
          aliases: ['DY', 'Fauji'],
          riskFlag: true,
          influenceScore: 71.0,
          cases: ['CR-2026-00712'],
          properties: { designation: 'Border Smuggling Courier' },
        },
        {
          entityId: 'O-0006',
          type: 'organization',
          label: 'Eastern Transit Cargo',
          aliases: ['ETC Logistics'],
          riskFlag: true,
          influenceScore: 62.0,
          cases: ['CR-2026-00712'],
          properties: { jurisdiction: 'Patna', permit: 'Eastern Railway Freight' },
        },
        {
          entityId: 'V-0005',
          type: 'vehicle',
          label: 'UP53BX1122',
          aliases: [],
          riskFlag: true,
          influenceScore: 49.0,
          cases: ['CR-2026-00712'],
          properties: { make: 'Mahindra', model: 'Scorpio', color: 'White' },
        },
      ];

      for (const e of entitiesToSeed) {
        await this.entityModel.findOneAndUpdate(
          { entityId: e.entityId },
          { $set: e },
          { upsert: true, new: true },
        );
      }
      this.logger.log('Demo entities successfully synchronized.');
    }
  }

  async create(dto: CreateEntityDto, user: any): Promise<Entity> {
    const existing = await this.entityModel.findOne({ entityId: dto.entityId });
    if (existing) {
      throw new ConflictException(`Entity with ID ${dto.entityId} already exists`);
    }

    const created = new this.entityModel(dto);
    const saved = await created.save();

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'CREATE_ENTITY',
      resourceType: 'entity',
      resourceId: saved.entityId,
      details: { type: saved.type, label: saved.label },
    });

    return saved;
  }

  async findAll(query?: { type?: string; risk?: boolean; caseId?: string; q?: string; limit?: number; skip?: number }) {
    const filter: any = {};
    if (query?.type) filter.type = query.type;
    if (query?.risk !== undefined) filter.riskFlag = query.risk;
    if (query?.caseId) filter.cases = query.caseId;
    if (query?.q) {
      filter.$or = [
        { label: { $regex: query.q, $options: 'i' } },
        { aliases: { $regex: query.q, $options: 'i' } },
        { entityId: { $regex: query.q, $options: 'i' } },
      ];
    }

    const limit = query?.limit ? Number(query.limit) : 100;
    const skip = query?.skip ? Number(query.skip) : 0;

    return this.entityModel
      .find(filter)
      .sort({ influenceScore: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(entityId: string): Promise<Entity> {
    const entity = await this.entityModel.findOne({ entityId }).exec();
    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }
    return entity;
  }
}
