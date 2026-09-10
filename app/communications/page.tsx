'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Phone,
  Search,
  Filter,
  ShieldAlert,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  X,
  Volume2,
  FileText,
  Flame,
  BarChart3,
  Download,
  Activity,
  Play,
  Share2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { MASTER_COMMUNICATIONS, CommunicationRecord } from '@/lib/data';

// 24-hour CDR distribution data (0 to 23 hours)
const HOURLY_DISTRIBUTION = [
  { hour: '00:00', calls: 3, isOddHour: true },
  { hour: '01:00', calls: 5, isOddHour: true },
  { hour: '02:00', calls: 9, isOddHour: true },
  { hour: '03:00', calls: 8, isOddHour: true },
  { hour: '04:00', calls: 7, isOddHour: true },
  { hour: '05:00', calls: 4, isOddHour: true },
  { hour: '06:00', calls: 1, isOddHour: false },
  { hour: '07:00', calls: 2, isOddHour: false },
  { hour: '08:00', calls: 3, isOddHour: false },
  { hour: '09:00', calls: 6, isOddHour: false },
  { hour: '10:00', calls: 8, isOddHour: false },
  { hour: '11:00', calls: 12, isOddHour: false },
  { hour: '12:00', calls: 9, isOddHour: false },
  { hour: '13:00', calls: 5, isOddHour: false },
  { hour: '14:00', calls: 7, isOddHour: false },
  { hour: '15:00', calls: 8, isOddHour: false },
  { hour: '16:00', calls: 11, isOddHour: false },
  { hour: '17:00', calls: 10, isOddHour: false },
  { hour: '18:00', calls: 14, isOddHour: false },
  { hour: '19:00', calls: 12, isOddHour: false },
  { hour: '20:00', calls: 9, isOddHour: false },
  { hour: '21:00', calls: 7, isOddHour: false },
  { hour: '22:00', calls: 6, isOddHour: false },
  { hour: '23:00', calls: 5, isOddHour: true },
];

export default function CommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [oddHourOnly, setOddHourOnly] = useState(false);
  const [showHourlyChart, setShowHourlyChart] = useState(true);
  const [selectedComm, setSelectedComm] = useState<CommunicationRecord | null>(null);

  const filtered = useMemo(() => {
    return MASTER_COMMUNICATIONS.filter((c) => {
      if (caseFilter !== 'all' && c.caseId !== caseFilter) return false;
      if (typeFilter !== 'all' && c.commType !== typeFilter) return false;
      if (oddHourOnly && !c.isOddHour) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          c.commId.toLowerCase().includes(q) ||
          c.callerName.toLowerCase().includes(q) ||
          c.callerPhone.includes(q) ||
          c.recipientName.toLowerCase().includes(q) ||
          c.recipientPhone.includes(q) ||
          c.cellTowerId.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.transcriptSnippet && c.transcriptSnippet.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [searchQuery, caseFilter, typeFilter, oddHourOnly]);

  const totalDurationMin = useMemo(() => {
    return Math.round(filtered.reduce((acc, curr) => acc + curr.durationSec, 0) / 60);
  }, [filtered]);

  const exportCSV = () => {
    const headers = [
      'CDR ID',
      'Caller Name',
      'Caller Phone',
      'Caller ID',
      'Recipient Name',
      'Recipient Phone',
      'Duration (sec)',
      'Channel',
      'Tower Sector',
      'City',
      'Odd Hour (00-05 AM)',
      'Case ID',
      'Risk Level',
      'Transcript Snippet',
    ];

    const rows = filtered.map((c) => [
      `"${c.commId}"`,
      `"${c.callerName.replace(/"/g, '""')}"`,
      `"${c.callerPhone}"`,
      `"${c.callerId}"`,
      `"${c.recipientName.replace(/"/g, '""')}"`,
      `"${c.recipientPhone}"`,
      c.durationSec,
      `"${c.commType}"`,
      `"${c.cellTowerId}"`,
      `"${c.city}"`,
      c.isOddHour ? 'YES' : 'NO',
      `"${c.caseId}"`,
      `"${c.riskLevel}"`,
      `"${(c.transcriptSnippet || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `circuit_cdr_intelligence_${Date.now()}.csv`);
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
            <Phone className="w-5 h-5 text-charcoal-800" />
            <span>Communications Intelligence & CDR Intercepts</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Real-time Call Detail Records (CDR), encrypted VoIP packet intercepts, cell tower triangulations, and odd-hour burner call forensics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowHourlyChart(!showHourlyChart)}
            className={`px-3.5 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showHourlyChart
                ? 'bg-charcoal-900 text-beige-100 border-charcoal-900'
                : 'bg-white text-charcoal-800 border-beige-300 hover:bg-beige-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{showHourlyChart ? 'Hide 24h Distribution' : 'Show 24h Distribution'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export CDR CSV</span>
          </button>
          <Link
            href="/locations"
            className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-beige-300" />
            <span>Map Towers</span>
          </Link>
        </div>
      </div>

      {/* SIGINT Telecom Intercept Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-indigo-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="font-bold text-indigo-300 tracking-wider">SIGINT TELECOM INTELLIGENCE GRID</span>
          <span className="text-slate-400 hidden sm:inline">• 24/7 CALL DETAIL RECORD (CDR) & BTS RADAR</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>INTERCEPTED CALLS: <strong className="text-white font-bold">{filtered.length}</strong></span>
          <span className="hidden sm:inline">LEGAL INTERCEPT: <strong className="text-indigo-300 font-bold">SEC 5(2) TELEGRAPH ACT</strong></span>
          <span className="hidden md:inline">BURNER DETECTOR: <strong className="text-emerald-300 font-bold">ONLINE</strong></span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Total Intercepts</p>
            <p className="text-base font-extrabold text-charcoal-950">{filtered.length} Logs Mapped</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Odd-Hour Surges (12 - 05 AM)</p>
            <p className="text-base font-extrabold text-red-700">
              {filtered.filter((c) => c.isOddHour).length} Critical
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Total Duration</p>
            <p className="text-base font-extrabold text-charcoal-950">{totalDurationMin} Minutes</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Cell Tower Sectors</p>
            <p className="text-base font-extrabold text-blue-800">
              {new Set(filtered.map((c) => c.cellTowerId)).size} Triangulated
            </p>
          </div>
        </div>
      </div>

      {/* 24-Hour Time of Day Distribution Chart */}
      {showHourlyChart && (
        <div className="p-5 rounded-3xl glass-panel shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-charcoal-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                24-Hour Time-of-Day Traffic Distribution (Highlighting 00:00 - 05:00 Red Zone)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 font-bold text-red-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span>Odd-Hour Burner Window</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-charcoal-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-charcoal-800" />
                <span>Normal Daytime</span>
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd3" vertical={false} />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-charcoal-950 text-beige-100 rounded-xl shadow-lg border border-charcoal-800 text-xs">
                          <p className="font-bold text-beige-300 font-mono">{label}</p>
                          <p className="font-semibold">
                            Volume: <span className="font-mono font-bold text-white">{payload[0].value} calls</span>
                          </p>
                          {item.isOddHour && (
                            <p className="text-red-400 font-bold text-[10px] uppercase mt-0.5">⚠️ Odd-Hour Burner Window</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                  {HOURLY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isOddHour ? '#ef4444' : '#2c3e50'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl glass-panel space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone number, tower ID, suspect, snippet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-semibold">
            {/* Case Filter */}
            <select
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Cases</option>
              <option value="CR-2026-00124">CR-2026-00124 (Operation Nightfall)</option>
              <option value="CR-2026-00842">CR-2026-00842 (Operation Goldcrest)</option>
              <option value="CR-2026-00315">CR-2026-00315 (Operation Red Sand)</option>
              <option value="CR-2026-00489">CR-2026-00489 (Project Phantom)</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Comm Channels</option>
              <option value="call">Voice Call (Cell)</option>
              <option value="encrypted_voip">Encrypted VoIP</option>
              <option value="satellite_vhf">Satellite / VHF</option>
            </select>

            {/* Odd Hour Toggle */}
            <button
              onClick={() => setOddHourOnly(!oddHourOnly)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                oddHourOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-beige-300 text-charcoal-700 hover:text-charcoal-950'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Odd-Hour Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Communications Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-beige-300/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-beige-200 bg-white/70 text-[10px] font-mono uppercase font-bold text-charcoal-600">
                <th className="p-4">CDR ID & Time</th>
                <th className="p-4">Caller (A-Party)</th>
                <th className="p-4">Recipient (B-Party)</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Tower Sector / City</th>
                <th className="p-4">Risk Severity</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200/70">
              {filtered.map((comm) => (
                <tr
                  key={comm.id}
                  onClick={() => setSelectedComm(comm)}
                  className="hover:bg-white/90 transition cursor-pointer group"
                >
                  <td className="p-4">
                    <p className="font-mono font-bold text-charcoal-950">{comm.commId}</p>
                    <p className="text-[10px] font-mono text-charcoal-500">{comm.timestamp}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-charcoal-950">{comm.callerName}</p>
                    <p className="text-[10px] font-mono text-blue-700 font-semibold">{comm.callerPhone}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-charcoal-950">{comm.recipientName}</p>
                    <p className="text-[10px] font-mono text-charcoal-600">{comm.recipientPhone}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-charcoal-900">
                      {Math.floor(comm.durationSec / 60)}m {comm.durationSec % 60}s
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold bg-white border border-beige-300 text-charcoal-800 shadow-sm">
                      {comm.commType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-charcoal-900">{comm.cellTowerId}</p>
                    <p className="text-[10px] text-charcoal-500">{comm.towerLocation}, {comm.city}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                        comm.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {comm.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComm(comm);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-[11px] font-bold transition shadow-sm cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Detail Slide-Over Modal */}
      {selectedComm && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-charcoal-500">
                  Intercept Telemetry & Speech-to-Text
                </span>
                <h3 className="text-base font-extrabold text-charcoal-950">{selectedComm.commId}</h3>
              </div>
              <button
                onClick={() => setSelectedComm(null)}
                className="w-7 h-7 rounded-full bg-beige-100 hover:bg-beige-200 text-charcoal-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal-900 text-beige-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-beige-300">Call Type / Protocol:</span>
                <span className="font-mono font-extrabold uppercase text-beige-100 text-sm">
                  {selectedComm.commType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-beige-300/10 pt-2">
                <span className="text-beige-300">Timestamp:</span>
                <span className="font-mono text-white">{selectedComm.timestamp}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-beige-300">Duration:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {Math.floor(selectedComm.durationSec / 60)}m {selectedComm.durationSec % 60}s ({selectedComm.durationSec}s)
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-beige-300 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-500">Caller (A-Party):</span>
                  <Link
                    href={`/entities`}
                    className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedComm.callerName} ({selectedComm.callerPhone})</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-400" />
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-500">Recipient (B-Party):</span>
                  <Link
                    href={`/entities`}
                    className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedComm.recipientName} ({selectedComm.recipientPhone})</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-400" />
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Cell Tower Sector:</span>
                  <span className="font-bold text-charcoal-950 font-mono">
                    {selectedComm.cellTowerId} ({selectedComm.towerLocation})
                  </span>
                </div>
                {selectedComm.imei && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Hardware IMEI:</span>
                    <span className="font-bold text-charcoal-900 font-mono">{selectedComm.imei}</span>
                  </div>
                )}
              </div>

              {/* Speech-to-text Intercept Snippet */}
              {selectedComm.transcriptSnippet && (
                <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-red-700 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Intercept Transcript Snippet</span>
                    </span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">FSL Match 96.4%</span>
                  </div>
                  <p className="text-xs text-charcoal-900 italic bg-white/70 p-3 rounded-xl border border-red-100 font-serif leading-relaxed">
                    &ldquo;{selectedComm.transcriptSnippet}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href={`/locations`}
                className="text-xs font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Map</span>
              </Link>
              <button
                onClick={() => setSelectedComm(null)}
                className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold transition cursor-pointer"
              >
                Close Intercept File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
