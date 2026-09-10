// AI Machine Learning Predictive Threat & Target Forecaster Dataset
// Covers 105+ Suspect Entities and Cases across Indian Syndicates

export interface PredictiveTargetCase {
  id: string;
  caseNumber: string;
  caseTitle: string;
  suspectId: string;
  suspectName: string;
  suspectAlias: string;
  suspectRole: string;
  syndicate: string;
  state: string;
  city: string;
  
  // Predictive AI Forecast
  predictedTarget: string;
  targetType: 'Financial Institution' | 'Bullion Vault' | 'Government Officer' | 'Logistics Fleet' | 'Corporate Victim' | 'Payment Gateway';
  targetLocation: string;
  attackMethod: string;
  methodCategory: 'Hawala & Money Laundering' | 'Cyber Fraud & SIM-Swap' | 'Highway Interception & Cargo' | 'Shell Round-Tripping' | 'Extortion & Blackmail';
  probabilityScore: number;
  timeWindow: string;
  vulnerabilityFactor: string;
  recommendedCountermeasure: string;
  attackVectorSteps: string[];
}

const SUSPECT_NAMES = [
  { name: 'Vikram Rathore', alias: 'Shadow Kingpin', role: 'Syndicate Boss / Master Financier', state: 'Maharashtra', city: 'Mumbai' },
  { name: 'Sunil Verma', alias: 'Chhota Hawala', role: 'Chief Hawala Cash Courier', state: 'Delhi', city: 'New Delhi' },
  { name: 'Rashid Al-Mansoor', alias: 'The Gold Broker', role: 'Offshore Bullion Clearing Agent', state: 'Gujarat', city: 'Ahmedabad' },
  { name: 'Rajesh Singhania', alias: 'Bullion Vault Master', role: 'Precious Metals Enclave Receiver', state: 'Rajasthan', city: 'Jaipur' },
  { name: 'Sameer Khan', alias: 'Sim Swapper', role: 'Telecom Burner Coordinator', state: 'Karnataka', city: 'Bengaluru' },
  { name: 'Dinesh Kulkarni', alias: 'Highway Phantom', role: 'Interstate Freight Logistics Lead', state: 'Maharashtra', city: 'Pune' },
  { name: 'Priya Sharma', alias: 'Nexa Architect', role: 'Dummy UPI Gateway Merchant Director', state: 'Haryana', city: 'Gurugram' },
  { name: 'Tariq Mahmood', alias: 'VoIP Relay', role: 'Offshore Proxy Server Operator', state: 'West Bengal', city: 'Kolkata' },
  { name: 'Harpreet Singh', alias: 'Border Freight', role: 'Heavy Rail Transit Smuggler', state: 'Punjab', city: 'Amritsar' },
  { name: 'Anand Vardhan', alias: 'Shell Manager', role: 'Ghost Company Auditor', state: 'Tamil Nadu', city: 'Chennai' },
  { name: 'Karan Malhotra', alias: 'Crypto OTC', role: 'Tokenized Liquidity Liquidation Lead', state: 'Telangana', city: 'Hyderabad' },
  { name: 'Deepak Patel', alias: 'Diamond Conduit', role: 'Customs Transit Specialist', state: 'Gujarat', city: 'Surat' },
  { name: 'Sanjay Deshmukh', alias: 'Escort Pilot', role: 'High-Speed Convoy Driver', state: 'Maharashtra', city: 'Nagpur' },
  { name: 'Manoj Agarwal', alias: 'Chamber Ledger', role: 'Bearer Slip Token Accountant', state: 'Uttar Pradesh', city: 'Lucknow' },
  { name: 'Arun Nair', alias: 'Port Clearence', role: 'Maritime Container Wharfman', state: 'Kerala', city: 'Kochi' },
  { name: 'Ramesh Reddy', alias: 'Red Sand Lead', role: 'Forest Contraband Logistics Broker', state: 'Andhra Pradesh', city: 'Visakhapatnam' },
  { name: 'Suresh Patil', alias: 'Goa Coastal', role: 'Offshore Yacht Trans-shipment Lead', state: 'Goa', city: 'Panaji' },
  { name: 'Gaurav Bansal', alias: 'Noida Server', role: 'Cloud Call Center Extortionist', state: 'Uttar Pradesh', city: 'Noida' },
  { name: 'Mukesh Goyal', alias: 'Bhopal Depot', role: 'Central India Weapons Courier', state: 'Madhya Pradesh', city: 'Bhopal' },
  { name: 'Jitendra Shah', alias: 'Ranchi Mining', role: 'Illegal Mineral Transit Financier', state: 'Jharkhand', city: 'Ranchi' },
];

const TARGETS_CATALOG = [
  { target: 'Karol Bagh Bullion Reserve Vault #4', type: 'Bullion Vault' as const, loc: 'New Delhi', vuln: 'Single physical lock with night-time courier delivery access.' },
  { target: 'Nodal RTGS Escrow Account (Apex Mercantile)', type: 'Financial Institution' as const, loc: 'Mumbai BKC', vuln: 'Outdated batch settlement without real-time multi-factor biometric check.' },
  { target: 'NH-48 Khed-Shivapur Toll Transport Consignment #9921', type: 'Logistics Fleet' as const, loc: 'Pune-Satara Highway', vuln: 'FASTag lane automated boom barrier opening without physical manual weighing.' },
  { target: 'State Cooperative Bank Clearing Gateway', type: 'Payment Gateway' as const, loc: 'Ahmedabad', vuln: 'Dummy merchant MID terminal registered under inactive shell company GSTIN.' },
  { target: 'Directorate General of Port Freight (Container Depot 14)', type: 'Government Officer' as const, loc: 'Chennai Port', vuln: 'Forged Bill of Lading stamp with pre-signed clearance documentation.' },
  { target: 'NexaPay Merchant Aggregator Pool #88', type: 'Payment Gateway' as const, loc: 'Gurugram Cyber City', vuln: 'High-volume micro-transactions bypassing automated AML threshold limits.' },
  { target: 'Tirupati Sandalwood Depository & Forest Weighbridge', type: 'Logistics Fleet' as const, loc: 'Andhra Pradesh Border', vuln: 'Unmonitored night bypass route cutting through private agricultural land.' },
  { target: 'Kolkata Salt Lake Sector V Server Relay Node', type: 'Corporate Victim' as const, loc: 'Kolkata', vuln: 'Unpatched VoIP gateway forwarding burner calls to overseas telephone exchanges.' },
  { target: 'Indo-Nepal Border Land Customs Station (Raxaul Post)', type: 'Government Officer' as const, loc: 'Bihar Border', vuln: 'Heavy pedestrian congestion allowing undetected bearer token handovers.' },
  { target: 'Panaji Marina Commercial Fuel Jetty #2', type: 'Logistics Fleet' as const, loc: 'Goa Coastline', vuln: 'Unregistered high-speed fibreglass motorboats operating without AIS transponders.' },
];

const METHODS_CATALOG = [
  {
    method: 'SIM-Swap & API Authentication Hijack',
    category: 'Cyber Fraud & SIM-Swap' as const,
    prob: 94.2,
    window: 'Within 24 to 48 Hours',
    counter: 'Order telecom operator to place immediate freeze on suspect IMSI/SIM reallocation. Notify bank nodal team.',
    steps: ['Clone victim telecom SIM via bribed retail agent', 'Intercept banking OTPs and login to corporate NetBanking', 'Execute rapid RTGS transfers to 16 mule accounts', 'Cash out via Hawala token brokers']
  },
  {
    method: 'Bearer Tokenized Hawala Cash-Out',
    category: 'Hawala & Money Laundering' as const,
    prob: 91.8,
    window: 'Next Banking Settlement Cycle',
    counter: 'Deploy surveillance units at target commercial bullion enclave. Intercept couriers matching token serial GOLD-DXB-99.',
    steps: ['Token code issued in Dubai messaging room', 'Local courier meets recipient in crowded wholesale alley', 'Split physical cash packets of ₹500 denominations', 'Transport via hidden vehicular floor compartments']
  },
  {
    method: 'Armed Highway Convoy Night Interception',
    category: 'Highway Interception & Cargo' as const,
    prob: 88.5,
    window: 'Tonight (01:30 AM - 04:00 AM)',
    counter: 'Deploy State Police Highway Interceptor QRT vehicles at NH-48 toll plaza. Activate spiked road barriers.',
    steps: ['Scout lead vehicle Fortuner checks for police checkpoints', 'Main transport truck trails 60-90 seconds behind', 'Bypass weighbridge via pre-arranged automated Fastag lane', 'Deliver cargo to fortified underground safehouse']
  },
  {
    method: 'Shell Company Circular Invoice Round-Tripping',
    category: 'Shell Round-Tripping' as const,
    prob: 86.4,
    window: 'Upcoming Fiscal Month End',
    counter: 'Serve Section 91 CrPC notice to Registrar of Companies (RoC). Freeze linked bank accounts under Section 102.',
    steps: ['Generate fake import invoices for non-existent IT equipment', 'Transfer funds through 7 layered shell entities', 'Claim fraudulent input tax credit (ITC)', 'Remit balance overseas via bogus consulting charges']
  },
  {
    method: 'Deepfake Voice & Executive Impersonation Extortion',
    category: 'Extortion & Blackmail' as const,
    prob: 82.7,
    window: 'Next 3 to 5 Business Days',
    counter: 'Issue cybersecurity advisory to target corporate finance officer. Implement mandatory multi-party video call authorization.',
    steps: ['Harvest public audio samples of corporate executive', 'Synthesize deepfake voice model using generative AI', 'Place urgent call to finance officer from spoofed caller ID', 'Instruct emergency RTGS wire to designated escrow account']
  },
];

function generate105PredictiveCases(): PredictiveTargetCase[] {
  const cases: PredictiveTargetCase[] = [];

  for (let i = 0; i < 108; i++) {
    const s = SUSPECT_NAMES[i % SUSPECT_NAMES.length];
    const t = TARGETS_CATALOG[(i * 3 + 2) % TARGETS_CATALOG.length];
    const m = METHODS_CATALOG[(i * 2 + 1) % METHODS_CATALOG.length];

    const caseNumber = `CR-2026-${String(100 + i).padStart(5, '0')}`;
    const caseTitle = `Operation ${s.name.split(' ')[0]} Nexus: Phase ${Math.floor(i / 10) + 1}`;
    const syndicate = i % 4 === 0 ? 'D-Company Hawala Cartel' : i % 3 === 0 ? 'Golden Crescent Transit Ring' : 'Phantom Cyber-Fin Syndicate';

    cases.push({
      id: `pred-case-${i + 1}`,
      caseNumber,
      caseTitle,
      suspectId: `P-${String(100 + i).padStart(4, '0')}`,
      suspectName: s.name,
      suspectAlias: s.alias,
      suspectRole: s.role,
      syndicate,
      state: s.state,
      city: s.city,
      predictedTarget: t.target,
      targetType: t.type,
      targetLocation: t.loc,
      attackMethod: m.method,
      methodCategory: m.category,
      probabilityScore: Number((m.prob - ((i % 5) * 1.8)).toFixed(1)),
      timeWindow: m.window,
      vulnerabilityFactor: t.vuln,
      recommendedCountermeasure: m.counter,
      attackVectorSteps: m.steps,
    });
  }

  return cases;
}

export const PREDICTIVE_THREAT_CASES: PredictiveTargetCase[] = generate105PredictiveCases();
