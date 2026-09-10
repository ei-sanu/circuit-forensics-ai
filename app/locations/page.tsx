'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  ArrowRight,
  Filter,
  Navigation,
  Flame,
  Phone,
  Car,
  Building,
  CreditCard,
  Layers,
  Sparkles,
  ShieldAlert,
  Clock,
  Compass,
  X,
  Briefcase,
  Users,
  Radio,
  ExternalLink,
  Target,
} from 'lucide-react';
import { LiveLocationMap, LocationOccurrence } from '@/components/map/LiveLocationMap';
import { api } from '@/lib/api';

import {
  GEOPOLITICAL_CASES,
  GEOPOLITICAL_OCCURRENCES,
  INDIAN_STATES_LIST,
  GeopoliticalCase,
} from '@/lib/geopoliticalCases';

const CASES_CATALOG: GeopoliticalCase[] = GEOPOLITICAL_CASES;

// Master Intelligence Geospatial Dataset across Enterprise Cases
const BASE_OCCURRENCES: LocationOccurrence[] = [
  // ==========================================
  // CASE 1: CR-2026-00124 (Operation Nightfall)
  // ==========================================
  {
    id: 'GEO-101',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0001',
    entityName: 'Vikram Rathore',
    entityType: 'person',
    category: 'transaction',
    title: '₹12,50,000 Hawala Cash Handover',
    description: 'Direct cash drop recorded between courier and Vikram Rathore at Nariman Point office suite.',
    latitude: 18.9256,
    longitude: 72.8242,
    locationName: 'Nariman Point Financial Enclave',
    city: 'Mumbai',
    stateOrCountry: 'Maharashtra',
    timestamp: '2026-09-04 23:45',
    amount: 1250000,
    counterparty: 'Sunil Verma (P-0002)',
    riskLevel: 'critical',
    details: { paymentMode: 'Hawala Cash Token', transitMethod: 'Courier' },
  },
  {
    id: 'GEO-102',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0001',
    entityName: 'Vikram Rathore',
    entityType: 'person',
    category: 'communication',
    title: 'Odd-Hour Burner Call Intercept (02:15 AM)',
    description: '384-second encrypted call on burner +919876543210 routed through Bandra West cell tower.',
    latitude: 19.0596,
    longitude: 72.8295,
    locationName: 'Bandra West Tower 14-B',
    city: 'Mumbai',
    stateOrCountry: 'Maharashtra',
    timestamp: '2026-09-05 02:15',
    counterparty: 'Sunil Verma (+919123456780)',
    riskLevel: 'critical',
    details: { durationSec: 384, cellId: 'MUM-BW-1044' },
  },
  {
    id: 'GEO-103',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0001',
    entityName: 'Vikram Rathore',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Camera Scan (Fortuner MH-02-CD-9988)',
    description: 'Black Toyota Fortuner passed expressway toll plaza heading towards Pune transit corridor.',
    latitude: 18.7512,
    longitude: 73.3421,
    locationName: 'Khalapur Toll Plaza, Mumbai-Pune Expy',
    city: 'Maharashtra',
    stateOrCountry: 'Maharashtra',
    timestamp: '2026-09-05 08:30',
    riskLevel: 'high',
    details: { plateNumber: 'MH-02-CD-9988', speedKm: 94 },
  },
  {
    id: 'GEO-104',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'O-0001',
    entityName: 'NorthStar Logistics',
    entityType: 'organization',
    category: 'safehouse',
    title: 'NorthStar Logistics Transit Depot',
    description: 'Warehousing complex used for temporary cargo consolidation and cash storage.',
    latitude: 19.2969,
    longitude: 73.0631,
    locationName: 'Bhiwandi Logistics Hub Sector 4',
    city: 'Thane',
    stateOrCountry: 'Maharashtra',
    timestamp: '2026-09-05 14:00',
    riskLevel: 'high',
    details: { facilityType: 'Warehouse', leaseStatus: 'Shell Lease' },
  },
  {
    id: 'GEO-105',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0001',
    entityName: 'Vikram Rathore',
    entityType: 'person',
    category: 'transaction',
    title: '₹25,00,000 Rapid RTGS Transfer',
    description: 'Layered RTGS transfer executed from shell account to Golden Horizon holding account.',
    latitude: 28.6315,
    longitude: 77.2167,
    locationName: 'Connaught Place Commercial Branch',
    city: 'New Delhi',
    stateOrCountry: 'Delhi',
    timestamp: '2026-09-06 11:20',
    amount: 2500000,
    counterparty: 'Golden Horizon Traders (O-0003)',
    riskLevel: 'critical',
    details: { txRef: 'RTGS-DL-99410', bankCode: 'HDFC000102' },
  },
  {
    id: 'GEO-106',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0001',
    entityName: 'Vikram Rathore',
    entityType: 'person',
    category: 'safehouse',
    title: 'Suspect Hideout & Meeting Point',
    description: 'Private farmhouse identified via CDR tower localization and surveillance pings.',
    latitude: 28.5245,
    longitude: 77.1558,
    locationName: 'Vasant Kunj Farmhouse Estate',
    city: 'New Delhi',
    stateOrCountry: 'Delhi',
    timestamp: '2026-09-06 16:40',
    riskLevel: 'critical',
    details: { perimeter: 'Gated', occupants: '3 Identified' },
  },
  {
    id: 'GEO-107',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0002',
    entityName: 'Sunil Verma',
    entityType: 'person',
    category: 'transaction',
    title: '₹5,00,000 Consecutive ATM Cash Pulls',
    description: 'Multiple card withdrawals within 8 minutes across 3 adjacent ATMs in Old Delhi.',
    latitude: 28.6562,
    longitude: 77.2310,
    locationName: 'Chandni Chowk ATM Cluster',
    city: 'Delhi',
    stateOrCountry: 'Delhi',
    timestamp: '2026-09-04 17:15',
    amount: 500000,
    riskLevel: 'critical',
    details: { atmIds: ['SBI-DL-109', 'ICICI-DL-881'], cardLast4: '4491' },
  },
  {
    id: 'GEO-108',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0002',
    entityName: 'Sunil Verma',
    entityType: 'person',
    category: 'communication',
    title: 'Cross-Border Handler Call Ping',
    description: 'Cell tower handshake near Nepal border corridor lasting 512 seconds.',
    latitude: 26.7606,
    longitude: 83.3732,
    locationName: 'Gorakhpur Railway Junction Tower',
    city: 'Gorakhpur',
    stateOrCountry: 'Uttar Pradesh',
    timestamp: '2026-09-05 19:40',
    counterparty: 'Kathmandu Transit Line (+977-9812-441)',
    riskLevel: 'high',
    details: { towerId: 'UP-GKP-09', signalDbm: -68 },
  },
  {
    id: 'GEO-109',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0002',
    entityName: 'Sunil Verma',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Border Checkpoint Sighting (UP-53-BX-1122)',
    description: 'Mahindra Scorpio crossed border toll gate heading towards Raxaul transit hub.',
    latitude: 26.9782,
    longitude: 84.8519,
    locationName: 'Raxaul Indo-Nepal Border Post',
    city: 'Bihar',
    stateOrCountry: 'Bihar',
    timestamp: '2026-09-06 04:10',
    riskLevel: 'critical',
    details: { plateNumber: 'UP-53-BX-1122', vehicle: 'Mahindra Scorpio', borderGate: 'Gate 2' },
  },
  {
    id: 'GEO-110',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'P-0003',
    entityName: 'Karan Malhotra',
    entityType: 'person',
    category: 'transaction',
    title: '₹18,00,000 Crypto OTC Liquidation',
    description: 'USDT escrow cash exchange coordinated at corporate cyber hub.',
    latitude: 28.4950,
    longitude: 77.0895,
    locationName: 'DLF Cyber City Tower 10',
    city: 'Gurugram',
    stateOrCountry: 'Haryana',
    timestamp: '2026-09-05 15:30',
    amount: 1800000,
    counterparty: 'Golden Horizon Traders (O-0003)',
    riskLevel: 'high',
    details: { cryptoAsset: 'USDT', walletAddress: '0x71C88B991' },
  },
  {
    id: 'GEO-111',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'O-0001',
    entityName: 'NorthStar Logistics',
    entityType: 'organization',
    category: 'safehouse',
    title: 'Kolkata Port Container Terminal Yard',
    description: 'Primary sea freight dispatch point for illicit consignment shipments.',
    latitude: 22.5485,
    longitude: 88.3182,
    locationName: 'Netaji Subhas Dock, Kolkata Port',
    city: 'Kolkata',
    stateOrCountry: 'West Bengal',
    timestamp: '2026-09-06 13:15',
    riskLevel: 'critical',
    details: { dockNumber: 'Berth 7', customsStatus: 'Under Scrutiny' },
  },
  {
    id: 'GEO-112',
    caseId: 'CR-2026-00124',
    caseName: 'Operation Nightfall',
    entityId: 'O-0001',
    entityName: 'NorthStar Logistics',
    entityType: 'organization',
    category: 'safehouse',
    title: 'Patna Industrial Transit Node',
    description: 'Railway siding depot for inland transit across Bihar and Eastern India.',
    latitude: 25.5941,
    longitude: 85.1376,
    locationName: 'Patna Industrial Estate Warehouse',
    city: 'Patna',
    stateOrCountry: 'Bihar',
    timestamp: '2026-09-06 15:45',
    riskLevel: 'high',
    details: { railSiding: 'Patna Junction Yard 3' },
  },

  // ==============================================================
  // CASE 2: CR-2026-00842 (Operation Goldcrest: Dubai-Delhi Hawala)
  // ==============================================================
  {
    id: 'GEO-201',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0004',
    entityName: 'Rashid Al-Mansoor',
    entityType: 'person',
    category: 'transaction',
    title: 'AED 450,000 (₹1,02,00,000) Tokenized Hawala Swap',
    description: 'Bearer serial token currency handshake coordinated at Deira wholesale bullion alley.',
    latitude: 25.2711,
    longitude: 55.2995,
    locationName: 'Deira Gold Souk Passage 3',
    city: 'Dubai',
    stateOrCountry: 'UAE',
    timestamp: '2026-09-04 16:30',
    amount: 10200000,
    counterparty: 'Apex Bullion DMCC (O-0002)',
    riskLevel: 'critical',
    details: { tokenCode: 'GOLD-DXB-99', currency: 'AED' },
  },
  {
    id: 'GEO-202',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0004',
    entityName: 'Rashid Al-Mansoor',
    entityType: 'person',
    category: 'communication',
    title: 'Encrypted Voice Handshake with Gulf Gateway',
    description: 'Encrypted audio packet transmission over WhatsApp relay (+971508842190).',
    latitude: 25.1884,
    longitude: 55.2744,
    locationName: 'Business Bay Bay-Square Tower 2',
    city: 'Dubai',
    stateOrCountry: 'UAE',
    timestamp: '2026-09-04 18:45',
    counterparty: 'Rajesh Singhania (+919811023456)',
    riskLevel: 'critical',
    details: { carrier: 'Etisalat', durationSec: 420 },
  },
  {
    id: 'GEO-203',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0005',
    entityName: 'Rajesh Singhania',
    entityType: 'person',
    category: 'transaction',
    title: '₹65,00,000 Bullion Settlement & Cash Vaulting',
    description: 'Physical gold delivery settled against overseas token codes inside private vault enclave.',
    latitude: 28.6517,
    longitude: 77.1906,
    locationName: 'Karol Bagh Bullion Market Enclave',
    city: 'New Delhi',
    stateOrCountry: 'Delhi',
    timestamp: '2026-09-05 12:10',
    amount: 6500000,
    counterparty: 'Golden Horizon Traders (O-0003)',
    riskLevel: 'critical',
    details: { weightKg: 8.5, purity: '99.9% 24K' },
  },
  {
    id: 'GEO-204',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0005',
    entityName: 'Rajesh Singhania',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Toll Clearance (Mercedes DL-01-AB-1234)',
    description: 'Silver Mercedes S-Class intercepted on airport toll heading towards Delhi-Gurgaon highway.',
    latitude: 28.5562,
    longitude: 77.1000,
    locationName: 'IGI Airport T3 Approach Road',
    city: 'New Delhi',
    stateOrCountry: 'Delhi',
    timestamp: '2026-09-05 17:50',
    riskLevel: 'high',
    details: { plateNumber: 'DL-01-AB-1234', speedKm: 78 },
  },
  {
    id: 'GEO-205',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'O-0003',
    entityName: 'Golden Horizon Traders',
    entityType: 'organization',
    category: 'transaction',
    title: '₹38,00,000 High-Velocity Gold Invoice Factoring',
    description: 'Paper invoice laundering transaction cleared through commercial branch.',
    latitude: 23.0300,
    longitude: 72.5600,
    locationName: 'CG Road Financial Complex',
    city: 'Ahmedabad',
    stateOrCountry: 'Gujarat',
    timestamp: '2026-09-06 10:40',
    amount: 3800000,
    riskLevel: 'high',
    details: { invoiceRef: 'INV-AHM-9910', gstNumber: '24AACCG1192M1Z8' },
  },
  {
    id: 'GEO-206',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0005',
    entityName: 'Rajesh Singhania',
    entityType: 'person',
    category: 'safehouse',
    title: 'Secret Gold Refining & Melting Vault',
    description: 'Unlicensed melting basement and token ledger repository.',
    latitude: 26.9167,
    longitude: 75.8167,
    locationName: 'MI Road Vault Enclave',
    city: 'Jaipur',
    stateOrCountry: 'Rajasthan',
    timestamp: '2026-09-06 14:20',
    riskLevel: 'critical',
    details: { facilityType: 'Basement Vault', securityLevel: 'Armed Guards' },
  },
  {
    id: 'GEO-207',
    caseId: 'CR-2026-00842',
    caseName: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
    entityId: 'P-0004',
    entityName: 'Rashid Al-Mansoor',
    entityType: 'person',
    category: 'communication',
    title: 'Burner CDR Tower Ping (+971508842190)',
    description: 'Tower triangulation ping recorded during physical bullion transfer coordination.',
    latitude: 18.9500,
    longitude: 72.8333,
    locationName: 'Zaveri Bazaar Central Tower 12',
    city: 'Mumbai',
    stateOrCountry: 'Maharashtra',
    timestamp: '2026-09-06 18:00',
    riskLevel: 'high',
    details: { cellId: 'MUM-ZB-401' },
  },

  // ===============================================================
  // CASE 3: CR-2026-00315 (Operation Red Sand: Inter-State Smuggling)
  // ===============================================================
  {
    id: 'GEO-301',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'P-0006',
    entityName: 'Sameer Khan',
    entityType: 'person',
    category: 'transaction',
    title: 'Consignment Driver Advance & Token Swap',
    description: '₹4,50,000 cash advance handed to long-haul container drivers with forged timber transit manifests.',
    latitude: 13.0285,
    longitude: 77.5197,
    locationName: 'Peenya Industrial Complex Gate 4',
    city: 'Bengaluru',
    stateOrCountry: 'Karnataka',
    timestamp: '2026-09-04 21:00',
    amount: 450000,
    counterparty: 'Royal Freight Carriers (O-0004)',
    riskLevel: 'high',
    details: { manifestNumber: 'KA-FOR-4481' },
  },
  {
    id: 'GEO-302',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'P-0006',
    entityName: 'Sameer Khan',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Weighbridge Scan (Container KA-03-NM-7788)',
    description: 'Heavy multi-axle truck bypassed commercial weight sensors at state boundary.',
    latitude: 12.7800,
    longitude: 77.7800,
    locationName: 'Hosur Road Interstate Checkpost',
    city: 'Karnataka-TN Border',
    stateOrCountry: 'Tamil Nadu',
    timestamp: '2026-09-05 03:15',
    riskLevel: 'critical',
    details: { plateNumber: 'KA-03-NM-7788', grossWeightTons: 38.4 },
  },
  {
    id: 'GEO-303',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'P-0007',
    entityName: 'Dinesh Kulkarni',
    entityType: 'person',
    category: 'communication',
    title: 'Seshachalam Forest Perimeter Radio Handshake',
    description: 'VHF/Satellite phone intercept (+91-98220-44910) during illicit timber extraction.',
    latitude: 13.6288,
    longitude: 79.4192,
    locationName: 'Tirupati Bypass Freight Siding',
    city: 'Tirupati',
    stateOrCountry: 'Andhra Pradesh',
    timestamp: '2026-09-05 11:30',
    riskLevel: 'critical',
    details: { towerId: 'AP-TPT-08', durationSec: 195 },
  },
  {
    id: 'GEO-304',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'O-0004',
    entityName: 'Royal Freight Carriers',
    entityType: 'organization',
    category: 'safehouse',
    title: 'Red Hills Transit Godown & Timber Staging Bay',
    description: 'Concealed warehouse used for re-labeling export containers under agricultural produce codes.',
    latitude: 13.1950,
    longitude: 80.1980,
    locationName: 'Red Hills Logistics Park Godown 14',
    city: 'Chennai',
    stateOrCountry: 'Tamil Nadu',
    timestamp: '2026-09-05 22:45',
    riskLevel: 'high',
    details: { containerIds: ['MSKU-99410', 'CMA-8812'] },
  },
  {
    id: 'GEO-305',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'P-0006',
    entityName: 'Sameer Khan',
    entityType: 'person',
    category: 'transaction',
    title: '₹37,50,000 Port Stevedoring Hawala Payoff',
    description: 'Cash payment delivered to customs clearing agent for green-channel bypass.',
    latitude: 13.2667,
    longitude: 80.3333,
    locationName: 'Ennore Port Cargo Berth 3',
    city: 'Chennai',
    stateOrCountry: 'Tamil Nadu',
    timestamp: '2026-09-06 09:15',
    amount: 3750000,
    counterparty: 'Customs Forwarding Agent',
    riskLevel: 'critical',
    details: { paymentMode: 'Hawala Cash Envelope' },
  },
  {
    id: 'GEO-306',
    caseId: 'CR-2026-00315',
    caseName: 'Operation Red Sand: Inter-State Smuggling Syndicate',
    entityId: 'P-0007',
    entityName: 'Dinesh Kulkarni',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'Air Cargo Sighting & Surveillance Scan',
    description: 'Transit vehicle scanned entering cargo complex for secondary manifest clearance.',
    latitude: 17.2403,
    longitude: 78.4294,
    locationName: 'Shamshabad Air Freight Zone',
    city: 'Hyderabad',
    stateOrCountry: 'Telangana',
    timestamp: '2026-09-06 17:30',
    riskLevel: 'high',
    details: { plateNumber: 'KA-03-NM-7788' },
  },

  // ==============================================================
  // CASE 4: CR-2026-00489 (Project Phantom: Cyber-Fin & Mule Ring)
  // ==============================================================
  {
    id: 'GEO-401',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'P-0008',
    entityName: 'Priya Sharma',
    entityType: 'person',
    category: 'transaction',
    title: '₹84,00,000 Layered UPI Payment Gateway Siphoning',
    description: 'Coordinated withdrawal through 48 dummy merchant UPI VPA endpoints into mule pool.',
    latitude: 28.4900,
    longitude: 77.0900,
    locationName: 'DLF Cyber City Sector 24',
    city: 'Gurugram',
    stateOrCountry: 'Haryana',
    timestamp: '2026-09-04 14:20',
    amount: 8400000,
    counterparty: 'NexaPay Solutions (O-0005)',
    riskLevel: 'critical',
    details: { vpaCount: 48, gatewayRef: 'NEXA-UPI-9921' },
  },
  {
    id: 'GEO-402',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'O-0005',
    entityName: 'NexaPay Solutions',
    entityType: 'organization',
    category: 'communication',
    title: 'Rogue Call Center Server Relay CDR Ping',
    description: 'VoIP gateway packet burst originating from illicit telecom server cluster.',
    latitude: 22.5800,
    longitude: 88.4300,
    locationName: 'Salt Lake Sector V IT Park',
    city: 'Kolkata',
    stateOrCountry: 'West Bengal',
    timestamp: '2026-09-05 04:00',
    counterparty: 'Tariq Mahmood (+91-99880-11223)',
    riskLevel: 'high',
    details: { ipSubnet: '103.211.94.0/24', serverCount: 16 },
  },
  {
    id: 'GEO-403',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'P-0008',
    entityName: 'Priya Sharma',
    entityType: 'person',
    category: 'transaction',
    title: '₹31,00,000 Coordinated Mule ATM Withdrawals',
    description: 'Debit cards issued to fictitious rural accounts liquidated in 15-minute blitz.',
    latitude: 28.6200,
    longitude: 77.3600,
    locationName: 'Sector 62 Electronic City Commercial Cluster',
    city: 'Noida',
    stateOrCountry: 'Uttar Pradesh',
    timestamp: '2026-09-05 18:30',
    amount: 3100000,
    riskLevel: 'critical',
    details: { cardCount: 12, atmBank: 'Bank of Baroda' },
  },
  {
    id: 'GEO-404',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'P-0009',
    entityName: 'Tariq Mahmood',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Sightings (Innova Crysta HR-26-DK-4091)',
    description: 'Vehicle transporting cash batches sighted on express highway towards UP border.',
    latitude: 28.7100,
    longitude: 77.5200,
    locationName: 'Delhi-Meerut Expressway Toll Plaza',
    city: 'Ghaziabad',
    stateOrCountry: 'Uttar Pradesh',
    timestamp: '2026-09-06 01:45',
    riskLevel: 'high',
    details: { plateNumber: 'HR-26-DK-4091', vehicle: 'Innova Crysta' },
  },
  {
    id: 'GEO-405',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'P-0009',
    entityName: 'Tariq Mahmood',
    entityType: 'person',
    category: 'transaction',
    title: '₹95,00,000 USDT Crypto OTC Cash Liquidation',
    description: 'Physical cash received in exchange for 112,000 Tether (USDT) wallet transfer.',
    latitude: 21.1400,
    longitude: 72.8200,
    locationName: 'Surat Diamond Bourse Vault 7',
    city: 'Surat',
    stateOrCountry: 'Gujarat',
    timestamp: '2026-09-06 11:15',
    amount: 9500000,
    counterparty: 'Diamond OTC Cash Desk',
    riskLevel: 'critical',
    details: { usdtTransferred: 112000, txHash: '0x99f8...2b1a' },
  },
  {
    id: 'GEO-406',
    caseId: 'CR-2026-00489',
    caseName: 'Project Phantom: Cyber-Fin Mule Network',
    entityId: 'P-0009',
    entityName: 'Tariq Mahmood',
    entityType: 'person',
    category: 'safehouse',
    title: 'Cross-Border Mule Account Command Room',
    description: 'Foreign exchange and remote SIM-bank operation operating out of rented guest house.',
    latitude: 27.7150,
    longitude: 85.3120,
    locationName: 'Thamel Forex District',
    city: 'Kathmandu',
    stateOrCountry: 'Nepal',
    timestamp: '2026-09-06 16:50',
    riskLevel: 'high',
    details: { simBoxes: 8, foreignCurrencies: ['USD', 'EUR', 'NPR'] },
  },

  // ==============================================================
  // CASE 5: CR-2026-00712 (Operation Eastern Corridor: Rail Cargo)
  // ==============================================================
  {
    id: 'GEO-501',
    caseId: 'CR-2026-00712',
    caseName: 'Operation Eastern Corridor: Rail Cargo Smuggling',
    entityId: 'P-0010',
    entityName: 'Amitabh Sen',
    entityType: 'person',
    category: 'safehouse',
    title: 'Danapur Rail Goods Parcel Yard Loading Point',
    description: 'Consignment disguised as industrial machine parts loaded onto eastern express train.',
    latitude: 25.6200,
    longitude: 85.0400,
    locationName: 'Danapur Railway Siding Yard',
    city: 'Patna',
    stateOrCountry: 'Bihar',
    timestamp: '2026-09-04 18:20',
    riskLevel: 'high',
    details: { trainNumber: '12304 Express Cargo', parcelWaybill: 'ECR-99810' },
  },
  {
    id: 'GEO-502',
    caseId: 'CR-2026-00712',
    caseName: 'Operation Eastern Corridor: Rail Cargo Smuggling',
    entityId: 'P-0010',
    entityName: 'Amitabh Sen',
    entityType: 'person',
    category: 'transaction',
    title: '₹15,00,000 Hawala Token Cash Drop',
    description: 'Bearer token settlement given to local train parcel supervisor at ancient city ghat.',
    latitude: 25.3100,
    longitude: 83.0100,
    locationName: 'Godowlia Chowk Safehouse',
    city: 'Varanasi',
    stateOrCountry: 'Uttar Pradesh',
    timestamp: '2026-09-05 13:40',
    amount: 1500000,
    counterparty: 'Devendra Yadav (P-0011)',
    riskLevel: 'critical',
    details: { tokenSerials: ['VNS-991', 'VNS-992'] },
  },
  {
    id: 'GEO-503',
    caseId: 'CR-2026-00712',
    caseName: 'Operation Eastern Corridor: Rail Cargo Smuggling',
    entityId: 'P-0011',
    entityName: 'Devendra Yadav',
    entityType: 'person',
    category: 'vehicle_sighting',
    title: 'ANPR Toll Gate Intercept (Scorpio UP-53-BX-1122)',
    description: 'Vehicle escorting parcel consignments logged crossing corridor junction.',
    latitude: 26.7300,
    longitude: 88.4300,
    locationName: 'Sevoke Road Transit Corridor',
    city: 'Siliguri',
    stateOrCountry: 'West Bengal',
    timestamp: '2026-09-06 06:10',
    riskLevel: 'high',
    details: { plateNumber: 'UP-53-BX-1122', route: 'North Bengal Highway' },
  },
  {
    id: 'GEO-504',
    caseId: 'CR-2026-00712',
    caseName: 'Operation Eastern Corridor: Rail Cargo Smuggling',
    entityId: 'O-0006',
    entityName: 'Eastern Transit Cargo',
    entityType: 'organization',
    category: 'safehouse',
    title: 'Paltan Bazaar Transport Depot & Border Staging',
    description: 'Terminal depot where parcel contraband is distributed into cross-border couriers.',
    latitude: 26.1800,
    longitude: 91.7500,
    locationName: 'Paltan Bazaar Transport Enclave',
    city: 'Guwahati',
    stateOrCountry: 'Assam',
    timestamp: '2026-09-06 14:30',
    riskLevel: 'critical',
    details: { borderHub: 'Indo-Myanmar Forward Relay' },
  },
];

import { generateExpandedLocations } from '@/lib/dataGenerator';

const MASTER_OCCURRENCES: LocationOccurrence[] = [
  ...generateExpandedLocations(BASE_OCCURRENCES),
  ...GEOPOLITICAL_OCCURRENCES,
];

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CR-2026-00124'); // Default: Active Case CR-2026-00124
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [interstateSearch, setInterstateSearch] = useState<string>('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<LocationOccurrence | null>(null);
  const [showTrajectory, setShowTrajectory] = useState(true);

  // Check if user has an active query or case selected
  const hasActiveQuery = Boolean(
    selectedCaseId ||
    searchQuery.trim().length > 0 ||
    selectedEntityFilter !== 'all' ||
    selectedState !== 'all' ||
    selectedNetwork !== 'all' ||
    interstateSearch.trim().length > 0
  );

  // Derive all unique suspects/entities tied to the active case or search
  const availableEntities = useMemo(() => {
    let pool = MASTER_OCCURRENCES;
    if (selectedCaseId) {
      pool = pool.filter((o) => o.caseId === selectedCaseId);
    }
    const map = new Map<string, { id: string; label: string; type: string }>();
    pool.forEach((o) => {
      if (!map.has(o.entityId)) {
        map.set(o.entityId, {
          id: o.entityId,
          label: `${o.entityName} (${o.entityId})`,
          type: o.entityType,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedCaseId]);

  // Compute filtered occurrences
  const filteredOccurrences = useMemo(() => {
    // If no case selected AND no search query entered AND no entity selected, show NOTHING (radar standby)
    if (!hasActiveQuery) {
      return [];
    }

    const q = searchQuery.toLowerCase().trim();

    return MASTER_OCCURRENCES.filter((occ) => {
      // 1. Case filter
      if (selectedCaseId && occ.caseId !== selectedCaseId) {
        return false;
      }

      // 2. Entity filter
      if (selectedEntityFilter !== 'all' && occ.entityId !== selectedEntityFilter) {
        return false;
      }

      // 3. Category filter
      if (categoryFilter !== 'all' && occ.category !== categoryFilter) {
        return false;
      }

      // 4. Full-text search match across all dimensions
      if (q) {
        const matchTitle = occ.title.toLowerCase().includes(q);
        const matchDesc = occ.description.toLowerCase().includes(q);
        const matchEntityName = occ.entityName.toLowerCase().includes(q);
        const matchEntityId = occ.entityId.toLowerCase().includes(q);
        const matchCaseId = occ.caseId?.toLowerCase().includes(q) || false;
        const matchCaseName = occ.caseName?.toLowerCase().includes(q) || false;
        const matchLocation = occ.locationName.toLowerCase().includes(q);
        const matchCity = occ.city.toLowerCase().includes(q);
        const matchState = occ.stateOrCountry?.toLowerCase().includes(q) || false;
        const matchCounterparty = occ.counterparty?.toLowerCase().includes(q) || false;
        const matchAmount = occ.amount ? String(occ.amount).includes(q) : false;
        const matchPlate = occ.details?.plateNumber?.toLowerCase().includes(q) || false;
        const matchCellId = occ.details?.cellId?.toLowerCase().includes(q) || false;
        const matchTxRef = occ.details?.txRef?.toLowerCase().includes(q) || false;
        const matchBank = occ.details?.bankCode?.toLowerCase().includes(q) || false;

        const matchesAny =
          matchTitle ||
          matchDesc ||
          matchEntityName ||
          matchEntityId ||
          matchCaseId ||
          matchCaseName ||
          matchLocation ||
          matchCity ||
          matchState ||
          matchCounterparty ||
          matchAmount ||
          matchPlate ||
          matchCellId ||
          matchTxRef ||
          matchBank;

        if (!matchesAny) return false;
      }

      // 5. State filter (22 Indian States)
      if (selectedState !== 'all' && occ.stateOrCountry !== selectedState) {
        return false;
      }

      // 6. Network category filter
      if (selectedNetwork !== 'all' && occ.details?.network !== selectedNetwork) {
        return false;
      }

      // 7. Inter-state corridor search
      if (interstateSearch.trim()) {
        const iq = interstateSearch.toLowerCase().trim();
        const matchesCorridor = (occ.details?.corridor || '').toLowerCase().includes(iq);
        const matchesState = occ.stateOrCountry.toLowerCase().includes(iq);
        const matchesCase = occ.caseName?.toLowerCase().includes(iq);
        if (!matchesCorridor && !matchesState && !matchesCase) return false;
      }

      return true;
    });
  }, [hasActiveQuery, selectedCaseId, selectedEntityFilter, categoryFilter, selectedState, selectedNetwork, interstateSearch, searchQuery]);

  // Keep selected occurrence in sync or reset if filtered out
  useEffect(() => {
    if (filteredOccurrences.length > 0) {
      // If current selected is in the filtered list, keep it; otherwise pick the first
      const exists = filteredOccurrences.some((o) => o.id === selectedOccurrence?.id);
      if (!exists) {
        setSelectedOccurrence(filteredOccurrences[0]);
      }
    } else {
      setSelectedOccurrence(null);
    }
  }, [filteredOccurrences, selectedOccurrence]);

  // Total Geocoded Volume
  const totalVolume = useMemo(() => {
    return filteredOccurrences.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredOccurrences]);

  // Reset / Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCaseId('');
    setSelectedEntityFilter('all');
    setCategoryFilter('all');
    setSelectedState('all');
    setSelectedNetwork('all');
    setInterstateSearch('');
    setSelectedOccurrence(null);
  };

  // Quick select a case
  const handleSelectCase = (caseNumber: string) => {
    setSelectedCaseId(caseNumber);
    setSelectedEntityFilter('all');
    setSearchQuery('');
  };

  // Quick search by entity or query
  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSelectedCaseId('');
    setSelectedEntityFilter('all');
  };

  return (
    <div className="space-y-6 text-charcoal-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-charcoal-800" />
            <span>Live Geospatial Intelligence & Incident Occurrences</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Real-time interactive OpenStreetMap plotting for specific investigations, suspect trajectories, Hawala/ATM cash transactions, and cell tower CDR triangulations.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              showTrajectory
                ? 'bg-charcoal-900 text-beige-100 shadow-charcoal-900/15'
                : 'bg-white border border-beige-300 text-charcoal-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showTrajectory ? 'Trajectory Trail: ON' : 'Trajectory Trail: OFF'}</span>
          </button>
          <Link
            href="/cases"
            className="px-4 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Briefcase className="w-3.5 h-3.5 text-charcoal-600" />
            <span>Case Files</span>
          </Link>
        </div>
      </div>

      {/* GIS Geospatial Reconnaissance HUD Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-teal-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-bold text-teal-300 tracking-wider">GIS SATELLITE RECON & SENSOR REPOSITORY</span>
          <span className="text-slate-400 hidden sm:inline">• 28.6139° N, 77.2090° E (WGS-84)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>MAPPED SENSORS: <strong className="text-white font-bold">{MASTER_OCCURRENCES.length}</strong></span>
          <span className="hidden sm:inline">COORDINATE SYSTEM: <strong className="text-teal-300 font-bold">EPSG:4326 GEODETIC</strong></span>
          <span className="hidden md:inline">RADAR TELEMETRY: <strong className="text-emerald-300 font-bold">LOCKED</strong></span>
        </div>
      </div>

      {/* Main Filter & Case Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel space-y-3.5 shadow-md">
        {/* Top row: Case Selector Dropdown + Search Input */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Case Dropdown */}
          <div className="lg:col-span-5 relative">
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Select Investigation Case:
            </label>
            <div className="relative">
              <select
                value={selectedCaseId}
                onChange={(e) => {
                  setSelectedCaseId(e.target.value);
                  setSelectedEntityFilter('all');
                }}
                className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-950 font-bold focus:border-charcoal-900 outline-none shadow-sm cursor-pointer appearance-none"
              >
                <option value="">-- No Case Selected (Search Any Target / Clean Map) --</option>
                {CASES_CATALOG.filter((c) => {
                  if (selectedState !== 'all' && c.originState !== selectedState && c.destinationState !== selectedState) return false;
                  if (selectedNetwork !== 'all' && c.networkType !== selectedNetwork) return false;
                  return true;
                }).map((c) => (
                  <option key={c.caseNumber} value={c.caseNumber}>
                    {c.caseNumber} • {c.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-500 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Search Input across all entities, vehicle plates, phones, bank accounts, cities */}
          <div className="lg:col-span-7">
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Target / Keyword Search:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suspect name, vehicle plate (e.g. MH-02-CD-9988), phone, city, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-800 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Geopolitical State & Network Search Row (22 Indian States + Inter-State Corridors) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-beige-200 text-xs">
          {/* State Filter (22 Indian States) */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Indian State Filter ({INDIAN_STATES_LIST.length} States):
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 font-bold focus:border-charcoal-900 outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All States & Territories (22 Indian States)</option>
              {INDIAN_STATES_LIST.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Search Between States / Interstate Corridor */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Search Between States / Transit Corridor:
            </label>
            <input
              type="text"
              placeholder="e.g. Maharashtra → Delhi, Gujarat, Punjab..."
              value={interstateSearch}
              onChange={(e) => setInterstateSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none shadow-sm"
            />
          </div>

          {/* Network Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Syndicate Network Category:
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 font-bold focus:border-charcoal-900 outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Networks & Transits</option>
              <option value="Hawala & Illicit Flow">Hawala & Illicit Financial Flows</option>
              <option value="Convoy & Toll Transits">Highway Convoy & Toll Transits</option>
              <option value="Burner Telecom Intercepts">Burner Telecom Intercepts</option>
              <option value="Cyber Financial Mules">Cyber Financial Mules</option>
              <option value="Border Contraband">Border & Maritime Contraband</option>
            </select>
          </div>
        </div>

        {/* Middle row: Category Filters & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-beige-200">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase font-bold shrink-0 mr-1">
              Category:
            </span>
            {[
              { id: 'all', label: 'All Intel Points' },
              { id: 'transaction', label: '💳 Transactions (Hawala/ATM)' },
              { id: 'communication', label: '📞 CDR Tower Calls' },
              { id: 'vehicle_sighting', label: '🚗 ANPR Sightings' },
              { id: 'safehouse', label: '🏢 Safehouses & Depots' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-charcoal-900 text-beige-100 shadow-sm font-bold'
                    : 'bg-white border border-beige-300 text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {hasActiveQuery && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Scope & Reset Map</span>
            </button>
          )}
        </div>

        {/* Bottom row: Dynamic Suspect Scope Chips (Only visible when a case is active) */}
        {selectedCaseId && availableEntities.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-beige-200 text-xs">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase font-bold shrink-0">
              Target Suspects in Case:
            </span>
            <button
              onClick={() => setSelectedEntityFilter('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] transition cursor-pointer ${
                selectedEntityFilter === 'all'
                  ? 'bg-charcoal-900 text-beige-100 font-bold shadow-sm'
                  : 'bg-white text-charcoal-700 hover:bg-beige-100 border border-beige-300'
              }`}
            >
              All Linked Suspects ({availableEntities.length})
            </button>
            {availableEntities.map((ent) => (
              <button
                key={ent.id}
                onClick={() => setSelectedEntityFilter(ent.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] transition cursor-pointer ${
                  selectedEntityFilter === ent.id
                    ? 'bg-charcoal-900 text-beige-100 font-bold shadow-sm'
                    : 'bg-white text-charcoal-700 hover:bg-beige-100 border border-beige-300'
                }`}
              >
                {ent.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Workspace: 70% Live Map, 30% Occurrence Timeline Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[560px]">
        {/* Left 2 Cols: Live OpenStreetMap */}
        <div className="lg:col-span-2 h-full flex flex-col gap-3">
          <div className="flex-1 min-h-0 relative rounded-3xl overflow-hidden shadow-xl border border-beige-300/80 bg-white">
            <LiveLocationMap
              occurrences={filteredOccurrences}
              selectedOccurrence={selectedOccurrence}
              onSelectOccurrence={(occ) => setSelectedOccurrence(occ)}
              showTrajectory={showTrajectory}
            />

            {/* Tactical Standby Radar HUD Overlay when no case/target is searched */}
            {!hasActiveQuery && (
              <div className="absolute inset-0 z-[400] bg-charcoal-950/45 backdrop-blur-[3px] flex items-center justify-center p-6 text-center animate-fade-in pointer-events-none">
                <div className="max-w-md p-6 rounded-3xl bg-white/95 border border-beige-300 shadow-2xl space-y-3 pointer-events-auto">
                  <div className="w-12 h-12 rounded-full bg-charcoal-900 text-beige-200 flex items-center justify-center mx-auto shadow-md">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-charcoal-950 text-base">
                      Geospatial Intel Standby — Query Required
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      To preserve clarity across enterprise intelligence datasets, geospatial occurrences and movement trajectories are plotted only upon searching a target or selecting an investigation case.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-beige-200">
                    <p className="text-[10px] font-mono uppercase text-charcoal-500 font-bold mb-2">
                      Quick Launch Active Cases:
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {CASES_CATALOG.slice(0, 3).map((c) => (
                        <button
                          key={c.caseNumber}
                          onClick={() => handleSelectCase(c.caseNumber)}
                          className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-[11px] font-bold transition shadow-sm cursor-pointer"
                        >
                          {c.caseNumber} • {c.title.split(':')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar below Map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl glass-panel shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-charcoal-900 text-beige-200">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-charcoal-500 uppercase font-semibold">Pings Mapped</p>
                <p className="text-sm font-extrabold text-charcoal-950">
                  {hasActiveQuery ? `${filteredOccurrences.length} Locations` : 'Standby (0)'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-charcoal-900 text-beige-200">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-charcoal-500 uppercase font-semibold">Mapped Volume</p>
                <p className="text-sm font-extrabold text-emerald-700">
                  {hasActiveQuery ? `₹${(totalVolume / 100000).toFixed(1)} Lakhs` : '₹0.0 Lakhs'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-charcoal-900 text-beige-200">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-charcoal-500 uppercase font-semibold">CDR Triangulations</p>
                <p className="text-sm font-extrabold text-charcoal-950">
                  {hasActiveQuery
                    ? `${filteredOccurrences.filter((o) => o.category === 'communication').length} Towers`
                    : '0 Towers'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-charcoal-900 text-beige-200">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-charcoal-500 uppercase font-semibold">ANPR Sightings</p>
                <p className="text-sm font-extrabold text-charcoal-950">
                  {hasActiveQuery
                    ? `${filteredOccurrences.filter((o) => o.category === 'vehicle_sighting').length} Checkpoints`
                    : '0 Checkpoints'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Occurrence Timeline & Details Drawer */}
        <div className="h-full flex flex-col gap-4 overflow-hidden">
          {/* If there is an active search with results */}
          {hasActiveQuery && filteredOccurrences.length > 0 ? (
            <>
              {/* Selected Occurrence Detail Card */}
              {selectedOccurrence && (
                <div className="p-5 rounded-3xl glass-panel space-y-3.5 shadow-xl border-2 border-charcoal-900/20 shrink-0 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                        selectedOccurrence.category === 'transaction'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : selectedOccurrence.category === 'communication'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : selectedOccurrence.category === 'vehicle_sighting'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {selectedOccurrence.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-charcoal-500">{selectedOccurrence.timestamp}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-charcoal-950 text-base leading-snug">
                      {selectedOccurrence.title}
                    </h3>
                    <p className="text-xs text-charcoal-600 font-medium mt-0.5">
                      Suspect: <strong className="text-charcoal-950">{selectedOccurrence.entityName}</strong> ({selectedOccurrence.entityId})
                    </p>
                    {selectedOccurrence.caseName && (
                      <p className="text-[11px] font-mono text-charcoal-500 mt-0.5">
                        Case: <span className="font-bold text-charcoal-800">{selectedOccurrence.caseName}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-beige-300 text-xs space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-500">Location:</span>
                      <span className="font-bold text-charcoal-950 text-right">
                        {selectedOccurrence.locationName}, {selectedOccurrence.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-500">Coordinates:</span>
                      <span className="font-mono text-charcoal-700 text-[11px]">
                        {selectedOccurrence.latitude.toFixed(4)}°N, {selectedOccurrence.longitude.toFixed(4)}°E
                      </span>
                    </div>
                    {selectedOccurrence.amount && (
                      <div className="flex items-center justify-between pt-1 border-t border-beige-200">
                        <span className="text-charcoal-500">Amount:</span>
                        <span className="font-bold text-emerald-700 font-mono text-sm">
                          ₹{selectedOccurrence.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {selectedOccurrence.counterparty && (
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-500">Counterparty:</span>
                        <span className="font-semibold text-charcoal-900">{selectedOccurrence.counterparty}</span>
                      </div>
                    )}
                    {selectedOccurrence.details?.plateNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-500">Vehicle Plate:</span>
                        <span className="font-mono font-bold text-charcoal-900">{selectedOccurrence.details.plateNumber}</span>
                      </div>
                    )}
                    {selectedOccurrence.details?.cellId && (
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-500">Tower Sector ID:</span>
                        <span className="font-mono font-bold text-blue-700">{selectedOccurrence.details.cellId}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
                    {selectedOccurrence.description}
                  </p>
                </div>
              )}

              {/* Chronological Timeline Feed */}
              <div className="flex-1 glass-panel rounded-3xl p-5 overflow-y-auto space-y-3 min-h-0 shadow-lg">
                <h4 className="text-xs font-bold text-charcoal-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-charcoal-700" />
                  <span>Movement & Transaction Chronology ({filteredOccurrences.length})</span>
                </h4>

                <div className="space-y-2.5">
                  {filteredOccurrences.map((occ) => {
                    const isSelected = selectedOccurrence?.id === occ.id;
                    return (
                      <div
                        key={occ.id}
                        onClick={() => setSelectedOccurrence(occ)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition space-y-1.5 ${
                          isSelected
                            ? 'bg-charcoal-900 border-charcoal-900 text-white shadow-md'
                            : 'bg-white/80 border-beige-300 text-charcoal-800 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-beige-300' : 'text-charcoal-500'}`}>
                            {occ.timestamp}
                          </span>
                          {occ.amount ? (
                            <span className={`font-mono font-extrabold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              ₹{(occ.amount / 100000).toFixed(1)}L
                            </span>
                          ) : (
                            <span className={`text-[10px] uppercase font-mono ${isSelected ? 'text-beige-300' : 'text-charcoal-400'}`}>
                              {occ.city}
                            </span>
                          )}
                        </div>
                        <p className={`font-bold leading-snug ${isSelected ? 'text-white' : 'text-charcoal-950'}`}>
                          {occ.title}
                        </p>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-beige-200' : 'text-charcoal-600'}`}>
                          {occ.locationName}, {occ.city}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : hasActiveQuery && filteredOccurrences.length === 0 ? (
            /* Search Query Returned Zero Results */
            <div className="h-full glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-charcoal-950 text-base">No Matching Geospatial Intel</h3>
                <p className="text-xs text-charcoal-600 mt-1 max-w-xs">
                  No incident occurrences or trajectory points matched <strong className="text-charcoal-900">"{searchQuery}"</strong>.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-full bg-charcoal-900 text-beige-100 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* Standby State: Case Directory & Quick Target Suggestions */
            <div className="h-full glass-panel rounded-3xl p-5 overflow-y-auto space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-beige-200 pb-3">
                <h4 className="text-xs font-bold text-charcoal-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-charcoal-700" />
                  <span>Investigation Directory ({CASES_CATALOG.length})</span>
                </h4>
                <span className="text-[10px] font-mono text-charcoal-500">Click to plot</span>
              </div>

              <p className="text-xs text-charcoal-600 leading-relaxed">
                Select an active case below or search any suspect, plate number, or account in the search bar above to plot live geospatial intelligence:
              </p>

              {/* Case Cards */}
              <div className="space-y-3">
                {CASES_CATALOG.map((c) => (
                  <div
                    key={c.caseNumber}
                    onClick={() => handleSelectCase(c.caseNumber)}
                    className="p-4 rounded-2xl bg-white border border-beige-300 hover:border-charcoal-400 hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-beige-100 text-charcoal-800 px-2.5 py-0.5 rounded-full border border-beige-300">
                        {c.caseNumber}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-700">
                        ₹{(c.totalVolume / 100000).toFixed(1)}L Vol
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-charcoal-950 group-hover:text-charcoal-800">
                      {c.title}
                    </h5>
                    <p className="text-[11px] text-charcoal-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-charcoal-400" />
                      <span>{c.primaryLocation}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Search Chips */}
              <div className="pt-3 border-t border-beige-200 space-y-2">
                <p className="text-[10px] font-mono uppercase text-charcoal-500 font-bold">
                  Quick Query Targets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Vikram Rathore',
                    'Rashid Al-Mansoor',
                    'Sameer Khan',
                    'Priya Sharma',
                    'MH-02-CD-9988',
                    'DL-01-AB-1234',
                    '+919876543210',
                    'Dubai',
                    'Surat',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleQuickSearch(chip)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-700 font-medium text-[10px] transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
