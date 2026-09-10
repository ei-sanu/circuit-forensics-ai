'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  CreditCard,
  Building,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  User,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MASTER_TRANSACTIONS, TransactionRecord } from '@/lib/data';

// Aggregated daily/monthly trend data for financial volume chart
const VOLUME_TREND_DATA = [
  { date: 'Aug 10', totalAmount: 450000, flaggedAmount: 450000, txCount: 1 },
  { date: 'Aug 15', totalAmount: 1570000, flaggedAmount: 1570000, txCount: 2 },
  { date: 'Aug 18', totalAmount: 1600000, flaggedAmount: 1600000, txCount: 2 },
  { date: 'Aug 20', totalAmount: 18500000, flaggedAmount: 18500000, txCount: 2 },
  { date: 'Aug 24', totalAmount: 9500000, flaggedAmount: 9500000, txCount: 1 },
  { date: 'Sep 04', totalAmount: 19800000, flaggedAmount: 18400000, txCount: 4 },
  { date: 'Sep 06', totalAmount: 13250000, flaggedAmount: 13250000, txCount: 2 },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [patternFilter, setPatternFilter] = useState('all');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [showChart, setShowChart] = useState(true);

  // Filter Transactions
  const filtered = useMemo(() => {
    return MASTER_TRANSACTIONS.filter((tx) => {
      if (caseFilter !== 'all' && tx.caseId !== caseFilter) return false;
      if (channelFilter !== 'all' && tx.channel !== channelFilter) return false;
      if (riskFilter !== 'all' && tx.riskLevel !== riskFilter) return false;
      if (patternFilter !== 'all' && tx.patternType !== patternFilter) return false;
      if (minAmount > 0 && tx.amount < minAmount) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          tx.transactionId.toLowerCase().includes(q) ||
          tx.fromName.toLowerCase().includes(q) ||
          tx.toName.toLowerCase().includes(q) ||
          tx.caseName.toLowerCase().includes(q) ||
          String(tx.amount).includes(q) ||
          (tx.details.txRef && tx.details.txRef.toLowerCase().includes(q)) ||
          (tx.details.tokenCode && tx.details.tokenCode.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [searchQuery, caseFilter, channelFilter, riskFilter, patternFilter, minAmount]);

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, caseFilter, channelFilter, riskFilter, patternFilter, minAmount]);

  const totalVolume = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filtered]);

  const flaggedVolume = useMemo(() => {
    return filtered.filter((t) => t.isFlagged).reduce((acc, curr) => acc + curr.amount, 0);
  }, [filtered]);

  const exportCSV = () => {
    const headers = [
      'Transaction ID',
      'Sender Name',
      'Sender ID',
      'Recipient Name',
      'Recipient ID',
      'Amount (INR)',
      'Channel',
      'Case ID',
      'Risk Level',
      'Pattern',
      'Timestamp',
      'Anomaly Flag Reason',
    ];

    const rows = filtered.map((tx) => [
      `"${tx.transactionId}"`,
      `"${tx.fromName.replace(/"/g, '""')}"`,
      `"${tx.fromId}"`,
      `"${tx.toName.replace(/"/g, '""')}"`,
      `"${tx.toId}"`,
      tx.amount,
      `"${tx.channel}"`,
      `"${tx.caseId}"`,
      `"${tx.riskLevel}"`,
      `"${tx.patternType || 'standard'}"`,
      `"${tx.timestamp}"`,
      `"${(tx.details?.flagReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `circuit_transactions_ledger_${Date.now()}.csv`);
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
            <Landmark className="w-5 h-5 text-charcoal-800" />
            <span>Financial Intelligence & Illicit Flow Ledger</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Forensic tracking of Hawala token drops, circular shell layering, rapid RTGS pass-throughs, and crypto OTC cash outs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowChart(!showChart)}
            className={`px-3.5 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showChart
                ? 'bg-charcoal-900 text-beige-100 border-charcoal-900'
                : 'bg-white text-charcoal-800 border-beige-300 hover:bg-beige-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{showChart ? 'Hide Trend Chart' : 'Show Trend Chart'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FIU-IND Financial Intelligence Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-emerald-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-300 tracking-wider">FIU-IND FINANCIAL INTELLIGENCE UNIT</span>
          <span className="text-slate-400 hidden sm:inline">• AML / CFT SUSPICIOUS TRANSACTION MONITOR</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>RECORDED FLOWS: <strong className="text-white font-bold">{filtered.length}</strong></span>
          <span className="hidden sm:inline">REGULATORY AUDIT: <strong className="text-emerald-300 font-bold">PMLA 2002 / RBI COMPLIANT</strong></span>
          <span className="hidden md:inline">HAWALA DETECTOR: <strong className="text-emerald-300 font-bold">ACTIVE</strong></span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Total Mapped Volume</p>
            <p className="text-base font-extrabold text-charcoal-950">₹{(totalVolume / 100000).toFixed(1)} Lakhs</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Flagged Illicit Flow</p>
            <p className="text-base font-extrabold text-red-700">₹{(flaggedVolume / 100000).toFixed(1)} Lakhs</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Transactions Filtered</p>
            <p className="text-base font-extrabold text-charcoal-950">{filtered.length} Recorded</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-charcoal-500 uppercase font-bold">Critical Risk Events</p>
            <p className="text-base font-extrabold text-amber-800">
              {filtered.filter((t) => t.riskLevel === 'critical').length} Urgent
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Volume Timeline Chart */}
      {showChart && (
        <div className="p-5 rounded-3xl glass-panel shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-charcoal-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Transaction Volume & Anomaly Timeline
              </h3>
            </div>
            <span className="text-[10px] font-mono text-charcoal-500">Timeline view across tracked syndicates</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VOLUME_TREND_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c3e50" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2c3e50" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0dcd3" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload[0]?.value as number;
                      const flagged = payload[1]?.value as number;
                      return (
                        <div className="p-3 bg-charcoal-950 text-beige-100 rounded-2xl shadow-xl border border-charcoal-800 text-xs space-y-1">
                          <p className="font-bold text-beige-300 font-mono">{label}</p>
                          <p className="text-beige-200">
                            Total Volume:{' '}
                            <span className="font-bold font-mono">₹{Number(total).toLocaleString('en-IN')}</span>
                          </p>
                          <p className="text-red-400">
                            Flagged Illicit:{' '}
                            <span className="font-bold font-mono">₹{Number(flagged).toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="totalAmount" stroke="#2c3e50" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="flaggedAmount" stroke="#e74c3c" strokeWidth={2} fillOpacity={1} fill="url(#colorFlagged)" />
              </AreaChart>
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
              placeholder="Search by ID, suspect name, bank code, token..."
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

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="hawala">Hawala Token</option>
              <option value="rtgs">Rapid RTGS</option>
              <option value="crypto_otc">Crypto OTC</option>
              <option value="atm_cluster">ATM Cluster</option>
              <option value="upi_gateway">UPI Gateway</option>
            </select>

            {/* Pattern Filter */}
            <select
              value={patternFilter}
              onChange={(e) => setPatternFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Patterns</option>
              <option value="circular_flow">Circular Flow</option>
              <option value="pass_through">Pass-Through Mule</option>
              <option value="rapid_chain">Rapid Turnaround</option>
              <option value="smurfing">Smurfing Fan-Out</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white border border-beige-300 text-charcoal-900 text-xs font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-beige-300/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-beige-200 bg-white/70 text-[10px] font-mono uppercase font-bold text-charcoal-600">
                <th className="p-4">Tx ID & Timestamp</th>
                <th className="p-4">Sender (From)</th>
                <th className="p-4">Recipient (To)</th>
                <th className="p-4">Amount (₹)</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Pattern Classification</th>
                <th className="p-4">Associated Case</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200/70">
              {paginatedTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-white/90 transition cursor-pointer group"
                >
                  <td className="p-4">
                    <p className="font-mono font-bold text-charcoal-950">{tx.transactionId}</p>
                    <p className="text-[10px] font-mono text-charcoal-500">{tx.timestamp}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-charcoal-950">{tx.fromName}</span>
                      <span className="text-[10px] font-mono text-charcoal-400">({tx.fromId})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-charcoal-950">{tx.toName}</span>
                      <span className="text-[10px] font-mono text-charcoal-400">({tx.toId})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold bg-white border border-beige-300 text-charcoal-800 shadow-sm">
                      {tx.channel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    {tx.patternType ? (
                      <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-md bg-beige-200 text-charcoal-800 font-semibold">
                        {tx.patternType.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-charcoal-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-charcoal-900">{tx.caseName}</p>
                    <p className="text-[10px] font-mono text-charcoal-500">{tx.caseId}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                        tx.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : tx.riskLevel === 'high'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {tx.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-[11px] font-bold transition shadow-sm cursor-pointer"
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-beige-200 bg-white/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-charcoal-600 font-medium">
            Showing <span className="font-bold text-charcoal-950 font-mono">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-charcoal-950 font-mono">{Math.min(page * pageSize, filtered.length)}</span> of{' '}
            <span className="font-bold text-charcoal-950 font-mono">{filtered.length}</span> transactions
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 text-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-charcoal-900 text-beige-100 font-bold">{page}</span>
              <span className="text-charcoal-400">/</span>
              <span className="px-2 py-1 text-charcoal-700">{totalPages}</span>
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 text-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Slide-Over Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-charcoal-500">
                  Forensic Banking & Hawala Audit Trail
                </span>
                <h3 className="text-base font-extrabold text-charcoal-950">{selectedTx.transactionId}</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-beige-100 hover:bg-beige-200 text-charcoal-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal-900 text-beige-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-beige-300">Transaction Amount:</span>
                <span className="font-mono font-extrabold text-emerald-300 text-lg">
                  ₹{selectedTx.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-beige-300/10 pt-2">
                <span className="text-beige-300">Transfer Channel:</span>
                <span className="font-bold uppercase text-white font-mono">{selectedTx.channel.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-beige-300">Timestamp:</span>
                <span className="font-mono text-beige-200">{selectedTx.timestamp}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-beige-300 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-500">Sender:</span>
                  <Link
                    href={`/entities`}
                    className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedTx.fromName} ({selectedTx.fromId})</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-400" />
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-500">Recipient:</span>
                  <Link
                    href={`/entities`}
                    className="font-bold text-charcoal-950 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedTx.toName} ({selectedTx.toId})</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-400" />
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Associated Case:</span>
                  <span className="font-bold text-charcoal-950">{selectedTx.caseName} ({selectedTx.caseId})</span>
                </div>
                {selectedTx.patternType && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Pattern Detected:</span>
                    <span className="font-bold font-mono text-red-700 capitalize">
                      {selectedTx.patternType.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Banking & Protocol Identifiers */}
              {selectedTx.details && (
                <div className="p-3 rounded-2xl bg-white border border-beige-300 text-xs space-y-1 font-mono">
                  <p className="text-[10px] text-charcoal-500 uppercase font-bold mb-1">Protocol Telemetry</p>
                  {selectedTx.details.txRef && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Tx Reference:</span>
                      <span className="font-bold text-charcoal-900">{selectedTx.details.txRef}</span>
                    </div>
                  )}
                  {selectedTx.details.tokenCode && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Token Passcode:</span>
                      <span className="font-bold text-amber-700">{selectedTx.details.tokenCode}</span>
                    </div>
                  )}
                  {selectedTx.details.bankCode && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">IFSC / Node Code:</span>
                      <span className="font-bold text-charcoal-900">{selectedTx.details.bankCode}</span>
                    </div>
                  )}
                  {selectedTx.details.walletAddress && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Wallet Hex:</span>
                      <span className="font-bold text-charcoal-900">{selectedTx.details.walletAddress}</span>
                    </div>
                  )}
                  {selectedTx.details.atmClusterId && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">ATM Cluster ID:</span>
                      <span className="font-bold text-charcoal-900">{selectedTx.details.atmClusterId}</span>
                    </div>
                  )}
                  {selectedTx.details.location && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Physical Location:</span>
                      <span className="font-bold text-charcoal-900">{selectedTx.details.location}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedTx.details?.flagReason && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
                  <p className="text-[10px] font-mono uppercase font-bold text-red-700">Intelligence Anomaly Trigger</p>
                  <p className="text-xs text-red-900 leading-relaxed font-medium">{selectedTx.details.flagReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href={`/alerts`}
                className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>View Linked ML Alerts</span>
              </Link>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold transition cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
