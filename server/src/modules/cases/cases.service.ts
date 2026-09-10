import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Case, CaseDocument } from '../../database/schemas/case.schema';
import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CasesService implements OnModuleInit {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    @InjectModel(Case.name) private caseModel: Model<CaseDocument>,
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDemoCases();
    } catch (err: any) {
      this.logger.warn(`Could not seed demo cases (DB may be offline): ${err.message}`);
    }
  }

  async seedDemoCases() {
    const count = await this.caseModel.countDocuments();
    if (count < 5) {
      this.logger.log('Seeding enterprise demo cases...');
      const casesToSeed = [
        {
          caseNumber: 'CR-2026-00124',
          title: 'Operation Nightfall',
          description: 'Multi-jurisdiction syndicate investigation involving rapid transfer chains, shell logistics entities, and burner communications.',
          status: 'active',
          priority: 'critical',
          leadInvestigators: ['Vikram Rao', 'Maya Sen'],
          tags: ['flagship', 'hawala', 'shell_company', 'illicit_transit'],
          entityIds: ['P-0001', 'P-0002', 'P-0003', 'O-0001', 'PH-0001', 'V-0001'],
        },
        {
          caseNumber: 'CR-2026-00842',
          title: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
          description: 'Cross-border gold bullion factoring, tokenized cash handshakes across Deira Gold Souk and Karol Bagh vaults.',
          status: 'active',
          priority: 'critical',
          leadInvestigators: ['Maya Sen', 'Rohan Mathur'],
          tags: ['hawala', 'bullion', 'dubai_corridor', 'money_laundering'],
          entityIds: ['P-0004', 'P-0005', 'O-0002', 'O-0003', 'PH-0002', 'V-0002'],
        },
        {
          caseNumber: 'CR-2026-00315',
          title: 'Operation Red Sand: Inter-State Smuggling Syndicate',
          description: 'Illicit interstate timber and precious mineral transport network moving through South India transit corridors to Ennore port.',
          status: 'active',
          priority: 'high',
          leadInvestigators: ['Vikram Rao', 'Kavita Nair'],
          tags: ['smuggling', 'port_export', 'anpr_tracking', 'interstate'],
          entityIds: ['P-0006', 'P-0007', 'O-0004', 'PH-0003', 'V-0003'],
        },
        {
          caseNumber: 'CR-2026-00489',
          title: 'Project Phantom: Cyber-Fin Mule Network',
          description: 'Rogue payment gateways, layered UPI routing, and crypto OTC cash conversions across NCR and Western hubs.',
          status: 'active',
          priority: 'high',
          leadInvestigators: ['Aman Gupta', 'Maya Sen'],
          tags: ['cyber_fraud', 'mule_accounts', 'crypto_otc', 'upi_layering'],
          entityIds: ['P-0008', 'P-0009', 'O-0005', 'PH-0004', 'V-0004'],
        },
        {
          caseNumber: 'CR-2026-00712',
          title: 'Operation Eastern Corridor: Rail Cargo Smuggling',
          description: 'Inland railway freight parcel contraband routing from Bihar to Eastern border checkpoints and foreign transit nodes.',
          status: 'active',
          priority: 'medium',
          leadInvestigators: ['Sanjay Jha'],
          tags: ['rail_transit', 'border_post', 'cargo_fraud'],
          entityIds: ['P-0010', 'P-0011', 'O-0006', 'V-0005'],
        },
      ];

      for (const c of casesToSeed) {
        await this.caseModel.findOneAndUpdate(
          { caseNumber: c.caseNumber },
          { $set: c },
          { upsert: true, new: true },
        );
      }
      this.logger.log('Demo cases successfully synchronized.');
    }
  }

  async create(dto: CreateCaseDto, user: any): Promise<Case> {
    const existing = await this.caseModel.findOne({ caseNumber: dto.caseNumber });
    if (existing) {
      throw new ConflictException(`Case with number ${dto.caseNumber} already exists`);
    }

    const created = new this.caseModel(dto);
    const saved = await created.save();

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'CREATE_CASE',
      resourceType: 'case',
      resourceId: saved.caseNumber,
      details: { title: saved.title, priority: saved.priority },
    });

    return saved;
  }

  async findAll(limit = 50, skip = 0) {
    return this.caseModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(caseNumber: string): Promise<Case> {
    const c = await this.caseModel.findOne({ caseNumber }).exec();
    if (!c) {
      throw new NotFoundException(`Case ${caseNumber} not found`);
    }
    return c;
  }

  async update(caseNumber: string, dto: UpdateCaseDto, user: any): Promise<Case> {
    const updated = await this.caseModel
      .findOneAndUpdate({ caseNumber }, { $set: dto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Case ${caseNumber} not found`);
    }

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE_CASE',
      resourceType: 'case',
      resourceId: caseNumber,
      details: dto,
    });

    return updated;
  }

  async linkEntity(caseNumber: string, entityId: string, user: any): Promise<Case> {
    const updated = await this.caseModel
      .findOneAndUpdate(
        { caseNumber },
        { $addToSet: { entityIds: entityId } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Case ${caseNumber} not found`);
    }

    // Also update entity cases array
    await this.entityModel.updateOne(
      { entityId },
      { $addToSet: { cases: caseNumber } },
    );

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'LINK_ENTITY_TO_CASE',
      resourceType: 'case',
      resourceId: caseNumber,
      details: { entityId },
    });

    return updated;
  }
}
