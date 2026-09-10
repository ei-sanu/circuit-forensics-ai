import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

import { GraphService } from '../graph/graph.service';
import { CaseDocument, CaseDocumentDocument } from '../../database/schemas/document.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private mlUrl: string;
  private mlSecret: string;

  constructor(
    private graphService: GraphService,
    @InjectModel(CaseDocument.name) private docModel: Model<CaseDocumentDocument>,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {
    this.mlUrl = this.configService.get<string>('mlService.url') || 'http://localhost:8001';
    this.mlSecret = this.configService.get<string>('mlService.secret') || 'dev-secret-internal-service-key-2026';
  }

  async askCopilot(query: string, caseId?: string, user?: any) {
    const graphState = await this.graphService.getGraphState(caseId);

    // Fetch relevant document summaries for case
    const docs = await this.docModel.find(caseId ? { caseId } : {}).limit(5).exec();
    const docSummaries = docs.map((d) => `[${d.title}] ${d.rawText.slice(0, 300)}...`);

    const payload = {
      query,
      case_id: caseId,
      graph: graphState,
      document_summaries: docSummaries,
    };

    try {
      const response = await axios.post(
        `${this.mlUrl}/ml/copilot`,
        payload,
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 10000 },
      );

      await this.auditService.log({
        userId: user?.userId || 'system',
        userEmail: user?.email || 'system',
        action: 'COPILOT_QUERY',
        resourceType: 'copilot',
        resourceId: caseId || 'global',
        details: { query, intent: response.data.intent },
      });

      return response.data;
    } catch (err) {
      this.logger.error(`Error querying Python ML Copilot: ${err.message}`);
      return {
        intent: 'fallback',
        direct_facts: ['Copilot reasoning service is currently operating in offline mode.'],
        analytical_reading: 'Analytical indicators are available via the Network Explorer and Anomaly alerts.',
        citations: [],
        suggested_followups: ['List entities in case', 'Show anomaly alerts'],
        disclaimer: 'Analytical indicator only. Does not constitute proof of guilt.',
      };
    }
  }
}
