// High-Volume Forensic Intelligence Generator for CIRCUIT AI
// Generates 500+ entities, 1000+ transactions, 250+ vehicles, 180+ locations, 150+ CDR logs

import {
  EntityRecord,
  TransactionRecord,
  VehicleRecord,
  CommunicationRecord,
  CaseRecord,
} from './data';
import { LocationOccurrence } from '@/components/map/LiveLocationMap';

const INDIAN_FIRST_NAMES = [
  'Vikram', 'Sunil', 'Karan', 'Rashid', 'Rajesh', 'Sameer', 'Dinesh', 'Priya',
  'Tariq', 'Anand', 'Deepak', 'Sanjay', 'Manoj', 'Arun', 'Ramesh', 'Suresh',
  'Amit', 'Rahul', 'Vikas', 'Pooja', 'Neha', 'Ritu', 'Kavita', 'Anjali',
  'Imran', 'Farooq', 'Zubair', 'Nadeem', 'Harpreet', 'Gurpreet', 'Manpreet',
  'Balwinder', 'Prashant', 'Sachin', 'Nitin', 'Gaurav', 'Alok', 'Ashok',
  'Mahesh', 'Kishore', 'Pankaj', 'Hemant', 'Jitendra', 'Bhavesh', 'Chetan',
  'Jignesh', 'Parth', 'Hitesh', 'Mukesh', 'Devendra', 'Shrikant', 'Santosh'
];

const INDIAN_LAST_NAMES = [
  'Rathore', 'Verma', 'Malhotra', 'Al-Mansoor', 'Singhania', 'Khan', 'Kulkarni',
  'Sharma', 'Mahmood', 'Singhal', 'Patel', 'Shah', 'Mehta', 'Deshmukh',
  'Joshi', 'Chavan', 'Pawar', 'Reddy', 'Rao', 'Nair', 'Menon', 'Pillai',
  'Gupta', 'Agarwal', 'Bansal', 'Mittal', 'Jain', 'Goyal', 'Bhatia',
  'Chawla', 'Sethi', 'Kapoor', 'Khanna', 'Gill', 'Dhillon', 'Sandhu',
  'Sidhu', 'Grewal', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Bhattacharya'
];

const INDIAN_CITIES: Array<{ city: string; state: string; lat: number; lng: number }> = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Amritsar', state: 'Punjab', lat: 31.634, lng: 74.8723 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
  { city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { city: 'Goa (Panaji)', state: 'Goa', lat: 15.4909, lng: 73.8278 },
  { city: 'Dubai (Offshore)', state: 'UAE Corridor', lat: 25.2048, lng: 55.2708 },
];

const VEHICLE_MODELS = [
  { make: 'Toyota', model: 'Fortuner', type: 'suv' },
  { make: 'Toyota', model: 'Innova Crysta', type: 'suv' },
  { make: 'Mahindra', model: 'Scorpio-N', type: 'suv' },
  { make: 'Tata Motors', model: 'Prima Multi-Axle Heavy Container', type: 'commercial_truck' },
  { make: 'BharatBenz', model: '3528C Heavy Hauler', type: 'commercial_truck' },
  { make: 'Maruti Suzuki', model: 'Swift Dzire', type: 'sedan' },
  { make: 'Hyundai', model: 'Verna Turbo', type: 'sedan' },
  { make: 'BMW', model: '7-Series Armored High-Security', type: 'luxury_armored' },
  { make: 'Mercedes-Benz', model: 'S-Guard VR10 Bulletproof', type: 'luxury_armored' },
  { make: 'Mahindra', model: 'Bolero Camper Fleet', type: 'suv' },
];

const RTO_CODES = [
  'MH-01', 'MH-02', 'MH-04', 'MH-12', 'MH-14', 'MH-43',
  'DL-01', 'DL-03', 'DL-08', 'DL-10', 'DL-12',
  'KA-01', 'KA-03', 'KA-04', 'KA-05', 'KA-51',
  'GJ-01', 'GJ-05', 'GJ-06', 'GJ-27',
  'TN-01', 'TN-07', 'TN-09', 'TN-22',
  'TS-07', 'TS-08', 'TS-09',
  'WB-01', 'WB-02', 'WB-20',
  'HR-26', 'HR-55',
  'UP-14', 'UP-16', 'UP-32',
  'RJ-14', 'RJ-45'
];

const CHANNELS: Array<TransactionRecord['channel']> = [
  'hawala', 'rtgs', 'crypto_otc', 'atm_cluster', 'upi_gateway', 'neft', 'imps'
];

const PATTERNS: Array<TransactionRecord['patternType']> = [
  'circular_flow', 'pass_through', 'rapid_chain', 'structuring_smurf', 'smurfing', 'normal'
];

const TOLL_PLAZAS = [
  { name: 'Khed-Shivapur Toll Plaza', highway: 'NH-48 (Pune-Satara)' },
  { name: 'Khalapur Toll Plaza', highway: 'Mumbai-Pune Expressway' },
  { name: 'Kherki Daula Toll Plaza', highway: 'NH-48 (Gurugram)' },
  { name: 'Attibele Toll Plaza', highway: 'NH-44 (Bengaluru-Hosur)' },
  { name: 'Dankuni Toll Plaza', highway: 'NH-19 (Kolkata-Durgapur)' },
  { name: 'Vashi Toll Naka', highway: 'Sion-Panvel Expressway' },
  { name: 'Surat-Navsari Toll Plaza', highway: 'NH-48 (South Gujarat)' },
  { name: 'Manoharpur Toll Plaza', highway: 'NH-48 (Jaipur-Delhi)' },
  { name: 'Chittoor Bypass Plaza', highway: 'NH-69 (Karnataka-AP)' },
  { name: 'Bhiwandi Octroi Checkpoint', highway: 'NH-160 (Mumbai Corridor)' },
];

// Helper deterministic pseudo-random generator
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// -----------------------------------------------------------------------------
// 1. GENERATE 500+ ENTITIES
// -----------------------------------------------------------------------------
export function generateExpandedEntities(baseEntities: EntityRecord[]): EntityRecord[] {
  const result = [...baseEntities];
  const targetCount = 520;

  for (let i = baseEntities.length; i < targetCount; i++) {
    const seed = i * 17 + 101;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const isOrg = r1 > 0.75;
    const isPhone = !isOrg && r1 > 0.60;
    const isLocation = !isOrg && !isPhone && r1 > 0.50;

    let type: EntityRecord['type'] = 'person';
    let label = '';
    let designation = '';

    if (isOrg) {
      type = 'organization';
      const orgTypes = ['Logistics', 'Traders', 'Bullion', 'Exports', 'Enterprises', 'Holdings', 'Consultancy', 'Shipping'];
      const city = INDIAN_CITIES[Math.floor(r2 * INDIAN_CITIES.length)].city;
      label = `${INDIAN_LAST_NAMES[Math.floor(r3 * INDIAN_LAST_NAMES.length)]} ${orgTypes[Math.floor(r4 * orgTypes.length)]} Pvt Ltd`;
      designation = 'Commercial Front & Banking Conduit';
    } else if (isPhone) {
      type = 'phone';
      const phoneNum = `+9198${Math.floor(10000000 + r2 * 89999999)}`;
      label = phoneNum;
      designation = 'Encrypted Burner Handset';
    } else if (isLocation) {
      type = 'location';
      const cityObj = INDIAN_CITIES[Math.floor(r2 * INDIAN_CITIES.length)];
      label = `${cityObj.city} Sector Vault & Transit Depot`;
      designation = 'Underground Depot';
    } else {
      type = 'person';
      const fn = INDIAN_FIRST_NAMES[Math.floor(r2 * INDIAN_FIRST_NAMES.length)];
      const ln = INDIAN_LAST_NAMES[Math.floor(r3 * INDIAN_LAST_NAMES.length)];
      label = `${fn} ${ln}`;
      const roles = ['Hawala Courier', 'Mule Account Holder', 'Transit Driver', 'Bullion Cleared Broker', 'Cash Custodian', 'Dispatcher'];
      designation = roles[Math.floor(r4 * roles.length)];
    }

    const cityObj = INDIAN_CITIES[Math.floor(r3 * INDIAN_CITIES.length)];
    const prefix = type === 'person' ? 'P' : type === 'organization' ? 'O' : type === 'phone' ? 'PH' : 'L';
    const id = `${prefix}-${String(i + 1).padStart(4, '0')}`;
    const riskFlag = r4 > 0.45;
    const influenceScore = Math.floor(40 + r1 * 55);

    const cases = ['CR-2026-00124', 'CR-2026-00842', 'CR-2026-00315', 'CR-2026-00489'];
    const assignedCase = cases[Math.floor(r2 * cases.length)];

    result.push({
      entityId: id,
      type,
      label,
      aliases: [label.split(' ')[0], `${prefix}-${i}`],
      riskFlag,
      influenceScore,
      riskScore: riskFlag ? Math.floor(70 + r2 * 28) : Math.floor(20 + r2 * 35),
      cases: [assignedCase],
      properties: {
        designation,
        jurisdiction: cityObj.city,
        phone: type === 'phone' ? label : `+9198${Math.floor(10000000 + r3 * 89999999)}`,
        pan: `${String.fromCharCode(65 + Math.floor(r1 * 26))}${String.fromCharCode(65 + Math.floor(r2 * 26))}CPK${Math.floor(1000 + r3 * 8999)}F`,
        coordinates: [cityObj.lat + (r1 - 0.5) * 0.1, cityObj.lng + (r2 - 0.5) * 0.1],
      },
      connectedEntities: [
        {
          entityId: 'P-0001',
          label: 'Vikram Rathore',
          type: 'person',
          relationship: 'indirect_syndicate_link',
        },
      ],
    });
  }

  return result;
}

// -----------------------------------------------------------------------------
// 2. GENERATE 1000+ TRANSACTIONS
// -----------------------------------------------------------------------------
export function generateExpandedTransactions(
  baseTransactions: TransactionRecord[],
  entities: EntityRecord[]
): TransactionRecord[] {
  const result = [...baseTransactions];
  const targetCount = 1050;

  const peopleAndOrgs = entities.filter((e) => e.type === 'person' || e.type === 'organization');

  for (let i = baseTransactions.length; i < targetCount; i++) {
    const seed = i * 29 + 303;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const fromIdx = Math.floor(r1 * peopleAndOrgs.length);
    let toIdx = Math.floor(r2 * peopleAndOrgs.length);
    if (toIdx === fromIdx) toIdx = (fromIdx + 1) % peopleAndOrgs.length;

    const fromEnt = peopleAndOrgs[fromIdx];
    const toEnt = peopleAndOrgs[toIdx];

    const channel = CHANNELS[Math.floor(r3 * CHANNELS.length)];
    const pattern = PATTERNS[Math.floor(r4 * PATTERNS.length)];

    // Realistic amounts between ₹50,000 and ₹45,00,000
    const rawAmt = r4 > 0.8 ? 500000 + r1 * 4000000 : 50000 + r2 * 450000;
    const amount = Math.round(rawAmt / 5000) * 5000;

    const cases = ['CR-2026-00124', 'CR-2026-00842', 'CR-2026-00315', 'CR-2026-00489'];
    const caseNames: Record<string, string> = {
      'CR-2026-00124': 'Operation Nightfall',
      'CR-2026-00842': 'Operation Goldcrest',
      'CR-2026-00315': 'Operation Red Sand',
      'CR-2026-00489': 'Project Phantom',
    };
    const cId = cases[Math.floor(r1 * cases.length)];

    const day = String(Math.floor(1 + r2 * 28)).padStart(2, '0');
    const month = r3 > 0.4 ? '08' : '09';
    const hour = String(Math.floor(r4 * 24)).padStart(2, '0');
    const min = String(Math.floor(r1 * 60)).padStart(2, '0');
    const timestamp = `2026-${month}-${day} ${hour}:${min}`;

    const isFlagged = r4 > 0.35 || pattern !== 'normal';
    const riskLevel: TransactionRecord['riskLevel'] =
      amount > 1500000 ? 'critical' : isFlagged ? 'high' : 'medium';

    const txId = `TX-${channel.toUpperCase().slice(0, 3)}-2026-${String(i + 1).padStart(4, '0')}`;

    result.push({
      id: `TX-GEN-${i + 1}`,
      transactionId: txId,
      fromName: fromEnt.label,
      fromId: fromEnt.entityId,
      fromType: fromEnt.type as 'person' | 'organization',
      toName: toEnt.label,
      toId: toEnt.entityId,
      toType: toEnt.type as 'person' | 'organization',
      amount,
      timestamp,
      channel,
      caseId: cId,
      caseName: caseNames[cId],
      isFlagged,
      riskLevel,
      patternType: pattern,
      details: {
        txRef: `${channel.toUpperCase()}-REF-${Math.floor(100000 + r1 * 899999)}`,
        tokenCode: channel === 'hawala' ? `TOK-${Math.floor(1000 + r2 * 8999)}` : undefined,
        bankCode: channel === 'rtgs' ? `SBIN000${Math.floor(100 + r3 * 899)}` : undefined,
        walletAddress: channel === 'crypto_otc' ? `0x${Math.floor(r1 * 1e16).toString(16)}...` : undefined,
        atmClusterId: channel === 'atm_cluster' ? `ATM-${cId.slice(-3)}-0${Math.floor(1 + r4 * 5)}` : undefined,
        location: INDIAN_CITIES[Math.floor(r3 * INDIAN_CITIES.length)].city,
        flagReason: isFlagged
          ? `Automated AML rule trigger: High velocity ${pattern.replace(/_/g, ' ')} detected across ${channel} channel.`
          : undefined,
        confidence: Number((0.82 + r4 * 0.16).toFixed(2)),
      },
    });
  }

  return result;
}

// -----------------------------------------------------------------------------
// 3. GENERATE 250+ VEHICLES (ANPR Highway Tracking)
// -----------------------------------------------------------------------------
export function generateExpandedVehicles(
  baseVehicles: VehicleRecord[],
  entities: EntityRecord[]
): VehicleRecord[] {
  const result = [...baseVehicles];
  const targetCount = 260;

  const people = entities.filter((e) => e.type === 'person');

  for (let i = baseVehicles.length; i < targetCount; i++) {
    const seed = i * 41 + 505;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const rto = RTO_CODES[Math.floor(r1 * RTO_CODES.length)];
    const series = `${String.fromCharCode(65 + Math.floor(r2 * 26))}${String.fromCharCode(65 + Math.floor(r3 * 26))}`;
    const num = Math.floor(1000 + r4 * 8999);
    const plateNumber = `${rto}-${series}-${num}`;

    const vModel = VEHICLE_MODELS[Math.floor(r3 * VEHICLE_MODELS.length)];
    const owner = people[Math.floor(r4 * people.length)] || people[0];

    const cityObj = INDIAN_CITIES[Math.floor(r2 * INDIAN_CITIES.length)];
    const tollObj = TOLL_PLAZAS[Math.floor(r1 * TOLL_PLAZAS.length)];

    const day = String(Math.floor(1 + r2 * 28)).padStart(2, '0');
    const month = r3 > 0.5 ? '08' : '09';
    const hour = String(Math.floor(r4 * 24)).padStart(2, '0');
    const min = String(Math.floor(r1 * 60)).padStart(2, '0');
    const timestamp = `2026-${month}-${day} ${hour}:${min}`;

    const riskFlag = r4 > 0.40;

    result.push({
      vehicleId: `VH-${String(i + 1).padStart(4, '0')}`,
      plateNumber,
      makeModel: `${vModel.make} ${vModel.model}`,
      vehicleType: vModel.type as any,
      ownerId: owner.entityId,
      ownerName: owner.label,
      ownerDesignation: (owner.properties as any)?.designation || 'Transit Associate',
      riskFlag,
      chassisNumber: `MA3E${rto.replace('-', '')}${Math.floor(10000000 + r1 * 89999999)}`,
      fastagId: `NETC-FA-${Math.floor(100000 + r3 * 899999)}`,
      cases: owner.cases || ['CR-2026-00124'],
      lastSeenLocation: `${tollObj.name} (${tollObj.highway})`,
      lastSeenCoordinates: [cityObj.lat + (r1 - 0.5) * 0.05, cityObj.lng + (r2 - 0.5) * 0.05],
      lastSeenTimestamp: timestamp,
      sightings: [
        {
          id: `ST-${i}-1`,
          tollPlaza: tollObj.name,
          city: cityObj.city,
          timestamp,
          lane: `Lane 0${Math.floor(1 + r4 * 6)} (Fastag Electronic Toll)`,
          confidence: Number((0.92 + r1 * 0.07).toFixed(2)),
          coTravelingWith: r4 > 0.7 ? ['MH-01-EA-9021'] : undefined,
        },
        {
          id: `ST-${i}-2`,
          tollPlaza: TOLL_PLAZAS[(Math.floor(r1 * TOLL_PLAZAS.length) + 1) % TOLL_PLAZAS.length].name,
          city: cityObj.city,
          timestamp: `2026-${month}-${String(Math.max(1, Number(day) - 2)).padStart(2, '0')} 14:20`,
          lane: 'Lane 02 (ANPR High-Speed Gantry)',
          confidence: 0.95,
        },
      ],
      alerts: riskFlag
        ? [
            {
              type: 'Escort Pattern',
              severity: 'high',
              description: `Consecutive toll crossing matched with known syndicate courier vehicle within 90 seconds.`,
              timestamp,
            },
          ]
        : [],
    });
  }

  return result;
}

// -----------------------------------------------------------------------------
// 4. GENERATE 180+ LOCATIONS / OCCURRENCES FOR GEOSPATIAL MAP
// -----------------------------------------------------------------------------
export function generateExpandedLocations(baseOccurrences: LocationOccurrence[]): LocationOccurrence[] {
  const result = [...baseOccurrences];
  const targetCount = 185;

  const categories: Array<LocationOccurrence['category']> = [
    'transaction', 'communication', 'vehicle_sighting', 'safehouse'
  ];

  for (let i = baseOccurrences.length; i < targetCount; i++) {
    const seed = i * 37 + 707;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);
    const r4 = pseudoRandom(seed + 3);

    const cityObj = INDIAN_CITIES[Math.floor(r1 * INDIAN_CITIES.length)];
    const category = categories[Math.floor(r2 * categories.length)];

    const cases = ['CR-2026-00124', 'CR-2026-00842', 'CR-2026-00315', 'CR-2026-00489'];
    const caseNames: Record<string, string> = {
      'CR-2026-00124': 'Operation Nightfall',
      'CR-2026-00842': 'Operation Goldcrest',
      'CR-2026-00315': 'Operation Red Sand',
      'CR-2026-00489': 'Project Phantom',
    };
    const cId = cases[Math.floor(r3 * cases.length)];

    const day = String(Math.floor(1 + r2 * 28)).padStart(2, '0');
    const month = r3 > 0.5 ? '08' : '09';
    const hour = String(Math.floor(r4 * 24)).padStart(2, '0');
    const min = String(Math.floor(r1 * 60)).padStart(2, '0');
    const timestamp = `2026-${month}-${day} ${hour}:${min}`;

    const fn = INDIAN_FIRST_NAMES[Math.floor(r2 * INDIAN_FIRST_NAMES.length)];
    const ln = INDIAN_LAST_NAMES[Math.floor(r3 * INDIAN_LAST_NAMES.length)];
    const entityName = `${fn} ${ln}`;
    const entityId = `P-${String(100 + Math.floor(r4 * 400)).padStart(4, '0')}`;

    let title = '';
    let desc = '';
    let amount: number | undefined = undefined;

    if (category === 'transaction') {
      amount = Math.round((250000 + r4 * 3500000) / 10000) * 10000;
      title = `₹${(amount / 100000).toFixed(1)} Lakhs Hawala Handover`;
      desc = `Cash drop coordinates confirmed between courier team and ${entityName} in commercial bazaar.`;
    } else if (category === 'communication') {
      title = `Odd-Hour Tower Intercept (${hour}:${min})`;
      desc = `Cell tower sector ping on secure burner frequency matching active wiretap authorization.`;
    } else if (category === 'vehicle_sighting') {
      title = `ANPR Toll Checkpoint Gantry Scan`;
      desc = `Vehicle electronic tag scanned traveling northbound at 94 km/h through highway weighbridge.`;
    } else if (category === 'safehouse') {
      title = `Covert Vault & Cash Depository Hub`;
      desc = `Underground consignment stash fortified with reinforced storage and electronic countermeasures.`;
    } else {
      title = `Enforcement Seizure & Forensic Panchnama`;
      desc = `Inter-agency search operation recovering forged transit invoices, ledger books, and bearer tokens.`;
    }

    result.push({
      id: `GEO-EXP-${i + 1}`,
      caseId: cId,
      caseName: caseNames[cId],
      entityId,
      entityName,
      entityType: 'person',
      category,
      title,
      description: desc,
      latitude: Number((cityObj.lat + (r2 - 0.5) * 0.12).toFixed(4)),
      longitude: Number((cityObj.lng + (r3 - 0.5) * 0.12).toFixed(4)),
      locationName: `${cityObj.city} Sector ${Math.floor(1 + r4 * 35)} Checkpoint`,
      city: cityObj.city,
      stateOrCountry: cityObj.state,
      timestamp,
      amount,
      counterparty: 'Sunil Verma (P-0002)',
      riskLevel: r4 > 0.6 ? 'critical' : r4 > 0.3 ? 'high' : 'medium',
      details: {
        transitMethod: category === 'vehicle_sighting' ? 'FASTag Toll Gantry' : 'Ground Courier',
      },
    });
  }

  return result;
}
