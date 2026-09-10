// Master Network Explorer Intelligence & Case Registry
// Powers the Network Explorer with 225+ cases, dynamic forensic topologies, suspect rosters, and Louvain community metrics.

import { MASTER_CASES, CaseRecord } from './data';

export interface ExplorerCaseMeta {
  caseNumber: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'under_review' | 'closed' | 'pending';
  region: string;
  leadInvestigator: string;
  department: string;
  totalVolume: number;
  tags: string[];
  entityIds: string[];
}

export const EXPLORER_CASES: ExplorerCaseMeta[] = MASTER_CASES.map((c) => ({
  caseNumber: c.caseNumber,
  title: c.title,
  category: c.category || 'Organized Syndicate Intelligence',
  priority: c.priority,
  status: c.status,
  region: c.region || 'National Jurisdiction',
  leadInvestigator: c.leadInvestigator || 'Senior Special Cell Investigator',
  department: c.department || 'Central Crime & Forensic Intelligence Directorate',
  totalVolume: c.totalVolume || 4500000,
  tags: c.tags || ['syndicate', 'hawala'],
  entityIds: c.entityIds || [],
}));

export interface GraphNode {
  id: string;
  label: string;
  entity_type: 'person' | 'organization' | 'phone' | 'vehicle' | 'location' | 'event';
  risk_flag: boolean;
  properties: {
    designation?: string;
    nationality?: string;
    jurisdiction?: string;
    score?: number;
    regNo?: string;
    type?: string;
    carrier?: string;
    circle?: string;
    make?: string;
    model?: string;
    city?: string;
    date?: string;
    venue?: string;
    [key: string]: any;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  rel_type: string;
  count?: number;
  total_amount?: number;
  confidence?: number;
  properties?: Record<string, any>;
}

export interface CaseGraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
  analytics: {
    metrics: {
      node_count: number;
      edge_count: number;
      density: number;
      avg_degree: number;
      components: number;
    };
    communities: Array<{
      community_id: number;
      size: number;
      members: string[];
    }>;
  };
  suspectRoster: Array<{
    id: string;
    name: string;
    role: string;
    risk: boolean;
    score: number;
    jurisdiction: string;
  }>;
}

// Master Cross-Syndicate Multi-Network (for "Entire network" scope)
export const MASTER_ENTIRE_NETWORK: CaseGraphPayload = {
  nodes: [
    { id: 'P-0001', label: 'Vikram Rathore', entity_type: 'person', risk_flag: true, properties: { designation: 'Syndicate Head', nationality: 'Indian', jurisdiction: 'Mumbai', score: 94.5 } },
    { id: 'P-0002', label: 'Dinesh Kulkarni', entity_type: 'person', risk_flag: true, properties: { designation: 'Pass-through Broker', jurisdiction: 'Pune', score: 86.2 } },
    { id: 'P-0003', label: 'Sunil Bhatia', entity_type: 'person', risk_flag: true, properties: { designation: 'Cash Courier', jurisdiction: 'Delhi', score: 79.0 } },
    { id: 'P-0004', label: 'Rashid Al-Mansoor', entity_type: 'person', risk_flag: true, properties: { designation: 'Gulf Token Issuer', nationality: 'Emirati', jurisdiction: 'Dubai', score: 96.0 } },
    { id: 'P-0005', label: 'Rajesh Singhania', entity_type: 'person', risk_flag: true, properties: { designation: 'Bullion Clearing Lead', jurisdiction: 'Surat', score: 82.5 } },
    { id: 'P-0006', label: 'Sameer Khan', entity_type: 'person', risk_flag: true, properties: { designation: 'South Logistics Coordinator', jurisdiction: 'Bengaluru', score: 87.0 } },
    { id: 'P-0007', label: 'Anand Singhal', entity_type: 'person', risk_flag: true, properties: { designation: 'Hawala Desk Controller', jurisdiction: 'Ahmedabad', score: 84.0 } },
    { id: 'P-0008', label: 'Karan Malhotra', entity_type: 'person', risk_flag: true, properties: { designation: 'Crypto OTC Operator', jurisdiction: 'Gurugram', score: 89.2 } },
    { id: 'P-0009', label: 'Maya Sen', entity_type: 'person', risk_flag: false, properties: { designation: 'Informant / Liaison', jurisdiction: 'New Delhi', score: 62.0 } },
    { id: 'P-0010', label: 'Sanjay Jha', entity_type: 'person', risk_flag: true, properties: { designation: 'Rail Transit Broker', jurisdiction: 'Patna', score: 78.4 } },
    { id: 'P-0015', label: 'Rakesh Pillai', entity_type: 'person', risk_flag: true, properties: { designation: 'Coastal Hawala Agent', jurisdiction: 'Kochi', score: 81.5 } },
    { id: 'P-0016', label: 'Mahesh Sethi', entity_type: 'person', risk_flag: true, properties: { designation: 'Vault Keeper', jurisdiction: 'Chandni Chowk', score: 77.0 } },
    { id: 'O-0001', label: 'NorthStar Logistics Pvt Ltd', entity_type: 'organization', risk_flag: true, properties: { regNo: 'U72900MH2021PTC332211', type: 'Shell Logistics Entity', jurisdiction: 'Mumbai' } },
    { id: 'O-0002', label: 'Apex Bullion DMCC', entity_type: 'organization', risk_flag: true, properties: { license: 'DMCC-99412', type: 'Bullion Clearing Desk', jurisdiction: 'Dubai' } },
    { id: 'O-0003', label: 'Zion Global Commodities', entity_type: 'organization', risk_flag: true, properties: { regNo: 'U51909DL2019PTC344102', type: 'Front Export Company', jurisdiction: 'Delhi' } },
    { id: 'O-0004', label: 'Royal Freight Carriers', entity_type: 'organization', risk_flag: true, properties: { regNo: 'U60200KA2018PTC112390', type: 'Inter-State Transit Fleet', jurisdiction: 'Bengaluru' } },
    { id: 'O-0005', label: 'NexaPay Solutions', entity_type: 'organization', risk_flag: true, properties: { type: 'FinTech Payment Aggregator', jurisdiction: 'Noida' } },
    { id: 'PH-0001', label: '+91 98765 43210', entity_type: 'phone', risk_flag: true, properties: { carrier: 'Airtel', circle: 'Delhi-NCR' } },
    { id: 'PH-0002', label: '+971 50 8842190', entity_type: 'phone', risk_flag: true, properties: { carrier: 'Etisalat', circle: 'Dubai' } },
    { id: 'PH-0003', label: '+91 98111 22233', entity_type: 'phone', risk_flag: true, properties: { carrier: 'Jio', circle: 'Mumbai' } },
    { id: 'PH-0004', label: '+91 98222 33344', entity_type: 'phone', risk_flag: true, properties: { carrier: 'Vodafone Idea', circle: 'Bengaluru' } },
    { id: 'V-0001', label: 'MH-01-EA-9021', entity_type: 'vehicle', risk_flag: true, properties: { make: 'Toyota', model: 'Fortuner 4x4', jurisdiction: 'Mumbai South' } },
    { id: 'V-0002', label: 'DL-03-CG-4819', entity_type: 'vehicle', risk_flag: true, properties: { make: 'Toyota', model: 'Innova Crysta', jurisdiction: 'South Delhi' } },
    { id: 'V-0003', label: 'KA-04-MB-3910', entity_type: 'vehicle', risk_flag: true, properties: { make: 'BharatBenz', model: '3528C Heavy Hauler', jurisdiction: 'Bengaluru Central' } },
    { id: 'L-0001', label: 'Karol Bagh Bullion Vault', entity_type: 'location', risk_flag: true, properties: { city: 'New Delhi', type: 'Underground Vault' } },
    { id: 'L-0002', label: 'Bhiwandi CFS Stash Yard', entity_type: 'location', risk_flag: true, properties: { city: 'Thane / Mumbai', type: 'Container Stash Yard' } },
    { id: 'L-0003', label: 'Hosur Industrial Transit Node', entity_type: 'location', risk_flag: true, properties: { city: 'Hosur / TN Border', type: 'Checkpoint Transit' } },
    { id: 'EV-0001', label: 'Hawala Drop Nov-26', entity_type: 'event', risk_flag: true, properties: { date: '2026-11-20', venue: 'Bhiwandi Yard' } },
    { id: 'EV-0002', label: 'Karol Bagh Bullion Handshake', entity_type: 'event', risk_flag: true, properties: { date: '2026-11-22', venue: 'Karol Bagh Vault' } },
  ],
  edges: [
    { source: 'P-0001', target: 'P-0002', rel_type: 'associated_with', count: 12, confidence: 0.95 },
    { source: 'P-0002', target: 'P-0003', rel_type: 'associated_with', count: 7, confidence: 0.90 },
    { source: 'P-0002', target: 'O-0001', rel_type: 'employed_by', count: 1, confidence: 0.99 },
    { source: 'P-0001', target: 'PH-0001', rel_type: 'owns', count: 1, confidence: 0.95 },
    { source: 'PH-0001', target: 'PH-0003', rel_type: 'communicated_with', count: 32, confidence: 0.98 },
    { source: 'P-0001', target: 'V-0001', rel_type: 'owns', count: 1, confidence: 0.92 },
    { source: 'P-0001', target: 'L-0001', rel_type: 'visited', count: 5, confidence: 0.88 },
    { source: 'P-0003', target: 'L-0002', rel_type: 'visited', count: 8, confidence: 0.91 },
    { source: 'P-0004', target: 'O-0002', rel_type: 'employed_by', count: 1, confidence: 0.99 },
    { source: 'P-0004', target: 'PH-0002', rel_type: 'owns', count: 1, confidence: 0.95 },
    { source: 'P-0001', target: 'P-0004', rel_type: 'communicated_with', count: 26, confidence: 0.97 },
    { source: 'O-0002', target: 'O-0001', rel_type: 'transferred_money_to', total_amount: 24500000, confidence: 0.96 },
    { source: 'O-0001', target: 'O-0003', rel_type: 'transferred_money_to', total_amount: 18000000, confidence: 0.94 },
    { source: 'P-0004', target: 'P-0005', rel_type: 'associated_with', count: 9, confidence: 0.93 },
    { source: 'P-0005', target: 'O-0003', rel_type: 'employed_by', count: 1, confidence: 0.96 },
    { source: 'P-0006', target: 'O-0004', rel_type: 'employed_by', count: 1, confidence: 0.98 },
    { source: 'P-0006', target: 'V-0003', rel_type: 'owns', count: 1, confidence: 0.91 },
    { source: 'P-0006', target: 'P-0002', rel_type: 'associated_with', count: 6, confidence: 0.89 },
    { source: 'P-0007', target: 'P-0001', rel_type: 'associated_with', count: 5, confidence: 0.92 },
    { source: 'P-0007', target: 'O-0001', rel_type: 'transferred_money_to', total_amount: 9500000, confidence: 0.95 },
    { source: 'P-0008', target: 'O-0005', rel_type: 'employed_by', count: 1, confidence: 0.99 },
    { source: 'P-0008', target: 'P-0004', rel_type: 'communicated_with', count: 14, confidence: 0.94 },
    { source: 'P-0008', target: 'O-0002', rel_type: 'transferred_money_to', total_amount: 12000000, confidence: 0.93 },
    { source: 'P-0010', target: 'O-0004', rel_type: 'associated_with', count: 4, confidence: 0.88 },
    { source: 'P-0015', target: 'O-0005', rel_type: 'transferred_money_to', total_amount: 4200000, confidence: 0.94 },
    { source: 'P-0015', target: 'P-0004', rel_type: 'communicated_with', count: 11, confidence: 0.93 },
    { source: 'P-0016', target: 'L-0001', rel_type: 'visited', count: 14, confidence: 0.97 },
    { source: 'P-0003', target: 'EV-0001', rel_type: 'attended', count: 1, confidence: 0.95 },
    { source: 'P-0005', target: 'EV-0002', rel_type: 'attended', count: 1, confidence: 0.96 },
    { source: 'PH-0001', target: 'PH-0002', rel_type: 'communicated_with', count: 28, confidence: 0.99 },
    { source: 'PH-0003', target: 'PH-0004', rel_type: 'communicated_with', count: 16, confidence: 0.92 },
    { source: 'V-0001', target: 'L-0002', rel_type: 'visited', count: 7, confidence: 0.89 },
    { source: 'V-0002', target: 'L-0001', rel_type: 'visited', count: 9, confidence: 0.93 },
    { source: 'V-0003', target: 'L-0003', rel_type: 'visited', count: 12, confidence: 0.95 },
  ],
  analytics: {
    metrics: {
      node_count: 29,
      edge_count: 34,
      density: 0.083,
      avg_degree: 2.34,
      components: 1,
    },
    communities: [
      { community_id: 0, size: 8, members: ['P-0001', 'P-0002', 'P-0003', 'O-0001', 'PH-0001', 'PH-0003', 'V-0001', 'L-0002', 'EV-0001'] },
      { community_id: 1, size: 7, members: ['P-0004', 'P-0005', 'P-0008', 'O-0002', 'O-0003', 'O-0005', 'PH-0002', 'EV-0002'] },
      { community_id: 2, size: 6, members: ['P-0006', 'P-0007', 'P-0010', 'O-0004', 'PH-0004', 'V-0003', 'L-0003'] },
      { community_id: 3, size: 4, members: ['P-0015', 'P-0016', 'L-0001', 'V-0002'] },
    ],
  },
  suspectRoster: [
    { id: 'P-0001', name: 'Vikram Rathore', role: 'Syndicate Head', risk: true, score: 94.5, jurisdiction: 'Mumbai' },
    { id: 'P-0004', name: 'Rashid Al-Mansoor', role: 'Gulf Token Issuer', risk: true, score: 96.0, jurisdiction: 'Dubai' },
    { id: 'P-0008', name: 'Karan Malhotra', role: 'Crypto OTC Operator', risk: true, score: 89.2, jurisdiction: 'Gurugram' },
    { id: 'P-0006', name: 'Sameer Khan', role: 'South Logistics Coordinator', risk: true, score: 87.0, jurisdiction: 'Bengaluru' },
    { id: 'P-0002', name: 'Dinesh Kulkarni', role: 'Pass-through Broker', risk: true, score: 86.2, jurisdiction: 'Pune' },
    { id: 'P-0007', name: 'Anand Singhal', role: 'Hawala Desk Controller', risk: true, score: 84.0, jurisdiction: 'Ahmedabad' },
    { id: 'P-0005', name: 'Rajesh Singhania', role: 'Bullion Clearing Lead', risk: true, score: 82.5, jurisdiction: 'Surat' },
    { id: 'P-0015', name: 'Rakesh Pillai', role: 'Coastal Hawala Agent', risk: true, score: 81.5, jurisdiction: 'Kochi' },
    { id: 'P-0003', name: 'Sunil Bhatia', role: 'Cash Courier', risk: true, score: 79.0, jurisdiction: 'Delhi' },
    { id: 'P-0010', name: 'Sanjay Jha', role: 'Rail Transit Broker', risk: true, score: 78.4, jurisdiction: 'Patna' },
  ],
};

// Procedural builder for ANY case from the 225+ Master Cases
export function buildGraphForCase(caseNumber: string): CaseGraphPayload {
  if (!caseNumber || caseNumber === 'all') {
    return MASTER_ENTIRE_NETWORK;
  }

  const caseObj = MASTER_CASES.find((c) => c.caseNumber === caseNumber) || {
    caseNumber,
    title: `Investigation Docket ${caseNumber}`,
    category: 'Financial Intelligence & Network Crime',
    priority: 'high' as const,
    status: 'active' as const,
    region: 'Western Zone (Mumbai)',
    leadInvestigator: 'Inspector Priya Nair',
    department: 'Cyber Crime & Special Intelligence Division',
    totalVolume: 4800000,
    tags: ['hawala', 'smurfing', 'shell_company'],
    entityIds: ['P-0001', 'P-0002', 'O-0001'],
    filedDate: '2026-08-15',
    timeline: [],
  };

  const numExtract = parseInt(caseNumber.replace(/\D/g, '').slice(-4), 10) || 124;

  // City & Regional extraction
  const regions = [
    { city: 'Mumbai', state: 'Maharashtra', rto: 'MH-01', phoneCircle: 'Mumbai' },
    { city: 'New Delhi', state: 'Delhi', rto: 'DL-01', phoneCircle: 'Delhi-NCR' },
    { city: 'Bengaluru', state: 'Karnataka', rto: 'KA-04', phoneCircle: 'Karnataka' },
    { city: 'Ahmedabad', state: 'Gujarat', rto: 'GJ-01', phoneCircle: 'Gujarat' },
    { city: 'Kolkata', state: 'West Bengal', rto: 'WB-02', phoneCircle: 'Kolkata' },
    { city: 'Hyderabad', state: 'Telangana', rto: 'TS-09', phoneCircle: 'Telangana' },
    { city: 'Chennai', state: 'Tamil Nadu', rto: 'TN-01', phoneCircle: 'Tamil Nadu' },
    { city: 'Pune', state: 'Maharashtra', rto: 'MH-12', phoneCircle: 'Maharashtra' },
    { city: 'Jaipur', state: 'Rajasthan', rto: 'RJ-14', phoneCircle: 'Rajasthan' },
    { city: 'Surat', state: 'Gujarat', rto: 'GJ-05', phoneCircle: 'Gujarat' },
    { city: 'Lucknow', state: 'Uttar Pradesh', rto: 'UP-32', phoneCircle: 'Uttar Pradesh' },
    { city: 'Kochi', state: 'Kerala', rto: 'KL-07', phoneCircle: 'Kerala' },
    { city: 'Amritsar', state: 'Punjab', rto: 'PB-02', phoneCircle: 'Punjab' },
    { city: 'Indore', state: 'Madhya Pradesh', rto: 'MP-09', phoneCircle: 'Madhya Pradesh' },
    { city: 'Patna', state: 'Bihar', rto: 'BR-01', phoneCircle: 'Bihar' },
    { city: 'Guwahati', state: 'Assam', rto: 'AS-01', phoneCircle: 'Assam' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', rto: 'AP-31', phoneCircle: 'Andhra Pradesh' },
    { city: 'Ranchi', state: 'Jharkhand', rto: 'JH-01', phoneCircle: 'Jharkhand' },
  ];
  const reg = regions[numExtract % regions.length];

  // Specific Suspects Names
  const firstNames = ['Vikram', 'Dinesh', 'Karan', 'Rashid', 'Sameer', 'Rajesh', 'Anand', 'Mahesh', 'Sunil', 'Arun', 'Deepak', 'Sanjay', 'Harpreet', 'Farooq', 'Prakash', 'Devendra', 'Naveen', 'Rohan', 'Ashok', 'Gautam'];
  const lastNames = ['Rathore', 'Kulkarni', 'Malhotra', 'Al-Mansoor', 'Khan', 'Singhania', 'Singhal', 'Sethi', 'Verma', 'Sharma', 'Patel', 'Jha', 'Gill', 'Mahmood', 'Menon', 'Reddy', 'Goyal', 'Deshmukh', 'Chawla', 'Joshi'];

  const p1Name = `${firstNames[numExtract % firstNames.length]} ${lastNames[numExtract % lastNames.length]}`;
  const p2Name = `${firstNames[(numExtract + 3) % firstNames.length]} ${lastNames[(numExtract + 4) % lastNames.length]}`;
  const p3Name = `${firstNames[(numExtract + 6) % firstNames.length]} ${lastNames[(numExtract + 8) % lastNames.length]}`;

  const p1Id = `P-${String(numExtract).padStart(4, '0')}`;
  const p2Id = `P-${String(numExtract + 1).padStart(4, '0')}`;
  const p3Id = `P-${String(numExtract + 2).padStart(4, '0')}`;

  const org1Id = `O-${String(numExtract).padStart(4, '0')}`;
  const org2Id = `O-${String(numExtract + 1).padStart(4, '0')}`;
  const ph1Id = `PH-${String(numExtract).padStart(4, '0')}`;
  const ph2Id = `PH-${String(numExtract + 1).padStart(4, '0')}`;
  const vh1Id = `VH-${String(numExtract).padStart(4, '0')}`;
  const loc1Id = `LOC-${String(numExtract).padStart(4, '0')}`;
  const ev1Id = `EV-${String(numExtract).padStart(4, '0')}`;

  // Organization names tailored to case category
  const orgBase = (caseObj.title || 'Apex Enterprises')
    .replace(/^Operation\s+/i, '')
    .replace(/^Project\s+/i, '')
    .split(/[:(-]/)[0]
    .trim();
  const org1Title = `${orgBase} Logistics Pvt Ltd`;
  const org2Title = `${orgBase} Clearing & Bullion Desk`;

  const phone1 = `+91 ${98000 + (numExtract % 900)} ${String(10000 + ((numExtract * 7) % 90000))}`;
  const phone2 = `+91 ${97000 + ((numExtract * 3) % 900)} ${String(20000 + ((numExtract * 13) % 80000))}`;

  const plate1 = `${reg.rto}-EA-${String(1000 + ((numExtract * 17) % 9000))}`;
  const safehouseTitle = `${reg.city} Stash & Cash Vault #${(numExtract % 12) + 1}`;
  const eventTitle = `Forensic Seizure Event: ${caseObj.title.slice(0, 28)}`;

  const vol = caseObj.totalVolume || 4500000;
  const p1Score = Math.min(98, 82 + (numExtract % 16) * 0.9);
  const p2Score = Math.min(92, 75 + (numExtract % 15) * 0.8);
  const p3Score = Math.min(86, 68 + (numExtract % 14) * 0.9);

  const nodes: GraphNode[] = [
    {
      id: p1Id,
      label: p1Name,
      entity_type: 'person',
      risk_flag: true,
      properties: {
        designation: 'Primary Syndicate Mastermind',
        jurisdiction: reg.city,
        nationality: 'Indian',
        score: p1Score,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: p2Id,
      label: p2Name,
      entity_type: 'person',
      risk_flag: true,
      properties: {
        designation: 'Cash Courier & Pass-Through Mule',
        jurisdiction: reg.city,
        nationality: 'Indian',
        score: p2Score,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: p3Id,
      label: p3Name,
      entity_type: 'person',
      risk_flag: numExtract % 3 !== 0,
      properties: {
        designation: 'Financial Broker & Hawala Conduit',
        jurisdiction: reg.state,
        nationality: 'Indian',
        score: p3Score,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: org1Id,
      label: org1Title,
      entity_type: 'organization',
      risk_flag: true,
      properties: {
        regNo: `U${72000 + (numExtract % 2000)}${reg.rto.slice(0, 2)}2021PTC${100000 + numExtract}`,
        type: 'Shell Corporate Conduit',
        jurisdiction: reg.city,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: org2Id,
      label: org2Title,
      entity_type: 'organization',
      risk_flag: true,
      properties: {
        type: 'Offshore Clearing Desk',
        jurisdiction: 'Offshore / Corridor Node',
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: ph1Id,
      label: phone1,
      entity_type: 'phone',
      risk_flag: true,
      properties: {
        carrier: 'Airtel',
        circle: reg.phoneCircle,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: ph2Id,
      label: phone2,
      entity_type: 'phone',
      risk_flag: true,
      properties: {
        carrier: 'Reliance Jio',
        circle: reg.phoneCircle,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: vh1Id,
      label: plate1,
      entity_type: 'vehicle',
      risk_flag: true,
      properties: {
        make: 'Toyota',
        model: numExtract % 2 === 0 ? 'Fortuner 4x4' : 'Innova Crysta',
        jurisdiction: `${reg.city} RTO`,
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: loc1Id,
      label: safehouseTitle,
      entity_type: 'location',
      risk_flag: true,
      properties: {
        city: reg.city,
        type: 'Underground Vault / Safehouse',
        caseNumber: caseObj.caseNumber,
      },
    },
    {
      id: ev1Id,
      label: eventTitle,
      entity_type: 'event',
      risk_flag: true,
      properties: {
        date: '2026-08-20',
        venue: `${reg.city} Commercial Transit Zone`,
        caseNumber: caseObj.caseNumber,
      },
    },
  ];

  const edges: GraphEdge[] = [
    {
      source: p1Id,
      target: p2Id,
      rel_type: 'associated_with',
      count: 9 + (numExtract % 11),
      confidence: 0.94,
    },
    {
      source: p2Id,
      target: p3Id,
      rel_type: 'associated_with',
      count: 6 + (numExtract % 7),
      confidence: 0.89,
    },
    {
      source: p1Id,
      target: org1Id,
      rel_type: 'employed_by',
      count: 1,
      confidence: 0.99,
    },
    {
      source: p2Id,
      target: org1Id,
      rel_type: 'transferred_money_to',
      total_amount: Math.round(vol * 0.45),
      confidence: 0.96,
    },
    {
      source: org1Id,
      target: org2Id,
      rel_type: 'transferred_money_to',
      total_amount: Math.round(vol * 0.35),
      confidence: 0.95,
    },
    {
      source: p1Id,
      target: ph1Id,
      rel_type: 'owns',
      count: 1,
      confidence: 0.98,
    },
    {
      source: p2Id,
      target: ph2Id,
      rel_type: 'owns',
      count: 1,
      confidence: 0.96,
    },
    {
      source: ph1Id,
      target: ph2Id,
      rel_type: 'communicated_with',
      count: 22 + (numExtract % 19),
      confidence: 0.97,
    },
    {
      source: p1Id,
      target: vh1Id,
      rel_type: 'owns',
      count: 1,
      confidence: 0.93,
    },
    {
      source: p2Id,
      target: vh1Id,
      rel_type: 'traveled_with',
      count: 4 + (numExtract % 5),
      confidence: 0.88,
    },
    {
      source: p1Id,
      target: loc1Id,
      rel_type: 'visited',
      count: 5 + (numExtract % 6),
      confidence: 0.91,
    },
    {
      source: vh1Id,
      target: loc1Id,
      rel_type: 'visited',
      count: 7 + (numExtract % 4),
      confidence: 0.94,
    },
    {
      source: p2Id,
      target: ev1Id,
      rel_type: 'attended',
      count: 1,
      confidence: 0.95,
    },
    {
      source: p3Id,
      target: org2Id,
      rel_type: 'associated_with',
      count: 3 + (numExtract % 4),
      confidence: 0.87,
    },
  ];

  const communities = [
    {
      community_id: 0,
      size: 5,
      members: [p1Id, p2Id, ph1Id, ph2Id, vh1Id],
    },
    {
      community_id: 1,
      size: 3,
      members: [org1Id, org2Id, p3Id],
    },
    {
      community_id: 2,
      size: 2,
      members: [loc1Id, ev1Id],
    },
  ];

  const suspectRoster = [
    {
      id: p1Id,
      name: p1Name,
      role: 'Primary Syndicate Mastermind',
      risk: true,
      score: p1Score,
      jurisdiction: reg.city,
    },
    {
      id: p2Id,
      name: p2Name,
      role: 'Cash Courier & Pass-Through Mule',
      risk: true,
      score: p2Score,
      jurisdiction: reg.city,
    },
    {
      id: p3Id,
      name: p3Name,
      role: 'Financial Broker & Hawala Conduit',
      risk: numExtract % 3 !== 0,
      score: p3Score,
      jurisdiction: reg.state,
    },
  ];

  return {
    nodes,
    edges,
    analytics: {
      metrics: {
        node_count: nodes.length,
        edge_count: edges.length,
        density: Number((edges.length / (nodes.length * (nodes.length - 1) * 0.5)).toFixed(3)),
        avg_degree: Number(((edges.length * 2) / nodes.length).toFixed(2)),
        components: 1,
      },
      communities,
    },
    suspectRoster,
  };
}
