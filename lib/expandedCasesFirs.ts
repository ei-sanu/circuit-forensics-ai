import { CaseRecord, FirRecord } from './data';

// =============================================================================
// 20 BASE CURATED INDIAN ENTERPRISE CASES / INVESTIGATIONS
// =============================================================================
const BASE_EXPANDED_CASES: CaseRecord[] = [
  {
    caseNumber: 'CR-2026-00124',
    title: 'Operation Nightfall (Multi-Jurisdiction Syndicate)',
    category: 'Hawala & Shell Transit',
    description: 'Investigation into a high-velocity circular laundering and smurfing network routing illicit extortion and contraband proceeds from Mumbai across Delhi and Kolkata via NorthStar Logistics and cash mule networks.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'Senior Inspector Vikram Shinde',
    department: 'Cyber Crime & Financial Intelligence Division',
    region: 'Western & Northern Zones (Mumbai - Delhi - Kolkata)',
    filedDate: '2026-08-14',
    totalVolume: 6050000,
    tags: ['hawala', 'shell_company', 'pass_through_mule', 'dns_318', 'circular_loop'],
    entityIds: ['P-0001', 'P-0002', 'P-0003', 'O-0001', 'P-0007', 'VH-0001'],
    timeline: [
      { date: '2026-08-14', title: 'FIR Filed: Colaba Cyber Crime PS', description: 'FIR #FIR-MUM-2026-0891 registered under DNS 318, 61, 338 alleging ₹4.2 Crore fraudulent loan deflection.', type: 'fir', severity: 'critical' },
      { date: '2026-08-15', title: 'Pass-Through Anomaly Detected', description: 'Dinesh Kulkarni account received ₹650,000 and forwarded ₹600,000 (92.3%) to NorthStar Logistics within 4 hours.', type: 'transaction', severity: 'critical' },
      { date: '2026-08-18', title: 'Circular Fund Routing Confirmed', description: 'Directed closed cycle detected: Vikram Rathore -> Sunil Verma -> Anand Singhal -> NorthStar Logistics -> Vikram Rathore.', type: 'transaction', severity: 'critical' },
      { date: '2026-08-22', title: 'Odd-Hour Interception', description: '384s encrypted VOIP call logged at 02:15 AM from Bandra West tower between Rathore and Sunil Verma.', type: 'interception', severity: 'high' },
      { date: '2026-08-28', title: 'Toll Plaza Intercept', description: 'Toyota Fortuner MH-01-EA-9021 flagged crossing Khed Shivapur toll plaza with escort Innova in convoy.', type: 'raid', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-001', type: 'FIR Document', title: 'Certified FIR Copy FIR-MUM-2026-0891', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'verified' },
      { id: 'EVD-002', type: 'Bank Statement', title: 'SBI Overdraft Statement - NorthStar Logistics', hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', status: 'verified' },
      { id: 'EVD-003', type: 'CDR Logs', title: 'Bandra Tower 14-B CDR Audit (Aug 1 - Aug 25)', hash: '8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677', status: 'verified' },
      { id: 'EVD-004', type: 'ANPR Toll Capture', title: 'Khed-Shivapur Toll Camera High-Res Frame', hash: 'cafebabe0123456789abcdef0123456789abcdef0123456789abcdef01234567', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00842',
    title: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    category: 'Cross-Border Bullion Factoring',
    description: 'Offshore gold bullion tokenization and rapid laundering from Deira Gold Souk through Karol Bagh vaults and Ahmedabad shell firms.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'ACP Rakesh Malhotra',
    department: 'Special Operations Cell & Directorate of Revenue Intelligence',
    region: 'International / Delhi / Gujarat',
    filedDate: '2026-08-20',
    totalVolume: 12500000,
    tags: ['bullion', 'dubai_corridor', 'gold_tokenization', 'customs_act_135'],
    entityIds: ['P-0004', 'P-0005', 'O-0002', 'P-0001'],
    timeline: [
      { date: '2026-08-20', title: 'DRI Interception in Karol Bagh', description: 'Interception of 4kg unhallmarked bullion bars with overseas serial stamps.', type: 'raid', severity: 'critical' },
      { date: '2026-08-22', title: 'Hawala Ledger Intercept', description: 'Ledger notebook matching UAE telephone contacts and token codes recovered.', type: 'intel', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-010', type: 'Customs Seizure Memo', title: 'Karol Bagh Physical Bullion Interception Report', hash: '554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00315',
    title: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    category: 'Contraband Logistics & Highway Escort',
    description: 'Inter-state transit network moving contraband timber and restricted items from perimeter forest reserves across Karnataka and Maharashtra to port terminals.',
    status: 'under_review',
    priority: 'high',
    leadInvestigator: 'Inspector Ananth Kumar',
    department: 'Special Crime Intelligence Wing',
    region: 'Southern Corridor (Bengaluru - Pune - Chennai)',
    filedDate: '2026-07-15',
    totalVolume: 4200000,
    tags: ['contraband', 'anpr_tracking', 'highway_escort', 'fleet_syndicate'],
    entityIds: ['P-0006', 'P-0007', 'O-0004', 'VH-0003', 'VH-0005'],
    timeline: [
      { date: '2026-07-15', title: 'Forest Perimeter Sensor Trigger', description: 'Unregistered heavy freight movements logged off-hours on NH-48.', type: 'intel', severity: 'high' },
      { date: '2026-07-28', title: 'Toll Plaza Sighting', description: 'Tata Prima KA-01-MJ-8822 spotted crossing Hosur Toll Plaza accompanied by escort Innova MH-12-PQ-7788.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-020', type: 'ANPR Log', title: 'Hosur Toll Fastag Batch Cross-Check Log', hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00489',
    title: 'Project Phantom: Cyber-Fin & Mule Network',
    category: 'Layered UPI & Crypto OTC Liquidation',
    description: 'Automated mule ring utilizing 84 burner UPI accounts and P2P USDT swaps to disperse cyber-extortion proceeds across 6 jurisdictions.',
    status: 'active',
    priority: 'high',
    leadInvestigator: 'Inspector K. S. Rao',
    department: 'Cyber Forensics Unit',
    region: 'NCR - Kolkata - Surat - Hyderabad',
    filedDate: '2026-08-28',
    totalVolume: 21000000,
    tags: ['cyber_fraud', 'mule_accounts', 'crypto_otc', 'rogue_gateways'],
    entityIds: ['P-0006', 'P-0008', 'O-0005', 'P-0002'],
    timeline: [
      { date: '2026-08-28', title: 'Mule Ring Intercept', description: '84 automated UPI merchant IDs flagged for rapid fan-out smurfing.', type: 'intel', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-035', type: 'UPI Ledger Audit', title: 'Cyber Cell NPCI Transaction Correlation Docket', hash: '66778899aabbccddeeff00112233445566778899aabbccddeeff001122334455', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00712',
    title: 'Operation Eastern Corridor: Rail Cargo Smuggling',
    category: 'Inland Railway Freight & Border Posts',
    description: 'Investigation into contraband transshipment concealed in sealed inland railway freight containers traversing Bihar, West Bengal, and Assam.',
    status: 'under_review',
    priority: 'medium',
    leadInvestigator: 'Inspector S. K. Mukherjee',
    department: 'Railway Protection Force & CID',
    region: 'Patna - Varanasi - Siliguri - Guwahati',
    filedDate: '2026-08-05',
    totalVolume: 1500000,
    tags: ['rail_transit', 'border_post', 'cargo_fraud'],
    entityIds: ['P-0003', 'P-0007', 'O-0003'],
    timeline: [
      { date: '2026-08-05', title: 'Siliguri Rail Yard Seizure', description: 'Unmanifested cargo parcels seized from express parcel van at New Jalpaiguri yard.', type: 'raid', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-042', type: 'Railway Manifest', title: 'Consignment Note & False Invoicing Docket', hash: '887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa99', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00905',
    title: 'Operation White Collar: Synthetic GST Invoicing Ring',
    category: 'Corporate Tax Evasion & Shell Layering',
    description: 'Syndicate operating 38 paper companies claiming ₹84.5 Crores in fraudulent Input Tax Credit (ITC) without actual movement of goods across Gujarat and Maharashtra.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'Joint Commissioner Alok Mehta',
    department: 'Directorate General of GST Intelligence (DGGI)',
    region: 'Ahmedabad - Surat - Mumbai',
    filedDate: '2026-07-22',
    totalVolume: 84500000,
    tags: ['gst_fraud', 'fake_invoices', 'shell_corporations', 'circular_itc'],
    entityIds: ['P-0005', 'P-0008', 'O-0001', 'O-0003'],
    timeline: [
      { date: '2026-07-22', title: 'DGGI Simultaneous Raids', description: '12 commercial premises searched across Surat textile cluster and Navrangpura.', type: 'raid', severity: 'critical' },
      { date: '2026-08-02', title: 'Digital Token Seizure', description: '68 DSC keys and forged letterheads seized from single accountant premise.', type: 'intel', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-051', type: 'GST Forensic Audit', title: 'GSTN Portal E-Way Bill Discrepancy Matrix', hash: '99887766aabbccddeeff00112233445566778899aabbccddeeff001122334455', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00231',
    title: 'Operation Black Pearl: Nhava Sheva Maritime Container Smuggling',
    category: 'Port Security & Customs Fraud',
    description: 'Misdeclared sea freight containers passing through JNPT Nhava Sheva containing restricted electronic consignments and undeclared luxury contraband.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'Deputy Commissioner Rajiv Sen',
    department: 'Customs Special Investigation & Intelligence Branch (SIIB)',
    region: 'Navi Mumbai - Mundra - Dubai',
    filedDate: '2026-08-11',
    totalVolume: 34000000,
    tags: ['port_smuggling', 'container_fraud', 'customs_act', 'dubai_gateway'],
    entityIds: ['P-0004', 'O-0001', 'P-0007', 'VH-0002'],
    timeline: [
      { date: '2026-08-11', title: 'Container Inspection Hold', description: '40ft container #MSKU-982103 flagged at JNPT CFS for non-intrusive container scanner anomaly.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-062', type: 'Container Scan Image', title: 'High-Energy X-Ray Radiograph Showing Hidden Compartment', hash: 'aabbccddee11223344556677889900aabbccddee11223344556677889900aabb', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00614',
    title: 'Operation CryptoSink: Rogue P2P OTC Liquidation',
    category: 'Cryptocurrency Laundering',
    description: 'Illicit USDT/INR cash-out syndicates bypassing FIU-IND registrations and converting extortion ransoms into physical Hawala currency drops.',
    status: 'active',
    priority: 'high',
    leadInvestigator: 'Superintendent Neha Varma',
    department: 'Financial Intelligence Unit (FIU) & ED',
    region: 'Gurugram - Bengaluru - Hyderabad',
    filedDate: '2026-08-19',
    totalVolume: 47200000,
    tags: ['crypto_otc', 'usdt_arbitrage', 'p2p_fraud', 'pmla_sec_3'],
    entityIds: ['P-0002', 'P-0006', 'O-0005', 'P-0008'],
    timeline: [
      { date: '2026-08-19', title: 'Cold Storage Wallet Traced', description: 'On-chain heuristics tied TRC-20 wallet TxTJq89... to 14 cyber-crime FIRs.', type: 'intel', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-075', type: 'Blockchain Cluster Trace', title: 'Chainalysis Graph Evidence Export for Target Wallets', hash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00155',
    title: 'Operation Vajra: Spurious Pharmaceuticals Supply Chain',
    category: 'Counterfeit Medical Goods',
    description: 'Inter-state racket manufacturing counterfeit oncology and anti-rabies injections with zero active ingredients, distributed to private clinics.',
    status: 'under_review',
    priority: 'high',
    leadInvestigator: 'Inspector Rameshwar Singh',
    department: 'State Drug Control Administration & CID',
    region: 'Baddi - Indore - Delhi NCR',
    filedDate: '2026-07-29',
    totalVolume: 18500000,
    tags: ['spurious_drugs', 'bns_276', 'public_safety', 'supply_chain_fraud'],
    entityIds: ['P-0003', 'P-0007', 'O-0004'],
    timeline: [
      { date: '2026-07-29', title: 'Factory Seizure in Baddi', description: 'Unlicensed industrial facility sealed; commercial tablet presses and bogus packaging seized.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-084', type: 'Government Analyst Report', title: 'Central Drugs Laboratory Quality Test Failure Certificate', hash: '3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00428',
    title: 'Operation Iron Gate: Darkweb Narcotics & Postal Courier',
    category: 'Narcotics & Postal Smuggling',
    description: 'Synthetic psychotropic substances sourced from Netherlands via darkweb marketplaces, distributed through local courier franchises under false invoices.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'Zonal Director K. Venkat',
    department: 'Narcotics Control Bureau (NCB)',
    region: 'Kochi - Goa - Chandigarh',
    filedDate: '2026-08-03',
    totalVolume: 29000000,
    tags: ['ndps_act', 'darkweb_courier', 'monero_payments', 'postal_intercept'],
    entityIds: ['P-0001', 'P-0006', 'VH-0004'],
    timeline: [
      { date: '2026-08-03', title: 'Foreign Post Office Intercept', description: '500 blotters of synthetic substances detected concealed within children books.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-096', type: 'Narcotics Forensic Report', title: 'Forensic Science Laboratory (FSL) Chemical Test Certificate', hash: '556677889900aabbccddeeff11223344556677889900aabbccddeeff11223344', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00889',
    title: 'Operation Shadow Titling: Wakf & Revenue Land Forgery',
    category: 'Real Estate Forgery & Institutional Land Grab',
    description: 'Organized syndicate fabricating 1974 colonial revenue seals and stamp papers to usurp prime government land parcels valued over ₹120 Crores.',
    status: 'under_review',
    priority: 'high',
    leadInvestigator: 'Deputy SP S. Prabhakar',
    department: 'Economic Offences Wing (CID)',
    region: 'Hyderabad - Bengaluru - Pune',
    filedDate: '2026-06-30',
    totalVolume: 120000000,
    tags: ['land_grab', 'forged_revenue_deed', 'bns_338', 'benami_titling'],
    entityIds: ['P-0005', 'P-0007', 'O-0003'],
    timeline: [
      { date: '2026-06-30', title: 'Registrar Office Red Flag', description: 'District Sub-Registrar lodged complaint regarding synthetic encumbrance certificates.', type: 'fir', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-108', type: 'Forensic Handwriting Analysis', title: 'Government Forensic Document Examiner Certificate', hash: '77889900aabbccddeeff11223344556677889900aabbccddeeff112233445566', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00367',
    title: 'Operation D-Ring: Luxury Vehicle Thefts & OBD Cloning',
    category: 'Automotive Crime & Inter-State Transit',
    description: 'High-tech carjacking racket cloning transponder keys via OBD ports within 90 seconds and running stolen luxury SUVs on forged Nagaland RTO documents.',
    status: 'active',
    priority: 'high',
    leadInvestigator: 'ACP Sanjeev Tyagi',
    department: 'Delhi Police Crime Branch & STF',
    region: 'Meerut - Jaipur - Guwahati',
    filedDate: '2026-08-08',
    totalVolume: 16000000,
    tags: ['vehicle_theft', 'obd_cloning', 'rto_forgery', 'interstate_highway'],
    entityIds: ['P-0007', 'VH-0001', 'VH-0003', 'VH-0005'],
    timeline: [
      { date: '2026-08-08', title: 'Chassis Number Tampering Workshop Raid', description: 'Underground garage busted in Meerut; 8 dismantled Toyota Fortuners recovered.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-119', type: 'Automotive Forensics Report', title: 'Laser Etch Forensic Verification on Tampered Chassis Frame', hash: '9900aabbccddeeff11223344556677889900aabbccddeeff1122334455667788', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00512',
    title: 'Operation CallMule: Cyber Extortion & Sextortion Call Center',
    category: 'Cybercrime & Digital Extortion',
    description: '42-workstation illegal VoIP call center posing as federal agency officers (CBI/ED) to extort senior citizens under fake digital arrest threats.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'Inspector Devyani Roy',
    department: 'Bidhannagar Cyber Crime PS',
    region: 'Kolkata - Jamtara - Nuh',
    filedDate: '2026-08-16',
    totalVolume: 38000000,
    tags: ['digital_arrest', 'cyber_extortion', 'voip_spoofing', 'mule_pooling'],
    entityIds: ['P-0006', 'P-0008', 'O-0005'],
    timeline: [
      { date: '2026-08-16', title: 'Salt Lake IT Park Midnight Raid', description: '42 operating VoIP terminals seized in flagrante delicto while extorting victim in Pune.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-128', type: 'VoIP Server Dump', title: 'Asterisk PBX Call Log CDRs & Spoofed Caller ID Logs', hash: 'bbccddeeff11223344556677889900aabbccddeeff11223344556677889900aa', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00678',
    title: 'Operation Bullion Token: Johari Bazar Tokenized Hawala',
    category: 'Gold Bullion Hawala',
    description: 'Bypassing currency reporting limits by distributing brass and silver physical chit tokens backed by Dubai gold bars, redeemed in Karol Bagh.',
    status: 'under_review',
    priority: 'high',
    leadInvestigator: 'Superintendent K. L. Sharma',
    department: 'Rajasthan Police Special Crime Branch',
    region: 'Jaipur - Surat - Mumbai',
    filedDate: '2026-08-01',
    totalVolume: 53000000,
    tags: ['gold_tokens', 'johari_bazar', 'hawala_chit', 'tax_evasion'],
    entityIds: ['P-0004', 'P-0005', 'O-0002'],
    timeline: [
      { date: '2026-08-01', title: 'Token Vault Discovery', description: 'Underground basement in Johari Bazar found with 340 serialized brass tokens.', type: 'raid', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-135', type: 'Seizure Memo', title: 'Physical Hawala Chit Tokens Recovery Memorandum', hash: 'ddeeff11223344556677889900aabbccddeeff11223344556677889900aabbcc', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00290',
    title: 'Operation Falcon: Inter-State Clandestine Arms Supply',
    category: 'Illegal Firearm Trafficking',
    description: 'Manufacturing of precision 9mm semi-automatic pistols in clandestine riverbed workshops in Munger, supplied to extortion gangs in Delhi NCR.',
    status: 'active',
    priority: 'critical',
    leadInvestigator: 'DSP R. K. Singh',
    department: 'Special Task Force (STF)',
    region: 'Munger - Meerut - Delhi NCR',
    filedDate: '2026-07-10',
    totalVolume: 8500000,
    tags: ['arms_act', 'illegal_firearms', 'stf_strike', 'clandestine_foundry'],
    entityIds: ['P-0001', 'P-0007', 'VH-0003'],
    timeline: [
      { date: '2026-07-10', title: 'Highway Intercept on NH-19', description: '24 concealed 9mm pistols recovered from modified fuel tank of commercial SUV.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-142', type: 'Ballistic Test Report', title: 'Central Forensic Science Laboratory (CFSL) Ballistics Examination', hash: 'ff11223344556677889900aabbccddeeff11223344556677889900aabbccddee', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00744',
    title: 'Operation Aqua Mafia: Mechanized Sand Mining & Extortion',
    category: 'Environmental Crime & Armed Extortion',
    description: 'Heavy mechanized riverbed dredging along the Sone and Ganga riverbeds utilizing heavy earthmovers without environmental clearance, escorted by armed muscle.',
    status: 'under_review',
    priority: 'medium',
    leadInvestigator: 'Inspector Anand Trivedi',
    department: 'Mining Task Force & District Police',
    region: 'Varanasi - Sonbhadra - Patna',
    filedDate: '2026-06-15',
    totalVolume: 22000000,
    tags: ['sand_mining', 'ngt_violation', 'armed_escort', 'environmental_crime'],
    entityIds: ['P-0003', 'P-0007', 'O-0004'],
    timeline: [
      { date: '2026-06-15', title: 'Riverbed Night Strike', description: '14 JCB hydraulic excavators and 30 heavy dumper trucks impounded on riverbank.', type: 'raid', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-150', type: 'Satellite Remote Sensing', title: 'ISRO / NRSC High-Resolution Satellite Sand Depletion Overlap', hash: '1133557799bbddff0022446688aaccee1133557799bbddff0022446688aaccee', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00188',
    title: 'Operation MicroChit: Rural Ponzi & Credit Cooperative Siphon',
    category: 'Financial Embezzlement & Cooperative Fraud',
    description: 'Multi-state fraudulent credit society collecting deposits from 18,000 rural self-help groups promising 24% annual returns, diverted into luxury properties.',
    status: 'active',
    priority: 'high',
    leadInvestigator: 'Superintendent B. N. Mohapatra',
    department: 'Economic Offences Wing (Odisha / Jharkhand)',
    region: 'Bhubaneswar - Ranchi - Raipur',
    filedDate: '2026-08-09',
    totalVolume: 62000000,
    tags: ['ponzi_scheme', 'cooperative_fraud', 'bns_318', 'rural_siphon'],
    entityIds: ['P-0002', 'P-0005', 'O-0003'],
    timeline: [
      { date: '2026-08-09', title: 'Bank Accounts Freezing Order', description: '34 operating bank accounts of fake cooperative society frozen under Sec 102 CrPC.', type: 'transaction', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-158', type: 'Chartered Accountant Audit', title: 'Forensic Audit Report Documenting Diverted Deposit Ledgers', hash: '22446688aaccee001133557799bbddff22446688aaccee001133557799bbddff', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00823',
    title: 'Operation Fastag Ghost: Commercial Fleet FASTag Cloning',
    category: 'Highway Tolling Fraud & Identity Theft',
    description: 'Conspiracy cloning RFID FASTag signatures from exempt government/emergency vehicles onto commercial multi-axle freight trucks to evade crores in toll dues.',
    status: 'under_review',
    priority: 'medium',
    leadInvestigator: 'Inspector Dilip Shinde',
    department: 'State Highway Police & NHAI Vigilance',
    region: 'NH-48 / NH-44 / Khed-Shivapur Toll',
    filedDate: '2026-07-25',
    totalVolume: 9200000,
    tags: ['fastag_clone', 'toll_fraud', 'anpr_bypass', 'highway_fleet'],
    entityIds: ['P-0007', 'VH-0001', 'VH-0002', 'VH-0005'],
    timeline: [
      { date: '2026-07-25', title: 'Toll Gantry Sensor Audit', description: 'Dual simultaneous toll transponder hits registered 450km apart within 3 minutes.', type: 'intel', severity: 'high' },
    ],
    evidence: [
      { id: 'EVD-165', type: 'IHMCL Telemetry Logs', title: 'National Electronic Toll Collection (NETC) Transponder Log Matrix', hash: '33557799bbddff1122446688aaccee0033557799bbddff1122446688aaccee00', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00399',
    title: 'Operation ATM Swarm: Inter-State ATM Skimming & Card Cloning',
    category: 'Bank Card Cloning & Electronic Fraud',
    description: 'Specialized gang attaching thermal key-press cameras and deep-insert magnetic skimmers on unmanned rural ATMs across Uttar Pradesh and Madhya Pradesh.',
    status: 'active',
    priority: 'high',
    leadInvestigator: 'ACP R. K. Varma',
    department: 'Cyber Crime Police Station Lucknow',
    region: 'Lucknow - Kanpur - Bhopal',
    filedDate: '2026-08-17',
    totalVolume: 14500000,
    tags: ['atm_skimming', 'magnetic_strip_clone', 'bns_319', 'it_act_66c'],
    entityIds: ['P-0006', 'P-0008', 'O-0005'],
    timeline: [
      { date: '2026-08-17', title: 'ATM Kiosk Surveillance Match', description: 'CCTV facial recognition matched habitual card skimmer installing reader bezel.', type: 'intel', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-174', type: 'Skimmer Hardware Seizure', title: 'CFSL Hardware Forensics on Deep-Insert Magnetic Skimming Circuit', hash: '446688aaccee00112233557799bbddff446688aaccee00112233557799bbddff', status: 'verified' },
    ],
  },
  {
    caseNumber: 'CR-2026-00955',
    title: 'Operation DBT Siphon: Biometric Cloning & Welfare Theft',
    category: 'Government Welfare Diversion',
    description: 'Corrupt common service center operators utilizing synthetic silicone thumb impressions to siphon rural pensions and agricultural welfare subsidies.',
    status: 'under_review',
    priority: 'high',
    leadInvestigator: 'Inspector Rajeshwar Prasad',
    department: 'Economic Offences Unit (EOU) Bihar',
    region: 'Patna - Gaya - Muzaffarpur',
    filedDate: '2026-08-04',
    totalVolume: 11000000,
    tags: ['dbt_fraud', 'biometric_cloning', 'aadhaar_act', 'aeps_diversion'],
    entityIds: ['P-0003', 'P-0007', 'O-0001'],
    timeline: [
      { date: '2026-08-04', title: 'Common Service Center Raid', description: 'Over 850 rubber silicone cloned finger molds recovered along with biometric scanners.', type: 'raid', severity: 'critical' },
    ],
    evidence: [
      { id: 'EVD-183', type: 'Biometric Silicone Molds Seizure', title: 'UIDAI Forensic Investigation & AePS Gateway Failure Audit', hash: '557799bbddff112233446688aaccee00557799bbddff112233446688aaccee00', status: 'verified' },
    ],
  },
];

// =============================================================================
// 24 BASE CURATED AUTHENTIC INDIAN POLICE FIRST INFORMATION REPORTS (FIR)
// =============================================================================
const BASE_EXPANDED_FIRS: FirRecord[] = [
  {
    firNumber: 'FIR-MUM-2026-0891',
    policeStation: 'Colaba Cyber Crime Police Station',
    district: 'Mumbai South',
    state: 'Maharashtra',
    year: '2026',
    gdNumber: 'GD-042/2026',
    gdTime: '03:45 AM',
    inchargeOfficer: 'Senior Inspector Vikram Shinde, SHO',
    complainantName: 'State Bank of India (Forensic Audit Cell)',
    complainantPhone: '+912222019944',
    complainantAddress: 'SBI Corporate Centre, Madame Cama Road, Nariman Point, Mumbai 400021',
    complainantDesignation: 'Chief Vigilance Officer & General Manager',
    accusedNames: ['Vikram Rathore', 'Dinesh Kulkarni', 'NorthStar Logistics Pvt Ltd', 'Sunil Verma'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 61 (Criminal Conspiracy)', 'BNS Sec 338 (Forgery)', 'Section 66D IT Act', 'PMLA Sec 3'],
    incidentDate: '2026-08-14T10:30:00Z',
    incidentLocation: 'Nariman Point Financial Enclave, Mumbai South',
    description: 'Corporate overdraft facility worth ₹4.2 Crore granted for fleet maintenance fraudulently diverted into 14 shell pass-through mule bank accounts and liquidated via cash drops.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-MUM-2026-0891.pdf',
    courtJurisdiction: 'Chief Metropolitan Magistrate Court No. 37, Esplanade, Mumbai',
    propertiesInvolved: '₹4,20,00,000/- fraudulent bank loan; 2 corporate overdraft accounts at Nariman Point branch; 4 commercial transit trucks.',
    delayReason: 'Preliminary forensic transaction audit and bank internal inquiry required before statutory police complaint.',
    ocrExtractedText: `GOVERNMENT OF MAHARASHTRA / STATE POLICE DEPARTMENT
FIRST INFORMATION REPORT (Under Section 173 BNSS 2023 / Section 154 Cr.P.C.)
INTEGRATED INVESTIGATION FORM - I (I.I.F.-I)

1. District: MUMBAI SOUTH, Police Station: COLABA CYBER CRIME, Year: 2026
   FIR No.: FIR-MUM-2026-0891, Date & Time: 14/08/2026 at 11:00 Hours
2. Acts & Sections:
   (i) Bharatiya Nyaya Sanhita (BNS) 2023: Sections 318 (Cheating), 61 (Criminal Conspiracy), 338 (Forgery of valuable security)
   (ii) Information Technology Act 2000: Section 66D (Cheating by personation using computer resource)
   (iii) Prevention of Money Laundering Act (PMLA) 2002: Sections 3 & 4
3. Occurrence of Offence:
   Day: Friday, Date From: 01/08/2026 to 14/08/2026, Time: Continuous
   General Diary Reference Entry No.: 042/2026, Time: 03:45 Hours
4. Place of Occurrence:
   Direction and distance from P.S.: 1.8 Km West, Beat No.: B-04
   Address: Nariman Point Financial Hub, Floor 14, Commercial Tower, Mumbai South
5. Complainant / Informant:
   Name: State Bank of India represented by Chief Vigilance Officer
   Address: Corporate Centre, Madame Cama Road, Nariman Point, Mumbai 400021
   Phone: +912222019944, Nationality: Indian
6. Details of Known / Suspected / Accused Persons:
   (1) Vikram Rathore (Managing Director, NorthStar Logistics Pvt Ltd)
   (2) Dinesh Kulkarni (Freight Coordinator / Account Holder)
   (3) NorthStar Logistics Pvt Ltd (Corporate Entity, CIN: U63090MH2021PTC367812)
   (4) Sunil Verma (Mule Account Conduit)
7. Brief Statement of Offence:
   A written complaint has been received alleging that accused persons hatched a criminal conspiracy to defraud complainant bank of ₹4,20,00,000/- by sanctioning commercial fleet credit facilities backed by forged transit invoices and hypothecation deeds. The disbursed proceeds were immediately layered across multiple non-operational pass-through accounts and converted into cash drops via Hawala tokens.
8. Investigating Officer: Senior Inspector Vikram Shinde, SHO (Badge #PS-MUM-891)`,
    matchedSuspectIds: ['P-0001', 'P-0007', 'O-0001', 'P-0002'],
    matchedSyndicateRisk: 94.2,
    status: 'under_investigation',
    filedByStation: 'Colaba Cyber Crime Police Station',
    createdAt: '2026-08-14T11:00:00Z',
  },
  {
    firNumber: 'FIR-DEL-2026-0412',
    policeStation: 'Karol Bagh Special Cell Police Station',
    district: 'Central Delhi',
    state: 'Delhi NCR',
    year: '2026',
    gdNumber: 'GD-019/2026',
    gdTime: '01:15 AM',
    inchargeOfficer: 'ACP Rakesh Malhotra',
    complainantName: 'Directorate of Revenue Intelligence (DRI) New Delhi',
    complainantPhone: '+911123389012',
    complainantAddress: 'DRI Headquarters, Paryavaran Bhawan, CGO Complex, Lodhi Road, New Delhi',
    complainantDesignation: 'Assistant Director (Intelligence)',
    accusedNames: ['Rashid Al-Mansoor', 'Rajesh Singhania', 'Apex Bullion DMCC'],
    ipcSections: ['BNS Sec 61 (Criminal Conspiracy)', 'Customs Act 1962 Sec 135', 'PMLA 2002 Sec 3/4', 'Foreign Exchange Management Act Sec 8'],
    incidentDate: '2026-08-20T14:15:00Z',
    incidentLocation: 'Karol Bagh Bullion Market, Gurudwara Road, Central Delhi',
    description: 'Interception of 4.2 kg undeclared gold bullion bars stamped with overseas Dubai DMCC hallmarks, routed through physical Hawala tokens without customs duties.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-DEL-2026-0412.pdf',
    courtJurisdiction: 'Special CBI / PMLA Court, Rouse Avenue District Court, New Delhi',
    propertiesInvolved: '4.2 kg 24-Karat Gold Bullion (Value: ₹3,15,00,000/-); Dubai DMCC serialized token chits; 2 encrypted burner handsets.',
    delayReason: 'Immediate interception upon specific actionable intelligence; FIR lodged within 3 hours of seizure panchnama.',
    ocrExtractedText: `DELHI POLICE FIRST INFORMATION REPORT
INTEGRATED INVESTIGATION FORM - I (I.I.F.-I)
District: CENTRAL DELHI, Police Station: KAROL BAGH SPECIAL CELL, Year: 2026
FIR No.: FIR-DEL-2026-0412, Date: 20/08/2026, GD Entry: 019/2026

1. Statutory Provisions:
   BNS 2023 Sec 61, Customs Act 1962 Sec 135 (Evasion of Duty & Smuggling), PMLA 2002 Sec 3/4
2. Complainant:
   Directorate of Revenue Intelligence (DRI), New Delhi Zonal Unit
3. Particulars of Occurrence:
   Place: Karol Bagh Bullion Market, Vault Complex #7, New Delhi
   Date & Time: 20/08/2026 at 14:15 Hours
4. Accused:
   (1) Rashid Al-Mansoor (Residing Dubai / Visiting New Delhi)
   (2) Rajesh Singhania alias Sethji (Bullion Broker, Karol Bagh)
   (3) Apex Bullion DMCC (Overseas Commodity Brokerage Entity)
5. Summary of Incident:
   A joint strike team of DRI and Special Cell intercepted accused carrying an aluminum attache containing 4 serialized gold bullion bars without bills of entry or sovereign duty stamps. Cross-examination of encrypted burner device revealed matching token codes ('GOLD-DXB-99') corresponding to offshore remittances originating in Deira, UAE.
6. Investigating Officer: ACP Rakesh Malhotra (Badge #PS-DEL-412)`,
    matchedSuspectIds: ['P-0004', 'P-0005', 'O-0002'],
    matchedSyndicateRisk: 91.8,
    status: 'chargesheet_filed',
    filedByStation: 'Karol Bagh Special Cell Police Station',
    createdAt: '2026-08-20T15:00:00Z',
  },
  {
    firNumber: 'FIR-BLR-2026-0199',
    policeStation: 'Koramangala Cyber Crime Police Station',
    district: 'Bengaluru South',
    state: 'Karnataka',
    year: '2026',
    gdNumber: 'GD-077/2026',
    gdTime: '08:10 AM',
    inchargeOfficer: 'Inspector Ananth Kumar',
    complainantName: 'Cyber Crime Investigation Bureau, Karnataka',
    complainantPhone: '+918025539090',
    complainantAddress: 'CID Headquarters, Palace Road, Bengaluru 560001',
    complainantDesignation: 'Deputy Superintendent of Police (Cyber)',
    accusedNames: ['Sameer Khan', 'Priya Sharma', 'NexaPay Solutions'],
    ipcSections: ['BNS Sec 319 (Cheating by Personation)', 'BNS Sec 318', 'Section 66C & 66D IT Act', 'BNS Sec 61'],
    incidentDate: '2026-08-28T09:00:00Z',
    incidentLocation: 'Outer Ring Road, Bellandur, Bengaluru',
    description: 'Syndicate deploying 84 automated burner UPI payment gateway merchant accounts to fan-out and structure extortion proceeds within seconds of receipt.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-BLR-2026-0199.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Bengaluru Urban District, Bengaluru',
    propertiesInvolved: '₹2,10,00,000/- structured cyber extortion deposits; 84 mule UPI accounts; 12 smart payment terminals.',
    delayReason: 'Time required to obtain digital server logs from cloud payment gateway providers.',
    ocrExtractedText: `KARNATAKA STATE POLICE - FIRST INFORMATION REPORT
P.S.: KORAMANGALA CYBER CRIME, BENGALURU
FIR Number: FIR-BLR-2026-0199, Date: 28/08/2026, GD No.: 077/2026

Acts & Sections: BNS 2023 Sec 319, 318, 61; Information Technology Act Sec 66C, 66D
Accused Persons:
1. SAMEER KHAN (Architect / Tech Operator)
2. PRIYA SHARMA (Financial Mules Coordinator)
3. NEXAPAY SOLUTIONS (Unregistered Shell Fintech Entity)

Brief Particulars:
Technical monitoring detected coordinated smurfing of digital extortion ransoms collected through fake electric utility bills. The funds were instantly dispersed across 84 mule UPI addresses within 90-second windows and transferred to crypto P2P aggregators.
IO: Inspector Ananth Kumar (Badge #PS-BLR-199)`,
    matchedSuspectIds: ['P-0006', 'P-0008', 'O-0005'],
    matchedSyndicateRisk: 88.0,
    status: 'under_investigation',
    filedByStation: 'Koramangala Cyber Crime Police Station',
    createdAt: '2026-08-28T09:45:00Z',
  },
  {
    firNumber: 'FIR-HYD-2026-0521',
    policeStation: 'Cyberabad Cyber Crime Police Station',
    district: 'Cyberabad',
    state: 'Telangana',
    year: '2026',
    gdNumber: 'GD-031/2026',
    gdTime: '04:15 AM',
    inchargeOfficer: 'ACP K. Venkat Reddy',
    complainantName: 'Dr. Srinivas Rao (Senior Consultant Physician)',
    complainantPhone: '+914023114455',
    complainantAddress: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    complainantDesignation: 'Private Citizen / Victim',
    accusedNames: ['Sameer Khan', 'NexaPay Solutions', 'Imran Mahmood'],
    ipcSections: ['BNS Sec 308 (Extortion)', 'BNS Sec 319 (Cheating by Personation)', 'Section 66D IT Act', 'BNS Sec 111 (Organized Crime)'],
    incidentDate: '2026-08-16T14:30:00Z',
    incidentLocation: 'Hitec City, Madhapur, Hyderabad',
    description: 'Digital arrest extortion racket placing fraudulent Skype calls disguised as Supreme Court & CBI officials, coercing victim to wire ₹1.85 Crores into mule bank accounts.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-HYD-2026-0521.pdf',
    courtJurisdiction: 'First Additional Chief Metropolitan Magistrate, Kukatpally, Cyberabad',
    propertiesInvolved: '₹1,85,00,000/- extorted electronic RTGS funds; 6 bank accounts in Pune and Surat.',
    delayReason: 'Complainant was kept under psychological digital arrest confinement for 48 hours before approaching police.',
    ocrExtractedText: `TELANGANA POLICE DEPARTMENT
FIRST INFORMATION REPORT (I.I.F.-I)
Police Station: CYBERABAD CYBER CRIME, District: CYBERABAD
FIR No.: FIR-HYD-2026-0521, Date: 17/08/2026, GD Entry: 031/2026

Offence: Digital Arrest Extortion & Impersonation of Public Servants
Sections: BNS 2023 Sec 308, 319, 111; IT Act Sec 66D
Complainant: Dr. Srinivas Rao, Jubilee Hills, Hyderabad
Accused: Syndicate operators utilizing VoIP identity 'CBI-HQ-CELL-09'

Details:
The complainant received video calls showing police uniforms and fake court seals asserting that narcotics were seized in an international courier in his name. Under duress, complainant transferred ₹1.85 Crores to purported verification escrow accounts, which were immediately cashed out via ATM clusters in Surat.
IO: ACP K. Venkat Reddy`,
    matchedSuspectIds: ['P-0006', 'P-0009', 'O-0005'],
    matchedSyndicateRisk: 92.5,
    status: 'under_investigation',
    filedByStation: 'Cyberabad Cyber Crime Police Station',
    createdAt: '2026-08-17T10:15:00Z',
  },
  {
    firNumber: 'FIR-KOL-2026-0318',
    policeStation: 'Salt Lake Cyber Crime Police Station',
    district: 'Bidhannagar',
    state: 'West Bengal',
    year: '2026',
    gdNumber: 'GD-055/2026',
    gdTime: '02:40 AM',
    inchargeOfficer: 'Senior Inspector Devyani Roy',
    complainantName: 'Bank of India (Eastern Zonal Vigilance)',
    complainantPhone: '+913322485566',
    complainantAddress: 'BBD Bagh North, Kolkata 700001',
    complainantDesignation: 'Deputy General Manager (Audit)',
    accusedNames: ['Vikram Rathore', 'Anand Singhal', 'NorthStar Logistics Pvt Ltd'],
    ipcSections: ['BNS Sec 318', 'BNS Sec 336 (Forged Document)', 'BNS Sec 61', 'Section 66 IT Act'],
    incidentDate: '2026-08-18T16:00:00Z',
    incidentLocation: 'Sector V, Salt Lake Electronic Complex, Kolkata',
    description: 'Illegal diversion of corporate letter-of-credit funds into bogus freight clearing agents in Kolkata Port and immediate outward remittance to Dubai entities.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-KOL-2026-0318.pdf',
    courtJurisdiction: 'Additional Chief Judicial Magistrate, Bidhannagar, Kolkata',
    propertiesInvolved: '₹3,40,00,000/- Letter of Credit funds; 8 false port clearance certificates.',
    delayReason: 'Inter-branch confirmation needed from overseas correspondent bank.',
    ocrExtractedText: `WEST BENGAL POLICE - FIRST INFORMATION REPORT
Police Station: SALT LAKE CYBER CRIME, Bidhannagar
FIR No.: FIR-KOL-2026-0318, Date: 19/08/2026, GD No.: 055/2026

BNS Sections: 318, 336, 61; IT Act Sec 66
Complainant: Bank of India (Eastern Zonal Vigilance)
Accused: Vikram Rathore, Anand Singhal, NorthStar Logistics

Narrative:
The bank uncovered that NorthStar Logistics utilized synthetic bills of lading to draw letters of credit for non-existent timber shipments. The proceeds were funneled into shell entities operating from Sector V before vanishing through cash withdrawals.
IO: Senior Inspector Devyani Roy`,
    matchedSuspectIds: ['P-0001', 'P-0003', 'O-0001'],
    matchedSyndicateRisk: 89.4,
    status: 'under_investigation',
    filedByStation: 'Salt Lake Cyber Crime Police Station',
    createdAt: '2026-08-19T11:30:00Z',
  },
  {
    firNumber: 'FIR-AHM-2026-0672',
    policeStation: 'Navrangpura Police Station',
    district: 'Ahmedabad City',
    state: 'Gujarat',
    year: '2026',
    gdNumber: 'GD-088/2026',
    gdTime: '06:20 AM',
    inchargeOfficer: 'Police Inspector Hitesh Patel',
    complainantName: 'Directorate General of GST Intelligence (DGGI)',
    complainantPhone: '+917926581122',
    complainantAddress: 'GST Bhawan, Ambawadi, Ahmedabad 380006',
    complainantDesignation: 'Senior Intelligence Officer',
    accusedNames: ['Rajesh Singhania', 'Apex Bullion DMCC', 'Parth Mehta'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 338 (Forgery of Security)', 'Central GST Act 2017 Sec 132', 'BNS Sec 61'],
    incidentDate: '2026-08-22T11:00:00Z',
    incidentLocation: 'C.G. Road, Navrangpura Commercial Zone, Ahmedabad',
    description: 'Syndicate claimed ₹18.4 Crores fake Input Tax Credit by producing synthetic invoices of bullion trading without physical custody or delivery of precious metals.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-AHM-2026-0672.pdf',
    courtJurisdiction: 'Metropolitan Magistrate Court No. 11, Gheekanta, Ahmedabad',
    propertiesInvolved: '₹18,40,00,000/- fraudulent Input Tax Credit; 14 shell business GSTIN registrations.',
    delayReason: 'Detailed GST portal data analytics and physical verification of non-existent factory premises.',
    ocrExtractedText: `GUJARAT STATE POLICE
FIRST INFORMATION REPORT (Under Section 173 BNSS 2023)
Police Station: NAVRANGPURA, District: AHMEDABAD CITY
FIR No.: FIR-AHM-2026-0672, Date: 22/08/2026, GD Entry: 088/2026

Acts: BNS 2023 Sec 318, 338, 61; CGST Act Sec 132(1)(b)
Complainant: Senior Intelligence Officer, DGGI Zonal Unit, Ahmedabad
Accused: Rajesh Singhania (Sethji), Parth Mehta, Apex Bullion

Particulars:
Physical inspection revealed that 14 registered business addresses on C.G. Road were locked 10x10 empty rooms. Invoices worth ₹110 Crores were circularized to extract illicit tax refunds, which were remitted offshore via Hawala channels.
IO: PI Hitesh Patel`,
    matchedSuspectIds: ['P-0005', 'O-0002'],
    matchedSyndicateRisk: 93.0,
    status: 'chargesheet_filed',
    filedByStation: 'Navrangpura Police Station',
    createdAt: '2026-08-22T14:20:00Z',
  },
  {
    firNumber: 'FIR-PUN-2026-0441',
    policeStation: 'Shivajinagar EOW Police Station',
    district: 'Pune City',
    state: 'Maharashtra',
    year: '2026',
    gdNumber: 'GD-022/2026',
    gdTime: '05:00 AM',
    inchargeOfficer: 'Senior Inspector S. Patil',
    complainantName: 'Pune Urban Cooperative Credit Society Federation',
    complainantPhone: '+912025531122',
    complainantAddress: 'FC Road, Shivajinagar, Pune 411005',
    complainantDesignation: 'Executive Director',
    accusedNames: ['Dinesh Kulkarni', 'Sunil Verma', 'NorthStar Logistics Pvt Ltd'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 316 (Criminal Breach of Trust)', 'MPID Act Sec 3 & 4', 'BNS Sec 61'],
    incidentDate: '2026-08-25T15:45:00Z',
    incidentLocation: 'Shivajinagar Commercial Arcade, Pune',
    description: 'Diversion of public term deposits worth ₹8.6 Crores into unsecured personal accounts and transit fleet logistics operations with forged hypothecation certificates.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-PUN-2026-0441.pdf',
    courtJurisdiction: 'Special MPID Court, Pune District & Sessions Court, Shivajinagar',
    propertiesInvolved: '₹8,60,00,000/- cooperative public deposits; 6 luxury vehicles.',
    delayReason: 'Audit report compilation by government-appointed cooperative liquidator.',
    ocrExtractedText: `MAHARASHTRA POLICE - FIRST INFORMATION REPORT
Police Station: SHIVAJINAGAR EOW, District: PUNE CITY
FIR No.: FIR-PUN-2026-0441, Date: 26/08/2026, GD No.: 022/2026

BNS Sections: 318, 316, 61; Maharashtra Protection of Interest of Depositors Act Sec 3
Complainant: Pune Urban Cooperative Credit Society Federation
Accused: Dinesh Kulkarni, Sunil Verma, NorthStar Logistics Pvt Ltd

Brief Statement:
Accused Dinesh Kulkarni received ₹8.6 Crores in unauthorized loan transfers sanctioned by cooperative directors without collateral. Funds were layered into Mumbai accounts and transit vehicle fleet acquisitions within 48 hours.
IO: Senior Inspector S. Patil`,
    matchedSuspectIds: ['P-0007', 'P-0002', 'O-0001'],
    matchedSyndicateRisk: 87.6,
    status: 'under_investigation',
    filedByStation: 'Shivajinagar EOW Police Station',
    createdAt: '2026-08-26T09:00:00Z',
  },
  {
    firNumber: 'FIR-JAI-2026-0289',
    policeStation: 'Kotwali Police Station',
    district: 'Jaipur City',
    state: 'Rajasthan',
    year: '2026',
    gdNumber: 'GD-063/2026',
    gdTime: '02:10 AM',
    inchargeOfficer: 'SHO Bhanwar Singh',
    complainantName: 'Jewellers Association Jaipur (Vigilance Cell)',
    complainantPhone: '+911412563344',
    complainantAddress: 'Johari Bazar, Pink City, Jaipur 302003',
    complainantDesignation: 'Secretary of Vigilance',
    accusedNames: ['Rashid Al-Mansoor', 'Rajesh Singhania', 'Bhanwar Lal Soni'],
    ipcSections: ['BNS Sec 318', 'BNS Sec 61', 'Customs Act Sec 135', 'PMLA Sec 3'],
    incidentDate: '2026-08-21T17:30:00Z',
    incidentLocation: 'Johari Bazar Vault Alley, Jaipur',
    description: 'Operation of illegal Hawala tokens redeeming Dubai smuggled gold bars without sales invoices or GST registration.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-JAI-2026-0289.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate Court, Jaipur Metro',
    propertiesInvolved: '3.5 kg Raw Gold Granules; 42 Serialized Brass Hawala Tokens (Token series DXB-JAI-001 to 042).',
    delayReason: 'Raid conducted on secret informer tip; panchnama concluded at midnight.',
    ocrExtractedText: `RAJASTHAN POLICE FIRST INFORMATION REPORT
Police Station: KOTWALI JAIPUR, District: JAIPUR CITY
FIR No.: FIR-JAI-2026-0289, Date: 22/08/2026, GD Entry: 063/2026

Provisions: BNS 2023 Sec 318, 61; Customs Act Sec 135
Complainant: Jewellers Association Jaipur
Accused: Rashid Al-Mansoor, Rajesh Singhania, Bhanwar Lal Soni

Summary:
Acting on intelligence, police searched a subterranean vault in Johari Bazar, seizing unrecorded bullion tokens matching overseas Hawala conduits. The tokens functioned as bearer currency for transactions across Delhi and Dubai.
IO: SHO Bhanwar Singh`,
    matchedSuspectIds: ['P-0004', 'P-0005'],
    matchedSyndicateRisk: 90.1,
    status: 'under_investigation',
    filedByStation: 'Kotwali Police Station',
    createdAt: '2026-08-22T08:30:00Z',
  },
  {
    firNumber: 'FIR-SUR-2026-0394',
    policeStation: 'Surat City Crime Branch Police Station',
    district: 'Surat',
    state: 'Gujarat',
    year: '2026',
    gdNumber: 'GD-044/2026',
    gdTime: '03:15 AM',
    inchargeOfficer: 'ACP Mukesh Solanki',
    complainantName: 'Surat Diamond Bourse Security & Vigilance Wing',
    complainantPhone: '+912612457788',
    complainantAddress: 'Khajod, Surat 395007',
    complainantDesignation: 'Chief Security Officer',
    accusedNames: ['Sunil Verma', 'Sameer Khan', 'NexaPay Solutions'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 111 (Organized Crime)', 'PMLA 2002 Sec 3/4'],
    incidentDate: '2026-08-27T12:00:00Z',
    incidentLocation: 'Mahidharpura Diamond Market, Surat',
    description: 'Hawala cash pooling center receiving over ₹14 Crores per week from extorted cyber proceeds, converting into rough diamonds for export laundering.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-SUR-2026-0394.pdf',
    courtJurisdiction: 'Principal Sessions Judge, Surat District Court, Athwalines',
    propertiesInvolved: '₹2,80,00,000/- seized physical cash in ₹500 denominations; 2 rough diamond parcels; 4 currency counting machines.',
    delayReason: 'Physical cash counting and currency verification panchnama took 14 hours.',
    ocrExtractedText: `SURAT CITY POLICE - CRIME BRANCH
FIRST INFORMATION REPORT (I.I.F.-I)
FIR No.: FIR-SUR-2026-0394, Date: 28/08/2026, GD: 044/2026

BNS Sections: 318, 111; PMLA Sec 3 & 4
Complainant: Surat Diamond Bourse Security Wing
Accused: Sunil Verma, Sameer Khan, NexaPay Solutions

Particulars:
Crime Branch raided an unbranded office in Mahidharpura, seizing ₹2.8 Crores in unaccounted cash. The funds originated from UPI extortion mules in Bengaluru and were being factored into rough diamond purchase invoices without physical diamond inventory.
IO: ACP Mukesh Solanki`,
    matchedSuspectIds: ['P-0002', 'P-0006', 'O-0005'],
    matchedSyndicateRisk: 95.0,
    status: 'under_investigation',
    filedByStation: 'Surat City Crime Branch Police Station',
    createdAt: '2026-08-28T16:00:00Z',
  },
  {
    firNumber: 'FIR-LKO-2026-0715',
    policeStation: 'Hazratganj Police Station',
    district: 'Lucknow Central',
    state: 'Uttar Pradesh',
    year: '2026',
    gdNumber: 'GD-092/2026',
    gdTime: '07:30 AM',
    inchargeOfficer: 'Inspector Akhilesh Kumar',
    complainantName: 'Punjab National Bank (Zonal Vigilance Lucknow)',
    complainantPhone: '+915222209911',
    complainantAddress: 'Ashok Marg, Hazratganj, Lucknow 226001',
    complainantDesignation: 'Chief Vigilance Manager',
    accusedNames: ['Dinesh Kulkarni', 'Vikram Rathore', 'Anand Singhal'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 338 (Forgery of Security)', 'BNS Sec 61'],
    incidentDate: '2026-08-12T11:20:00Z',
    incidentLocation: 'Vidhan Sabha Marg, Hazratganj, Lucknow',
    description: 'Submission of 18 forged government contract supply bills to secure fraudulent bank advances worth ₹5.2 Crores.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-LKO-2026-0715.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Lucknow District Court, Qaiserbagh',
    propertiesInvolved: '₹5,20,00,000/- fraudulent bank loan; 18 forged state procurement orders with counterfeit stamps.',
    delayReason: 'Confirmation obtained from State Public Works Department confirming contracts were forged.',
    ocrExtractedText: `UP POLICE - FIRST INFORMATION REPORT
Police Station: HAZRATGANJ, District: LUCKNOW CENTRAL
FIR No.: FIR-LKO-2026-0715, Date: 13/08/2026, GD Entry: 092/2026

BNS Sections: 318, 338, 61
Complainant: PNB Zonal Vigilance, Lucknow
Accused: Dinesh Kulkarni, Vikram Rathore, Anand Singhal

Summary:
The accused submitted forged supply bills bearing fake official stamps of the UP PWD department to discount bills of exchange. Upon verification with government treasury, all 18 bills were declared fake. Disbursed funds were routed to Mumbai shell entities.
IO: Inspector Akhilesh Kumar`,
    matchedSuspectIds: ['P-0007', 'P-0001', 'P-0003'],
    matchedSyndicateRisk: 86.2,
    status: 'chargesheet_filed',
    filedByStation: 'Hazratganj Police Station',
    createdAt: '2026-08-13T12:00:00Z',
  },
  {
    firNumber: 'FIR-KOC-2026-0152',
    policeStation: 'Kochi Cyber Police Station',
    district: 'Ernakulam',
    state: 'Kerala',
    year: '2026',
    gdNumber: 'GD-014/2026',
    gdTime: '01:50 AM',
    inchargeOfficer: 'Inspector V. S. Pillai',
    complainantName: 'Customs Preventive Commissionerate, Cochin Port',
    complainantPhone: '+914842668811',
    complainantAddress: 'Custom House, Willingdon Island, Kochi 682009',
    complainantDesignation: 'Superintendent of Customs',
    accusedNames: ['Vikram Rathore', 'Rashid Al-Mansoor', 'Apex Bullion DMCC'],
    ipcSections: ['Customs Act 1962 Sec 135', 'BNS Sec 61', 'PMLA 2002 Sec 3'],
    incidentDate: '2026-08-04T16:30:00Z',
    incidentLocation: 'Cochin International Seaport CFS, Vallarpadam',
    description: 'Misdeclared maritime container carrying commercial electronic components concealing undeclared gold dust paste valued at ₹6.8 Crores.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-KOC-2026-0152.pdf',
    courtJurisdiction: 'Additional Chief Judicial Magistrate (Economic Offences), Ernakulam',
    propertiesInvolved: '11.4 kg Gold Paste (Estimated Pure Value: ₹6,80,00,000/-); 1 refrigerated 20ft marine container.',
    delayReason: 'Chemical extraction and assay verification at Government Mint laboratory.',
    ocrExtractedText: `KERALA POLICE - FIRST INFORMATION REPORT
Police Station: KOCHI CYBER POLICE STATION, Ernakulam
FIR No.: FIR-KOC-2026-0152, Date: 05/08/2026, GD: 014/2026

Customs Act Sec 135; BNS 2023 Sec 61; PMLA Sec 3 & 4
Complainant: Customs Preventive Commissionerate, Willingdon Island
Accused: Vikram Rathore, Rashid Al-Mansoor, Apex Bullion DMCC

Details:
Customs inspection at Vallarpadam Terminal intercepted container #CMAU-441209 originating from Jebel Ali. Inside industrial compressors, customs officers extracted 11.4 kg of gold paste designed to evade x-ray port scanners.
IO: Inspector V. S. Pillai`,
    matchedSuspectIds: ['P-0001', 'P-0004', 'O-0002'],
    matchedSyndicateRisk: 91.0,
    status: 'under_investigation',
    filedByStation: 'Kochi Cyber Police Station',
    createdAt: '2026-08-05T10:00:00Z',
  },
  {
    firNumber: 'FIR-PAT-2026-0633',
    policeStation: 'Patna Kotwali Police Station',
    district: 'Patna',
    state: 'Bihar',
    year: '2026',
    gdNumber: 'GD-071/2026',
    gdTime: '06:40 AM',
    inchargeOfficer: 'Senior Inspector Manoj Tiwari',
    complainantName: 'Directorate of Social Welfare, Government of Bihar',
    complainantPhone: '+916122214455',
    complainantAddress: 'Vikas Bhawan, Bailey Road, Patna 800001',
    complainantDesignation: 'Joint Director (Audit)',
    accusedNames: ['Dinesh Kulkarni', 'Sunil Verma', 'Manoj Kumar'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 338 (Forgery)', 'Aadhaar Act 2016 Sec 42', 'BNS Sec 61'],
    incidentDate: '2026-08-02T13:00:00Z',
    incidentLocation: 'Dak Bungalow Road, Kotwali, Patna',
    description: 'Biometric spoofing ring cloning thumb prints on silicone rubber to hijack government direct benefit transfers and old-age pensions.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-PAT-2026-0633.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Patna District Court',
    propertiesInvolved: '₹3,40,00,000/- siphoned DBT welfare funds; 420 silicone thumb molds; 14 biometric scanners.',
    delayReason: 'UIDAI technical log matching across multiple banking correspondents.',
    ocrExtractedText: `BIHAR POLICE - FIRST INFORMATION REPORT
Police Station: PATNA KOTWALI, District: PATNA
FIR No.: FIR-PAT-2026-0633, Date: 03/08/2026, GD Entry: 071/2026

BNS Sections: 318, 338, 61; Aadhaar Act Sec 42
Complainant: Directorate of Social Welfare, Bihar
Accused: Dinesh Kulkarni, Sunil Verma, Manoj Kumar

Brief:
A raid on a kiosk near Dak Bungalow recovered hundreds of silicone fingerprint replicas with beneficiary Aadhaar lists. The operators siphoned ₹3.4 Crores across 12 months using cloned biometrics.
IO: Senior Inspector Manoj Tiwari`,
    matchedSuspectIds: ['P-0007', 'P-0002'],
    matchedSyndicateRisk: 88.7,
    status: 'under_investigation',
    filedByStation: 'Patna Kotwali Police Station',
    createdAt: '2026-08-03T11:45:00Z',
  },
  {
    firNumber: 'FIR-CHD-2026-0220',
    policeStation: 'Sector 17 Police Station',
    district: 'Chandigarh Central',
    state: 'Chandigarh (UT)',
    year: '2026',
    gdNumber: 'GD-038/2026',
    gdTime: '03:00 AM',
    inchargeOfficer: 'DSP Gurpreet Singh',
    complainantName: 'Excise & Taxation Department, Chandigarh',
    complainantPhone: '+911722704455',
    complainantAddress: 'Sector 17, Chandigarh 160017',
    complainantDesignation: 'Assistant Excise Commissioner',
    accusedNames: ['Vikram Rathore', 'NorthStar Logistics Pvt Ltd', 'Harpreet Sandhu'],
    ipcSections: ['BNS Sec 318', 'Punjab Excise Act Sec 61', 'BNS Sec 61'],
    incidentDate: '2026-07-26T22:30:00Z',
    incidentLocation: 'Madhya Marg, Sector 17, Chandigarh',
    description: 'Interception of 3 container trucks carrying bonded commercial liquor under forged military canteen export passes.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-CHD-2026-0220.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, District Courts Complex, Sector 43, Chandigarh',
    propertiesInvolved: '3,200 cases of premium commercial liquor (Value: ₹2,40,00,000/-); 3 Ashok Leyland heavy transit trucks.',
    delayReason: 'Verification of authenticity of military canteen permits from procurement depot.',
    ocrExtractedText: `CHANDIGARH POLICE - FIRST INFORMATION REPORT
Police Station: SECTOR 17, Chandigarh Central
FIR No.: FIR-CHD-2026-0220, Date: 27/07/2026, GD: 038/2026

Provisions: BNS 2023 Sec 318, 61; Punjab Excise Act Sec 61
Complainant: Assistant Excise Commissioner, Chandigarh
Accused: Vikram Rathore, NorthStar Logistics Pvt Ltd, Harpreet Sandhu

Summary:
Highway mobile patrol intercepted 3 NorthStar Logistics trucks with forged military canteen supply permits. Seized liquor worth ₹2.4 Crores was bound for dry state smuggling.
IO: DSP Gurpreet Singh`,
    matchedSuspectIds: ['P-0001', 'O-0001'],
    matchedSyndicateRisk: 85.0,
    status: 'chargesheet_filed',
    filedByStation: 'Sector 17 Police Station',
    createdAt: '2026-07-27T08:00:00Z',
  },
  {
    firNumber: 'FIR-GUR-2026-0811',
    policeStation: 'Cyber Crime Police Station DLF Phase 4',
    district: 'Gurugram',
    state: 'Haryana',
    year: '2026',
    gdNumber: 'GD-067/2026',
    gdTime: '04:50 AM',
    inchargeOfficer: 'ACP Satyendra Kumar',
    complainantName: 'American Express Banking Corp. (Risk Management)',
    complainantPhone: '+911244589900',
    complainantAddress: 'Cyber City, DLF Phase 2, Gurugram 122002',
    complainantDesignation: 'Director, Global Fraud Risk',
    accusedNames: ['Sameer Khan', 'Priya Sharma', 'NexaPay Solutions'],
    ipcSections: ['BNS Sec 318 (Cheating)', 'BNS Sec 319 (Personation)', 'Section 66C IT Act', 'BNS Sec 61'],
    incidentDate: '2026-08-23T15:10:00Z',
    incidentLocation: 'Golf Course Road, DLF Phase 5, Gurugram',
    description: 'Syndicate running fraudulent online chargeback claims and merchant refund gateways using compromised credit card credentials.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-GUR-2026-0811.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Gurugram District Court',
    propertiesInvolved: '₹5,80,00,000/- fraudulent merchant chargebacks; 48 POS terminals.',
    delayReason: 'Complex digital IP log audit from offshore card networks.',
    ocrExtractedText: `HARYANA POLICE - FIRST INFORMATION REPORT
Police Station: CYBER CRIME PS DLF PHASE 4, GURUGRAM
FIR No.: FIR-GUR-2026-0811, Date: 24/08/2026, GD Entry: 067/2026

BNS Sections: 318, 319, 61; IT Act Sec 66C
Complainant: American Express Banking Corp.
Accused: Sameer Khan, Priya Sharma, NexaPay Solutions

Narrative:
The accused registered fake travel merchant accounts through NexaPay Solutions, running high-velocity synthetic transactions with compromised US and European card credentials before filing automated chargebacks to drain escrow accounts.
IO: ACP Satyendra Kumar`,
    matchedSuspectIds: ['P-0006', 'P-0008', 'O-0005'],
    matchedSyndicateRisk: 91.5,
    status: 'under_investigation',
    filedByStation: 'Cyber Crime Police Station DLF Phase 4',
    createdAt: '2026-08-24T10:30:00Z',
  },
  {
    firNumber: 'FIR-GOA-2026-0177',
    policeStation: 'Panaji Coastal Police Station',
    district: 'North Goa',
    state: 'Goa',
    year: '2026',
    gdNumber: 'GD-025/2026',
    gdTime: '02:00 AM',
    inchargeOfficer: 'Police Inspector Rohan Naik',
    complainantName: 'Narcotics Control Bureau (Goa Sub-Zone)',
    complainantPhone: '+918322421133',
    complainantAddress: 'EDC Complex, Patto Plaza, Panaji 403001',
    complainantDesignation: 'Intelligence Officer',
    accusedNames: ['Vikram Rathore', 'Sameer Khan', 'Zubair Sheikh'],
    ipcSections: ['NDPS Act 1985 Sec 8(c), 21(c), 29', 'BNS Sec 61'],
    incidentDate: '2026-08-06T01:30:00Z',
    incidentLocation: 'Anjuna Beach Coastline, North Goa',
    description: 'Offshore speed boat delivery of commercial quantity of synthetic psychotropic MDMA crystals and distribution via beach club VIP circuits.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-GOA-2026-0177.pdf',
    courtJurisdiction: 'Special NDPS Court, District & Sessions Court, Mapusa, North Goa',
    propertiesInvolved: '2.8 kg Pure MDMA Crystals (Estimated Street Value: ₹8,40,00,000/-); 1 high-speed marine outboard boat.',
    delayReason: 'Offshore marine chase panchnama concluded at early dawn.',
    ocrExtractedText: `GOA POLICE - FIRST INFORMATION REPORT
Police Station: PANAJI COASTAL, District: NORTH GOA
FIR No.: FIR-GOA-2026-0177, Date: 06/08/2026, GD Entry: 025/2026

NDPS Act Sec 8(c), 21(c), 29; BNS 2023 Sec 61
Complainant: Intelligence Officer, NCB Goa
Accused: Vikram Rathore, Sameer Khan, Zubair Sheikh

Details:
Coastal police intercepted a fiberglass speedboat off Anjuna, recovering 2.8 kg of synthetic crystals packaged in vacuum-sealed foil with Dutch stamps. Electronic devices linked the delivery to courier drops funded by Mumbai Hawala channels.
IO: PI Rohan Naik`,
    matchedSuspectIds: ['P-0001', 'P-0006'],
    matchedSyndicateRisk: 96.0,
    status: 'under_investigation',
    filedByStation: 'Panaji Coastal Police Station',
    createdAt: '2026-08-06T09:15:00Z',
  },
  {
    firNumber: 'FIR-CHE-2026-0402',
    policeStation: 'Ashok Nagar Police Station',
    district: 'Chennai South',
    state: 'Tamil Nadu',
    year: '2026',
    gdNumber: 'GD-081/2026',
    gdTime: '05:30 AM',
    inchargeOfficer: 'Inspector R. Muthusamy',
    complainantName: 'Directorate of Revenue Intelligence (Chennai Zonal Unit)',
    complainantPhone: '+914428331122',
    complainantAddress: 'G.N. Chetty Road, T. Nagar, Chennai 600017',
    complainantDesignation: 'Deputy Director',
    accusedNames: ['Priya Sharma', 'Sameer Khan', 'Dinesh Kulkarni'],
    ipcSections: ['Customs Act 1962 Sec 135', 'BNS Sec 61', 'PMLA 2002 Sec 3'],
    incidentDate: '2026-08-10T14:45:00Z',
    incidentLocation: 'Chennai Port Trust Gate No. 2A, Chennai',
    description: 'Attempted outbound export of red sandalwood logs misdeclared as heavy industrial machine spare parts in 2x20ft sea containers.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-CHE-2026-0402.pdf',
    courtJurisdiction: 'Additional Chief Metropolitan Magistrate (E.O.-I), Egmore, Chennai',
    propertiesInvolved: '9.5 Metric Tonnes Red Sandalwood Logs (International Market Value: ₹14,25,00,000/-); 2 container tractor-trailers.',
    delayReason: 'Forest department species botanical verification and timber measurement.',
    ocrExtractedText: `TAMIL NADU POLICE - FIRST INFORMATION REPORT
Police Station: ASHOK NAGAR, District: CHENNAI SOUTH
FIR No.: FIR-CHE-2026-0402, Date: 11/08/2026, GD Entry: 081/2026

Customs Act Sec 135; BNS Sec 61; Wildlife Protection Act Sec 51
Complainant: Deputy Director, DRI Chennai
Accused: Priya Sharma, Sameer Khan, Dinesh Kulkarni

Summary:
DRI officials intercepted two container trucks entering Chennai Port with export shipping bills declaring agricultural pumps. Inspection revealed 9.5 tonnes of grade-A red sanders logs harvested from Seshachalam forests. Transport was coordinated by NorthStar transit fleets.
IO: Inspector R. Muthusamy`,
    matchedSuspectIds: ['P-0008', 'P-0006', 'P-0007'],
    matchedSyndicateRisk: 93.8,
    status: 'under_investigation',
    filedByStation: 'Ashok Nagar Police Station',
    createdAt: '2026-08-11T09:30:00Z',
  },
  {
    firNumber: 'FIR-IND-2026-0359',
    policeStation: 'Vijay Nagar Police Station',
    district: 'Indore',
    state: 'Madhya Pradesh',
    year: '2026',
    gdNumber: 'GD-049/2026',
    gdTime: '03:40 AM',
    inchargeOfficer: 'CSP Prashant Chouhan',
    complainantName: 'State Cyber Police Headquarters, MP',
    complainantPhone: '+917312543322',
    complainantAddress: 'Scheme No. 54, Vijay Nagar, Indore 452010',
    complainantDesignation: 'Superintendent of Police (Cyber)',
    accusedNames: ['Sameer Khan', 'NexaPay Solutions', 'Alok Agarwal'],
    ipcSections: ['BNS Sec 318', 'Section 66D IT Act', 'BNS Sec 111 (Organized Crime)'],
    incidentDate: '2026-08-25T11:30:00Z',
    incidentLocation: 'AB Road, Scheme 54, Vijay Nagar, Indore',
    description: 'Fake high-return stock trading app syndicate duping over 1,200 investors of ₹26 Crores by creating synthetic simulated trading portfolios.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-IND-2026-0359.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate Court, Indore',
    propertiesInvolved: '₹26,00,000/- frozen bank deposits; 18 mobile workstations; 64 corporate SIM cards.',
    delayReason: 'Cyber forensics image acquisition of cloud-hosted fake trading app databases.',
    ocrExtractedText: `MP POLICE - FIRST INFORMATION REPORT
Police Station: VIJAY NAGAR, District: INDORE
FIR No.: FIR-IND-2026-0359, Date: 26/08/2026, GD Entry: 049/2026

BNS 2023 Sec 318, 111; IT Act Sec 66D
Complainant: SP State Cyber Police, Indore
Accused: Sameer Khan, NexaPay Solutions, Alok Agarwal

Narrative:
The syndicate promoted a fake trading application ('AlphaTrade Pro') promising 30% weekly stock market profits. Victims were lured into depositing funds into mule accounts operated by NexaPay, which were layered into crypto OTC liquidations.
IO: CSP Prashant Chouhan`,
    matchedSuspectIds: ['P-0006', 'O-0005'],
    matchedSyndicateRisk: 89.9,
    status: 'under_investigation',
    filedByStation: 'Vijay Nagar Police Station',
    createdAt: '2026-08-26T11:00:00Z',
  },
  {
    firNumber: 'FIR-GUW-2026-0514',
    policeStation: 'Panbazar Police Station',
    district: 'Guwahati City',
    state: 'Assam',
    year: '2026',
    gdNumber: 'GD-072/2026',
    gdTime: '06:10 AM',
    inchargeOfficer: 'ACP Bhaben Barman',
    complainantName: 'Assam Forest Protection Force & CID',
    complainantPhone: '+913612540099',
    complainantAddress: 'Panbazar, MG Road, Guwahati 781001',
    complainantDesignation: 'Divisional Forest Officer',
    accusedNames: ['Dinesh Kulkarni', 'NorthStar Logistics Pvt Ltd', 'Tariq Mahmood'],
    ipcSections: ['Wildlife Protection Act Sec 9, 39, 51', 'BNS Sec 61', 'BNS Sec 318'],
    incidentDate: '2026-08-01T15:00:00Z',
    incidentLocation: 'Guwahati ISBT Transit Hub, NH-27, Guwahati',
    description: 'Interception of inter-state wildlife smuggling network moving exotic fauna and pangolin scales concealed in false partitions of fruit consignment trucks.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-GUW-2026-0514.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Kamrup Metro, Guwahati',
    propertiesInvolved: '34 kg Pangolin Scales; 2 live exotic specimens; 1 refrigerated commercial truck.',
    delayReason: 'Zoological survey identification of seized wildlife contraband.',
    ocrExtractedText: `ASSAM POLICE - FIRST INFORMATION REPORT
Police Station: PANBAZAR, District: GUWAHATI CITY
FIR No.: FIR-GUW-2026-0514, Date: 02/08/2026, GD Entry: 072/2026

Provisions: Wildlife Protection Act Sec 9, 51; BNS 2023 Sec 61
Complainant: DFO Guwahati Forest Division
Accused: Dinesh Kulkarni, NorthStar Logistics, Tariq Mahmood

Details:
A joint checkpoint at ISBT searched truck #AS-01-DD-4411 operated under NorthStar Logistics subcontract. Hidden beneath pineapple crates, officers seized 34 kg of pangolin scales intended for cross-border transit via Moreh.
IO: ACP Bhaben Barman`,
    matchedSuspectIds: ['P-0007', 'O-0001', 'P-0009'],
    matchedSyndicateRisk: 92.1,
    status: 'under_investigation',
    filedByStation: 'Panbazar Police Station',
    createdAt: '2026-08-02T08:30:00Z',
  },
  {
    firNumber: 'FIR-BHU-2026-0298',
    policeStation: 'Saheed Nagar Police Station',
    district: 'Bhubaneswar Urban',
    state: 'Odisha',
    year: '2026',
    gdNumber: 'GD-033/2026',
    gdTime: '02:30 AM',
    inchargeOfficer: 'IIC Bijay Kumar Jena',
    complainantName: 'Odisha Mining Corporation (OMC Vigilance)',
    complainantPhone: '+916742542288',
    complainantAddress: 'OMC House, Bhubaneswar 751001',
    complainantDesignation: 'General Manager (Vigilance)',
    accusedNames: ['Vikram Rathore', 'NorthStar Logistics Pvt Ltd', 'Sunil Verma'],
    ipcSections: ['Mines and Minerals Act Sec 21', 'BNS Sec 303 (Theft)', 'BNS Sec 318', 'BNS Sec 61'],
    incidentDate: '2026-07-20T19:00:00Z',
    incidentLocation: 'Janpath, Saheed Nagar, Bhubaneswar',
    description: 'High-grade iron ore fines transported from Keonjhar mining belt on forged e-transit passes, evading state royalty of ₹12.5 Crores.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-BHU-2026-0298.pdf',
    courtJurisdiction: 'Senior Civil Judge & JMFC, Bhubaneswar',
    propertiesInvolved: '4,800 Metric Tonnes Iron Ore Fines; 18 freight transit vehicles; 42 forged transit permits.',
    delayReason: 'Weighbridge electronic audit against integrated Odisha i3MS mining portal.',
    ocrExtractedText: `ODISHA POLICE - FIRST INFORMATION REPORT
Police Station: SAHEED NAGAR, Bhubaneswar
FIR No.: FIR-BHU-2026-0298, Date: 21/07/2026, GD No.: 033/2026

Mines & Minerals Act Sec 21; BNS 2023 Sec 303, 318, 61
Complainant: GM Vigilance, OMC Bhubaneswar
Accused: Vikram Rathore, NorthStar Logistics, Sunil Verma

Summary:
The accused generated counterfeit e-passes replicating government i3MS QR codes to dispatch 4,800 tonnes of high-grade iron ore to Paradeep port without royalty payments. NorthStar Logistics trucks were used for transit.
IO: IIC Bijay Kumar Jena`,
    matchedSuspectIds: ['P-0001', 'O-0001', 'P-0002'],
    matchedSyndicateRisk: 87.0,
    status: 'chargesheet_filed',
    filedByStation: 'Saheed Nagar Police Station',
    createdAt: '2026-07-21T09:00:00Z',
  },
  {
    firNumber: 'FIR-VAR-2026-0688',
    policeStation: 'Cantt Police Station',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    year: '2026',
    gdNumber: 'GD-051/2026',
    gdTime: '04:00 AM',
    inchargeOfficer: 'Inspector Shailendra Mishra',
    complainantName: 'Inland Waterways Authority of India (IWAI)',
    complainantPhone: '+915422501199',
    complainantAddress: 'Varanasi Multi-Modal Terminal, Ramnagar, Varanasi',
    complainantDesignation: 'Port Operations Officer',
    accusedNames: ['Dinesh Kulkarni', 'NorthStar Logistics Pvt Ltd', 'Anand Singhal'],
    ipcSections: ['Inland Vessels Act Sec 58', 'BNS Sec 318', 'BNS Sec 61'],
    incidentDate: '2026-08-08T18:00:00Z',
    incidentLocation: 'Ramnagar Terminal Port, River Ganga, Varanasi',
    description: 'Unmanifested cargo transshipment on river freight barges avoiding GST E-Way bills between Varanasi and Haldia.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-VAR-2026-0688.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Varanasi District Court',
    propertiesInvolved: '2 inland river freight barges; 120 tonnes unmanifested industrial chemical drums (Value: ₹3,10,00,000/-).',
    delayReason: 'Navigational safety inspection and chemical laboratory hazard testing.',
    ocrExtractedText: `UP POLICE - FIRST INFORMATION REPORT
Police Station: CANTT, District: VARANASI
FIR No.: FIR-VAR-2026-0688, Date: 09/08/2026, GD Entry: 051/2026

BNS Sections: 318, 61; Inland Vessels Act Sec 58
Complainant: Port Officer, IWAI Ramnagar
Accused: Dinesh Kulkarni, NorthStar Logistics, Anand Singhal

Details:
Two river freight barges docked at Ramnagar Port were found carrying undeclared chemical consignments without E-Way bills. The transport contracts were managed under NorthStar Logistics shell accounts.
IO: Inspector Shailendra Mishra`,
    matchedSuspectIds: ['P-0007', 'O-0001', 'P-0003'],
    matchedSyndicateRisk: 84.5,
    status: 'under_investigation',
    filedByStation: 'Cantt Police Station',
    createdAt: '2026-08-09T10:00:00Z',
  },
  {
    firNumber: 'FIR-NAG-2026-0310',
    policeStation: 'Sitabuldi Police Station',
    district: 'Nagpur City',
    state: 'Maharashtra',
    year: '2026',
    gdNumber: 'GD-029/2026',
    gdTime: '02:20 AM',
    inchargeOfficer: 'Senior Inspector Dilip Lande',
    complainantName: 'Bank of Baroda (Forensic Cell Nagpur)',
    complainantPhone: '+917122534411',
    complainantAddress: 'West High Court Road, Dharampeth, Nagpur 440010',
    complainantDesignation: 'Chief Manager (Audit)',
    accusedNames: ['Sunil Verma', 'Anand Singhal', 'Dinesh Kulkarni'],
    ipcSections: ['BNS Sec 318', 'BNS Sec 338', 'BNS Sec 61'],
    incidentDate: '2026-08-15T12:00:00Z',
    incidentLocation: 'Sitabuldi Interchange, Nagpur',
    description: 'Circular pass-through hawala channeling utilizing shell trade finance accounts to deflect coal consignment auction funds.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-NAG-2026-0310.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Nagpur District Court',
    propertiesInvolved: '₹4,75,00,000/- coal auction advances; 4 commercial escrow accounts.',
    delayReason: 'Coal auction portal ledger confirmation from Western Coalfields Limited.',
    ocrExtractedText: `MAHARASHTRA POLICE - FIRST INFORMATION REPORT
Police Station: SITABULDI, District: NAGPUR CITY
FIR No.: FIR-NAG-2026-0310, Date: 16/08/2026, GD: 029/2026

BNS Sections: 318, 338, 61
Complainant: Bank of Baroda Forensic Cell
Accused: Sunil Verma, Anand Singhal, Dinesh Kulkarni

Particulars:
Audit revealed that funds disbursed for coal auction lifting at WCL were routed through 3 pass-through accounts in Sitabuldi and converted into cash within 2 hours, without coal lifting.
IO: Senior Inspector Dilip Lande`,
    matchedSuspectIds: ['P-0002', 'P-0003', 'P-0007'],
    matchedSyndicateRisk: 86.8,
    status: 'under_investigation',
    filedByStation: 'Sitabuldi Police Station',
    createdAt: '2026-08-16T11:00:00Z',
  },
  {
    firNumber: 'FIR-VAD-2026-0425',
    policeStation: 'Sayajigunj Police Station',
    district: 'Vadodara City',
    state: 'Gujarat',
    year: '2026',
    gdNumber: 'GD-078/2026',
    gdTime: '06:50 AM',
    inchargeOfficer: 'PI R. B. Jadeja',
    complainantName: 'Gujarat State Petroleum Vigilance Cell',
    complainantPhone: '+912652361100',
    complainantAddress: 'Station Road, Sayajigunj, Vadodara 390020',
    complainantDesignation: 'Vigilance Inspector',
    accusedNames: ['Rajesh Singhania', 'Vikram Rathore', 'NorthStar Logistics Pvt Ltd'],
    ipcSections: ['Essential Commodities Act Sec 7', 'BNS Sec 318', 'BNS Sec 61'],
    incidentDate: '2026-07-29T14:30:00Z',
    incidentLocation: 'National Highway 48, Makarpura, Vadodara',
    description: 'Adulteration and illegal diversion of subsidized industrial solvents into automotive diesel fuel, distributed through unregistered private pumps.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-VAD-2026-0425.pdf',
    courtJurisdiction: 'Chief Judicial Magistrate, Vadodara District Court',
    propertiesInvolved: '48,000 Litres Subsidized Industrial Solvent; 2 specialized tanker trailers.',
    delayReason: 'Chemical density test analysis report from Forensic Science Laboratory Gandhinagar.',
    ocrExtractedText: `GUJARAT POLICE - FIRST INFORMATION REPORT
Police Station: SAYAJIGUNJ, District: VADODARA CITY
FIR No.: FIR-VAD-2026-0425, Date: 30/07/2026, GD Entry: 078/2026

Essential Commodities Act Sec 7; BNS 2023 Sec 318, 61
Complainant: Gujarat Petroleum Vigilance Cell
Accused: Rajesh Singhania, Vikram Rathore, NorthStar Logistics

Summary:
Tankers operated under NorthStar Logistics transport contracts were intercepted diverting subsidized solvent from petrochemical plants into clandestine blending depots in Makarpura.
IO: PI R. B. Jadeja`,
    matchedSuspectIds: ['P-0005', 'P-0001', 'O-0001'],
    matchedSyndicateRisk: 88.0,
    status: 'chargesheet_filed',
    filedByStation: 'Sayajigunj Police Station',
    createdAt: '2026-07-30T10:00:00Z',
  },
  {
    firNumber: 'FIR-MUM-2026-1104',
    policeStation: 'Bandra West Police Station',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    year: '2026',
    gdNumber: 'GD-011/2026',
    gdTime: '01:00 AM',
    inchargeOfficer: 'Senior Inspector Sanjay Kadam',
    complainantName: 'Special Intelligence Branch, Mumbai Police',
    complainantPhone: '+912226421100',
    complainantAddress: 'Hill Road, Bandra West, Mumbai 400050',
    complainantDesignation: 'Assistant Commissioner of Police',
    accusedNames: ['Vikram Rathore', 'Sunil Verma', 'Rashid Al-Mansoor'],
    ipcSections: ['BNS Sec 111 (Organized Crime)', 'BNS Sec 308 (Extortion)', 'BNS Sec 61', 'Indian Telegraph Act Sec 25'],
    incidentDate: '2026-08-22T02:15:00Z',
    incidentLocation: 'Carter Road, Bandra West, Mumbai Suburban',
    description: 'Odd-hour encrypted communications network coordinating overseas extortion payoffs and safehouse security for Hawala couriers.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-MUM-2026-1104.pdf',
    courtJurisdiction: 'Metropolitan Magistrate Court No. 12, Bandra, Mumbai',
    propertiesInvolved: '8 encrypted satellite / burner phones; 1 Safehouse lease agreement; ₹75,00,000/- cash reserve.',
    delayReason: 'Telecom intercept authorization under Section 5(2) Indian Telegraph Act verified.',
    ocrExtractedText: `MUMBAI POLICE - FIRST INFORMATION REPORT
Police Station: BANDRA WEST, District: MUMBAI SUBURBAN
FIR No.: FIR-MUM-2026-1104, Date: 23/08/2026, GD Entry: 011/2026

BNS 2023 Sec 111, 308, 61; Indian Telegraph Act Sec 25
Complainant: Special Intelligence Branch, Mumbai Police
Accused: Vikram Rathore, Sunil Verma, Rashid Al-Mansoor

Details:
Court-authorized wiretaps on Bandra Tower 14-B intercepted 384 seconds of encrypted communication at 02:15 AM directing bullion token liquidations and highway escort routes on NH-48.
IO: Senior Inspector Sanjay Kadam`,
    matchedSuspectIds: ['P-0001', 'P-0002', 'P-0004'],
    matchedSyndicateRisk: 97.4,
    status: 'under_investigation',
    filedByStation: 'Bandra West Police Station',
    createdAt: '2026-08-23T08:00:00Z',
  },
  {
    firNumber: 'FIR-DEL-2026-0985',
    policeStation: 'Tughlak Road Special Cell Police Station',
    district: 'New Delhi',
    state: 'Delhi NCR',
    year: '2026',
    gdNumber: 'GD-007/2026',
    gdTime: '00:45 AM',
    inchargeOfficer: 'ACP Sanjeev Yadav',
    complainantName: 'Enforcement Directorate (ED Headquarters)',
    complainantPhone: '+911123456677',
    complainantAddress: 'Pravachan Bhawan, APJ Abdul Kalam Road, New Delhi',
    complainantDesignation: 'Special Director (PMLA)',
    accusedNames: ['Rashid Al-Mansoor', 'Vikram Rathore', 'Apex Bullion DMCC', 'NorthStar Logistics Pvt Ltd'],
    ipcSections: ['PMLA 2002 Sec 3 & 4', 'BNS Sec 111 (Organized Crime Syndicate)', 'BNS Sec 61'],
    incidentDate: '2026-08-29T16:00:00Z',
    incidentLocation: 'APJ Abdul Kalam Road, New Delhi',
    description: 'ECIR registered for cross-border money laundering syndicate combining bullion tokens, logistics shell companies, and overseas Dubai factoring accounts.',
    firCopyUrl: 'https://circuit.internal/documents/fir/FIR-DEL-2026-0985.pdf',
    courtJurisdiction: 'Principal Sessions Judge / Special PMLA Court, Patiala House Courts, New Delhi',
    propertiesInvolved: 'Provisional Attachment of ₹54,00,000/- corporate real estate; 14 commercial vehicles; 18 bank accounts.',
    delayReason: 'Registration of Enforcement Case Information Report (ECIR) based on predicate offences.',
    ocrExtractedText: `DELHI POLICE SPECIAL CELL / ENFORCEMENT DIRECTATE
FIRST INFORMATION REPORT (Under Section 173 BNSS 2023)
FIR No.: FIR-DEL-2026-0985, Date: 30/08/2026, GD No.: 007/2026

PMLA 2002 Sec 3 & 4; BNS 2023 Sec 111, 61
Complainant: Special Director, Enforcement Directorate
Accused: Rashid Al-Mansoor, Vikram Rathore, Apex Bullion DMCC, NorthStar Logistics

Summary:
Comprehensive syndicate prosecution initiated under PMLA based on predicate offences in Maharashtra, Delhi, and Gujarat. The investigation establishes an enterprise structure utilizing logistics shell companies and offshore bullion chits to launder proceeds of organized crime.
IO: ACP Sanjeev Yadav`,
    matchedSuspectIds: ['P-0004', 'P-0001', 'O-0002', 'O-0001'],
    matchedSyndicateRisk: 98.9,
    status: 'under_investigation',
    filedByStation: 'Tughlak Road Special Cell Police Station',
    createdAt: '2026-08-30T10:00:00Z',
  },
];

// =============================================================================
// EVIDENCE TEMPLATES & ASSETS POOL
// =============================================================================
const EVIDENCE_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80', // Bullion & Physical Seizures
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', // Highway Toll Camera ANPR
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80', // Digital UFED Forensics
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', // Bank Ledger Exhibit
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80', // Panchnama Seizure Memo
  'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80', // CCTV Surveillance Intercept
];

const CITIES_POOL = [
  { city: 'Mumbai', state: 'Maharashtra', zone: 'Western Zone', stations: ['Colaba Cyber Crime PS', 'Bandra Crime Branch Unit IX', 'Andheri Police Station', 'BKC Financial Crime PS'] },
  { city: 'New Delhi', state: 'Delhi NCR', zone: 'Northern Zone', stations: ['Karol Bagh Special Cell', 'Tughlak Road PS', 'Dwarka Cyber Crime PS', 'Barakhamba EOW PS'] },
  { city: 'Bengaluru', state: 'Karnataka', zone: 'Southern Zone', stations: ['Koramangala Cyber Crime PS', 'Indiranagar PS', 'Whitefield Cyber Command', 'Electronic City PS'] },
  { city: 'Hyderabad', state: 'Telangana', zone: 'Southern Zone', stations: ['Cyberabad Cyber Crime PS', 'Banjara Hills PS', 'Gachibowli Special Cell', 'Begumpet PS'] },
  { city: 'Kolkata', state: 'West Bengal', zone: 'Eastern Zone', stations: ['Salt Lake Cyber Crime PS', 'Park Street Special Cell', 'Alipore Crime Branch', 'Howrah Commissionerate'] },
  { city: 'Ahmedabad', state: 'Gujarat', zone: 'Western Zone', stations: ['Navrangpura Crime Branch', 'SG Highway Cyber PS', 'Sarkhej Special Cell', 'Surat Crime Branch Unit III'] },
  { city: 'Chennai', state: 'Tamil Nadu', zone: 'Southern Zone', stations: ['Nungambakkam Cyber Cell', 'T. Nagar Crime Unit', 'Guindy Industrial Crime PS', 'Anna Nagar PS'] },
  { city: 'Pune', state: 'Maharashtra', zone: 'Western Zone', stations: ['Shivajinagar EOW', 'Hinjewadi Cyber Cell', 'Swargate Crime Branch', 'Koregaon Park PS'] },
  { city: 'Jaipur', state: 'Rajasthan', zone: 'North-Western Zone', stations: ['Vidhyadhar Nagar PS', 'Malviya Nagar Cyber Cell', 'Manak Chowk Special Unit', 'Vaishali Nagar PS'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', zone: 'Central Zone', stations: ['Hazratganj Cyber Crime PS', 'Gomti Nagar Crime Unit', 'Alambagh Police Station', 'Indira Nagar Special Cell'] },
  { city: 'Kochi', state: 'Kerala', zone: 'Southern Coastal Zone', stations: ['Ernakulam Central Cyber PS', 'Kochi Coastal Coastal Cell', 'Kakkanad IT Crime Unit', 'Panaji Coastal Police Station'] },
  { city: 'Chandigarh', state: 'Punjab & Haryana', zone: 'Northern Zone', stations: ['Sector 17 Special Cell', 'Mohali Cyber Command', 'Panchkula EOW PS', 'Zirakpur Transit Unit'] },
];

const CASE_THEMES = [
  { title: 'Operation Black Falcon: Real Estate Shell Layering', category: 'Hawala & Benami Real Estate', tag: 'benami_property' },
  { title: 'Operation BitStorm: Darknet Crypto Mixer Syndicate', category: 'Crypto Laundering & Ransomware', tag: 'crypto_mixer' },
  { title: 'Operation Ghost SIM: Cross-Border SIM-Box Routing', category: 'Telecom Fraud & VoIP Intercept', tag: 'sim_box' },
  { title: 'Operation Diamond Transit: Uninvoiced Bullion Corridor', category: 'Customs & Precious Stones', tag: 'diamond_smuggling' },
  { title: 'Operation PhishNet: AI Deepfake Banking Exfiltration', category: 'Cyber Fraud & Phishing', tag: 'deepfake_phishing' },
  { title: 'Operation Red Iron: Coastal Container Hawala Factoring', category: 'Maritime Contraband & Customs', tag: 'container_transit' },
  { title: 'Operation Paper Trail: Fake Invoice Input Tax Syndicate', category: 'GST & Commercial Fraud', tag: 'bogus_invoicing' },
  { title: 'Operation Falcon Eye: Highway Toll ANPR Vehicle Intercept', category: 'High-Value Highway Transit', tag: 'convoy_intercept' },
  { title: 'Operation Silver Oak: Offshore Hawala Token Settlement', category: 'Cross-Border Bullion', tag: 'token_exchange' },
  { title: 'Operation Blue Shield: Counterfeit Pharmaceutical Distribution', category: 'Medical Contraband & DNS 274', tag: 'counterfeit_drugs' },
];

const OFFICERS_POOL = [
  'Senior Inspector Vikram Shinde',
  'ACP Rakesh Malhotra',
  'Inspector Priya Nair',
  'ACP Sanjeev Yadav',
  'Deputy Commissioner Rajesh Kulkarni',
  'Inspector Ananya Deshmukh',
  'ACP Farooq Ahmed',
  'Inspector Gurpreet Singh Gill',
  'Senior Inspector K. V. Ramanathan',
  'Inspector Bhavesh Patel',
  'ACP Meera Sen',
  'Inspector Nitin Singhania',
  'Superintendent Arvind Joshi',
  'Senior Inspector Suresh Chawla',
];

// Helper to deterministically generate hash
function generatePseudoHash(seed: number): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[(seed * (i + 13) + i * 37) % chars.length];
  }
  return hash;
}

// Generate 205 additional realistic cases to make total 225
function generateMoreCases(baseCases: CaseRecord[], needed: number = 205): CaseRecord[] {
  const cases: CaseRecord[] = [...baseCases];
  const startIndex = 21;

  for (let i = 0; i < needed; i++) {
    const num = startIndex + i;
    const caseNum = `CR-2026-${String(num).padStart(5, '0')}`;
    const theme = CASE_THEMES[i % CASE_THEMES.length];
    const loc = CITIES_POOL[i % CITIES_POOL.length];
    const officer = OFFICERS_POOL[i % OFFICERS_POOL.length];
    const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    const statuses: Array<'active' | 'under_review' | 'pending' | 'closed'> = ['active', 'active', 'under_review', 'pending', 'closed'];
    const priority = priorities[i % priorities.length];
    const status = statuses[i % statuses.length];
    const totalVolume = 1500000 + (i * 285000) % 24000000;
    const seed = i * 19 + 501;

    const evidenceItems = [
      {
        id: `EVD-${caseNum}-01`,
        type: 'Physical Seizure Photo',
        title: `Seizure Memo & Recovered Assets Log - ${loc.city}`,
        description: `Physical search conducted at premise under Section 105 BNSS in presence of two panch witnesses. Recovered unaccounted cash notes and Hawala ledger note.`,
        hash: generatePseudoHash(seed + 1),
        status: 'verified',
        date: `2026-08-${String(10 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[0],
        fileSize: '4.8 MB',
        textExcerpt: `PANCHNAMA RECOVERY MEMO\nDate: 2026-08-${String(10 + (i % 20)).padStart(2, '0')}\nLocation: ${loc.city} Commercial Hub\nItems Recovered: ₹${(totalVolume * 0.15).toFixed(0)}/- Currency Notes; Ledger Notebook containing bearer token entries. Signed by Panch Witness 1 & 2.`,
      },
      {
        id: `EVD-${caseNum}-02`,
        type: 'CCTV / ANPR Capture',
        title: `ANPR Highway Toll Optical Capture - Sector ${loc.zone}`,
        description: `Automated high-speed camera toll record confirming convoy movement flagged by surveillance command.`,
        hash: generatePseudoHash(seed + 2),
        status: 'court_admissible',
        date: `2026-08-${String(11 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[1],
        fileSize: '12.4 MB',
        textExcerpt: `ANPR TOLL LOG SHEET\nCamera ID: ANPR-${loc.city.toUpperCase()}-04\nLPR Recognition: Confirmed license plate crossing plaza at 02:41 AM (Odd Hours).\nVehicle Status: Watchlisted Syndicate Transit Conveyance.`,
      },
      {
        id: `EVD-${caseNum}-03`,
        type: 'Forensic Lab Certificate',
        title: `FSL Digital Device Extraction Report (UFED 4PC)`,
        description: `Cryptographic physical acquisition of target smartphone memory yielding encrypted chat logs and deleted transaction receipts.`,
        hash: generatePseudoHash(seed + 3),
        status: 'verified',
        date: `2026-08-${String(12 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[2],
        fileSize: '24.1 MB',
        textExcerpt: `FORENSIC SCIENCE LABORATORY DIGITAL EXTRACTION CERTIFICATE\nExtraction Software: Cellebrite Physical Analyzer v7.68\nSHA-256 Hash Integrity: Verified Matched\nExtracted: 28 deleted WhatsApp DB threads; 4 encrypted audio voicemails coordinated with overseas conduits.`,
      },
      {
        id: `EVD-${caseNum}-04`,
        type: 'Bank Ledger Exhibit',
        title: `Forensic Bank Statement & Swift Audit Memo`,
        description: `Certified bank account statement obtained under Section 94 BNSS establishing rapid pass-through structuring.`,
        hash: generatePseudoHash(seed + 4),
        status: 'chain_of_custody_intact',
        date: `2026-08-${String(14 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[3],
        fileSize: '6.2 MB',
        textExcerpt: `BANK LEDGER AUDIT EXTRACT\nAccount Title: ${theme.title.slice(0, 24)} Conduit A/C\nAudit Period: August 2026\nFinding: 94.2% of deposited credits disbursed to secondary accounts within 3 hours (Mule structuring indicator).`,
      },
    ];

    cases.push({
      caseNumber: caseNum,
      title: `${theme.title} (#${num})`,
      category: theme.category,
      description: `Comprehensive multi-agency investigation in ${loc.city} into ${theme.category.toLowerCase()}. Coordinated across ${loc.zone} covering shell layering networks, bank conduits, and telecom surveillance under lead officer ${officer}.`,
      status: status,
      priority: priority,
      leadInvestigator: officer,
      department: `${loc.city} Special Crime & Financial Intelligence Command`,
      region: `${loc.zone} (${loc.city} - ${loc.state})`,
      filedDate: `2026-08-${String(1 + (i % 28)).padStart(2, '0')}`,
      totalVolume: totalVolume,
      tags: [theme.tag, 'inter_state_syndicate', 'bns_2023', 'financial_forensics'],
      entityIds: [`P-${String(100 + (i % 40)).padStart(4, '0')}`, `O-${String(10 + (i % 20)).padStart(4, '0')}`],
      timeline: [
        {
          date: `2026-08-${String(1 + (i % 28)).padStart(2, '0')}`,
          title: `Case File Initiated: ${loc.city}`,
          description: `Formal case docket opened based on financial intelligence disclosures.`,
          type: 'fir',
          severity: priority,
        },
        {
          date: `2026-08-${String(5 + (i % 24)).padStart(2, '0')}`,
          title: 'Special Search Operation Conducted',
          description: `Coordinated search memo executed recovering Hawala token records and transit logs.`,
          type: 'raid',
          severity: 'high',
        },
      ],
      evidence: evidenceItems,
    });
  }

  return cases;
}

// Generate 201 additional realistic FIRs to make total 225
function generateMoreFirs(baseFirs: FirRecord[], needed: number = 201): FirRecord[] {
  const firs: FirRecord[] = [...baseFirs];
  const startIndex = 25;

  for (let i = 0; i < needed; i++) {
    const num = startIndex + i;
    const loc = CITIES_POOL[i % CITIES_POOL.length];
    const station = loc.stations[i % loc.stations.length];
    const officer = OFFICERS_POOL[i % OFFICERS_POOL.length];
    const cityCode = loc.city.slice(0, 3).toUpperCase();
    const firNum = `FIR-${cityCode}-2026-${String(num).padStart(4, '0')}`;
    const gdNum = `GD-${String(num * 3).padStart(3, '0')}/2026`;
    const theme = CASE_THEMES[i % CASE_THEMES.length];
    const seed = i * 23 + 711;

    const evidenceItems = [
      {
        id: `EVD-${firNum}-01`,
        type: 'Document Proof',
        title: `Certified Form I.I.F.-I First Information Copy`,
        description: `Official court certified duplicate of registered FIR with SHO circular endorsement.`,
        hash: generatePseudoHash(seed + 1),
        status: 'verified',
        date: `2026-08-${String(10 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[4],
        fileSize: '3.1 MB',
        textExcerpt: `STATE POLICE INTEGRATED INVESTIGATION FORM - I\nFIR No: ${firNum}\nPolice Station: ${station}\nActs: Bharatiya Nyaya Sanhita (BNS 2023) Sec 318(4), Sec 61(2), Sec 111.\nComplainant: Verified Authorized Citizen Informant.`,
      },
      {
        id: `EVD-${firNum}-02`,
        type: 'Physical Seizure Photo',
        title: `Seized Digital Devices & Token Ledger Photo`,
        description: `Photographic proof of hardware seized at scene of occurrence including SIM boxes and encrypted phones.`,
        hash: generatePseudoHash(seed + 2),
        status: 'verified',
        date: `2026-08-${String(11 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[0],
        fileSize: '8.7 MB',
        textExcerpt: `SEIZURE PHOTO LOG\nExhibits Photographed: 2x Apple iPhone, 1x SIM-Box Array, 14x Airtel SIM cards.\nSeizure Officer: ${officer}\nWitness Statements: Signed and recorded under Sec 180 BNSS.`,
      },
      {
        id: `EVD-${firNum}-03`,
        type: 'Bank Ledger Exhibit',
        title: `Bank Transaction Statement & Fraud Flow Sheet`,
        description: `Certified banking statement verifying fraudulent diversion of corporate funds.`,
        hash: generatePseudoHash(seed + 3),
        status: 'court_admissible',
        date: `2026-08-${String(13 + (i % 20)).padStart(2, '0')}`,
        officer: officer,
        imageUrl: EVIDENCE_IMAGE_POOL[3],
        fileSize: '5.2 MB',
        textExcerpt: `BANK RECONCILIATION SUMMARY\nTotal Fraud Amount: ₹${(450000 + i * 35000).toLocaleString('en-IN')}\nChannel: IMPS / RTGS Gateway\nProvisional Restraint: Issued under Section 106 BNSS 2023.`,
      },
    ];

    firs.push({
      firNumber: firNum,
      policeStation: station,
      district: `${loc.city} District`,
      state: loc.state,
      year: '2026',
      gdNumber: gdNum,
      gdTime: `${String(1 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'PM'}`,
      inchargeOfficer: `${officer}, Station House Officer`,
      complainantName: `Deepak ${['Verma', 'Sharma', 'Patel', 'Reddy', 'Nair', 'Singh'][i % 6]}`,
      complainantPhone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
      complainantAddress: `${loc.city}, ${loc.state}, India`,
      complainantDesignation: 'Authorized Informant / Victim',
      accusedNames: [
        `Sameer ${['Khan', 'Mehta', 'Kulkarni', 'Jain', 'Rathore'][i % 5]}`,
        `Karan ${['Singhal', 'Malhotra', 'Gupta', 'Verma', 'Shah'][i % 5]}`,
        `${theme.title.slice(0, 18)} Enterprises Pvt Ltd`,
      ],
      ipcSections: ['BNS Sec 318(4) (Cheating)', 'BNS Sec 316 (Breach of Trust)', 'BNS Sec 61(2) (Criminal Conspiracy)', 'IT Act Sec 66D'],
      incidentDate: `2026-08-${String(1 + (i % 28)).padStart(2, '0')}T11:00:00Z`,
      incidentLocation: `${loc.city} Commercial Area, Beat No. ${1 + (i % 8)}`,
      description: `First Information Report lodged at ${station} regarding ${theme.title.toLowerCase()}. Accused orchestrated financial defalcation and layering through forged commercial invoices and unauthorized banking transfers.`,
      firCopyUrl: `https://circuit.internal/documents/fir/${firNum}.pdf`,
      courtJurisdiction: `Court of Chief Judicial Magistrate (CJM), ${loc.city}`,
      propertiesInvolved: `Disputed proceeds amounting to ₹${(450000 + i * 35000).toLocaleString('en-IN')}; digital transit devices; transit convoy vehicles.`,
      delayReason: 'Internal audit verification and bank statement procurement required prior to formal registration.',
      ocrExtractedText: `${loc.state.toUpperCase()} POLICE DEPARTMENT\nFIRST INFORMATION REPORT (Form I.I.F.-I)\nUnder Section 173 BNSS 2023 / Section 154 Cr.P.C.\n\nDistrict: ${loc.city} | Police Station: ${station} | Year: 2026\nFIR No: ${firNum} | Date: 2026-08-${String(1 + (i % 28)).padStart(2, '0')}\n\n1. Acts & Sections: BNS Sec 318(4), Sec 316, Sec 61(2), IT Act Sec 66D\n2. Complainant: Deepak ${['Verma', 'Sharma', 'Patel', 'Reddy', 'Nair'][i % 5]}\n3. Accused: Sameer Khan & associates\n4. Occurrence: Unauthorized diversion of commercial funds.\n\nInvestigation assigned to: ${officer}.`,
      matchedSuspectIds: [`P-${String(100 + (i % 40)).padStart(4, '0')}`, `P-${String(101 + (i % 40)).padStart(4, '0')}`],
      matchedSyndicateRisk: 82.5 + (i % 16),
      status: ['under_investigation', 'chargesheet_filed', 'registered'][i % 3] as any,
      filedByStation: station,
      createdAt: `2026-08-${String(1 + (i % 28)).padStart(2, '0')}T12:00:00Z`,
      evidence: evidenceItems,
    });
  }

  return firs;
}

// Also backfill base FIRs with evidence if empty
const enrichedBaseFirs = BASE_EXPANDED_FIRS.map((fir, idx) => {
  if (fir.evidence && fir.evidence.length > 0) return fir;
  return {
    ...fir,
    evidence: [
      {
        id: `EVD-${fir.firNumber}-01`,
        type: 'Document Proof',
        title: `Certified FIR Form I.I.F.-I Copy - ${fir.policeStation}`,
        description: `Original court certified First Information Report transcript signed by SHO with official rubber stamp.`,
        hash: generatePseudoHash(idx * 7 + 101),
        status: 'verified',
        date: fir.incidentDate?.slice(0, 10) || '2026-08-15',
        officer: fir.inchargeOfficer,
        imageUrl: EVIDENCE_IMAGE_POOL[4],
        fileSize: '4.2 MB',
        textExcerpt: fir.ocrExtractedText || fir.description,
      },
      {
        id: `EVD-${fir.firNumber}-02`,
        type: 'Physical Seizure Photo',
        title: `Physical Seizure Memo & Property Recovery`,
        description: `Seizure memo of cash, transit records, and hardware recovered at scene of occurrence.`,
        hash: generatePseudoHash(idx * 7 + 202),
        status: 'verified',
        date: fir.incidentDate?.slice(0, 10) || '2026-08-15',
        officer: fir.inchargeOfficer,
        imageUrl: EVIDENCE_IMAGE_POOL[0],
        fileSize: '7.9 MB',
        textExcerpt: `SEIZURE MEMO: Recovered at ${fir.incidentLocation}. Properties: ${fir.propertiesInvolved}. Sealed with State Police brass seal.`,
      },
      {
        id: `EVD-${fir.firNumber}-03`,
        type: 'CCTV / ANPR Capture',
        title: `CCTV / ANPR Optical Toll Verification Snapshot`,
        description: `Surveillance image capture corroborating presence of target convoy at time of incident.`,
        hash: generatePseudoHash(idx * 7 + 303),
        status: 'court_admissible',
        date: fir.incidentDate?.slice(0, 10) || '2026-08-15',
        officer: fir.inchargeOfficer,
        imageUrl: EVIDENCE_IMAGE_POOL[1],
        fileSize: '11.3 MB',
        textExcerpt: `CCTV LOG: Camera 04-B captured target persons arriving at location ${fir.incidentLocation} matching General Diary GD #${fir.gdNumber}.`,
      },
    ],
  };
});

// Enriched base cases with image URLs and text transcripts
const enrichedBaseCases = BASE_EXPANDED_CASES.map((c, idx) => {
  const enhancedEvidence = (c.evidence || []).map((ev, evIdx) => ({
    ...ev,
    imageUrl: ev.imageUrl || EVIDENCE_IMAGE_POOL[evIdx % EVIDENCE_IMAGE_POOL.length],
    fileSize: ev.fileSize || `${(3.5 + evIdx * 2.1).toFixed(1)} MB`,
    officer: ev.officer || c.leadInvestigator,
    date: ev.date || c.filedDate,
    textExcerpt: ev.textExcerpt || `EXHIBIT REF: ${ev.id}\nTitle: ${ev.title}\nDescription: ${ev.description || 'Verified evidentiary material held in continuous legal chain of custody.'}\nSHA-256 Hash: ${ev.hash}\nCertified under Sec 63 BSA 2023.`,
  }));
  return { ...c, evidence: enhancedEvidence };
});

// EXPORT 225 CASES AND 225 FIRS
export const EXPANDED_CASES: CaseRecord[] = generateMoreCases(enrichedBaseCases, 205);
export const EXPANDED_FIRS: FirRecord[] = generateMoreFirs(enrichedBaseFirs, 201);
