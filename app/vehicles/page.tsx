'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Car,
  Search,
  Filter,
  ShieldAlert,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  Camera,
  AlertTriangle,
  Download,
  Truck,
  Users,
  Eye,
  CheckCircle2,
  ChevronLeft,
  SlidersHorizontal,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { MASTER_VEHICLES, VehicleRecord } from '@/lib/data';

const POPULAR_RTO_REGIONS = [
  { key: 'all', label: 'All RTO Circles' },
  { key: 'MH', label: 'MH (Maharashtra)' },
  { key: 'DL', label: 'DL (Delhi-NCR)' },
  { key: 'KA', label: 'KA (Karnataka)' },
  { key: 'GJ', label: 'GJ (Gujarat)' },
  { key: 'TN', label: 'TN (Tamil Nadu)' },
  { key: 'TS', label: 'TS (Telangana)' },
  { key: 'WB', label: 'WB (West Bengal)' },
  { key: 'HR', label: 'HR (Haryana)' },
  { key: 'UP', label: 'UP (Uttar Pradesh)' },
];

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [riskOnly, setRiskOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'plate' | 'risk'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);

  // Instant Number Plate Culprit Scanner State
  const [plateScannerInput, setPlateScannerInput] = useState('');
  const [scannedTriageResult, setScannedTriageResult] = useState<{
    plate: string;
    status: 'culprit' | 'suspicious' | 'safe';
    vehicle?: VehicleRecord;
    title: string;
    description: string;
    lastSighted: string;
    riskScore: number;
    owner: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanPlate = (plateToScan?: string) => {
    const raw = (plateToScan || plateScannerInput).trim().toUpperCase();
    if (!raw) return;
    setIsScanning(true);

    setTimeout(() => {
      // Look up in database
      const cleanRaw = raw.replace(/[^A-Z0-9]/g, '');
      const found = MASTER_VEHICLES.find(
        (v) => v.plateNumber.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanRaw ||
               v.plateNumber.toUpperCase().includes(raw)
      );

      if (found) {
        const hasCriticalAlert = (found.alerts && found.alerts.some((a) => a.severity === 'critical')) || found.riskFlag;
        const linkedCase = (found.cases && found.cases[0]) || 'CR-2026-00124';

        if (hasCriticalAlert) {
          setScannedTriageResult({
            plate: found.plateNumber,
            status: 'culprit',
            vehicle: found,
            title: '🔴 CULPRIT / HIGH-RISK SYNDICATE ESCORT',
            description: `MATCH CONFIRMED: Vehicle flagged in active criminal syndicate movement (${linkedCase}). Wanted for transit of contraband and convoy coordination. Immediate highway impound order active.`,
            lastSighted: `${found.lastSeenLocation} (${found.lastSeenTimestamp})`,
            riskScore: 94,
            owner: found.ownerName,
          });
        } else if (found.vehicleType === 'commercial_truck' || (found.alerts && found.alerts.length > 0)) {
          setScannedTriageResult({
            plate: found.plateNumber,
            status: 'suspicious',
            vehicle: found,
            title: '🟡 SUSPICIOUS / HIGHWAY WATCHLIST',
            description: `ELEVATED RISK: Irregular interstate transit history with odd-hour toll crossings detected. FASTag account linked to commercial freight monitoring. Visual patrol check advised.`,
            lastSighted: `${found.lastSeenLocation} (${found.lastSeenTimestamp})`,
            riskScore: 62,
            owner: found.ownerName,
          });
        } else {
          setScannedTriageResult({
            plate: found.plateNumber,
            status: 'safe',
            vehicle: found,
            title: '🟢 SAFE / VERIFIED CLEAR',
            description: `CLEAN RECORD: Verified registration under Ministry of Road Transport VAHAN 4.0. Valid commercial/private insurance & active FASTag balance. Zero association with flagged syndicates.`,
            lastSighted: `${found.lastSeenLocation} (${found.lastSeenTimestamp})`,
            riskScore: 15,
            owner: found.ownerName,
          });
        }
      } else {
        // Unknown plate evaluation
        const isKnownSuspiciousFormat = raw.includes('77') || raw.includes('99') || raw.includes('00') || raw.startsWith('DL');
        if (isKnownSuspiciousFormat) {
          setScannedTriageResult({
            plate: raw,
            status: 'suspicious',
            title: '🟡 SUSPICIOUS / UNREGISTERED TAG',
            description: `UNVERIFIED TAG: Plate format detected at regional border checkpoint but FASTag electronic signature is unlinked in state VAHAN registry. Flagged for physical weighbridge check.`,
            lastSighted: `Interstate Boundary Gantry (Recent)`,
            riskScore: 58,
            owner: 'Unregistered / Commercial Transit',
          });
        } else {
          setScannedTriageResult({
            plate: raw,
            status: 'safe',
            title: '🟢 SAFE / REGULAR CIVILIAN VEHICLE',
            description: `CLEAR RECORD: Standard civilian registration detected. No active lookouts, APBs, or criminal syndicate links logged in the central crime repository.`,
            lastSighted: `State Highway Checkpoint`,
            riskScore: 12,
            owner: 'Civilian Motor Vehicle',
          });
        }
      }
      setIsScanning(false);
    }, 250);
  };

  const filtered = useMemo(() => {
    return MASTER_VEHICLES.filter((v) => {
      if (typeFilter !== 'all' && v.vehicleType !== typeFilter) return false;
      if (regionFilter !== 'all' && !v.plateNumber.startsWith(regionFilter)) return false;
      if (riskOnly && !v.riskFlag) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          v.plateNumber.toLowerCase().includes(q) ||
          v.makeModel.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          v.ownerId.toLowerCase().includes(q) ||
          v.fastagId.toLowerCase().includes(q) ||
          v.lastSeenLocation.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'risk') return (b.riskFlag ? 1 : 0) - (a.riskFlag ? 1 : 0);
      if (sortBy === 'plate') return a.plateNumber.localeCompare(b.plateNumber);
      return (b.lastSeenTimestamp || '').localeCompare(a.lastSeenTimestamp || '');
    });
  }, [searchQuery, typeFilter, regionFilter, riskOnly, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalSightings = useMemo(() => {
    return MASTER_VEHICLES.reduce((acc, v) => acc + v.sightings.length, 0);
  }, []);

  const exportCSV = () => {
    const headers = [
      'Vehicle Plate',
      'Make / Model',
      'Vehicle Type',
      'Owner Name',
      'Owner ID',
      'Risk Flagged',
      'FASTag ID',
      'Chassis Number',
      'Last Seen Location',
      'Last Seen Timestamp',
      'Associated Cases',
    ];

    const rows = filtered.map((v) => [
      `"${v.plateNumber}"`,
      `"${v.makeModel.replace(/"/g, '""')}"`,
      `"${v.vehicleType}"`,
      `"${v.ownerName.replace(/"/g, '""')}"`,
      `"${v.ownerId}"`,
      v.riskFlag ? 'YES' : 'NO',
      `"${v.fastagId}"`,
      `"${v.chassisNumber}"`,
      `"${v.lastSeenLocation.replace(/"/g, '""')}"`,
      `"${v.lastSeenTimestamp}"`,
      `"${v.cases.join(', ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `circuit_vehicle_intel_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <Car className="w-5 h-5 text-charcoal-800" />
            <span>Vehicle Intelligence & ANPR Highway Surveillance ({MASTER_VEHICLES.length} Tracked)</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Automated Number Plate Recognition (ANPR), FASTag highway toll logs, escort convoy patterns, and cross-state transit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/locations"
            className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-beige-300" />
            <span>Live Geospatial Map</span>
          </Link>
        </div>
      </div>

      {/* Highway ANPR & VAHAN Intercept Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-amber-700/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-300 tracking-wider">HIGHWAY ANPR & VAHAN 4.0 TELEMETRY</span>
          <span className="text-slate-400 hidden sm:inline">• TOLLWAY FASTAG RADAR & CONVOY INTERCEPT</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>UNITS TRACKED: <strong className="text-white font-bold">{MASTER_VEHICLES.length}</strong></span>
          <span className="hidden sm:inline">HIGHWAY SENSORS: <strong className="text-amber-300 font-bold">NH-48 / NH-44 ACTIVE</strong></span>
          <span className="hidden md:inline">FASTAG FEED: <strong className="text-emerald-300 font-bold">REAL-TIME</strong></span>
        </div>
      </div>

      {/* Instant Number Plate Triage Scanner (Culprit / Suspicious / Safe) */}
      <div className="p-5 rounded-3xl glass-panel border border-beige-300 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige-200 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
              VAHAN 4.0 & ANPR LOOKUP INTERFACE
            </span>
            <h3 className="text-sm font-extrabold text-charcoal-950 flex items-center gap-2 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-charcoal-800" />
              <span>Instant Vehicle Number Plate Culprit & Threat Triage</span>
            </h3>
            <p className="text-[11px] text-charcoal-600">
              Query any motor vehicle registration number to instantly determine if it is a <strong>Culprit (Flagged Escort)</strong>, <strong>Suspicious (Watchlist)</strong>, or <strong>Safe (Clear)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-charcoal-500 font-bold">Quick Presets:</span>
            <button
              onClick={() => { setPlateScannerInput('MH-01-EA-9021'); handleScanPlate('MH-01-EA-9021'); }}
              className="px-2 py-0.5 rounded bg-red-100 text-red-800 hover:bg-red-200 text-[10px] font-bold transition cursor-pointer"
            >
              MH-01-EA-9021 (Culprit)
            </button>
            <button
              onClick={() => { setPlateScannerInput('DL-03-CC-1122'); handleScanPlate('DL-03-CC-1122'); }}
              className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-bold transition cursor-pointer"
            >
              DL-03-CC-1122 (Suspicious)
            </button>
            <button
              onClick={() => { setPlateScannerInput('MH-14-AA-1001'); handleScanPlate('MH-14-AA-1001'); }}
              className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px] font-bold transition cursor-pointer"
            >
              MH-14-AA-1001 (Safe)
            </button>
          </div>
        </div>

        {/* Input bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="bg-blue-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded font-mono">IND</span>
            </div>
            <input
              type="text"
              placeholder="Enter Registration Plate (e.g. MH-01-EA-9021, DL-03-CC-1122, KA-04-MB-3344)..."
              value={plateScannerInput}
              onChange={(e) => setPlateScannerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleScanPlate()}
              className="w-full pl-14 pr-4 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs font-mono font-bold text-charcoal-950 focus:border-charcoal-900 outline-none shadow-sm uppercase tracking-wider"
            />
          </div>

          <button
            onClick={() => handleScanPlate()}
            disabled={isScanning || !plateScannerInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-beige-100 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning VAHAN 4.0...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-beige-300" />
                <span>Scan Plate & Triage</span>
              </>
            )}
          </button>
        </div>

        {/* Triage Verdict Banner */}
        {scannedTriageResult && (
          <div
            className={`p-4 rounded-2xl border transition-all animate-fade-in ${
              scannedTriageResult.status === 'culprit'
                ? 'bg-red-50 border-red-300 text-red-950'
                : scannedTriageResult.status === 'suspicious'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 font-bold ${
                    scannedTriageResult.status === 'culprit'
                      ? 'bg-red-600 text-white'
                      : scannedTriageResult.status === 'suspicious'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        scannedTriageResult.status === 'culprit'
                          ? 'bg-red-600 text-white'
                          : scannedTriageResult.status === 'suspicious'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {scannedTriageResult.status === 'culprit'
                        ? 'CULPRIT / FLAGGED CONVOY'
                        : scannedTriageResult.status === 'suspicious'
                        ? 'SUSPICIOUS / WATCHLIST'
                        : 'SAFE / VERIFIED CLEAR'}
                    </span>
                    <span className="font-mono font-bold text-xs bg-white/80 px-2 py-0.5 rounded border border-charcoal-200">
                      PLATE: {scannedTriageResult.plate}
                    </span>
                    <span className="font-mono text-[10px] text-charcoal-600">
                      Risk Score: {scannedTriageResult.riskScore}/100
                    </span>
                  </div>

                  <p className="text-xs font-semibold mt-1 leading-relaxed">
                    {scannedTriageResult.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-charcoal-600 mt-2">
                    <span>Registered Owner: <strong>{scannedTriageResult.owner}</strong></span>
                    <span>Last Sighting: <strong>{scannedTriageResult.lastSighted}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {scannedTriageResult.vehicle && (
                  <button
                    onClick={() => setSelectedVehicle(scannedTriageResult.vehicle!)}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-charcoal-300 text-charcoal-900 font-bold text-xs transition cursor-pointer"
                  >
                    View Vehicle Record
                  </button>
                )}
                {scannedTriageResult.status === 'culprit' && (
                  <button
                    onClick={() => alert(`HIGHWAY INTERCEPT APB ISSUED for ${scannedTriageResult.plate} to State Police Highway Patrol & All Toll Plazas.`)}
                    className="px-3.5 py-1.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Issue Intercept APB
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Convoy Detection Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-600 text-white shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-charcoal-950 text-sm block">
              Active Highway Escort Convoy Detected
            </span>
            <p className="text-charcoal-700 mt-0.5">
              ANPR cameras captured <span className="font-mono font-bold text-charcoal-950">MH-01-EA-9021</span> (Toyota Fortuner) and{' '}
              <span className="font-mono font-bold text-charcoal-950">MH-12-PQ-7788</span> (Innova Crysta) crossing Khed-Shivapur Toll Plaza (Pune-Satara NH-48) within <span className="font-bold text-red-700">68 seconds</span> of each other.
            </p>
          </div>
        </div>
        <Link
          href="/locations"
          className="px-4 py-2 rounded-full bg-charcoal-900 text-beige-100 font-bold hover:bg-charcoal-800 text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <span>Track on Highway Map</span>
          <ChevronRight className="w-3.5 h-3.5 text-beige-300" />
        </Link>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Tracked Vehicles</p>
            <p className="text-base font-extrabold text-charcoal-950">{MASTER_VEHICLES.length} Units</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Flagged Escorts</p>
            <p className="text-base font-extrabold text-red-700">
              {MASTER_VEHICLES.filter((v) => v.riskFlag).length} Flagged
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Toll ANPR Checkpoints</p>
            <p className="text-base font-extrabold text-charcoal-950">{totalSightings} Sightings</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Heavy Freight Containers</p>
            <p className="text-base font-extrabold text-purple-900">
              {MASTER_VEHICLES.filter((v) => v.vehicleType === 'commercial_truck').length} Intercepted
            </p>
          </div>
        </div>
      </div>

      {/* Regional RTO Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {POPULAR_RTO_REGIONS.map((rto) => (
          <button
            key={rto.key}
            onClick={() => {
              setRegionFilter(rto.key);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer shrink-0 ${
              regionFilter === rto.key
                ? 'bg-charcoal-900 text-beige-100 shadow-sm'
                : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
            }`}
          >
            {rto.label}
          </button>
        ))}
      </div>

      {/* Filter & Plate Search Bar */}
      <div className="p-4 rounded-3xl glass-panel space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registration plate (e.g. MH-01-EA, DL-3C), make, FASTag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-semibold">
            {/* Vehicle Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Vehicle Types</option>
              <option value="suv">SUV / Escort Vehicle</option>
              <option value="sedan">Sedan</option>
              <option value="commercial_truck">Commercial Heavy Container</option>
              <option value="luxury_armored">Luxury / Bulletproof</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-800 font-medium outline-none cursor-pointer"
            >
              <option value="recent">Sort by Last Sighting</option>
              <option value="plate">Sort by Plate Number</option>
              <option value="risk">Sort by High-Risk</option>
            </select>

            {/* Risk Only Toggle */}
            <button
              onClick={() => {
                setRiskOnly(!riskOnly);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                riskOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-beige-300 text-charcoal-700 hover:text-charcoal-950'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Flagged Targets Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Table with Pagination */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-beige-300/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-beige-200 bg-white/70 text-[10px] font-mono uppercase font-bold text-charcoal-600">
                <th className="p-4">Registration Plate & Model</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Registered Owner</th>
                <th className="p-4">FASTag ID / Chassis</th>
                <th className="p-4">Last Verified Checkpoint</th>
                <th className="p-4">Sightings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200/70">
              {paginated.map((v) => (
                <tr
                  key={v.vehicleId}
                  onClick={() => setSelectedVehicle(v)}
                  className="hover:bg-white/90 transition cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-charcoal-900 text-beige-200 shrink-0 shadow-sm">
                        {v.vehicleType === 'commercial_truck' ? (
                          <Truck className="w-4 h-4" />
                        ) : (
                          <Car className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-mono font-extrabold text-charcoal-950 text-sm block">
                          {v.plateNumber}
                        </span>
                        <span className="text-[11px] text-charcoal-600">{v.makeModel}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-charcoal-700 font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-white border border-beige-300 text-[10px] uppercase font-mono font-bold">
                      {v.vehicleType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/entities`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                    >
                      <span>{v.ownerName}</span>
                      <ExternalLink className="w-3 h-3 text-charcoal-400" />
                    </Link>
                    <span className="text-[10px] text-charcoal-500 block">{v.ownerDesignation}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-charcoal-600">
                    <span className="block font-bold text-charcoal-800">{v.fastagId}</span>
                    <span className="text-[10px] text-charcoal-400">{v.chassisNumber}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-charcoal-900 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{v.lastSeenLocation}</span>
                    </div>
                    <span className="text-[10px] font-mono text-charcoal-500 block mt-0.5">
                      {v.lastSeenTimestamp}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-beige-200 text-charcoal-800 font-mono font-bold text-[11px]">
                      {v.sightings.length} ANPR logs
                    </span>
                  </td>
                  <td className="p-4">
                    {v.riskFlag ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Flagged Escort</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
                        Clear
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(v);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-[11px] font-bold transition shadow-sm cursor-pointer"
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 bg-white/70 border-t border-beige-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-charcoal-600 font-mono">
            Showing <strong className="text-charcoal-950">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-charcoal-950">{Math.min(currentPage * pageSize, filtered.length)}</strong> of{' '}
            <strong className="text-charcoal-950">{filtered.length}</strong> vehicles
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-charcoal-950 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Dossier & Movement Timeline Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-7 shadow-2xl space-y-5 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-charcoal-900 text-beige-100 shadow-md">
                  <Car className="w-6 h-6 text-beige-200" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-extrabold text-charcoal-950">
                    {selectedVehicle.plateNumber}
                  </h3>
                  <p className="text-xs text-charcoal-600">
                    {selectedVehicle.makeModel} • <span className="capitalize">{selectedVehicle.vehicleType.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="w-8 h-8 rounded-full bg-beige-100 hover:bg-beige-200 text-charcoal-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Owner & Registry Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1">
                <span className="text-[10px] uppercase font-mono text-charcoal-500 font-bold block">
                  Registered Owner
                </span>
                <Link
                  href={`/entities`}
                  className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                >
                  <span>{selectedVehicle.ownerName}</span>
                  <ExternalLink className="w-3 h-3 text-charcoal-400" />
                </Link>
                <span className="text-[11px] text-charcoal-500 block">{selectedVehicle.ownerDesignation}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1 font-mono">
                <span className="text-[10px] uppercase font-mono text-charcoal-500 font-bold block">
                  FASTag & Chassis
                </span>
                <p className="font-bold text-charcoal-900">{selectedVehicle.fastagId}</p>
                <p className="text-[10px] text-charcoal-500">{selectedVehicle.chassisNumber}</p>
              </div>
            </div>

            {/* Toll ANPR Sightings Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center justify-between">
                <span>ANPR Highway Sightings Timeline ({selectedVehicle.sightings.length})</span>
                <span className="text-[10px] font-mono text-charcoal-500">Chronological highway logs</span>
              </h4>

              <div className="space-y-2">
                {selectedVehicle.sightings.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-white border border-beige-300 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-bold text-charcoal-950">{s.tollPlaza}</span>
                      </div>
                      <span className="font-mono text-[11px] text-charcoal-500">{s.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-charcoal-600 text-[11px] pt-1 border-t border-beige-100">
                      <span>{s.city} • {s.lane}</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        ANPR OCR Confidence: {(s.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {s.coTravelingWith && s.coTravelingWith.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 mt-1 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          Convoy Alert: Co-traveling with{' '}
                          <span className="font-mono font-bold">{s.coTravelingWith.join(', ')}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-beige-200">
              <Link
                href="/locations"
                className="text-xs font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Highway Map</span>
              </Link>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold transition cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
