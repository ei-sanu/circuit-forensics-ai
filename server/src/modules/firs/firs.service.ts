import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Fir, FirDocument } from '../../database/schemas/fir.schema';
import { Entity, EntityDocument } from '../../database/schemas/entity.schema';
import { Alert, AlertDocument } from '../../database/schemas/alert.schema';
import { CreateFirDto } from './dto/create-fir.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FirsService implements OnModuleInit {
  private readonly logger = new Logger(FirsService.name);

  constructor(
    @InjectModel(Fir.name) private firModel: Model<FirDocument>,
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDemoFirs();
    } catch (err: any) {
      this.logger.warn(`Could not seed demo FIRs: ${err.message}`);
    }
  }

  async seedDemoFirs() {
    const count = await this.firModel.countDocuments();
    if (count < 3) {
      this.logger.log('Seeding official FIR forensic registry in MongoDB...');
      const demoFirs = [
        {
          firNumber: 'FIR-MUM-2026-0891',
          policeStation: 'Colaba Cyber Crime PS',
          district: 'Mumbai South',
          inchargeOfficer: 'Senior Inspector Vikram Shinde, SHO',
          complainantName: 'State Bank of India (Forensic Audit Cell)',
          complainantPhone: '+912222019944',
          accusedNames: ['Vikram Rathore', 'Dinesh Kulkarni', 'NorthStar Logistics Pvt Ltd'],
          ipcSections: ['IPC 420 (Cheating)', 'IPC 120B (Conspiracy)', 'IPC 467 (Forgery)', 'Section 66D IT Act'],
          incidentDate: new Date('2026-08-14T10:30:00Z'),
          incidentLocation: 'Nariman Point Financial Hub, Mumbai',
          description: 'Suspects orchestrated ₹4.2 Crore synthetic loan pass-through layering through shell entities and mule accounts.',
          firCopyUrl: 'https://res.cloudinary.com/demo/image/upload/v1690000000/fir_sample_mumbai_0891.jpg',
          ocrExtractedText: `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)\nDistrict: MUMBAI SOUTH, P.S.: COLABA CYBER CRIME\nFIR No: FIR-MUM-2026-0891 Date: 14/08/2026\nAct: IPC 1860, Sections: 420, 120B, 467, 468, 66D IT ACT\nComplainant: STATE BANK OF INDIA (FORENSIC AUDIT CELL)\nAccused: 1. VIKRAM RATHORE 2. DINESH KULKARNI 3. NORTHSTAR LOGISTICS PVT LTD\nBrief Incident: Unlawful diversion of corporate overdraft funds into pass-through mule accounts and immediate withdrawal via cash couriers.`,
          matchedSuspectIds: ['P-0001', 'P-0007', 'O-0001'],
          matchedSyndicateRisk: 94.2,
          status: 'under_investigation',
          filedByStation: 'Colaba Cyber Crime PS',
        },
        {
          firNumber: 'FIR-DEL-2026-0412',
          policeStation: 'Karol Bagh Special Cell PS',
          district: 'Central Delhi',
          inchargeOfficer: 'ACP Rakesh Malhotra',
          complainantName: 'Directorate of Revenue Intelligence (DRI)',
          complainantPhone: '+911123389012',
          accusedNames: ['Rashid Al-Mansoor', 'Rajesh Singhania', 'Apex Bullion DMCC'],
          ipcSections: ['IPC 120B (Conspiracy)', 'Customs Act Section 135', 'Hawala Prohibition & FERA Sec 8'],
          incidentDate: new Date('2026-08-20T14:15:00Z'),
          incidentLocation: 'Karol Bagh Bullion Market, New Delhi',
          description: 'Gold bullion consignment worth ₹12.8 Crores liquidated through unrecorded cash tokens and overseas Hawala routing.',
          firCopyUrl: 'https://res.cloudinary.com/demo/image/upload/v1690000000/fir_sample_delhi_0412.jpg',
          ocrExtractedText: `DELHI POLICE FIRST INFORMATION REPORT\nPolice Station: KAROL BAGH SPECIAL CELL, District: CENTRAL DELHI\nFIR No: FIR-DEL-2026-0412\nSections: IPC 120B, CUSTOMS ACT 135, PMLA 2002\nAccused: RASHID AL-MANSOOR, RAJESH SINGHANIA (SETHJI)\nParticulars: Physical custody of bullion tokens intercepted during inter-state transport; undeclared remittance to Dubai DMCC.`,
          matchedSuspectIds: ['P-0004', 'P-0005', 'O-0002'],
          matchedSyndicateRisk: 91.8,
          status: 'chargesheet_filed',
          filedByStation: 'Karol Bagh Special Cell PS',
        },
        {
          firNumber: 'FIR-BLR-2026-0199',
          policeStation: 'Koramangala Cyber Crime PS',
          district: 'Bengaluru South',
          inchargeOfficer: 'Inspector Ananth Kumar',
          complainantName: 'Cyber Crime Investigation Bureau',
          complainantPhone: '+918025539090',
          accusedNames: ['Sameer Khan', 'Priya Sharma', 'NexaPay Solutions'],
          ipcSections: ['IPC 419 (Cheating by Impersonation)', 'IPC 420', 'Sec 66C IT Act'],
          incidentDate: new Date('2026-08-28T09:00:00Z'),
          incidentLocation: 'Outer Ring Road, Bellandur, Bengaluru',
          description: 'Automated mule ring utilizing 84 burner UPI IDs for instant dispersal of extortion proceeds.',
          firCopyUrl: 'https://res.cloudinary.com/demo/image/upload/v1690000000/fir_sample_blr_0199.jpg',
          ocrExtractedText: `KARNATAKA STATE POLICE - FIR COPY\nP.S.: KORAMANGALA CYBER CRIME, BENGALURU\nFIR Number: FIR-BLR-2026-0199\nAccused: SAMEER KHAN, PRIYA SHARMA, NEXAPAY SOLUTIONS\nIPC: 419, 420, 66C, 66D IT Act\nDetails: Interception of transit vehicle KA03NM7788 carrying 12 burner mobile terminals and pass-through ledger books.`,
          matchedSuspectIds: ['P-0006', 'P-0008', 'O-0005'],
          matchedSyndicateRisk: 88.0,
          status: 'registered',
          filedByStation: 'Koramangala Cyber Crime PS',
        },
      ];

      for (const f of demoFirs) {
        await this.firModel.findOneAndUpdate(
          { firNumber: f.firNumber },
          { $set: f },
          { upsert: true, new: true },
        );
      }
      this.logger.log('Demo FIRs seeded successfully.');
    }
  }

  async create(dto: CreateFirDto, user?: any) {
    const existing = await this.firModel.findOne({ firNumber: dto.firNumber });
    if (existing) {
      throw new ConflictException(`FIR Number ${dto.firNumber} already exists in registry`);
    }

    // Match accused names against known entities in database
    const matchedSuspectIds: string[] = [];
    let highestRisk = 0;
    const accused = dto.accusedNames || [];

    if (accused.length > 0) {
      for (const name of accused) {
        const cleanName = name.trim();
        if (!cleanName) continue;
        const matchedEntity = await this.entityModel.findOne({
          $or: [
            { label: { $regex: cleanName, $options: 'i' } },
            { aliases: { $regex: cleanName, $options: 'i' } },
          ],
        });

        if (matchedEntity) {
          matchedSuspectIds.push(matchedEntity.entityId);
          if ((matchedEntity.influenceScore || 0) > highestRisk) {
            highestRisk = matchedEntity.influenceScore || 85;
          }
        }
      }
    }

    const fir = new this.firModel({
      ...dto,
      accusedNames: accused,
      ipcSections: dto.ipcSections || ['IPC 420'],
      matchedSuspectIds,
      matchedSyndicateRisk: highestRisk > 0 ? highestRisk : 50,
      status: 'registered',
      filedByUserId: user?.userId || 'system',
      filedByStation: dto.policeStation || user?.stationName || 'District Police Station',
    });

    const saved = await fir.save();

    // If suspects matched, trigger instant critical alert in DB for Admin, Analyst, Investigator
    if (matchedSuspectIds.length > 0) {
      const alertId = `ALT-FIR-${Date.now().toString().slice(-6)}`;
      await this.alertModel.create({
        alertId,
        detectorName: 'fir_suspect_match',
        severity: 'critical',
        title: `🚨 CRITICAL MATCH: Suspect(s) [${accused.join(', ')}] Identified in ${saved.firNumber}`,
        explanation: `FIR #${saved.firNumber} was filed at ${saved.policeStation} (${saved.district}) citing ${saved.ipcSections?.join(', ')}. Target matches master syndicate records [${matchedSuspectIds.join(', ')}].`,
        confidence: 0.98,
        status: 'open',
        entities: matchedSuspectIds.map((id) => ({ id, type: 'person', label: accused[0] })),
        evidenceIds: [saved.firNumber],
        caseId: 'CR-2026-00124',
        methodology: 'Cross-references newly lodged police station FIR records with active criminal intelligence database.',
        metadata: {
          firNumber: saved.firNumber,
          policeStation: saved.policeStation,
          district: saved.district,
          matchedSuspects: accused,
          firCopyUrl: saved.firCopyUrl,
        },
      });
    }

    await this.auditService.log({
      userId: user?.userId || 'police_officer',
      userEmail: user?.email || 'police@circuit.gov',
      action: 'FILE_FIR',
      resourceType: 'fir',
      resourceId: saved.firNumber,
      details: {
        policeStation: saved.policeStation,
        district: saved.district,
        accused: saved.accusedNames,
        matchedCount: matchedSuspectIds.length,
      },
    });

    return saved;
  }

  async findAll(query?: {
    policeStation?: string;
    district?: string;
    status?: string;
    q?: string;
  }) {
    const filter: any = {};
    if (query?.policeStation) filter.policeStation = { $regex: query.policeStation, $options: 'i' };
    if (query?.district) filter.district = { $regex: query.district, $options: 'i' };
    if (query?.status) filter.status = query.status;
    if (query?.q) {
      filter.$or = [
        { firNumber: { $regex: query.q, $options: 'i' } },
        { accusedNames: { $regex: query.q, $options: 'i' } },
        { complainantName: { $regex: query.q, $options: 'i' } },
        { policeStation: { $regex: query.q, $options: 'i' } },
        { district: { $regex: query.q, $options: 'i' } },
        { description: { $regex: query.q, $options: 'i' } },
        { ipcSections: { $regex: query.q, $options: 'i' } },
      ];
    }

    return this.firModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Fir> {
    const fir = await this.firModel.findOne({
      $or: [{ firNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).exec();

    if (!fir) {
      throw new NotFoundException(`FIR ${id} not found in database`);
    }
    return fir;
  }

  async updateStatus(id: string, status: string, user: any): Promise<Fir> {
    const fir = await this.firModel
      .findOneAndUpdate({ firNumber: id }, { $set: { status } }, { new: true })
      .exec();

    if (!fir) {
      throw new NotFoundException(`FIR ${id} not found`);
    }

    await this.auditService.log({
      userId: user.userId,
      userEmail: user.email,
      action: 'UPDATE_FIR_STATUS',
      resourceType: 'fir',
      resourceId: id,
      details: { newStatus: status },
    });

    return fir;
  }

  parseOcrText(rawText: string) {
    // Intelligent parser for FIR OCR text
    const firNoMatch = rawText.match(/FIR\s*(?:No\.?|Number)?\s*[:\-]?\s*([A-Z0-9\-]+)/i);
    const districtMatch = rawText.match(/District\s*[:\-]?\s*([A-Za-z\s]+)/i);
    const stationMatch = rawText.match(/(?:Police Station|P\.S\.)\s*[:\-]?\s*([A-Za-z\s]+)/i);
    const sectionsMatch = rawText.match(/(?:Sections?|Acts?)\s*[:\-]?\s*([A-Za-z0-9,\s\(\)]+)/i);
    const accusedMatch = rawText.match(/(?:Accused|Suspects?)\s*[:\-]?\s*([A-Za-z0-9,\.\s\(\)]+)/i);

    return {
      firNumber: firNoMatch ? firNoMatch[1].trim() : `FIR-${Date.now().toString().slice(-6)}`,
      district: districtMatch ? districtMatch[1].split('\n')[0].trim() : '',
      policeStation: stationMatch ? stationMatch[1].split('\n')[0].trim() : '',
      ipcSections: sectionsMatch ? sectionsMatch[1].split(',').map((s) => s.trim()) : ['IPC 420'],
      accusedNames: accusedMatch
        ? accusedMatch[1]
            .split(/,|\n|\d+\./)
            .map((s) => s.trim())
            .filter((s) => s.length > 2)
        : [],
      rawText,
    };
  }
}
