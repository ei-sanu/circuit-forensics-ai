'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Users,
  ArrowRight,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Flame,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { CasesSkeleton } from '@/components/ui/Skeleton';
import { MASTER_CASES, MASTER_ENTITIES, MASTER_ALERTS, CaseRecord } from '@/lib/data';
import { EvidenceViewerModal } from '@/components/evidence/EvidenceViewerModal';
import { downloadElementAsPdf } from '@/lib/pdfExport';

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>(MASTER_CASES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'under_review' | 'pending' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Modal states
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [evidenceModalCase, setEvidenceModalCase] = useState<CaseRecord | null>(null);
  const [reportViewMode, setReportViewMode] = useState<'official' | 'overview'>('official');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadCasePdf = async () => {
    if (selectedCase) {
      setIsExportingPdf(true);
      await downloadElementAsPdf('printable-case-document', `OFFICIAL_CASE_${selectedCase.caseNumber}.pdf`);
      setIsExportingPdf(false);
    }
  };
  const [newCase, setNewCase] = useState({
    caseNumber: '',
    title: '',
    description: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    status: 'active' as 'active' | 'under_review' | 'pending' | 'closed',
    leadInvestigator: 'Inspector Priya Nair',
    department: 'Cyber Crime & Financial Intelligence',
    region: 'Western & Northern Zones',
    tags: 'hawala, shell_company',
  });

  const loadCases = async () => {
    try {
      const data = await api.getCases().catch(() => null);
      if (data && Array.isArray(data) && data.length > 0) {
        // Merge backend cases with full master dataset (all 225+ cases preserved)
        const existingNumbers = new Set(data.map((d: any) => d.caseNumber));
        const backendMerged = data.map((d: any) => {
          const match = MASTER_CASES.find((m) => m.caseNumber === d.caseNumber);
          return match ? { ...match, ...d } : d;
        });
        const additionalFromMaster = MASTER_CASES.filter((m) => !existingNumbers.has(m.caseNumber));
        setCases([...backendMerged, ...additionalFromMaster]);
      } else {
        setCases(MASTER_CASES);
      }
    } catch (err) {
      console.error('Failed to load cases', err);
      setCases(MASTER_CASES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CaseRecord = {
      caseNumber: newCase.caseNumber || `CR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      title: newCase.title,
      category: 'Financial Intelligence & Network Crime',
      description: newCase.description,
      priority: newCase.priority,
      status: newCase.status,
      leadInvestigator: newCase.leadInvestigator,
      department: newCase.department,
      region: newCase.region,
      filedDate: new Date().toISOString().split('T')[0],
      totalVolume: 1200000,
      tags: newCase.tags.split(',').map((t) => t.trim()).filter(Boolean),
      entityIds: ['P-0001'],
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          title: 'Case File Registered',
          description: 'Official case file opened with preliminary forensic scope.',
          type: 'fir',
          severity: newCase.priority,
        },
      ],
      evidence: [],
    };

    try {
      await api.createCase(created).catch(() => null);
    } catch {}

    setCases((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewCase({
      caseNumber: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'active',
      leadInvestigator: 'Inspector Priya Nair',
      department: 'Cyber Crime & Financial Intelligence',
      region: 'Western & Northern Zones',
      tags: 'hawala, shell_company',
    });
    setSelectedCase(created);
  };

  const handleStatusChange = (caseNum: string, newStatus: 'active' | 'under_review' | 'closed' | 'pending') => {
    setCases((prev) =>
      prev.map((c) => (c.caseNumber === caseNum ? { ...c, status: newStatus } : c))
    );
    if (selectedCase && selectedCase.caseNumber === caseNum) {
      setSelectedCase((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    api.updateCase(caseNum, { status: newStatus }).catch(() => null);
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (regionFilter !== 'all' && !c.region?.toLowerCase().includes(regionFilter.toLowerCase())) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = c.caseNumber.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q) || false;
        const matchLead = c.leadInvestigator?.toLowerCase().includes(q) || false;
        const matchTag = c.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        return matchNumber || matchTitle || matchDesc || matchLead || matchTag;
      }
      return true;
    });
  }, [cases, statusFilter, priorityFilter, regionFilter, searchQuery]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, regionFilter, searchQuery]);

  return (
    <div className="space-y-6 text-charcoal-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-charcoal-800" />
            <span>Active Investigations & Case Files</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Manage case evidence, suspect links, statutory DNS sections, and forensic custody logs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold flex items-center gap-2 shadow-md shadow-charcoal-900/15 transition shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-beige-300" />
          <span>New Investigation File</span>
        </button>
      </div>

      {/* SIU Tactical Status Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100 tracking-wider">SPECIAL INVESTIGATION UNIT (SIU)</span>
          <span className="text-slate-400 hidden sm:inline">• EVIDENCE VAULT & DOCKET REPOSITORY</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>TOTAL CASES: <strong className="text-white font-bold">{cases.length}</strong></span>
          <span className="hidden sm:inline">CUSTODY LOG: <strong className="text-emerald-300 font-bold">SEC-63 BSA ADMISSIBLE</strong></span>
          <span className="hidden md:inline">FORENSIC NODES: <strong className="text-emerald-300 font-bold">SYNCED</strong></span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl glass-panel space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cases by number, title, lead officer, or keywords (e.g. Hawala, Bullion)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-beige-300 text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs font-semibold text-charcoal-700 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs font-semibold text-charcoal-700 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Zones & Corridors</option>
              <option value="Western">Western Zone (Mumbai / Gujarat)</option>
              <option value="Northern">Northern Zone (Delhi / NCR)</option>
              <option value="Southern">Southern Zone (Bengaluru / Hosur)</option>
              <option value="Eastern">Eastern Zone (Kolkata / Bihar)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-beige-200 text-xs">
          <span className="text-[11px] text-charcoal-500 font-semibold mr-1">Status:</span>
          {(['all', 'active', 'under_review', 'pending', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-charcoal-900 text-beige-100 shadow-sm'
                  : 'bg-white text-charcoal-600 hover:bg-beige-100 border border-beige-300'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
          <span className="text-[11px] text-charcoal-400 font-mono ml-auto">
            Showing {filteredCases.length} of {cases.length} cases
          </span>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <CasesSkeleton />
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Briefcase className="w-8 h-8 text-charcoal-400 mx-auto" />
          <h3 className="text-sm font-bold text-charcoal-800">No matching investigation files found</h3>
          <p className="text-xs text-charcoal-500">Adjust your search terms or clear active filters to display cases.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setRegionFilter('all');
            }}
            className="px-4 py-2 bg-charcoal-900 text-beige-100 rounded-full text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCases.map((c) => (
              <div
                key={c.caseNumber}
                onClick={() => setSelectedCase(c)}
                className="p-6 rounded-3xl glass-card hover:border-slate-400 hover:shadow-xl transition flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-charcoal-900 font-bold bg-white border border-beige-300 px-3 py-1 rounded-full shadow-sm">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                        c.priority === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : c.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-white text-charcoal-700 border border-beige-300'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-charcoal-950 text-base leading-snug group-hover:text-sky-700 transition">
                    {c.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                    {c.description || 'No operational summary provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-beige-300/80 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-charcoal-600">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Lead Officer</span>
                      <span className="font-medium truncate block">{c.leadInvestigator || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Volume Tracked</span>
                      <span className="font-mono font-bold text-emerald-700 block">₹{((c.totalVolume || 0) / 100000).toFixed(1)} Lakhs</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        c.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'under_review'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{c.entityIds?.length || 0} Suspects</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(c);
                      }}
                      className="flex-1 min-w-[85px] py-2 bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEvidenceModalCase(c);
                      }}
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      title="Inspect Proofs & Evidence"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Evidence ({c.evidence?.length || 4})</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus = c.status === 'closed' ? 'active' : 'closed';
                        handleStatusChange(c.caseNumber, nextStatus);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        c.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {c.status === 'closed' ? 'Reopen' : 'Close'}
                    </button>
                    <Link
                      href={`/reports?caseNumber=${c.caseNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Generate Case Report"
                      className="p-2 bg-white hover:bg-beige-100 border border-beige-300 rounded-xl text-charcoal-700 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl glass-panel text-xs font-mono shadow-md">
              <div className="text-charcoal-600">
                Showing <span className="font-bold text-charcoal-950">{(page - 1) * pageSize + 1}</span> to{' '}
                <span className="font-bold text-charcoal-950">{Math.min(page * pageSize, filteredCases.length)}</span> of{' '}
                <span className="font-bold text-charcoal-950">{filteredCases.length}</span> investigations
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-1.5 rounded-full border border-beige-300 text-xs font-bold text-charcoal-800 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="px-3 py-1 font-bold text-charcoal-950 bg-white rounded-full border border-beige-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-1.5 rounded-full border border-beige-300 text-xs font-bold text-charcoal-800 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE DETAIL DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-5 sm:p-7 border border-beige-300 shadow-2xl space-y-4 my-6 max-h-[92vh] flex flex-col">
            {/* Modal Top Bar (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-beige-200 pb-3 shrink-0 no-print">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-beige-100 rounded-full border border-beige-300 text-xs font-bold">
                  <button
                    onClick={() => setReportViewMode('official')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      reportViewMode === 'official'
                        ? 'bg-charcoal-950 text-white shadow-sm'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    Official Docket (I.I.F.-V)
                  </button>
                  <button
                    onClick={() => setReportViewMode('overview')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      reportViewMode === 'overview'
                        ? 'bg-charcoal-950 text-white shadow-sm'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    Interactive Intel
                  </button>
                </div>

                <span className="hidden sm:inline-block text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
                  {selectedCase.caseNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEvidenceModalCase(selectedCase)}
                  className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Inspect Evidence Proofs & Exhibits"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Evidence Vault ({selectedCase.evidence?.length || 0})</span>
                </button>
                <button
                  onClick={handleDownloadCasePdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-60"
                  title="Download Case Document as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-beige-300" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Case (PDF)'}</span>
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 rounded-full hover:bg-beige-200 text-charcoal-500 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {reportViewMode === 'official' ? (
                /* =================================================================== */
                /* AUTHENTIC OFFICIAL INVESTIGATION DOCKET (FORM I.I.F.-V)             */
                /* =================================================================== */
                <div
                  id="printable-case-document"
                  className="p-6 sm:p-10 bg-white border-2 border-charcoal-900 rounded-2xl shadow-inner text-charcoal-950 font-serif leading-relaxed relative select-text"
                >
                  {/* Official Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                    <p className="text-6xl sm:text-8xl font-black font-sans -rotate-45 uppercase text-charcoal-950 text-center tracking-widest leading-tight">
                      OFFICIAL CASE DIARY<br />CONFIDENTIAL
                    </p>
                  </div>

                  {/* Header */}
                  <div className="text-center border-b-2 border-charcoal-900 pb-4 space-y-1 relative">
                    {/* Ashoka Lion Capital Insignia */}
                    <div className="mx-auto w-12 h-12 mb-1 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-12 h-12 text-charcoal-900 fill-current">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M38 38 L62 62 M38 62 L62 38" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="4" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-charcoal-800 font-sans uppercase">
                      सत्यमेव जयते • GOVERNMENT OF INDIA
                    </p>
                    <h2 className="text-base sm:text-lg font-black tracking-wide font-serif uppercase">
                      केन्द्रीय अपराध अन्वेषण एवं विधि प्रवर्तन प्रभाग
                    </h2>
                    <h3 className="text-xs sm:text-sm font-bold tracking-wider font-sans text-charcoal-800 uppercase">
                      CENTRAL CRIME INVESTIGATION & FORENSICS DIRECTORATE
                    </h3>
                    <h4 className="text-xs sm:text-sm font-bold tracking-wider font-mono text-charcoal-900 uppercase">
                      INTEGRATED INVESTIGATION FORM - V (I.I.F.-V) / एकीकृत अन्वेषण प्रपत्र - ५
                    </h4>
                    <p className="text-sm sm:text-base font-black tracking-tight font-serif uppercase underline decoration-1 underline-offset-4 mt-1">
                      STATUTORY CASE DIARY & INVESTIGATION REPORT
                    </p>
                    <p className="text-[11px] text-charcoal-700 italic font-sans">
                      (Under Section 173(2) & Section 176 BNSS 2023 / Section 173 Cr.P.C.)
                    </p>
                  </div>

                  {/* Metadata Table */}
                  <div className="mt-4 border border-charcoal-900 divide-y divide-charcoal-900 text-xs font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 bg-neutral-50/70 p-0">
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Case Docket No.</span>
                        <span className="font-mono font-black text-charcoal-950 text-[11px]">{selectedCase.caseNumber}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Registration Date</span>
                        <span className="font-mono font-bold text-charcoal-950 text-[11px]">{selectedCase.filedDate}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Statutory Priority</span>
                        <span className="font-mono font-extrabold uppercase text-[11px] text-red-700">
                          {selectedCase.priority} PRIORITY
                        </span>
                      </div>
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Legal File Status</span>
                        <span className="font-mono font-extrabold uppercase text-[11px] text-emerald-800">
                          {selectedCase.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 p-0">
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Lead Investigating Officer</span>
                        <span className="font-bold text-charcoal-950 text-[11px]">{selectedCase.leadInvestigator}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Enforcement Wing</span>
                        <span className="font-bold text-charcoal-900 text-[11px]">{selectedCase.department}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[9px] font-bold uppercase text-charcoal-600 block">Jurisdiction Zone</span>
                        <span className="font-bold text-charcoal-900 text-[11px]">{selectedCase.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Scope of Investigation */}
                  <div className="mt-4 space-y-1.5 font-sans text-xs">
                    <span className="text-[10px] font-mono font-black uppercase text-charcoal-900 block border-b border-charcoal-900 pb-0.5">
                      1.0 STATEMENT OF PREDICATE OFFENCE & INVESTIGATION SCOPE
                    </span>
                    <div className="p-3 bg-neutral-50/70 border border-charcoal-300 rounded text-charcoal-900 text-justify leading-relaxed">
                      <p className="font-bold mb-1">{selectedCase.title}</p>
                      <p>{selectedCase.description}</p>
                    </div>
                  </div>

                  {/* Section 2: Syndicate Accused Targets */}
                  {selectedCase.entityIds && (
                    <div className="mt-4 space-y-1.5 font-sans text-xs">
                      <span className="text-[10px] font-mono font-black uppercase text-charcoal-900 block border-b border-charcoal-900 pb-0.5">
                        2.0 CHARGE-SHEETED PRIMARY TARGETS & SYNDICATE MEMBERS ({selectedCase.entityIds.length})
                      </span>
                      <div className="border border-charcoal-300 rounded overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-neutral-100 font-mono text-[9px] font-bold uppercase text-charcoal-700">
                            <tr>
                              <th className="p-1.5 border-r border-charcoal-300">Target ID</th>
                              <th className="p-1.5 border-r border-charcoal-300">Full Legal Name</th>
                              <th className="p-1.5 border-r border-charcoal-300">Syndicate Function</th>
                              <th className="p-1.5">Statutory Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-charcoal-200">
                            {selectedCase.entityIds.map((id) => {
                              const ent = MASTER_ENTITIES.find((e) => e.entityId === id);
                              return (
                                <tr key={id}>
                                  <td className="p-1.5 font-mono font-bold border-r border-charcoal-200">{id}</td>
                                  <td className="p-1.5 font-bold border-r border-charcoal-200">{ent?.label || id}</td>
                                  <td className="p-1.5 text-charcoal-700 border-r border-charcoal-200">
                                    {ent?.properties?.designation || ent?.type || 'Conduit / Co-conspirator'}
                                  </td>
                                  <td className="p-1.5 font-mono font-bold text-red-700">
                                    {ent?.riskFlag ? 'FLAGGED HIGH RISK' : 'UNDER MONITORING'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Timeline & Operational Log */}
                  {selectedCase.timeline && selectedCase.timeline.length > 0 && (
                    <div className="mt-4 space-y-1.5 font-sans text-xs">
                      <span className="text-[10px] font-mono font-black uppercase text-charcoal-900 block border-b border-charcoal-900 pb-0.5">
                        3.0 CHRONOLOGICAL INVESTIGATION DIARY & ACTIONS TAKEN
                      </span>
                      <div className="border border-charcoal-300 rounded overflow-hidden divide-y divide-charcoal-200">
                        {selectedCase.timeline.map((item, idx) => (
                          <div key={idx} className="p-2.5 flex items-start justify-between gap-3 text-[11px] bg-white">
                            <div className="space-y-0.5">
                              <p className="font-bold text-charcoal-950">{item.title}</p>
                              <p className="text-charcoal-700">{item.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono text-[10px] text-charcoal-500 block">{item.date}</span>
                              <span className="font-mono text-[9px] uppercase font-bold text-red-700">
                                {item.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Physical & Digital Evidence Custody */}
                  {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                    <div className="mt-4 space-y-1.5 font-sans text-xs">
                      <span className="text-[10px] font-mono font-black uppercase text-charcoal-900 block border-b border-charcoal-900 pb-0.5">
                        4.0 SEIZED PROPERTY & FORENSIC CHAIN OF CUSTODY ({selectedCase.evidence.length})
                      </span>
                      <div className="border border-charcoal-300 rounded overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-neutral-100 font-mono text-[9px] font-bold uppercase text-charcoal-700">
                            <tr>
                              <th className="p-1.5 border-r border-charcoal-300">Evidence Title</th>
                              <th className="p-1.5 border-r border-charcoal-300">Cryptographic SHA-256 Hash</th>
                              <th className="p-1.5">Custody Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-charcoal-200">
                            {selectedCase.evidence.map((ev) => (
                              <tr key={ev.id}>
                                <td className="p-1.5 font-medium border-r border-charcoal-200">{ev.title}</td>
                                <td className="p-1.5 font-mono text-[10px] text-charcoal-600 border-r border-charcoal-200">{ev.hash}</td>
                                <td className="p-1.5 font-mono font-bold text-emerald-800 uppercase text-[10px]">{ev.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Official Endorsements, Seals & Signature Block */}
                  <div className="mt-6 pt-4 border-t-2 border-charcoal-900 font-sans text-xs">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center space-y-1">
                        <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                          <span className="font-serif italic font-bold text-sm text-charcoal-900">
                            {selectedCase.leadInvestigator}
                          </span>
                        </div>
                        <p className="font-mono font-bold text-[9px] text-charcoal-950 uppercase">
                          Investigating Officer (IO)
                        </p>
                        <p className="text-[8px] font-mono text-charcoal-500">
                          Badge #{selectedCase.caseNumber.replace('CR-', 'IO-')}
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="w-22 h-22 rounded-full border-2 border-dashed border-blue-700 text-blue-800 flex flex-col items-center justify-center p-1 text-center rotate-[-5deg] shadow-sm bg-blue-50/40">
                          <span className="text-[7px] font-black uppercase tracking-tight">★ STATE POLICE ★</span>
                          <span className="text-[8px] font-extrabold uppercase leading-tight">{selectedCase.department.slice(0, 16)}</span>
                          <span className="text-[7px] font-mono font-bold">OFFICIAL SEAL</span>
                          <span className="text-[7px] font-bold uppercase">CRIME BRANCH</span>
                        </div>
                        <span className="text-[8px] font-mono text-charcoal-400 mt-1">Official Case Stamp</span>
                      </div>

                      <div className="text-center space-y-1">
                        <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                          <span className="font-serif italic font-bold text-sm text-charcoal-900">
                            Superintendent of Police
                          </span>
                        </div>
                        <p className="font-mono font-bold text-[9px] text-charcoal-950 uppercase">
                          Supervising Authority
                        </p>
                        <p className="text-[8px] font-mono text-charcoal-500">Special Crime Wing</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-charcoal-300 flex flex-col sm:flex-row items-center justify-between text-[9px] text-charcoal-500 font-mono">
                      <span>Dispatch to JMFC Court: Judicial Magistrate First Class</span>
                      <span>Certified Under Sec 63 BSA 2023</span>
                      <span>Record Hash: #{selectedCase.caseNumber}-AUTHENTICATED</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* =================================================================== */
                /* INTERACTIVE INTEL OVERVIEW MODE                                     */
                /* =================================================================== */
                <div className="space-y-4">
                  {/* Case Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-beige-100/70 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Lead Officer</span>
                      <span className="font-bold text-charcoal-900 block mt-0.5">{selectedCase.leadInvestigator}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Total Volume</span>
                      <span className="font-mono font-bold text-emerald-700 block mt-0.5">
                        ₹{((selectedCase.totalVolume || 0) / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Filed Date</span>
                      <span className="font-mono text-charcoal-800 block mt-0.5">{selectedCase.filedDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-charcoal-400 font-semibold block">Status</span>
                      <select
                        value={selectedCase.status}
                        onChange={(e) => handleStatusChange(selectedCase.caseNumber, e.target.value as any)}
                        className="mt-0.5 bg-white border border-beige-300 rounded-lg text-xs font-bold text-charcoal-900 px-2 py-0.5 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="under_review">Under Review</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Scope Summary */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-charcoal-900 uppercase font-mono text-[11px]">Investigative Scope:</span>
                    <p className="text-charcoal-700 leading-relaxed bg-white p-3 rounded-2xl border border-beige-200">
                      {selectedCase.description}
                    </p>
                  </div>

                  {/* Case Timeline Reconstruction */}
                  {selectedCase.timeline && selectedCase.timeline.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-charcoal-900 uppercase font-mono text-[11px]">Operational Timeline:</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedCase.timeline.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white border border-beige-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-charcoal-950 text-xs">{item.title}</span>
                              <span className="text-[10px] font-mono text-charcoal-400">{item.date}</span>
                            </div>
                            <p className="text-charcoal-600 text-[11px] leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Entities */}
                  {selectedCase.entityIds && (
                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-charcoal-900 uppercase font-mono text-[11px]">
                        Linked Entities & Suspects ({selectedCase.entityIds.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase.entityIds.map((id) => {
                          const ent = MASTER_ENTITIES.find((e) => e.entityId === id);
                          return (
                            <Link
                              key={id}
                              href={`/entities?q=${encodeURIComponent(ent?.label || id)}`}
                              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-charcoal-900 text-xs font-medium transition flex items-center gap-1.5"
                            >
                              <Users className="w-3 h-3 text-charcoal-500" />
                              <span>{ent?.label || id}</span>
                              <ExternalLink className="w-3 h-3 text-charcoal-400" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions (Bottom) */}
            <div className="pt-3 border-t border-beige-200 flex flex-wrap items-center justify-between gap-2 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <Link
                  href={`/reports?caseNumber=${selectedCase.caseNumber}`}
                  className="px-4 py-2 bg-charcoal-900 text-beige-100 rounded-full text-xs font-bold hover:bg-charcoal-800 transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Generate Official Report</span>
                </Link>
                <Link
                  href="/locations"
                  className="px-4 py-2 bg-white text-charcoal-800 border border-beige-300 rounded-full text-xs font-semibold hover:bg-beige-100 transition flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geo Intel Map</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = selectedCase.status === 'closed' ? 'active' : 'closed';
                    handleStatusChange(selectedCase.caseNumber, next);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
                    selectedCase.status === 'closed'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                      : 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                  }`}
                >
                  {selectedCase.status === 'closed' ? 'Reopen Investigation' : 'Close Investigation File'}
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-full border border-beige-300 text-charcoal-700 text-xs font-semibold hover:bg-beige-100 transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* CREATE CASE MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <h3 className="text-base font-bold text-charcoal-950">Create New Investigation File</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-charcoal-400 hover:text-charcoal-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Case Number (Unique Identification)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CR-2026-00999"
                  value={newCase.caseNumber}
                  onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                  className="w-full p-3 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Investigation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Goldcrest Hawala Channel"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="w-full p-3 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Investigative Scope & Summary</label>
                <textarea
                  rows={3}
                  placeholder="Brief operational summary, statutory sections (DNS 318, 61, 338), and suspects..."
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="w-full p-3 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-700 mb-1 font-medium">Priority</label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as any })}
                    className="w-full p-3 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-charcoal-700 mb-1 font-medium">Status</label>
                  <select
                    value={newCase.status}
                    onChange={(e) => setNewCase({ ...newCase, status: e.target.value as any })}
                    className="w-full p-3 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                  >
                    <option value="active">Active</option>
                    <option value="under_review">Under Review</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white text-charcoal-700 hover:bg-beige-100 border border-beige-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold shadow-md shadow-charcoal-900/15 transition cursor-pointer"
                >
                  Create Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVIDENCE & FORENSIC PROOFS MODAL                                          */}
      {/* ========================================================================= */}
      <EvidenceViewerModal
        isOpen={!!evidenceModalCase}
        onClose={() => setEvidenceModalCase(null)}
        identifier={evidenceModalCase?.caseNumber || ''}
        title={evidenceModalCase?.title || ''}
        evidenceList={evidenceModalCase?.evidence || []}
      />
    </div>
  );
}
