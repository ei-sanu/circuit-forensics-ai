// Master Interconnected Intelligence Data Store for CIRCUIT AI
// Preserves consistent entity IDs, cases, transactions, communications, vehicles, locations, and alerts across all tabs.

export interface EntityRecord {
  entityId: string;
  type: 'person' | 'organization' | 'phone' | 'vehicle' | 'location' | 'event';
  label: string;
  aliases: string[];
  riskFlag: boolean;
  influenceScore: number;
  riskScore: number;
  cases: string[];
  properties: {
    designation?: string;
    nationality?: string;
    jurisdiction?: string;
    pan?: string;
    aadhaar?: string;
    passport?: string;
    phone?: string;
    email?: string;
    regNo?: string;
    vehicleModel?: string;
    chassisNo?: string;
    fastagId?: string;
    coordinates?: [number, number];
    address?: string;
    bankAccount?: string;
    ifsc?: string;
    type?: string;
  };
  connectedEntities: Array<{
    entityId: string;
    label: string;
    type: string;
    relationship: string;
    weight?: number;
  }>;
}

export interface CaseRecord {
  caseNumber: string;
  title: string;
  category: string;
  description: string;
  status: 'active' | 'under_review' | 'closed' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  leadInvestigator: string;
  department: string;
  region: string;
  filedDate: string;
  totalVolume: number;
  tags: string[];
  entityIds: string[];
  timeline: Array<{
    date: string;
    title: string;
    description: string;
    type: 'fir' | 'transaction' | 'interception' | 'raid' | 'intel';
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  evidence: Array<{
    id: string;
    type: string;
    title: string;
    hash: string;
    status: string;
    description?: string;
    date?: string;
    officer?: string;
    imageUrl?: string;
    textExcerpt?: string;
    fileSize?: string;
  }>;
}

export interface FirRecord {
  firNumber: string;
  policeStation: string;
  district: string;
  state: string;
  year: string;
  gdNumber: string;
  gdTime: string;
  inchargeOfficer: string;
  complainantName: string;
  complainantPhone: string;
  complainantAddress: string;
  complainantDesignation?: string;
  accusedNames: string[];
  ipcSections: string[];
  incidentDate: string;
  incidentLocation: string;
  description: string;
  firCopyUrl?: string;
  ocrExtractedText: string;
  matchedSuspectIds: string[];
  matchedSyndicateRisk: number;
  status: 'registered' | 'under_investigation' | 'chargesheet_filed' | 'closed';
  filedByStation: string;
  createdAt: string;
  courtJurisdiction: string;
  propertiesInvolved: string;
  delayReason: string;
  evidence?: Array<{
    id: string;
    type: string;
    title: string;
    hash: string;
    status: string;
    description?: string;
    date?: string;
    officer?: string;
    imageUrl?: string;
    textExcerpt?: string;
    fileSize?: string;
  }>;
}

export interface TransactionRecord {
  id: string;
  transactionId: string;
  fromName: string;
  fromId: string;
  fromType: 'person' | 'organization';
  toName: string;
  toId: string;
  toType: 'person' | 'organization';
  amount: number;
  timestamp: string;
  channel: 'hawala' | 'rtgs' | 'crypto_otc' | 'atm_cluster' | 'upi_gateway' | 'neft' | 'imps';
  caseId: string;
  caseName: string;
  isFlagged: boolean;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  patternType?: 'pass_through' | 'circular_flow' | 'rapid_chain' | 'structuring_smurf' | 'smurfing' | 'normal' | string;
  details: {
    txRef?: string;
    bankCode?: string;
    accountNo?: string;
    targetAccount?: string;
    ifsc?: string;
    tokenCode?: string;
    walletAddress?: string;
    atmClusterId?: string;
    location?: string;
    flagReason?: string;
    confidence?: number;
  };
}

export interface CommunicationRecord {
  id: string;
  commId: string;
  callerName: string;
  callerPhone: string;
  callerId: string;
  recipientName: string;
  recipientPhone: string;
  recipientId: string;
  timestamp: string;
  durationSec: number;
  commType: 'call' | 'encrypted_voip' | 'sms' | 'satellite_vhf';
  cellTowerId: string;
  towerLocation: string;
  city: string;
  coordinates: [number, number];
  isOddHour: boolean;
  caseId: string;
  caseName: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  imei?: string;
  imsi?: string;
  transcriptSnippet?: string;
}

export interface VehicleRecord {
  vehicleId: string;
  plateNumber: string;
  makeModel: string;
  vehicleType: 'sedan' | 'suv' | 'commercial_truck' | 'luxury_armored' | 'motorcycle';
  ownerId: string;
  ownerName: string;
  ownerDesignation: string;
  riskFlag: boolean;
  chassisNumber: string;
  fastagId: string;
  cases: string[];
  lastSeenLocation: string;
  lastSeenCoordinates: [number, number];
  lastSeenTimestamp: string;
  sightings: Array<{
    id: string;
    tollPlaza: string;
    city: string;
    timestamp: string;
    lane: string;
    confidence: number;
    anprImageUrl?: string;
    coTravelingWith?: string[];
  }>;
  alerts: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
    timestamp: string;
  }>;
}

export interface DocumentRecord {
  documentId: string;
  caseId: string;
  caseNumber: string;
  title: string;
  documentType: 'FIR' | 'Police Report' | 'Intelligence Report' | 'Bank Statement' | 'Surveillance Report';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'uploaded' | 'extracted' | 'reviewed' | 'approved' | 'committed';
  extractedEntities: Array<{
    id: string;
    label: string;
    type: 'person' | 'organization' | 'phone' | 'vehicle' | 'location' | 'amount';
    confidence: number;
    status: 'approved' | 'pending' | 'rejected';
  }>;
  extractedRelationships: Array<{
    source: string;
    target: string;
    relation: string;
    confidence: number;
    status: 'approved' | 'pending' | 'rejected';
  }>;
  rawText: string;
  summary: string;
  sha256Hash: string;
}

export interface AlertRecord {
  alertId: string;
  detectorName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  explanation: string;
  methodology: string;
  confidence: number;
  status: 'open' | 'investigating' | 'dismissed' | 'confirmed';
  caseId: string;
  caseName: string;
  createdAt: string;
  entities: Array<{ id: string; type: string; label: string }>;
  evidenceIds: string[];
  transactionId?: string;
  communicationId?: string;
  metrics?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// MASTER ENTITIES DATASET
// -----------------------------------------------------------------------------
const BASE_ENTITIES: EntityRecord[] = [
  {
    entityId: 'P-0001',
    type: 'person',
    label: 'Vikram Rathore',
    aliases: ['Vicky', 'VR', 'The Overseer', 'V.R. Khan'],
    riskFlag: true,
    influenceScore: 94.5,
    riskScore: 92.0,
    cases: ['CR-2026-00124', 'CR-2026-00842'],
    properties: {
      designation: 'Primary Syndicate Coordinator & Finance Controller',
      nationality: 'Indian',
      jurisdiction: 'Mumbai South',
      pan: 'ABCDE1234F',
      aadhaar: '4589 1204 8831',
      passport: 'Z8942104',
      phone: '+919876543210',
      email: 'v.rathore@northstar-logistics.in',
      coordinates: [18.9220, 72.8347],
      address: 'Sea Green Terraces, Colaba, Mumbai',
      bankAccount: '990145821034',
      ifsc: 'SBIN0000300',
    },
    connectedEntities: [
      { entityId: 'P-0002', label: 'Sunil Verma', type: 'person', relationship: 'transferred_money_to', weight: 850000 },
      { entityId: 'O-0001', label: 'NorthStar Logistics Pvt Ltd', type: 'organization', relationship: 'director_of' },
      { entityId: 'P-0007', label: 'Dinesh Kulkarni', type: 'person', relationship: 'communicated_with' },
      { entityId: 'VH-0001', label: 'MH-01-EA-9021 (Toyota Fortuner)', type: 'vehicle', relationship: 'owns' },
      { entityId: 'PH-0001', label: '+91 98765 43210 (Secure Burner)', type: 'phone', relationship: 'uses_phone' },
      { entityId: 'P-0004', label: 'Rashid Al-Mansoor', type: 'person', relationship: 'hawala_token_exchange' },
    ],
  },
  {
    entityId: 'P-0002',
    type: 'person',
    label: 'Sunil Verma',
    aliases: ['SV', 'Pandit', 'Cash Courier #4'],
    riskFlag: true,
    influenceScore: 84.2,
    riskScore: 78.5,
    cases: ['CR-2026-00124'],
    properties: {
      designation: 'Cash Transit Courier & Physical Handler',
      nationality: 'Indian',
      jurisdiction: 'Central Delhi',
      pan: 'PQRS5678M',
      aadhaar: '9012 4432 1109',
      phone: '+919123456780',
      coordinates: [28.6507, 77.2334],
      address: 'Chandni Chowk Bullion Lane, Old Delhi',
      bankAccount: '110294817234',
      ifsc: 'HDFC0000120',
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'received_money_from' },
      { entityId: 'P-0003', label: 'Anand Singhal', type: 'person', relationship: 'transferred_money_to', weight: 720000 },
      { entityId: 'VH-0002', label: 'DL-3C-AU-4190 (Mahindra Scorpio)', type: 'vehicle', relationship: 'drives_vehicle' },
    ],
  },
  {
    entityId: 'P-0003',
    type: 'person',
    label: 'Anand Singhal',
    aliases: ['Singhal Seth', 'Hawala Dispatcher'],
    riskFlag: true,
    influenceScore: 79.0,
    riskScore: 82.0,
    cases: ['CR-2026-00124', 'CR-2026-00842'],
    properties: {
      designation: 'Hawala Account Operator & Token Verifier',
      nationality: 'Indian',
      jurisdiction: 'Kolkata Burrabazar',
      pan: 'LMNOP9012K',
      aadhaar: '7781 9902 4410',
      phone: '+919830192844',
      coordinates: [22.5851, 88.3512],
      address: 'Cotton Street, Burrabazar, Kolkata',
      bankAccount: '330192840192',
      ifsc: 'ICIC0000005',
    },
    connectedEntities: [
      { entityId: 'P-0002', label: 'Sunil Verma', type: 'person', relationship: 'received_money_from' },
      { entityId: 'O-0001', label: 'NorthStar Logistics Pvt Ltd', type: 'organization', relationship: 'transferred_money_to', weight: 680000 },
    ],
  },
  {
    entityId: 'P-0004',
    type: 'person',
    label: 'Rashid Al-Mansoor',
    aliases: ['Sheikh Rashid', 'The Goldsmith', 'Al-Mansoor Gold'],
    riskFlag: true,
    influenceScore: 96.0,
    riskScore: 95.0,
    cases: ['CR-2026-00842'],
    properties: {
      designation: 'Offshore Bullion Tokenizer & Clearing Agent',
      nationality: 'Emirati',
      jurisdiction: 'Dubai / Deira',
      passport: 'UAE-8819203',
      phone: '+971501234567',
      coordinates: [25.2711, 55.3075],
      address: 'Gold Souk Precinct 4, Deira, Dubai, UAE',
      bankAccount: 'AE440330000192841029',
      ifsc: 'NBDUAE01',
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'hawala_token_exchange' },
      { entityId: 'P-0005', label: 'Rajesh Singhania', type: 'person', relationship: 'bullion_consignment' },
      { entityId: 'O-0002', label: 'Apex Bullion DMCC', type: 'organization', relationship: 'managing_director' },
    ],
  },
  {
    entityId: 'P-0005',
    type: 'person',
    label: 'Rajesh Singhania',
    aliases: ['Sethji', 'R.S. Jewellers', 'Singhania Bullion'],
    riskFlag: true,
    influenceScore: 88.5,
    riskScore: 84.0,
    cases: ['CR-2026-00842'],
    properties: {
      designation: 'Domestic Vault & Physical Bullion Cleared',
      nationality: 'Indian',
      jurisdiction: 'New Delhi',
      pan: 'RSTUV3456A',
      aadhaar: '6612 0091 3829',
      phone: '+919811099234',
      coordinates: [28.6517, 77.1906],
      address: 'Bank Street, Karol Bagh, New Delhi',
      bankAccount: '441029384756',
      ifsc: 'PUNB0001920',
    },
    connectedEntities: [
      { entityId: 'P-0004', label: 'Rashid Al-Mansoor', type: 'person', relationship: 'received_bullion' },
      { entityId: 'O-0002', label: 'Apex Bullion DMCC', type: 'organization', relationship: 'domestic_agent' },
      { entityId: 'VH-0004', label: 'DL-1C-AA-0009 (Mercedes Maybach)', type: 'vehicle', relationship: 'owns' },
    ],
  },
  {
    entityId: 'P-0006',
    type: 'person',
    label: 'Sameer Khan',
    aliases: ['Bhaijaan', 'Sam Logistics', 'SK Express'],
    riskFlag: true,
    influenceScore: 86.0,
    riskScore: 80.0,
    cases: ['CR-2026-00315'],
    properties: {
      designation: 'South Inter-State Freight Fleet Manager',
      nationality: 'Indian',
      jurisdiction: 'Bengaluru / Kalasipalya',
      pan: 'KHMNO7890B',
      aadhaar: '5519 2840 1928',
      phone: '+919980112233',
      coordinates: [12.9654, 77.5794],
      address: 'Goods Shed Road, Kalasipalya, Bengaluru',
      bankAccount: '550192847162',
      ifsc: 'CNRB0001829',
    },
    connectedEntities: [
      { entityId: 'P-0007', label: 'Dinesh Kulkarni', type: 'person', relationship: 'convoy_coordinator' },
      { entityId: 'O-0004', label: 'Royal Freight Carriers', type: 'organization', relationship: 'partner' },
      { entityId: 'VH-0003', label: 'KA-01-MJ-8822 (Tata Prima Heavy Haul)', type: 'vehicle', relationship: 'operates' },
    ],
  },
  {
    entityId: 'P-0007',
    type: 'person',
    label: 'Dinesh Kulkarni',
    aliases: ['DK', 'Kulkarni Escorts', 'Pilot 1'],
    riskFlag: true,
    influenceScore: 80.0,
    riskScore: 76.0,
    cases: ['CR-2026-00315', 'CR-2026-00124'],
    properties: {
      designation: 'Highway Escort Lead & Checkpost Bypass Liaison',
      nationality: 'Indian',
      jurisdiction: 'Pune / Satara Corridor',
      pan: 'KLMOP2345D',
      aadhaar: '8820 1948 2910',
      phone: '+919422019283',
      coordinates: [18.5204, 73.8567],
      address: 'Swargate Transport Nagar, Pune',
      bankAccount: '661029384751',
      ifsc: 'MAHB0000100',
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'pass_through_mule' },
      { entityId: 'P-0006', label: 'Sameer Khan', type: 'person', relationship: 'escort_coordination' },
      { entityId: 'VH-0005', label: 'MH-12-PQ-7788 (Toyota Innova Crysta)', type: 'vehicle', relationship: 'drives_vehicle' },
    ],
  },
  {
    entityId: 'O-0001',
    type: 'organization',
    label: 'NorthStar Logistics Pvt Ltd',
    aliases: ['NorthStar', 'NSL India', 'NorthStar Freight'],
    riskFlag: true,
    influenceScore: 78.9,
    riskScore: 89.0,
    cases: ['CR-2026-00124'],
    properties: {
      designation: 'Shell Freight Entity & Layering Conduit',
      jurisdiction: 'Mumbai West / Nariman Point',
      regNo: 'U72900MH2021PTC332211',
      type: 'Private Limited (Shell Holding)',
      coordinates: [18.9256, 72.8242],
      address: 'Mittal Chambers Suite 902, Nariman Point, Mumbai',
      bankAccount: '990145821034',
      ifsc: 'SBIN0000300',
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'beneficial_owner' },
      { entityId: 'P-0003', label: 'Anand Singhal', type: 'person', relationship: 'circular_inflow' },
    ],
  },
  {
    entityId: 'O-0002',
    type: 'organization',
    label: 'Apex Bullion DMCC',
    aliases: ['Apex Bullion', 'Apex Gold Dubai'],
    riskFlag: true,
    influenceScore: 89.0,
    riskScore: 92.5,
    cases: ['CR-2026-00842'],
    properties: {
      designation: 'Free Zone Bullion Clearing Vault',
      jurisdiction: 'DMCC Dubai',
      regNo: 'DMCC-994821',
      type: 'Free Zone Trading Entity',
      coordinates: [25.0768, 55.1485],
      address: 'Almas Tower 42nd Floor, JLT, Dubai, UAE',
    },
    connectedEntities: [
      { entityId: 'P-0004', label: 'Rashid Al-Mansoor', type: 'person', relationship: 'controlled_by' },
      { entityId: 'P-0005', label: 'Rajesh Singhania', type: 'person', relationship: 'consignee' },
    ],
  },
  {
    entityId: 'O-0004',
    type: 'organization',
    label: 'Royal Freight Carriers',
    aliases: ['Royal Carriers', 'RFC South'],
    riskFlag: true,
    influenceScore: 75.0,
    riskScore: 71.0,
    cases: ['CR-2026-00315'],
    properties: {
      designation: 'Contraband Highway Transit Front',
      jurisdiction: 'Bengaluru / Hosur',
      regNo: 'KA-REG-2019-9941',
      type: 'Partnership Transport Firm',
      coordinates: [12.7409, 77.8253],
      address: 'SIPCOT Industrial Complex, Hosur Highway',
    },
    connectedEntities: [
      { entityId: 'P-0006', label: 'Sameer Khan', type: 'person', relationship: 'fleet_owner' },
      { entityId: 'P-0007', label: 'Dinesh Kulkarni', type: 'person', relationship: 'escort_contractor' },
    ],
  },
  {
    entityId: 'PH-0001',
    type: 'phone',
    label: '+91 98765 43210',
    aliases: ['Vikram Rathore Primary', 'Mumbai Cell Tower 14'],
    riskFlag: true,
    influenceScore: 91.0,
    riskScore: 88.0,
    cases: ['CR-2026-00124'],
    properties: {
      phone: '+919876543210',
      jurisdiction: 'Mumbai South',
      coordinates: [18.9220, 72.8347],
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'subscriber' },
    ],
  },
  {
    entityId: 'VH-0001',
    type: 'vehicle',
    label: 'MH-01-EA-9021 (Toyota Fortuner)',
    aliases: ['Fortuner Black', 'Rathore Convoy Lead'],
    riskFlag: true,
    influenceScore: 84.0,
    riskScore: 82.0,
    cases: ['CR-2026-00124'],
    properties: {
      regNo: 'MH-01-EA-9021',
      vehicleModel: 'Toyota Fortuner 4x4',
      chassisNo: 'MBJ11V4T0018491',
      fastagId: 'NETC-FASTAG-9940192',
      coordinates: [19.0760, 72.8777],
    },
    connectedEntities: [
      { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', relationship: 'registered_owner' },
    ],
  },
];

// -----------------------------------------------------------------------------
// MASTER CASES & FIRS DATASET (20 Cases & 24 Authentic Indian Police FIRs)
// -----------------------------------------------------------------------------
import { EXPANDED_CASES, EXPANDED_FIRS } from './expandedCasesFirs';

export const MASTER_CASES: CaseRecord[] = EXPANDED_CASES;
export const MASTER_FIRS: FirRecord[] = EXPANDED_FIRS;

// -----------------------------------------------------------------------------
// MASTER TRANSACTIONS DATASET
// -----------------------------------------------------------------------------
const BASE_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TX-001',
    transactionId: 'TX-HW-2026-991',
    fromName: 'Vikram Rathore',
    fromId: 'P-0001',
    fromType: 'person',
    toName: 'Sunil Verma',
    toId: 'P-0002',
    toType: 'person',
    amount: 850000,
    timestamp: '2026-08-15 11:20:00',
    channel: 'hawala',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    isFlagged: true,
    riskLevel: 'critical',
    patternType: 'circular_flow',
    details: {
      txRef: 'HW-TOK-78401',
      tokenCode: 'DEL-GOLD-441',
      location: 'Chandni Chowk Bullion Lane, Delhi',
      flagReason: 'High-value Hawala cash dispatch token matching master syndicate ledger.',
      confidence: 0.98,
    },
  },
  {
    id: 'TX-002',
    transactionId: 'TX-RTGS-2026-8812',
    fromName: 'Sunil Verma',
    fromId: 'P-0002',
    fromType: 'person',
    toName: 'Anand Singhal',
    toId: 'P-0003',
    toType: 'person',
    amount: 720000,
    timestamp: '2026-08-15 14:45:00',
    channel: 'rtgs',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    isFlagged: true,
    riskLevel: 'high',
    patternType: 'rapid_chain',
    details: {
      txRef: 'HDFCR52026081500491',
      bankCode: 'HDFC',
      accountNo: '110294817234',
      targetAccount: '330192840192',
      ifsc: 'ICIC0000005',
      location: 'Burrabazar, Kolkata',
      flagReason: 'Rapid onward transfer within 3 hours of receiving cash dispatch.',
      confidence: 0.92,
    },
  },
  {
    id: 'TX-003',
    transactionId: 'TX-NEFT-2026-3019',
    fromName: 'Anand Singhal',
    fromId: 'P-0003',
    fromType: 'person',
    toName: 'NorthStar Logistics Pvt Ltd',
    toId: 'O-0001',
    toType: 'organization',
    amount: 680000,
    timestamp: '2026-08-16 10:15:00',
    channel: 'neft',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    isFlagged: true,
    riskLevel: 'critical',
    patternType: 'circular_flow',
    details: {
      txRef: 'ICICN2026081600124',
      bankCode: 'ICICI',
      accountNo: '330192840192',
      targetAccount: '990145821034',
      ifsc: 'SBIN0000300',
      location: 'Nariman Point, Mumbai',
      flagReason: 'Closing edge of circular laundering cycle returning funds to beneficial owner firm.',
      confidence: 0.96,
    },
  },
  {
    id: 'TX-004',
    transactionId: 'TX-RTGS-2026-5501',
    fromName: 'Vikram Rathore',
    fromId: 'P-0001',
    fromType: 'person',
    toName: 'Dinesh Kulkarni',
    toId: 'P-0007',
    toType: 'person',
    amount: 650000,
    timestamp: '2026-08-17 09:30:00',
    channel: 'rtgs',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    isFlagged: true,
    riskLevel: 'critical',
    patternType: 'pass_through',
    details: {
      txRef: 'SBINR52026081700994',
      bankCode: 'SBI',
      accountNo: '990145821034',
      targetAccount: '661029384751',
      ifsc: 'MAHB0000100',
      location: 'Swargate, Pune',
      flagReason: 'Initial deposit to pass-through mule account.',
      confidence: 0.94,
    },
  },
  {
    id: 'TX-005',
    transactionId: 'TX-RTGS-2026-5502',
    fromName: 'Dinesh Kulkarni',
    fromId: 'P-0007',
    fromType: 'person',
    toName: 'NorthStar Logistics Pvt Ltd',
    toId: 'O-0001',
    toType: 'organization',
    amount: 600000,
    timestamp: '2026-08-17 13:10:00',
    channel: 'rtgs',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    isFlagged: true,
    riskLevel: 'critical',
    patternType: 'pass_through',
    details: {
      txRef: 'MAHBR52026081700219',
      bankCode: 'Bank of Maharashtra',
      accountNo: '661029384751',
      targetAccount: '990145821034',
      ifsc: 'SBIN0000300',
      location: 'Nariman Point, Mumbai',
      flagReason: 'Forwarded 92.3% of received funds within 3 hours 40 minutes (classic mule pass-through).',
      confidence: 0.95,
    },
  },
  {
    id: 'TX-006',
    transactionId: 'TX-HW-2026-1104',
    fromName: 'Rashid Al-Mansoor',
    fromId: 'P-0004',
    fromType: 'person',
    toName: 'Rajesh Singhania',
    toId: 'P-0005',
    toType: 'person',
    amount: 2500000,
    timestamp: '2026-08-20 16:30:00',
    channel: 'hawala',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest',
    isFlagged: true,
    riskLevel: 'critical',
    patternType: 'structuring_smurf',
    details: {
      txRef: 'HW-DXB-9901',
      tokenCode: 'DMCC-TOKEN-2026',
      location: 'Karol Bagh, New Delhi',
      flagReason: 'Cross-border gold token settlement matching Dubai DMCC invoices.',
      confidence: 0.97,
    },
  },
  {
    id: 'TX-007',
    transactionId: 'TX-UPI-2026-7781',
    fromName: 'Sameer Khan',
    fromId: 'P-0006',
    fromType: 'person',
    toName: 'Dinesh Kulkarni',
    toId: 'P-0007',
    toType: 'person',
    amount: 195000,
    timestamp: '2026-08-22 01:45:00',
    channel: 'upi_gateway',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand',
    isFlagged: true,
    riskLevel: 'high',
    patternType: 'normal',
    details: {
      txRef: 'UPI-20260822-990182',
      location: 'NH-48 Checkpost Perimeter',
      flagReason: 'Odd-hour payment during highway transport transit.',
      confidence: 0.88,
    },
  },
  {
    id: 'TX-008',
    transactionId: 'TX-RTGS-2026-9001',
    fromName: 'NorthStar Logistics Pvt Ltd',
    fromId: 'O-0001',
    fromType: 'organization',
    toName: 'Royal Freight Carriers',
    toId: 'O-0004',
    toType: 'organization',
    amount: 450000,
    timestamp: '2026-08-24 11:00:00',
    channel: 'rtgs',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand',
    isFlagged: false,
    riskLevel: 'medium',
    patternType: 'normal',
    details: {
      txRef: 'SBINR52026082400192',
      bankCode: 'SBI',
      location: 'Hosur Industrial Hub',
      flagReason: 'Inter-firm freight subcontract invoice.',
      confidence: 0.75,
    },
  },
];

// -----------------------------------------------------------------------------
// MASTER COMMUNICATIONS DATASET
// -----------------------------------------------------------------------------
export const MASTER_COMMUNICATIONS: CommunicationRecord[] = [
  {
    id: 'COMM-001',
    commId: 'CDR-2026-9912',
    callerName: 'Vikram Rathore',
    callerPhone: '+919876543210',
    callerId: 'P-0001',
    recipientName: 'Sunil Verma',
    recipientPhone: '+919123456780',
    recipientId: 'P-0002',
    timestamp: '2026-08-15 02:15:30',
    durationSec: 384,
    commType: 'call',
    cellTowerId: 'MUM-BW-1044',
    towerLocation: 'Bandra West Tower 14-B',
    city: 'Mumbai',
    coordinates: [19.0596, 72.8295],
    isOddHour: true,
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    riskLevel: 'critical',
    imei: '867940029104821',
    imsi: '404450192837461',
    transcriptSnippet: '...The consignment token has cleared Burrabazar. Dispatch courier by morning train to Old Delhi station...',
  },
  {
    id: 'COMM-002',
    commId: 'CDR-2026-9915',
    callerName: 'Sunil Verma',
    callerPhone: '+919123456780',
    callerId: 'P-0002',
    recipientName: 'Anand Singhal',
    recipientPhone: '+919830192844',
    recipientId: 'P-0003',
    timestamp: '2026-08-15 03:40:12',
    durationSec: 195,
    commType: 'encrypted_voip',
    cellTowerId: 'DEL-CB-9021',
    towerLocation: 'Chandni Chowk Main Exchange',
    city: 'New Delhi',
    coordinates: [28.6507, 77.2334],
    isOddHour: true,
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    riskLevel: 'critical',
    transcriptSnippet: '...Code 441 confirmed. ₹8.5 Lakh cash handed over. Forward the RTGS confirmation receipt to the Nariman Point account...',
  },
  {
    id: 'COMM-003',
    commId: 'CDR-2026-8801',
    callerName: 'Vikram Rathore',
    callerPhone: '+919876543210',
    callerId: 'P-0001',
    recipientName: 'Dinesh Kulkarni',
    recipientPhone: '+919422019283',
    recipientId: 'P-0007',
    timestamp: '2026-08-17 01:10:00',
    durationSec: 420,
    commType: 'call',
    cellTowerId: 'MUM-NB-4011',
    towerLocation: 'Nariman Point Financial Tower 2',
    city: 'Mumbai',
    coordinates: [18.9256, 72.8242],
    isOddHour: true,
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    riskLevel: 'critical',
    imei: '867940029104821',
    transcriptSnippet: '...Account credited with 6.5. Deduct your fee and push the rest into NorthStar current account before banking hours...',
  },
  {
    id: 'COMM-004',
    commId: 'CDR-2026-7721',
    callerName: 'Sameer Khan',
    callerPhone: '+919980112233',
    callerId: 'P-0006',
    recipientName: 'Dinesh Kulkarni',
    recipientPhone: '+919422019283',
    recipientId: 'P-0007',
    timestamp: '2026-08-22 04:30:15',
    durationSec: 155,
    commType: 'sms',
    cellTowerId: 'BLR-KP-3301',
    towerLocation: 'Kalasipalya South Gateway',
    city: 'Bengaluru',
    coordinates: [12.9654, 77.5794],
    isOddHour: true,
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand',
    riskLevel: 'high',
    transcriptSnippet: 'CONVOY CLEAR: KA-01-MJ-8822 departed depot. Pilot Innova take lead at Hosur toll plaza before 05:00.',
  },
  {
    id: 'COMM-005',
    commId: 'CDR-2026-6610',
    callerName: 'Rashid Al-Mansoor',
    callerPhone: '+971501234567',
    callerId: 'P-0004',
    recipientName: 'Rajesh Singhania',
    recipientPhone: '+919811099234',
    recipientId: 'P-0005',
    timestamp: '2026-08-20 18:22:40',
    durationSec: 512,
    commType: 'satellite_vhf',
    cellTowerId: 'DEL-KB-1102',
    towerLocation: 'Karol Bagh Central Tower',
    city: 'New Delhi',
    coordinates: [28.6517, 77.1906],
    isOddHour: false,
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest',
    riskLevel: 'critical',
    transcriptSnippet: '...Consignment serial 2026-DXB cleared. Settlement tokens verified in JLT vault...',
  },
  {
    id: 'COMM-006',
    commId: 'CDR-2026-5509',
    callerName: 'Vikram Rathore',
    callerPhone: '+919876543210',
    callerId: 'P-0001',
    recipientName: 'Rashid Al-Mansoor',
    recipientPhone: '+971501234567',
    recipientId: 'P-0004',
    timestamp: '2026-08-19 23:45:10',
    durationSec: 280,
    commType: 'encrypted_voip',
    cellTowerId: 'MUM-CL-2010',
    towerLocation: 'Colaba Waterfront Tower',
    city: 'Mumbai',
    coordinates: [18.9220, 72.8347],
    isOddHour: false,
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest',
    riskLevel: 'high',
    transcriptSnippet: '...Singhania has arranged the domestic vault release. Ensure Dubai accounts balance prior to court hearings...',
  },
];

// -----------------------------------------------------------------------------
// MASTER VEHICLES DATASET
// -----------------------------------------------------------------------------
const BASE_VEHICLES: VehicleRecord[] = [
  {
    vehicleId: 'VH-0001',
    plateNumber: 'MH-01-EA-9021',
    makeModel: 'Toyota Fortuner 4x4 (Black)',
    vehicleType: 'suv',
    ownerId: 'P-0001',
    ownerName: 'Vikram Rathore',
    ownerDesignation: 'Primary Syndicate Coordinator',
    riskFlag: true,
    chassisNumber: 'MBJ11V4T0018491',
    fastagId: 'NETC-FASTAG-9940192',
    cases: ['CR-2026-00124'],
    lastSeenLocation: 'Khed-Shivapur Toll Plaza, Pune Highway',
    lastSeenCoordinates: [18.3541, 73.8562],
    lastSeenTimestamp: '2026-08-28 03:15:00',
    sightings: [
      { id: 'ST-001', tollPlaza: 'Khed-Shivapur Toll Plaza', city: 'Pune Outskirts', timestamp: '2026-08-28 03:15:00', lane: 'Lane 04 (Express Fastag)', confidence: 0.99, coTravelingWith: ['MH-12-PQ-7788'] },
      { id: 'ST-002', tollPlaza: 'Vashi Creek Bridge Toll', city: 'Navi Mumbai', timestamp: '2026-08-28 01:20:00', lane: 'Lane 02', confidence: 0.98 },
      { id: 'ST-003', tollPlaza: 'Bandra-Worli Sea Link Toll', city: 'Mumbai', timestamp: '2026-08-27 23:45:00', lane: 'Lane 06', confidence: 0.97 },
    ],
    alerts: [
      { type: 'Convoy Tracking', severity: 'critical', description: 'Co-traveling within 2 minutes of flagged escort vehicle MH-12-PQ-7788 at Khed-Shivapur Toll.', timestamp: '2026-08-28 03:16:00' },
      { type: 'Odd-Hour Transit', severity: 'high', description: 'High-speed interstate transit between 01:00 AM and 04:00 AM.', timestamp: '2026-08-28 03:20:00' },
    ],
  },
  {
    vehicleId: 'VH-0002',
    plateNumber: 'DL-3C-AU-4190',
    makeModel: 'Mahindra Scorpio-N (Silver)',
    vehicleType: 'suv',
    ownerId: 'P-0002',
    ownerName: 'Sunil Verma',
    ownerDesignation: 'Cash Transit Courier',
    riskFlag: true,
    chassisNumber: 'MA1TC2SC0089123',
    fastagId: 'NETC-FASTAG-7718293',
    cases: ['CR-2026-00124'],
    lastSeenLocation: 'Badarpur Border Toll Plaza, Delhi-Faridabad',
    lastSeenCoordinates: [28.4986, 77.3012],
    lastSeenTimestamp: '2026-08-26 14:10:00',
    sightings: [
      { id: 'ST-010', tollPlaza: 'Badarpur Border Toll', city: 'Delhi Border', timestamp: '2026-08-26 14:10:00', lane: 'Lane 01', confidence: 0.96 },
      { id: 'ST-011', tollPlaza: 'Gurugram Kherki Daula Toll', city: 'Gurugram', timestamp: '2026-08-25 18:30:00', lane: 'Lane 05', confidence: 0.94 },
    ],
    alerts: [
      { type: 'Cash Transit Route', severity: 'high', description: 'Repeated round-trip crossings along Delhi-Haryana bullion corridor.', timestamp: '2026-08-26 14:15:00' },
    ],
  },
  {
    vehicleId: 'VH-0003',
    plateNumber: 'KA-01-MJ-8822',
    makeModel: 'Tata Prima 4028.S (Heavy Multi-Axle Truck)',
    vehicleType: 'commercial_truck',
    ownerId: 'P-0006',
    ownerName: 'Sameer Khan',
    ownerDesignation: 'Fleet Manager (Royal Freight Carriers)',
    riskFlag: true,
    chassisNumber: 'MAT628100129481',
    fastagId: 'NETC-FASTAG-5501928',
    cases: ['CR-2026-00315'],
    lastSeenLocation: 'Hosur Inter-State Toll Plaza, NH-48',
    lastSeenCoordinates: [12.7409, 77.8253],
    lastSeenTimestamp: '2026-08-22 04:50:00',
    sightings: [
      { id: 'ST-020', tollPlaza: 'Hosur Toll Plaza', city: 'Tamil Nadu / Karnataka Border', timestamp: '2026-08-22 04:50:00', lane: 'Commercial Heavy Lane 08', confidence: 0.98, coTravelingWith: ['MH-12-PQ-7788'] },
      { id: 'ST-021', tollPlaza: 'Electronic City Tollway', city: 'Bengaluru', timestamp: '2026-08-22 03:40:00', lane: 'Lane 02', confidence: 0.95 },
    ],
    alerts: [
      { type: 'Toll Convoy Flag', severity: 'critical', description: 'Co-traveling with escort pilot vehicle MH-12-PQ-7788 at Hosur toll plaza during odd hours.', timestamp: '2026-08-22 04:55:00' },
      { type: 'Overweight Anomaly', severity: 'medium', description: 'Declared empty container showing heavy axle depression on toll weighbridge.', timestamp: '2026-08-22 05:00:00' },
    ],
  },
  {
    vehicleId: 'VH-0004',
    plateNumber: 'DL-1C-AA-0009',
    makeModel: 'Mercedes-Maybach S580 (Obsidian Black)',
    vehicleType: 'luxury_armored',
    ownerId: 'P-0005',
    ownerName: 'Rajesh Singhania',
    ownerDesignation: 'Vault Operator',
    riskFlag: true,
    chassisNumber: 'WDD2231761A00912',
    fastagId: 'NETC-FASTAG-1100921',
    cases: ['CR-2026-00842'],
    lastSeenLocation: 'IGI Airport Terminal 3 VIP Flyover',
    lastSeenCoordinates: [28.5562, 77.1000],
    lastSeenTimestamp: '2026-08-20 19:40:00',
    sightings: [
      { id: 'ST-030', tollPlaza: 'IGI Airport T3 Approach', city: 'New Delhi', timestamp: '2026-08-20 19:40:00', lane: 'VIP Lane', confidence: 0.99 },
    ],
    alerts: [
      { type: 'Diplomatic / Cargo Concourse Presence', severity: 'high', description: 'Vehicle logged parked near international air cargo wing during bullion arrival.', timestamp: '2026-08-20 19:45:00' },
    ],
  },
  {
    vehicleId: 'VH-0005',
    plateNumber: 'MH-12-PQ-7788',
    makeModel: 'Toyota Innova Crysta 2.4 ZX (Pearl White)',
    vehicleType: 'suv',
    ownerId: 'P-0007',
    ownerName: 'Dinesh Kulkarni',
    ownerDesignation: 'Highway Escort Lead',
    riskFlag: true,
    chassisNumber: 'MBJ11ZX20091823',
    fastagId: 'NETC-FASTAG-8829104',
    cases: ['CR-2026-00124', 'CR-2026-00315'],
    lastSeenLocation: 'Khed-Shivapur Toll Plaza, Pune Highway',
    lastSeenCoordinates: [18.3541, 73.8562],
    lastSeenTimestamp: '2026-08-28 03:17:00',
    sightings: [
      { id: 'ST-040', tollPlaza: 'Khed-Shivapur Toll Plaza', city: 'Pune Outskirts', timestamp: '2026-08-28 03:17:00', lane: 'Lane 04', confidence: 0.98, coTravelingWith: ['MH-01-EA-9021'] },
      { id: 'ST-041', tollPlaza: 'Hosur Toll Plaza', city: 'TN / KA Border', timestamp: '2026-08-22 04:48:00', lane: 'Lane 06', confidence: 0.97, coTravelingWith: ['KA-01-MJ-8822'] },
    ],
    alerts: [
      { type: 'Syndicate Pilot Escort', severity: 'critical', description: 'Identified as pilot vehicle for multiple flagged convoys across Maharashtra and Karnataka.', timestamp: '2026-08-28 03:18:00' },
    ],
  },
];

// -----------------------------------------------------------------------------
// MASTER DOCUMENTS DATASET
// -----------------------------------------------------------------------------
export const MASTER_DOCUMENTS: DocumentRecord[] = [
  {
    documentId: 'DOC-001',
    caseId: 'CR-2026-00124',
    caseNumber: 'CR-2026-00124',
    title: 'Certified First Information Report (FIR-MUM-2026-0891)',
    documentType: 'FIR',
    fileName: 'FIR_Colaba_2026_0891.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-08-14 11:30:00',
    status: 'committed',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    summary: 'Complaint lodged by State Bank of India Forensic Audit Cell regarding unauthorized corporate overdraft diversion into pass-through mule accounts and immediate cash withdrawals.',
    rawText: `FIRST INFORMATION REPORT (Under Bharatiya Nagarik Suraksha Sanhita / Cr.P.C.)\nDistrict: MUMBAI SOUTH, P.S.: COLABA CYBER CRIME\nFIR No: FIR-MUM-2026-0891 Date: 14/08/2026\nAct: DNS 2023, Sections: 318, 61, 338, 336, 66D IT ACT\nComplainant: STATE BANK OF INDIA (FORENSIC AUDIT CELL)\nAccused: 1. VIKRAM RATHORE 2. DINESH KULKARNI 3. NORTHSTAR LOGISTICS PVT LTD\nBrief Incident: Unlawful diversion of corporate overdraft funds into pass-through mule accounts and immediate withdrawal via cash couriers.`,
    extractedEntities: [
      { id: 'E-01', label: 'Vikram Rathore', type: 'person', confidence: 0.99, status: 'approved' },
      { id: 'E-02', label: 'Dinesh Kulkarni', type: 'person', confidence: 0.98, status: 'approved' },
      { id: 'E-03', label: 'NorthStar Logistics Pvt Ltd', type: 'organization', confidence: 0.99, status: 'approved' },
      { id: 'E-04', label: 'Colaba Cyber Crime PS', type: 'location', confidence: 0.95, status: 'approved' },
      { id: 'E-05', label: '₹4,20,00,000', type: 'amount', confidence: 0.97, status: 'approved' },
    ],
    extractedRelationships: [
      { source: 'Vikram Rathore', target: 'NorthStar Logistics Pvt Ltd', relation: 'director_of', confidence: 0.98, status: 'approved' },
      { source: 'Dinesh Kulkarni', target: 'NorthStar Logistics Pvt Ltd', relation: 'pass_through_mule', confidence: 0.94, status: 'approved' },
    ],
  },
  {
    documentId: 'DOC-002',
    caseId: 'CR-2026-00124',
    caseNumber: 'CR-2026-00124',
    title: 'Forensic Bank Ledger & Pass-Through Audit Report',
    documentType: 'Bank Statement',
    fileName: 'SBI_Forensic_Statement_Aug2026.pdf',
    fileSize: '4.8 MB',
    uploadDate: '2026-08-16 16:45:00',
    status: 'approved',
    sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    summary: 'Audited ledger statement showing incoming ₹6,50,000 credit into Dinesh Kulkarni account and subsequent ₹6,00,000 debit within 3h 40m to NorthStar Logistics.',
    rawText: `STATE BANK OF INDIA - FORENSIC EXTRACT\nAccount: 990145821034 (NorthStar Logistics)\nLinked Mule: 661029384751 (Dinesh Kulkarni)\nTx Ref: SBINR52026081700994 (Credit: ₹6,50,000)\nTx Ref: MAHBR52026081700219 (Debit: ₹6,00,000 -> NorthStar)\nTurnaround Velocity: 220 Minutes (Mule Turnaround Ratio: 92.3%)`,
    extractedEntities: [
      { id: 'E-10', label: 'Dinesh Kulkarni', type: 'person', confidence: 0.98, status: 'approved' },
      { id: 'E-11', label: 'NorthStar Logistics', type: 'organization', confidence: 0.99, status: 'approved' },
      { id: 'E-12', label: '₹6,50,000', type: 'amount', confidence: 0.99, status: 'approved' },
      { id: 'E-13', label: '₹6,00,000', type: 'amount', confidence: 0.99, status: 'approved' },
    ],
    extractedRelationships: [
      { source: 'Dinesh Kulkarni', target: 'NorthStar Logistics', relation: 'transferred_money_to', confidence: 0.99, status: 'approved' },
    ],
  },
  {
    documentId: 'DOC-003',
    caseId: 'CR-2026-00842',
    caseNumber: 'CR-2026-00842',
    title: 'Directorate of Revenue Intelligence (DRI) Seizure Memo',
    documentType: 'Intelligence Report',
    fileName: 'DRI_Bullion_Memo_Delhi_0412.pdf',
    fileSize: '1.9 MB',
    uploadDate: '2026-08-20 18:00:00',
    status: 'reviewed',
    sha256Hash: '554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766',
    summary: 'Seizure memo of undeclared gold bullion bars stamped with Dubai DMCC ref codes recovered from vault premises in Karol Bagh, New Delhi.',
    rawText: `DIRECTORATE OF REVENUE INTELLIGENCE - SEIZURE MEMO\nFile No: DRI/HQ/DZU/2026/842\nLocation: 14/2 Bank Street, Karol Bagh, New Delhi\nAccused Present: Rajesh Singhania (Sethji)\nForeign Correspondent Identified: Rashid Al-Mansoor (Apex Bullion DMCC)\nContraband: 4.0 kg 999.9 Purity Bullion Bars with token code DEL-GOLD-441`,
    extractedEntities: [
      { id: 'E-20', label: 'Rajesh Singhania', type: 'person', confidence: 0.99, status: 'approved' },
      { id: 'E-21', label: 'Rashid Al-Mansoor', type: 'person', confidence: 0.97, status: 'approved' },
      { id: 'E-22', label: 'Apex Bullion DMCC', type: 'organization', confidence: 0.98, status: 'approved' },
      { id: 'E-23', label: 'Karol Bagh, New Delhi', type: 'location', confidence: 0.96, status: 'approved' },
    ],
    extractedRelationships: [
      { source: 'Rashid Al-Mansoor', target: 'Rajesh Singhania', relation: 'bullion_consignment', confidence: 0.96, status: 'approved' },
    ],
  },
];

// -----------------------------------------------------------------------------
// MASTER ALERTS DATASET (10 ML DETECTORS)
// -----------------------------------------------------------------------------
export const MASTER_ALERTS: AlertRecord[] = [
  {
    alertId: 'ALT-FIR-001',
    detectorName: 'fir_suspect_match',
    severity: 'critical',
    title: '🚨 CRITICAL MATCH: Suspect Vikram Rathore Identified in FIR-MUM-2026-0891',
    explanation: 'FIR #FIR-MUM-2026-0891 filed at Colaba Cyber Crime PS cites DNS 318, 61, 338. Accused Vikram Rathore matches master syndicate records with 94.5% risk rating.',
    methodology: 'Cross-references newly lodged police station FIR records with active criminal intelligence database.',
    confidence: 0.98,
    status: 'open',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-14T11:00:00Z',
    entities: [
      { id: 'P-0001', type: 'person', label: 'Vikram Rathore' },
      { id: 'O-0001', type: 'organization', label: 'NorthStar Logistics' },
    ],
    evidenceIds: ['FIR-MUM-2026-0891', 'DOC-001'],
  },
  {
    alertId: 'ALT-PT-001',
    detectorName: 'pass_through_mule',
    severity: 'critical',
    title: 'Pass-Through Mule Account Identified: Dinesh Kulkarni',
    explanation: 'Account received ₹650,000 from Vikram Rathore and forwarded ₹600,000 (92.3%) to NorthStar Logistics within 3 hours 40 minutes, characteristic of high-velocity layering.',
    methodology: 'Monitors rapid turnover pass-through behavior (>80% forwarded within 24-48 hours).',
    confidence: 0.95,
    status: 'open',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-17T13:15:00Z',
    entities: [
      { id: 'P-0007', type: 'person', label: 'Dinesh Kulkarni' },
      { id: 'O-0001', type: 'organization', label: 'NorthStar Logistics' },
    ],
    evidenceIds: ['TX-004', 'TX-005', 'DOC-002'],
    transactionId: 'TX-RTGS-2026-5502',
  },
  {
    alertId: 'ALT-CIRC-001',
    detectorName: 'circular_flow',
    severity: 'critical',
    title: 'Directed Closed-Loop Money Laundering Cycle Detected',
    explanation: 'Closed loop detected across 4 hops: Vikram Rathore -> Sunil Verma (₹8.5L) -> Anand Singhal (₹7.2L) -> NorthStar Logistics (₹6.8L) -> Vikram Rathore.',
    methodology: 'NetworkX simple_cycles algorithm over directed financial transaction graph.',
    confidence: 0.99,
    status: 'open',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-16T10:30:00Z',
    entities: [
      { id: 'P-0001', type: 'person', label: 'Vikram Rathore' },
      { id: 'P-0002', type: 'person', label: 'Sunil Verma' },
      { id: 'P-0003', type: 'person', label: 'Anand Singhal' },
      { id: 'O-0001', type: 'organization', label: 'NorthStar Logistics' },
    ],
    evidenceIds: ['TX-001', 'TX-002', 'TX-003'],
  },
  {
    alertId: 'ALT-ODD-001',
    detectorName: 'odd_hour_communications',
    severity: 'high',
    title: 'Odd-Hour Burst: 384s Encrypted Call Between Key Suspects',
    explanation: 'Voice transmission between Vikram Rathore and Sunil Verma logged at 02:15 AM via Bandra West tower, deviating 4.2 sigma from normal business hours.',
    methodology: 'Flags telecommunications between 00:00 and 05:00 with duration > 120 seconds.',
    confidence: 0.91,
    status: 'investigating',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-15T02:20:00Z',
    entities: [
      { id: 'P-0001', type: 'person', label: 'Vikram Rathore' },
      { id: 'P-0002', type: 'person', label: 'Sunil Verma' },
    ],
    evidenceIds: ['COMM-001'],
    communicationId: 'COMM-001',
  },
  {
    alertId: 'ALT-CNV-001',
    detectorName: 'co_traveling_convoy',
    severity: 'critical',
    title: 'ANPR Toll Convoy Alert: Fortuner (MH-01-EA-9021) & Innova (MH-12-PQ-7788)',
    explanation: 'Both vehicles logged crossing Khed-Shivapur Toll Plaza within 120 seconds of each other in Lane 04 at 03:15 AM.',
    methodology: 'Detects multiple flagged registration plates crossing the same ANPR checkpoint within a 15-minute window.',
    confidence: 0.97,
    status: 'open',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-28T03:18:00Z',
    entities: [
      { id: 'VH-0001', type: 'vehicle', label: 'MH-01-EA-9021' },
      { id: 'VH-0005', type: 'vehicle', label: 'MH-12-PQ-7788' },
    ],
    evidenceIds: ['ST-001', 'ST-040'],
  },
  {
    alertId: 'ALT-RAPID-001',
    detectorName: 'rapid_transfer_chain',
    severity: 'high',
    title: 'Multi-Hop Rapid Transfer Chain: Delhi to Kolkata in 3 Hours',
    explanation: 'Funds transferred across 3 disparate banking jurisdictions in under 180 minutes without commercial trade backing.',
    methodology: 'Detects funds dispersed through multiple accounts in rapid sequence.',
    confidence: 0.92,
    status: 'investigating',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-15T15:00:00Z',
    entities: [
      { id: 'P-0002', type: 'person', label: 'Sunil Verma' },
      { id: 'P-0003', type: 'person', label: 'Anand Singhal' },
    ],
    evidenceIds: ['TX-001', 'TX-002'],
    transactionId: 'TX-RTGS-2026-8812',
  },
  {
    alertId: 'ALT-BRDG-001',
    detectorName: 'bridge_connector',
    severity: 'high',
    title: 'High Betweenness Broker Identified: Dinesh Kulkarni',
    explanation: 'Dinesh Kulkarni exhibits betweenness centrality of 0.742, serving as the sole bridge connecting Mumbai Hawala network with Karnataka freight syndicate.',
    methodology: 'NetworkX betweenness_centrality ranking identifying structural bottlenecks.',
    confidence: 0.96,
    status: 'open',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    createdAt: '2026-08-23T12:00:00Z',
    entities: [
      { id: 'P-0007', type: 'person', label: 'Dinesh Kulkarni' },
      { id: 'O-0001', type: 'organization', label: 'NorthStar Logistics' },
      { id: 'O-0004', type: 'organization', label: 'Royal Freight Carriers' },
    ],
    evidenceIds: ['COMM-003', 'COMM-004'],
  },
  {
    alertId: 'ALT-SPK-001',
    detectorName: 'activity_spike',
    severity: 'medium',
    title: '340% Communication Activity Spike Preceding Delivery',
    explanation: 'Call volume between Sameer Khan and Dinesh Kulkarni surged by 340% over the 48-hour baseline prior to toll crossing.',
    methodology: 'Surge detection exceeding 300% of rolling 14-day baseline.',
    confidence: 0.89,
    status: 'open',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand',
    createdAt: '2026-08-22T06:00:00Z',
    entities: [
      { id: 'P-0006', type: 'person', label: 'Sameer Khan' },
      { id: 'P-0007', type: 'person', label: 'Dinesh Kulkarni' },
    ],
    evidenceIds: ['COMM-004'],
  },
  {
    alertId: 'ALT-SMURF-001',
    detectorName: 'structuring_smurf',
    severity: 'medium',
    title: 'Potential Structuring Beneath Mandatory Reporting Limit',
    explanation: 'Multiple repetitive transfers of ₹1,95,000 kept just below the ₹2,00,000 regulatory reporting threshold.',
    methodology: 'Monitors recurring amounts within 5% below statutory reporting limits.',
    confidence: 0.85,
    status: 'open',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand',
    createdAt: '2026-08-22T02:00:00Z',
    entities: [
      { id: 'P-0006', type: 'person', label: 'Sameer Khan' },
      { id: 'P-0007', type: 'person', label: 'Dinesh Kulkarni' },
    ],
    evidenceIds: ['TX-007'],
    transactionId: 'TX-UPI-2026-7781',
  },
  {
    alertId: 'ALT-RISK-001',
    detectorName: 'high_risk_repetition',
    severity: 'critical',
    title: 'Recurrent Cross-Border Token Exchange with Watchlisted Entity',
    explanation: 'Continuous financial and telecommunication ties observed between Vikram Rathore and Dubai DMCC token operator Rashid Al-Mansoor.',
    methodology: 'Automated matching against Interpol red notice and FATF high-risk jurisdiction entities.',
    confidence: 0.98,
    status: 'confirmed',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest',
    createdAt: '2026-08-21T09:00:00Z',
    entities: [
      { id: 'P-0001', type: 'person', label: 'Vikram Rathore' },
      { id: 'P-0004', type: 'person', label: 'Rashid Al-Mansoor' },
    ],
    evidenceIds: ['TX-006', 'COMM-005', 'COMM-006'],
  },
];

// -----------------------------------------------------------------------------
// MASTER ANALYTICS & COMMUNITY CLUSTERS DATASET
// -----------------------------------------------------------------------------
export const MASTER_INSIGHTS = {
  modularityScore: 0.684,
  networkDensity: 0.142,
  averagePathLength: 2.34,
  communities: [
    {
      id: 'cluster-1',
      name: 'Western Hawala & Shell Financing Ring',
      leadEntity: 'Vikram Rathore (P-0001)',
      memberCount: 5,
      members: ['P-0001', 'P-0002', 'P-0003', 'O-0001', 'PH-0001'],
      totalTransactionVolume: 6050000,
      riskLevel: 'critical',
      anomalySummary: 'Closed-loop money laundering, pass-through accounts, and burner phone coordinator networks.',
    },
    {
      id: 'cluster-2',
      name: 'Cross-Border Bullion & Dubai DMCC Corridor',
      leadEntity: 'Rashid Al-Mansoor (P-0004)',
      memberCount: 4,
      members: ['P-0004', 'P-0005', 'O-0002', 'VH-0004'],
      totalTransactionVolume: 12500000,
      riskLevel: 'critical',
      anomalySummary: 'Tokenized bullion factoring and unhallmarked precious metal imports through Karol Bagh vaults.',
    },
    {
      id: 'cluster-3',
      name: 'Southern Highway Transit & Highway Escort Fleet',
      leadEntity: 'Sameer Khan (P-0006)',
      memberCount: 4,
      members: ['P-0006', 'P-0007', 'O-0004', 'VH-0003', 'VH-0005'],
      totalTransactionVolume: 4200000,
      riskLevel: 'high',
      anomalySummary: 'Overnight ANPR toll crossings, escort convoy patterns, and off-hour perimeter coordination.',
    },
  ],
  centralityRankings: [
    { entityId: 'P-0001', label: 'Vikram Rathore', type: 'person', degree: 0.85, betweenness: 0.94, pagerank: 0.22, eigenvector: 0.88 },
    { entityId: 'P-0004', label: 'Rashid Al-Mansoor', type: 'person', degree: 0.72, betweenness: 0.82, pagerank: 0.19, eigenvector: 0.76 },
    { entityId: 'P-0007', label: 'Dinesh Kulkarni', type: 'person', degree: 0.68, betweenness: 0.89, pagerank: 0.16, eigenvector: 0.71 },
    { entityId: 'O-0001', label: 'NorthStar Logistics', type: 'organization', degree: 0.65, betweenness: 0.62, pagerank: 0.14, eigenvector: 0.64 },
    { entityId: 'P-0002', label: 'Sunil Verma', type: 'person', degree: 0.58, betweenness: 0.54, pagerank: 0.11, eigenvector: 0.58 },
  ],
  predictiveLinks: [
    {
      sourceId: 'P-0002',
      sourceLabel: 'Sunil Verma',
      targetId: 'P-0005',
      targetLabel: 'Rajesh Singhania',
      probability: 0.89,
      sharedNeighbors: ['Vikram Rathore', 'Anand Singhal'],
      rationale: 'High co-location frequency in Chandni Chowk bullion market and mutual financial intermediaries.',
    },
    {
      sourceId: 'P-0003',
      sourceLabel: 'Anand Singhal',
      targetId: 'P-0004',
      targetLabel: 'Rashid Al-Mansoor',
      probability: 0.84,
      sharedNeighbors: ['Vikram Rathore'],
      rationale: 'Complementary Hawala settlement channels matching Dubai DMCC clearing timestamps.',
    },
    {
      sourceId: 'VH-0001',
      sourceLabel: 'MH-01-EA-9021 (Fortuner)',
      targetId: 'O-0004',
      targetLabel: 'Royal Freight Carriers',
      probability: 0.78,
      sharedNeighbors: ['Dinesh Kulkarni', 'Sameer Khan'],
      rationale: 'Shared toll plaza convoy sightings on NH-48 corridor.',
    },
  ],
};

// -----------------------------------------------------------------------------
// EXPANDED HIGH-VOLUME ENTERPRISE FORENSIC DATASETS (500+ Entities, 1000+ Tx, 250+ Vehicles)
// -----------------------------------------------------------------------------
import {
  generateExpandedEntities,
  generateExpandedTransactions,
  generateExpandedVehicles,
} from './dataGenerator';

export const MASTER_ENTITIES: EntityRecord[] = generateExpandedEntities(BASE_ENTITIES);
export const MASTER_TRANSACTIONS: TransactionRecord[] = generateExpandedTransactions(BASE_TRANSACTIONS, MASTER_ENTITIES);
export const MASTER_VEHICLES: VehicleRecord[] = generateExpandedVehicles(BASE_VEHICLES, MASTER_ENTITIES);

