import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';

import { CaseDocument, CaseDocumentDocument } from '../../database/schemas/document.schema';
import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { Relationship, RelationshipDocument } from '../../database/schemas/relationship.schema';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CommitDocumentDto } from './dto/commit-document.dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private mlUrl: string;
  private mlSecret: string;

  constructor(
    @InjectModel(CaseDocument.name) private docModel: Model<CaseDocumentDocument>,
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    @InjectModel(Relationship.name) private relModel: Model<RelationshipDocument>,
    private storageService: StorageService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {
    this.mlUrl = this.configService.get<string>('mlService.url') || 'http://localhost:8001';
    this.mlSecret = this.configService.get<string>('mlService.secret') || 'dev-secret-internal-service-key-2026';
  }

  async uploadAndProcess(
    dto: UploadDocumentDto,
    file?: Express.Multer.File,
    user?: any,
  ): Promise<CaseDocument> {
    const documentId = `DOC-${Date.now()}-${randomUUID().substring(0, 6)}`;
    const fileName = file?.originalname || `${dto.title.replace(/\s+/g, '_')}.txt`;
    const fileSize = file?.size || Buffer.byteLength(dto.textContent || '', 'utf-8');
    const mimeType = file?.mimetype || 'text/plain';

    // 1. Upload to Cloudflare R2
    const buffer = file?.buffer || Buffer.from(dto.textContent || '', 'utf-8');
    const r2Key = `cases/${dto.caseId || 'unassigned'}/${documentId}-${fileName}`;
    const { key, url } = await this.storageService.uploadFile(buffer, r2Key, mimeType);

    const rawText = file?.buffer ? file.buffer.toString('utf-8') : (dto.textContent || '');

    // 2. Extract Entities & Relationships via Python ML microservice
    let extractedEntities: any[] = [];
    let proposedRelationships: any[] = [];

    try {
      const mlResponse = await axios.post(
        `${this.mlUrl}/ml/extract`,
        { text: rawText, document_id: documentId },
        { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 10000 },
      );
      extractedEntities = mlResponse.data.entities || [];
      proposedRelationships = mlResponse.data.proposed_relationships || [];

      // 3. Resolve extracted entities against MongoDB canonical records
      const existingCandidates = await this.entityModel.find().lean().exec();
      const formattedCandidates = existingCandidates.map((c) => ({
        id: c.entityId,
        type: c.type,
        name: c.label,
        aliases: c.aliases || [],
      }));

      for (const ent of extractedEntities) {
        try {
          const res = await axios.post(
            `${this.mlUrl}/ml/resolve`,
            {
              target: { type: ent.type, label: ent.label },
              candidates: formattedCandidates,
              threshold: 0.75,
            },
            { headers: { 'X-Internal-Service-Key': this.mlSecret }, timeout: 5000 },
          );
          ent.resolution = res.data.result;
        } catch (err) {
          ent.resolution = { decision: 'new_candidate', matched_id: null, confidence: 0 };
        }
      }
    } catch (err) {
      this.logger.warn(`Python ML Extraction unavailable: ${err.message}. Saving doc without ML extraction.`);
    }

    // 4. Save metadata in MongoDB
    const doc = new this.docModel({
      documentId,
      caseId: dto.caseId,
      title: dto.title,
      fileName,
      fileSize,
      mimeType,
      r2Key: key,
      r2Url: url,
      rawText,
      status: extractedEntities.length > 0 ? 'extracted' : 'uploaded',
      extractedEntities,
      proposedRelationships,
      uploadedBy: user?.email,
    });

    const saved = await doc.save();

    await this.auditService.log({
      userId: user?.userId || 'system',
      userEmail: user?.email || 'system',
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'document',
      resourceId: saved.documentId,
      details: { caseId: dto.caseId, extractedCount: extractedEntities.length },
    });

    return saved;
  }

  async findAll(caseId?: string, limit = 50, skip = 0) {
    const filter = caseId ? { caseId } : {};
    return this.docModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async findOne(documentId: string): Promise<CaseDocument> {
    const doc = await this.docModel.findOne({ documentId }).exec();
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }
    // Refresh pre-signed URL for viewing/download
    doc.r2Url = await this.storageService.getPresignedDownloadUrl(doc.r2Key, 3600);
    return doc;
  }

  async commit(documentId: string, dto: CommitDocumentDto, user: any): Promise<CaseDocument> {
    const doc = await this.docModel.findOne({ documentId }).exec();
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    const tempToCanonicalMap = new Map<string, string>();

    // 1. Commit approved entities
    for (const ent of dto.approvedEntities) {
      if (ent.createAsNew || !ent.canonicalId) {
        const prefix = ent.type === 'person' ? 'P' : ent.type === 'organization' ? 'O' : ent.type === 'phone' ? 'PH' : ent.type === 'vehicle' ? 'V' : 'L';
        const newEntityId = `${prefix}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
        
        await this.entityModel.create({
          entityId: newEntityId,
          type: ent.type,
          label: ent.label,
          aliases: [],
          riskFlag: false,
          cases: doc.caseId ? [doc.caseId] : [],
          source: 'document_extract',
        });
        tempToCanonicalMap.set(ent.tempId, newEntityId);
      } else {
        tempToCanonicalMap.set(ent.tempId, ent.canonicalId);
        if (doc.caseId) {
          await this.entityModel.updateOne(
            { entityId: ent.canonicalId },
            { $addToSet: { cases: doc.caseId } },
          );
        }
      }
    }

    // 2. Commit approved relationships
    for (const rel of dto.approvedRelationships) {
      const srcId = tempToCanonicalMap.get(rel.sourceId) || rel.sourceId;
      const tgtId = tempToCanonicalMap.get(rel.targetId) || rel.targetId;

      await this.relModel.updateOne(
        { sourceId: srcId, targetId: tgtId, relType: rel.relType },
        {
          $set: {
            sourceId: srcId,
            targetId: tgtId,
            relType: rel.relType,
            confidence: rel.confidence || 0.90,
            sourceType: 'ai_inferred',
            isAiInferred: true,
            caseId: doc.caseId,
          },
          $addToSet: { evidenceIds: documentId },
          $inc: { weight: 1 },
        },
        { upsert: true },
      );
    }

    doc.status = 'committed';
    const updated = await doc.save();

    await this.auditService.log({
      userId: user?.userId || 'system',
      userEmail: user?.email || 'system',
      action: 'COMMIT_AI_DOCUMENT',
      resourceType: 'document',
      resourceId: documentId,
      details: {
        approvedEntities: dto.approvedEntities.length,
        approvedRelationships: dto.approvedRelationships.length,
      },
    });

    return updated;
  }
}
