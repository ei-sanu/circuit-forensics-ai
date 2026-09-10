import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas/audit-log.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: {
    userId: string;
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const entry = new this.auditLogModel({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    const saved = await entry.save();
    this.logger.log(`[AUDIT] ${params.userEmail} ${params.action} on ${params.resourceType}:${params.resourceId}`);
    return saved;
  }

  async findAll(limit = 100, skip = 0) {
    return this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByResource(resourceType: string, resourceId: string) {
    return this.auditLogModel
      .find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
