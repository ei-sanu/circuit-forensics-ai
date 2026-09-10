// Geopolitical Investigation Cases & Geospatial Intelligence Dataset
// Covers 110+ Cases across 22 Indian States with Inter-State Corridors and Networks

import { LocationOccurrence } from '@/components/map/LiveLocationMap';

export interface GeopoliticalCase {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium';
  primaryLocation: string;
  originState: string;
  destinationState: string;
  corridor: string;
  networkType: 'Hawala & Illicit Flow' | 'Convoy & Toll Transits' | 'Burner Telecom Intercepts' | 'Cyber Financial Mules' | 'Border Contraband';
  totalVolume: number;
  suspectCount: number;
  tags: string[];
  leadOfficer: string;
}

export const INDIAN_STATES_LIST = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Kerala',
  'Bihar',
  'Madhya Pradesh',
  'Odisha',
  'Andhra Pradesh',
  'Goa',
  'Assam',
  'Jammu & Kashmir',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jharkhand',
] as const;

export type IndianStateName = typeof INDIAN_STATES_LIST[number];

export const STATE_COORDINATES: Record<string, { city: string; lat: number; lng: number }> = {
  'Maharashtra': { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  'Delhi': { city: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  'Karnataka': { city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu': { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  'Telangana': { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  'West Bengal': { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  'Gujarat': { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  'Rajasthan': { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  'Uttar Pradesh': { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  'Punjab': { city: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  'Haryana': { city: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  'Kerala': { city: 'Kochi', lat: 9.9312, lng: 76.2673 },
  'Bihar': { city: 'Patna', lat: 25.5941, lng: 85.1376 },
  'Madhya Pradesh': { city: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  'Odisha': { city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  'Andhra Pradesh': { city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  'Goa': { city: 'Panaji', lat: 15.4909, lng: 73.8278 },
  'Assam': { city: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  'Jammu & Kashmir': { city: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  'Uttarakhand': { city: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  'Himachal Pradesh': { city: 'Shimla', lat: 31.1048, lng: 77.1734 },
  'Jharkhand': { city: 'Ranchi', lat: 23.3441, lng: 85.3096 },
};

const BASE_CASE_TEMPLATES = [
  { prefix: 'Operation Nightfall', cat: 'Hawala & Shell Transit', net: 'Hawala & Illicit Flow' as const, vol: 6500000 },
  { prefix: 'Operation Goldcrest', cat: 'Cross-Border Bullion Factoring', net: 'Hawala & Illicit Flow' as const, vol: 14500000 },
  { prefix: 'Operation Red Sand', cat: 'Contraband Heavy Freight Transit', net: 'Convoy & Toll Transits' as const, vol: 5200000 },
  { prefix: 'Project Phantom', cat: 'Layered UPI & Crypto OTC Liquidation', net: 'Cyber Financial Mules' as const, vol: 22000000 },
  { prefix: 'Operation Eastern Corridor', cat: 'Inland Rail Cargo Smuggling', net: 'Border Contraband' as const, vol: 3500000 },
  { prefix: 'Project Black Pearl', cat: 'Coastal Maritime Narcotics Drop', net: 'Border Contraband' as const, vol: 18000000 },
  { prefix: 'Operation Shadow Wire', cat: 'Encrypted Burner IMEI Swarm', net: 'Burner Telecom Intercepts' as const, vol: 1200000 },
  { prefix: 'Operation Tiger Claw', cat: 'Inter-State Tollway Armed Escort', net: 'Convoy & Toll Transits' as const, vol: 8900000 },
  { prefix: 'Project Silverline', cat: 'Bullion Vaulting & Cash Tokens', net: 'Hawala & Illicit Flow' as const, vol: 11200000 },
  { prefix: 'Operation Cyber Nexus', cat: 'Dummy Merchant UPI Gateway Fraud', net: 'Cyber Financial Mules' as const, vol: 16700000 },
];

const OFFICERS_POOL = [
  'ACP Vikram Malhotra', 'SI Priya Nair', 'DSP Ramesh Kulkarni', 'Inspector Rajesh Sen',
  'SI Kavita Rao', 'ACP Sameer Khan', 'Inspector Anand Vardhan', 'DSP Suresh Patil',
  'ACP Gurpreet Singh', 'Inspector Sunita Joshi', 'SI Tariq Ahmed', 'DSP Devendra Shah'
];

function generate110Cases(): GeopoliticalCase[] {
  const cases: GeopoliticalCase[] = [];
  const stateCount = INDIAN_STATES_LIST.length;

  for (let i = 0; i < 112; i++) {
    const originIdx = i % stateCount;
    const destIdx = (i * 3 + 5) % stateCount;
    const origin = INDIAN_STATES_LIST[originIdx];
    const dest = INDIAN_STATES_LIST[destIdx === originIdx ? (originIdx + 1) % stateCount : destIdx];
    const tpl = BASE_CASE_TEMPLATES[i % BASE_CASE_TEMPLATES.length];

    const caseNum = `CR-2026-${String(100 + i).padStart(5, '0')}`;
    const priority = i % 5 === 0 ? 'critical' : i % 3 === 0 ? 'high' : 'medium';
    const volume = Math.round((tpl.vol * (0.8 + (i % 7) * 0.25)) / 10000) * 10000;

    cases.push({
      id: `geo-case-${i + 1}`,
      caseNumber: caseNum,
      title: `${tpl.prefix}: ${origin} to ${dest} Corridor (Phase ${Math.floor(i / 10) + 1})`,
      category: tpl.cat,
      priority,
      primaryLocation: `${STATE_COORDINATES[origin]?.city || origin} – ${STATE_COORDINATES[dest]?.city || dest} Net`,
      originState: origin,
      destinationState: dest,
      corridor: `${origin} → ${dest}`,
      networkType: tpl.net,
      totalVolume: volume,
      suspectCount: 3 + (i % 4),
      tags: [tpl.net.toLowerCase().replace(/\s+/g, '_'), origin.toLowerCase(), dest.toLowerCase(), 'interstate_transit'],
      leadOfficer: OFFICERS_POOL[i % OFFICERS_POOL.length],
    });
  }

  return cases;
}

export const GEOPOLITICAL_CASES: GeopoliticalCase[] = generate110Cases();

// Generate interactive map occurrences across all 110 cases
function generate110Occurrences(cases: GeopoliticalCase[]): LocationOccurrence[] {
  const occs: LocationOccurrence[] = [];

  cases.forEach((c, cIdx) => {
    const originCoords = STATE_COORDINATES[c.originState] || { city: c.originState, lat: 20.5937, lng: 78.9629 };
    const destCoords = STATE_COORDINATES[c.destinationState] || { city: c.destinationState, lat: 28.6139, lng: 77.2090 };

    // Point 1: Origin Point
    occs.push({
      id: `OCC-${c.caseNumber}-1`,
      caseId: c.caseNumber,
      caseName: c.title,
      entityId: `P-${String(100 + (cIdx % 400)).padStart(4, '0')}`,
      entityName: `Suspect Entity (${c.originState} Lead)`,
      entityType: 'person',
      category: 'transaction',
      title: `₹${(c.totalVolume / 100000).toFixed(1)} Lakhs Hawala Handshake`,
      description: `Primary dispatch coordinate confirmed under surveillance at ${originCoords.city} commercial market.`,
      latitude: Number((originCoords.lat + ((cIdx % 7) - 3) * 0.03).toFixed(4)),
      longitude: Number((originCoords.lng + ((cIdx % 5) - 2) * 0.03).toFixed(4)),
      locationName: `${originCoords.city} Central Commercial Hub`,
      city: originCoords.city,
      stateOrCountry: c.originState,
      timestamp: `2026-08-${String(10 + (cIdx % 15)).padStart(2, '0')} 11:30`,
      amount: c.totalVolume,
      counterparty: `Nodal Syndicate Receiver (${c.destinationState})`,
      riskLevel: c.priority,
      details: { corridor: c.corridor, network: c.networkType },
    });

    // Point 2: Transit Highway Toll / Cell Tower Midpoint
    const midLat = Number(((originCoords.lat + destCoords.lat) / 2 + ((cIdx % 9) - 4) * 0.04).toFixed(4));
    const midLng = Number(((originCoords.lng + destCoords.lng) / 2 + ((cIdx % 7) - 3) * 0.04).toFixed(4));
    occs.push({
      id: `OCC-${c.caseNumber}-2`,
      caseId: c.caseNumber,
      caseName: c.title,
      entityId: `V-${String(200 + (cIdx % 300)).padStart(4, '0')}`,
      entityName: `Transit Convoy / Tower Sector`,
      entityType: c.networkType === 'Convoy & Toll Transits' ? 'vehicle' : 'organization',
      category: c.networkType === 'Convoy & Toll Transits' ? 'vehicle_sighting' : 'communication',
      title: `Inter-State Checkpoint Transit Scan`,
      description: `FASTag sensor & cell sector ping detected traversing interstate national highway boundary.`,
      latitude: midLat,
      longitude: midLng,
      locationName: `${c.originState} – ${c.destinationState} Interstate Toll Plaza`,
      city: `${originCoords.city} Outskirts`,
      stateOrCountry: c.originState,
      timestamp: `2026-08-${String(11 + (cIdx % 15)).padStart(2, '0')} 02:45`,
      riskLevel: c.priority === 'critical' ? 'critical' : 'high',
      details: { tollGantry: 'National Highway Weighbridge #4', speedKmh: 94 },
    });

    // Point 3: Destination Infiltration Point
    occs.push({
      id: `OCC-${c.caseNumber}-3`,
      caseId: c.caseNumber,
      caseName: c.title,
      entityId: `P-${String(500 + (cIdx % 400)).padStart(4, '0')}`,
      entityName: `Target Receiver (${c.destinationState})`,
      entityType: 'person',
      category: c.networkType === 'Cyber Financial Mules' ? 'transaction' : 'safehouse',
      title: `Depository Vault & Nodal Extraction`,
      description: `Consignment drop and shell company nodal account credit verified in destination jurisdiction.`,
      latitude: Number((destCoords.lat + ((cIdx % 6) - 2) * 0.03).toFixed(4)),
      longitude: Number((destCoords.lng + ((cIdx % 8) - 4) * 0.03).toFixed(4)),
      locationName: `${destCoords.city} Industrial Enclave Sector 12`,
      city: destCoords.city,
      stateOrCountry: c.destinationState,
      timestamp: `2026-08-${String(12 + (cIdx % 15)).padStart(2, '0')} 16:15`,
      amount: Math.round(c.totalVolume * 0.85),
      riskLevel: c.priority,
      details: { destinationHub: destCoords.city, custodyStatus: 'Surveillance Active' },
    });
  });

  return occs;
}

export const GEOPOLITICAL_OCCURRENCES: LocationOccurrence[] = generate110Occurrences(GEOPOLITICAL_CASES);
