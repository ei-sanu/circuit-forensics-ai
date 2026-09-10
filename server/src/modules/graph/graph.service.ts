import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { Relationship, RelationshipDocument } from '../../database/schemas/relationship.schema';
import { Transaction, TransactionDocument } from '../../database/schemas/transaction.schema';
import { Communication, CommunicationDocument } from '../../database/schemas/communication.schema';

@Injectable()
export class GraphService implements OnModuleInit {
  private readonly logger = new Logger(GraphService.name);
  private mlUrl: string;
  private mlSecret: string;

  constructor(
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    @InjectModel(Relationship.name) private relModel: Model<RelationshipDocument>,
    @InjectModel(Transaction.name) private txnModel: Model<TransactionDocument>,
    @InjectModel(Communication.name) private commModel: Model<CommunicationDocument>,
    private configService: ConfigService,
  ) {
    this.mlUrl = this.configService.get<string>('mlService.url') || 'http://localhost:8001';
    this.mlSecret = this.configService.get<string>('mlService.secret') || 'dev-secret-internal-service-key-2026';
  }

  async onModuleInit() {
    try {
      await this.seedDemoGraph();
    } catch (err: any) {
      this.logger.warn(`Could not seed demo graph (DB may be offline): ${err.message}`);
    }
  }

  async seedDemoGraph() {
    const relCount = await this.relModel.countDocuments();
    if (relCount < 15) {
      this.logger.log('Seeding and updating comprehensive enterprise intelligence graph relationships...');

      const relationshipsToSeed = [
        // CR-2026-00124 (Operation Nightfall)
        { sourceId: 'P-0001', targetId: 'P-0002', relType: 'associated_with', weight: 8, confidence: 0.95, caseId: 'CR-2026-00124' },
        { sourceId: 'P-0002', targetId: 'P-0003', relType: 'associated_with', weight: 5, confidence: 0.90, caseId: 'CR-2026-00124' },
        { sourceId: 'P-0002', targetId: 'O-0001', relType: 'employed_by', weight: 1, confidence: 0.99, caseId: 'CR-2026-00124' },
        { sourceId: 'P-0001', targetId: 'PH-0001', relType: 'owns', weight: 1, confidence: 0.95, caseId: 'CR-2026-00124' },
        { sourceId: 'P-0001', targetId: 'V-0001', relType: 'owns', weight: 1, confidence: 0.92, caseId: 'CR-2026-00124' },
        { sourceId: 'P-0003', targetId: 'O-0001', relType: 'transferred_money_to', weight: 3, confidence: 0.94, totalAmount: 1800000, caseId: 'CR-2026-00124' },

        // CR-2026-00842 (Operation Goldcrest)
        { sourceId: 'P-0004', targetId: 'O-0002', relType: 'employed_by', weight: 1, confidence: 0.99, caseId: 'CR-2026-00842' },
        { sourceId: 'P-0004', targetId: 'P-0005', relType: 'associated_with', weight: 6, confidence: 0.93, caseId: 'CR-2026-00842' },
        { sourceId: 'P-0005', targetId: 'O-0003', relType: 'owns', weight: 1, confidence: 0.96, caseId: 'CR-2026-00842' },
        { sourceId: 'P-0004', targetId: 'PH-0002', relType: 'owns', weight: 1, confidence: 0.95, caseId: 'CR-2026-00842' },
        { sourceId: 'P-0005', targetId: 'V-0002', relType: 'owns', weight: 1, confidence: 0.89, caseId: 'CR-2026-00842' },
        { sourceId: 'O-0002', targetId: 'O-0001', relType: 'transferred_money_to', weight: 4, confidence: 0.96, totalAmount: 14500000, caseId: 'CR-2026-00842' },
        { sourceId: 'P-0001', targetId: 'P-0004', relType: 'communicated_with', weight: 18, confidence: 0.97, caseId: 'CR-2026-00842' },

        // CR-2026-00315 (Operation Red Sand)
        { sourceId: 'P-0006', targetId: 'O-0004', relType: 'employed_by', weight: 1, confidence: 0.98, caseId: 'CR-2026-00315' },
        { sourceId: 'P-0006', targetId: 'P-0007', relType: 'associated_with', weight: 7, confidence: 0.91, caseId: 'CR-2026-00315' },
        { sourceId: 'P-0006', targetId: 'V-0003', relType: 'owns', weight: 1, confidence: 0.92, caseId: 'CR-2026-00315' },
        { sourceId: 'P-0007', targetId: 'O-0004', relType: 'employed_by', weight: 1, confidence: 0.95, caseId: 'CR-2026-00315' },
        { sourceId: 'O-0004', targetId: 'O-0001', relType: 'associated_with', weight: 2, confidence: 0.88, caseId: 'CR-2026-00315' },
        { sourceId: 'P-0007', targetId: 'P-0002', relType: 'traveled_with', weight: 3, confidence: 0.90, caseId: 'CR-2026-00315' },

        // CR-2026-00489 (Project Phantom)
        { sourceId: 'P-0008', targetId: 'O-0005', relType: 'employed_by', weight: 1, confidence: 0.99, caseId: 'CR-2026-00489' },
        { sourceId: 'P-0008', targetId: 'P-0009', relType: 'associated_with', weight: 5, confidence: 0.94, caseId: 'CR-2026-00489' },
        { sourceId: 'P-0009', targetId: 'O-0005', relType: 'transferred_money_to', weight: 6, confidence: 0.96, totalAmount: 4200000, caseId: 'CR-2026-00489' },
        { sourceId: 'P-0008', targetId: 'V-0004', relType: 'owns', weight: 1, confidence: 0.89, caseId: 'CR-2026-00489' },
        { sourceId: 'O-0005', targetId: 'O-0003', relType: 'transferred_money_to', weight: 8, confidence: 0.95, totalAmount: 6800000, caseId: 'CR-2026-00489' },
        { sourceId: 'P-0009', targetId: 'P-0004', relType: 'communicated_with', weight: 12, confidence: 0.92, caseId: 'CR-2026-00489' },

        // CR-2026-00712 (Operation Eastern Corridor)
        { sourceId: 'P-0010', targetId: 'O-0006', relType: 'employed_by', weight: 1, confidence: 0.97, caseId: 'CR-2026-00712' },
        { sourceId: 'P-0010', targetId: 'P-0011', relType: 'associated_with', weight: 6, confidence: 0.90, caseId: 'CR-2026-00712' },
        { sourceId: 'P-0011', targetId: 'V-0005', relType: 'owns', weight: 1, confidence: 0.88, caseId: 'CR-2026-00712' },
        { sourceId: 'P-0011', targetId: 'O-0006', relType: 'employed_by', weight: 1, confidence: 0.94, caseId: 'CR-2026-00712' },
        { sourceId: 'O-0006', targetId: 'O-0004', relType: 'associated_with', weight: 3, confidence: 0.87, caseId: 'CR-2026-00712' },
        { sourceId: 'P-0010', targetId: 'P-0003', relType: 'communicated_with', weight: 9, confidence: 0.91, caseId: 'CR-2026-00712' },
        { sourceId: 'PH-0001', targetId: 'PH-0002', relType: 'communicated_with', weight: 22, confidence: 0.99, caseId: 'CR-2026-00124' },
      ];

      for (const rel of relationshipsToSeed) {
        await this.relModel.findOneAndUpdate(
          { sourceId: rel.sourceId, targetId: rel.targetId, relType: rel.relType },
          { $set: rel },
          { upsert: true, new: true }
        );
      }

      this.logger.log('Comprehensive intelligence relationships state fully synchronized.');
    }
  }

  async getGraphState(caseId?: string) {
    const entityFilter = caseId ? { cases: caseId } : {};
    const relFilter = caseId ? { caseId } : {};

    const entities = await this.entityModel.find(entityFilter).lean().exec();
    const relationships = await this.relModel.find(relFilter).lean().exec();

    const nodes = entities.map((e) => ({
      id: e.entityId,
      label: e.label,
      entity_type: e.type,
      risk_flag: e.riskFlag || false,
      properties: e.properties || {},
    }));

    const edges = relationships.map((r) => ({
      source: r.sourceId,
      target: r.targetId,
      rel_type: r.relType,
      count: r.weight || 1,
      total_amount: r.totalAmount || 0,
      confidence: r.confidence || 1.0,
      source_type: r.sourceType || 'explicit',
      properties: r.properties || {},
    }));

    return { nodes, edges };
  }

  async getAnalytics(caseId?: string) {
    const graphState = await this.getGraphState(caseId);

    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/graph/analytics`,
        { graph: graphState },
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 8000 },
      );

      const influenceScores = response.data.influence_scores || {};
      for (const [entityId, info] of Object.entries(influenceScores)) {
        await this.entityModel.updateOne(
          { entityId },
          { $set: { influenceScore: (info as any).score } },
        );
      }

      return {
        graph: graphState,
        analytics: response.data,
      };
    } catch (err) {
      this.logger.warn(`Python ML graph analytics fallback: ${err.message}`);
      return {
        graph: graphState,
        analytics: {
          metrics: {
            node_count: graphState.nodes.length,
            edge_count: graphState.edges.length,
            density: 0,
            average_degree: 0,
            num_communities: 1,
          },
          influence_scores: {},
          communities: [],
          hidden_connectors: [],
        },
      };
    }
  }

  async findShortestPath(sourceId: string, targetId: string, caseId?: string) {
    const graphState = await this.getGraphState(caseId);
    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/graph/path`,
        { graph: graphState, source_id: sourceId, target_id: targetId },
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 5000 },
      );
      return response.data;
    } catch (err) {
      return { found: false, path: [], total_hops: 0, hops: [] };
    }
  }

  async simulateRemoval(removedNodeId: string, caseId?: string) {
    const graphState = await this.getGraphState(caseId);
    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/graph/simulate`,
        { graph: graphState, removed_node_id: removedNodeId },
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 5000 },
      );
      return response.data;
    } catch (err) {
      return {
        removed_node: removedNodeId,
        original_components: 1,
        new_components: 1,
        isolated_neighbors: [],
        impact_summary: 'Simulation unavailable',
      };
    }
  }

  async getTransactions(caseId?: string, limit = 100) {
    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    return this.txnModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getCommunications(caseId?: string, limit = 100) {
    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    return this.commModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
