'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  ShieldAlert,
  Building,
  Calendar,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  X,
  Download,
  Filter,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileDown,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FirTrackSkeleton } from '@/components/ui/Skeleton';
import { MASTER_FIRS, FirRecord } from '@/lib/data';
import { EvidenceViewerModal } from '@/components/evidence/EvidenceViewerModal';
import { downloadElementAsPdf } from '@/lib/pdfExport';

const DEFAULT_FIRS: FirRecord[] = MASTER_FIRS;

export default function FirTrackPage() {
  const [firs, setFirs] = useState<FirRecord[]>(DEFAULT_FIRS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFir, setSelectedFir] = useState<FirRecord | null>(DEFAULT_FIRS[0] || null);
  const [showCopyModal, setShowCopyModal] = useState<FirRecord | null>(null);
  const [evidenceModalFir, setEvidenceModalFir] = useState<FirRecord | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const loadFirs = async () => {
    try {
      const data = await api.getFirs();
      if (data && Array.isArray(data) && data.length > 0) {
        const merged = [...MASTER_FIRS];
        data.forEach((d: any) => {
          if (!merged.some((m) => m.firNumber === d.firNumber)) {
            merged.push(d);
          }
        });
        setFirs(merged);
        if (!selectedFir && merged.length > 0) setSelectedFir(merged[0]);
      } else {
        setFirs(MASTER_FIRS);
        if (!selectedFir && MASTER_FIRS.length > 0) setSelectedFir(MASTER_FIRS[0]);
      }
    } catch (err) {
      console.warn('Using master FIR records:', err);
      setFirs(MASTER_FIRS);
      if (!selectedFir && MASTER_FIRS.length > 0) setSelectedFir(MASTER_FIRS[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFirs();
  }, []);

  const filteredFirs = useMemo(() => {
    return firs.filter((f) => {
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQ =
        !q ||
        f.firNumber?.toLowerCase().includes(q) ||
        f.policeStation?.toLowerCase().includes(q) ||
        f.district?.toLowerCase().includes(q) ||
        f.complainantName?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        (Array.isArray(f.accusedNames) && f.accusedNames.some((a: string) => a.toLowerCase().includes(q))) ||
        (Array.isArray(f.ipcSections) && f.ipcSections.some((s: string) => s.toLowerCase().includes(q)));
      return matchesStatus && matchesQ;
    });
  }, [firs, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredFirs.length / pageSize) || 1;

  const paginatedFirs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredFirs.slice(start, start + pageSize);
  }, [filteredFirs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const handleDownloadFirPdf = async (fir: FirRecord) => {
    setIsExportingPdf(true);
    // If modal is not open, open it briefly for DOM element or use printable-fir-document
    setShowCopyModal(fir);
    setTimeout(async () => {
      await downloadElementAsPdf('printable-fir-document', `OFFICIAL_FIR_${fir.firNumber}.pdf`);
      setIsExportingPdf(false);
    }, 150);
  };

  const handlePrintFir = () => {
    window.print();
  };

  const stats = useMemo(() => {
    return {
      total: firs.length,
      underInvestigation: firs.filter((f) => f.status === 'under_investigation').length,
      chargeSheeted: firs.filter((f) => f.status === 'chargesheet_filed').length,
      highRiskMatched: firs.filter((f) => (f.matchedSuspectIds?.length || 0) > 0).length,
    };
  }, [firs]);

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-charcoal-800" />
            <span>FIR Forensic Tracker & Court Registry</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Centralized tracking of all lodged Police Station FIRs, verified digitized copies, OCR extractions, and criminal syndicate matches.
          </p>
        </div>
        <Link
          href="/police"
          className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold flex items-center gap-2 shadow-md shadow-charcoal-900/15 transition shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-beige-300" />
          <span>File Police Station FIR</span>
        </Link>
      </div>

      {/* CCTNS Police Registry Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-amber-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-200 tracking-wider">CCTNS NATIONAL CRIME DOCKET</span>
          <span className="text-slate-400 hidden sm:inline">• STATUTORY FIRST INFORMATION RECORD (FIR) REPOSITORY</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>RECORDED FIRS: <strong className="text-white font-bold">{firs.length}</strong></span>
          <span className="hidden sm:inline">CRIMINAL STATUTE: <strong className="text-amber-200 font-bold">BNS 2023 / IPC ADMISSIBLE</strong></span>
          <span className="hidden md:inline">POLICE NET: <strong className="text-emerald-300 font-bold">STATE GRID CONNECTED</strong></span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-3xl glass-panel space-y-1 shadow-md">
          <span className="text-charcoal-500 uppercase text-[10px] font-bold">Total Lodged FIRs</span>
          <p className="text-2xl font-bold text-charcoal-950 font-mono">{stats.total}</p>
          <span className="text-[10px] text-charcoal-400 font-sans">Synced with State CCIS & Cloudinary</span>
        </div>
        <div className="p-4 rounded-3xl glass-panel space-y-1 shadow-md">
          <span className="text-amber-700 uppercase text-[10px] font-bold">Active Investigation</span>
          <p className="text-2xl font-bold text-amber-900 font-mono">{stats.underInvestigation}</p>
          <span className="text-[10px] text-charcoal-400 font-sans">Evidence & Wiretaps Active</span>
        </div>
        <div className="p-4 rounded-3xl glass-panel space-y-1 shadow-md">
          <span className="text-emerald-700 uppercase text-[10px] font-bold">Charge-sheet Filed</span>
          <p className="text-2xl font-bold text-emerald-900 font-mono">{stats.chargeSheeted}</p>
          <span className="text-[10px] text-charcoal-400 font-sans">Submitted to Judiciary</span>
        </div>
        <div className="p-4 rounded-3xl glass-panel space-y-1 shadow-md border border-red-500/20">
          <span className="text-red-700 uppercase text-[10px] font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Syndicate Matches</span>
          </span>
          <p className="text-2xl font-bold text-red-700 font-mono">{stats.highRiskMatched}</p>
          <span className="text-[10px] text-red-600 font-sans">Cross-referenced with graph</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Registered' },
            { id: 'under_investigation', label: 'Under Investigation' },
            { id: 'chargesheet_filed', label: 'Charge-sheet Filed' },
            { id: 'registered', label: 'Recently Lodged' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-full font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-charcoal-900 text-beige-100 shadow-sm'
                  : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FIR No, Station, Accused, DNS Section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-xs text-charcoal-900 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* FIRs Table */}
      {loading ? (
        <FirTrackSkeleton />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
                  <th className="p-4 font-semibold">FIR Number & Station</th>
                  <th className="p-4 font-semibold">Accused / Suspects</th>
                  <th className="p-4 font-semibold">Legal Sections (DNS / Acts)</th>
                  <th className="p-4 font-semibold">Intelligence Match</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Document & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {paginatedFirs.map((f) => (
                  <tr
                    key={f.firNumber}
                    onClick={() => setSelectedFir(f)}
                    className="hover:bg-white/80 transition cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-charcoal-950 font-mono text-sm block">{f.firNumber}</span>
                        <div className="flex items-center gap-1 text-[11px] text-charcoal-600 font-medium">
                          <Building className="w-3 h-3 text-charcoal-400" />
                          <span>{f.policeStation}</span>
                          <span className="text-charcoal-400">• {f.district}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {f.accusedNames && f.accusedNames.length > 0 ? (
                          f.accusedNames.map((a: string) => (
                            <span
                              key={a}
                              className="px-2.5 py-0.5 rounded-full bg-white border border-beige-300 font-semibold text-charcoal-900 text-[11px]"
                            >
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-charcoal-400 italic">Unknown operatives</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {f.ipcSections && f.ipcSections.map((s: string) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-charcoal-900/5 text-charcoal-800 font-mono text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {f.matchedSuspectIds && f.matchedSuspectIds.length > 0 ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] w-fit">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          <span>{f.matchedSuspectIds.length} Linked Suspect(s) ({f.matchedSyndicateRisk || 92}%)</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-500 font-mono text-[11px]">Unlinked Record</span>
                      )}
                    </td>
                    <td className="p-4 capitalize">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                          f.status === 'chargesheet_filed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : f.status === 'under_investigation'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {f.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEvidenceModalFir(f)}
                          className="px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title="Inspect Evidence & Forensic Proofs"
                        >
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                          <span>Evidence ({f.evidence?.length || 3})</span>
                        </button>
                        <button
                          onClick={() => setShowCopyModal(f)}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-[11px] flex items-center gap-1 shadow-sm transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-charcoal-600" />
                          <span>View Copy</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFirPdf(f)}
                          className="px-2.5 py-1.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-[11px] flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title="Download Official FIR Document (PDF)"
                        >
                          <Download className="w-3 h-3 text-beige-300" />
                          <span>PDF</span>
                        </button>
                      </div>
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
              <span className="font-bold text-charcoal-950 font-mono">{Math.min(page * pageSize, filteredFirs.length)}</span> of{' '}
              <span className="font-bold text-charcoal-950 font-mono">{filteredFirs.length}</span> FIRs registered
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
      )}

      {/* FIR Detail Slide-Over Drawer */}
      {selectedFir && (
        <div className="glass-panel p-6 rounded-3xl border border-beige-300 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-beige-300 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-charcoal-900 text-beige-100">
                <FileCheck className="w-5 h-5 text-beige-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-charcoal-500">
                  Judicial First Information Record
                </span>
                <h3 className="text-lg font-bold text-charcoal-950 font-mono">{selectedFir.firNumber}</h3>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
                selectedFir.status === 'chargesheet_filed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : selectedFir.status === 'under_investigation'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {selectedFir.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Police Station</span>
              <span className="font-bold text-charcoal-950 text-sm">{selectedFir.policeStation}</span>
              <span className="text-[11px] text-charcoal-600 block">{selectedFir.district}, {selectedFir.state || 'India'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Incharge Officer / SHO</span>
              <span className="font-bold text-charcoal-950 text-sm">{selectedFir.inchargeOfficer}</span>
              <span className="text-[10px] font-mono text-charcoal-500 block">General Diary: {selectedFir.gdNumber || 'GD-042/26'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Complainant / Informant</span>
              <span className="font-bold text-charcoal-950 text-sm">{selectedFir.complainantName}</span>
              <span className="text-[11px] font-mono text-charcoal-600 block">{selectedFir.complainantPhone}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-beige-300 space-y-1">
              <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Incident Location</span>
              <span className="font-bold text-charcoal-950 text-sm">{selectedFir.incidentLocation || 'State Jurisdiction'}</span>
              <span className="text-[10px] font-mono text-charcoal-500 block">{selectedFir.incidentDate?.slice(0, 10)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-900 uppercase font-mono tracking-wider block mb-1">
              FIR Incident Particulars
            </label>
            <div className="p-3.5 rounded-2xl bg-white border border-beige-300 text-xs text-charcoal-800 leading-relaxed shadow-inner">
              {selectedFir.description}
            </div>
          </div>

          {selectedFir.ocrExtractedText && (
            <div>
              <label className="text-xs font-bold text-charcoal-900 uppercase font-mono tracking-wider block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Digitized Official Police Transcript (Integrated Investigation Form)</span>
              </label>
              <pre className="p-4 rounded-2xl bg-charcoal-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner border border-beige-300/10 whitespace-pre-wrap max-h-48">
                {selectedFir.ocrExtractedText}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-beige-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCopyModal(selectedFir)}
                className="px-4 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-beige-300" />
                <span>View Official FIR Copy (I.I.F.-I)</span>
              </button>
              <button
                onClick={() => handleDownloadFirPdf(selectedFir)}
                className="px-3.5 py-2.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-charcoal-700" />
                <span>Download FIR PDF</span>
              </button>
            </div>
            <Link
              href="/explorer"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <span>Investigate in Network Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-600" />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTIC INDIAN POLICE FIRST INFORMATION REPORT (FORM I.I.F.-I) MODAL */}
      {/* ========================================================================= */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="glass-panel bg-white border border-beige-300 rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl space-y-4 animate-scale-in max-h-[96vh] flex flex-col">
            {/* Modal Action Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-beige-300 pb-3 gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-charcoal-900 text-beige-100 flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-charcoal-950 font-mono">
                    {showCopyModal.firNumber} • Form I.I.F.-I
                  </h3>
                  <p className="text-[11px] text-charcoal-500 font-medium">
                    {showCopyModal.policeStation} • {showCopyModal.district}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEvidenceModalFir(showCopyModal)}
                  className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Inspect Evidence Proofs & Exhibits"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Evidence Vault ({showCopyModal.evidence?.length || 0})</span>
                </button>
                <button
                  onClick={() => handleDownloadFirPdf(showCopyModal)}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-60"
                  title="Download FIR Document as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-beige-300" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download FIR (PDF)'}</span>
                </button>
                <button
                  onClick={handlePrintFir}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
                  title="Print Court Copy"
                >
                  <Printer className="w-3.5 h-3.5 text-charcoal-700" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowCopyModal(null)}
                  className="p-1.5 rounded-full hover:bg-beige-200 text-charcoal-600 transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Authentic Printable Indian Police FIR Document Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white border-2 border-charcoal-900 rounded-2xl shadow-inner text-charcoal-950 font-serif leading-normal relative select-text" id="printable-fir-document">
              {/* Official Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                <p className="text-6xl sm:text-8xl font-black font-sans -rotate-45 uppercase text-charcoal-950 text-center tracking-widest leading-tight">
                  CERTIFIED COPY<br />STATE POLICE
                </p>
              </div>

              {/* Official National / State Header */}
              <div className="text-center border-b-2 border-charcoal-900 pb-4 space-y-1 relative">
                {/* Ashoka Lion Emblem Insignia Graphic */}
                <div className="mx-auto w-12 h-12 mb-1 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12 text-charcoal-900 fill-current">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M38 38 L62 62 M38 62 L62 38" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="4" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold tracking-widest text-charcoal-800 font-sans uppercase">
                  सत्यमेव जयते • GOVERNMENT OF INDIA
                </p>
                <h2 className="text-base sm:text-lg font-black tracking-wide font-serif uppercase">
                  {showCopyModal.state?.toUpperCase() || 'STATE'} POLICE DEPARTMENT
                </h2>
                <h3 className="text-xs sm:text-sm font-bold tracking-wider font-mono text-charcoal-800 uppercase">
                  INTEGRATED INVESTIGATION FORM - I (I.I.F.-I) / एकीकृत अन्वेषण प्रपत्र - १
                </h3>
                <h4 className="text-sm sm:text-base font-extrabold tracking-tight font-serif uppercase underline decoration-1 underline-offset-4">
                  FIRST INFORMATION REPORT / प्रथम सूचना रिपोर्ट
                </h4>
                <p className="text-[11px] text-charcoal-700 italic font-sans">
                  (Under Section 173 Bharatiya Nagarik Suraksha Sanhita 2023 / Section 154 Cr.P.C.)
                </p>
              </div>

              {/* Form Grid 1: Police Station & Registration Meta */}
              <div className="mt-4 border border-charcoal-900 divide-y divide-charcoal-900 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 p-0 font-sans">
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">1. जिला / District</span>
                    <span className="font-bold text-charcoal-950 font-mono text-[11px]">{showCopyModal.district}</span>
                  </div>
                  <div className="p-2 sm:col-span-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">थाना / Police Station</span>
                    <span className="font-bold text-charcoal-950 text-[11px]">{showCopyModal.policeStation}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">वर्ष / Year</span>
                    <span className="font-bold text-charcoal-950 font-mono text-[11px]">{showCopyModal.year || '2026'}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">FIR No. / रिपोर्ट सं.</span>
                    <span className="font-black text-charcoal-950 font-mono text-[11px]">{showCopyModal.firNumber}</span>
                  </div>
                </div>

                {/* Form Grid 2: Acts & Sections */}
                <div className="p-2.5 bg-neutral-50/50 font-sans">
                  <span className="text-[9px] font-bold uppercase text-charcoal-600 block mb-1">
                    2. अधिनियम एवं धाराएं / Acts & Sections Applicable:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {showCopyModal.ipcSections?.map((sec: string) => (
                      <span key={sec} className="px-2 py-0.5 rounded border border-charcoal-400 bg-white font-mono text-[11px] font-bold">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Form Grid 3: Occurrence of Offence & General Diary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 p-0 font-sans text-xs">
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">3. अपराध की घटना / Occurrence</span>
                    <p className="font-medium text-[11px]">
                      दिनांक / Date: <span className="font-bold font-mono">{showCopyModal.incidentDate?.slice(0, 10)}</span>
                    </p>
                    <p className="font-medium text-[11px]">
                      समय / Time: <span className="font-bold font-mono">{showCopyModal.gdTime || '10:30 Hours'}</span>
                    </p>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">जनरल डायरी संदर्भ / GD Entry</span>
                    <p className="font-medium text-[11px]">
                      GD No.: <span className="font-bold font-mono">{showCopyModal.gdNumber || 'GD-042/2026'}</span>
                    </p>
                    <p className="font-medium text-[11px]">
                      GD Time: <span className="font-bold font-mono">{showCopyModal.gdTime || '03:45 AM'}</span>
                    </p>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] font-bold uppercase text-charcoal-600 block">सूचना का प्रकार / Information Type</span>
                    <p className="font-bold text-[11px] text-charcoal-950">लिखित / Written & Digitally Signed</p>
                    <p className="text-[10px] text-charcoal-500 font-mono">Transmission: ICJS Central Node</p>
                  </div>
                </div>

                {/* Form Grid 4: Place of Occurrence */}
                <div className="p-2.5 font-sans text-xs">
                  <span className="text-[9px] font-bold uppercase text-charcoal-600 block">
                    4. घटना स्थल / Place of Occurrence:
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mt-0.5">
                    <p>
                      <span className="font-bold">Address / पता:</span> {showCopyModal.incidentLocation}
                    </p>
                    <p className="text-charcoal-600 font-mono">
                      Distance from P.S.: 1.5 Km • Beat No. 4
                    </p>
                  </div>
                </div>

                {/* Form Grid 5: Complainant / Informant */}
                <div className="p-2.5 font-sans text-xs space-y-1">
                  <span className="text-[9px] font-bold uppercase text-charcoal-600 block">
                    5. शिकायतकर्ता / सूचनाकर्ता का विवरण / Complainant or Informant:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-charcoal-500 text-[10px] block">Full Name / पूरा नाम:</span>
                      <span className="font-bold text-charcoal-950">{showCopyModal.complainantName}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 text-[10px] block">Designation / पद:</span>
                      <span className="font-semibold text-charcoal-900">{showCopyModal.complainantDesignation || 'Complainant / Authorized Informant'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 text-[10px] block">Contact / संपर्क दूरभाष:</span>
                      <span className="font-mono font-bold text-charcoal-900">{showCopyModal.complainantPhone}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-charcoal-600">
                    <span className="font-bold">Permanent Address:</span> {showCopyModal.complainantAddress || 'Corporate Office / Headquarters, India'}
                  </p>
                </div>

                {/* Form Grid 6: Details of Accused Persons */}
                <div className="p-2.5 font-sans text-xs">
                  <span className="text-[9px] font-bold uppercase text-charcoal-600 block mb-1">
                    6. ज्ञात / संदेही / अभियुक्त व्यक्तियों का विवरण / Details of Accused Persons:
                  </span>
                  <div className="border border-charcoal-300 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-100 text-[9px] font-mono uppercase font-bold text-charcoal-700">
                        <tr>
                          <th className="p-1.5 border-r border-charcoal-300">Sl. No.</th>
                          <th className="p-1.5 border-r border-charcoal-300">Accused Name & Particulars</th>
                          <th className="p-1.5 border-r border-charcoal-300">Syndicate Role</th>
                          <th className="p-1.5">Linked Target ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal-200">
                        {showCopyModal.accusedNames?.map((name: string, idx: number) => (
                          <tr key={name}>
                            <td className="p-1.5 font-mono text-center border-r border-charcoal-200">{idx + 1}</td>
                            <td className="p-1.5 font-bold border-r border-charcoal-200">{name}</td>
                            <td className="p-1.5 text-charcoal-700 border-r border-charcoal-200">
                              {idx === 0 ? 'Primary Mastermind / Transshipment Controller' : idx === 1 ? 'Mule Account Beneficiary & Courier Handler' : 'Commercial Shell Entity / Transport Conduit'}
                            </td>
                            <td className="p-1.5 font-mono font-bold text-charcoal-800">
                              {showCopyModal.matchedSuspectIds?.[idx] || `P-${String(101 + idx).padStart(4, '0')}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Grid 7: Particulars of Properties Involved */}
                <div className="p-2.5 font-sans text-xs">
                  <span className="text-[9px] font-bold uppercase text-charcoal-600 block">
                    7. संलिप्त / चुराई गई / सम्बद्ध संपत्ति का विवरण / Particulars of Properties Involved:
                  </span>
                  <p className="text-[11px] font-mono text-charcoal-950 mt-0.5">
                    {showCopyModal.propertiesInvolved || 'Commercial credit facilities, electronic funds transfer ledgers, and transit convoy vehicles.'}
                  </p>
                </div>

                {/* Form Grid 8: First Information Narrative */}
                <div className="p-3 font-serif text-xs space-y-2 leading-relaxed">
                  <span className="text-[9px] font-bold uppercase font-sans text-charcoal-600 block">
                    8. प्रथम सूचना का सार / Statement of First Information:
                  </span>
                  <div className="p-3 bg-neutral-50/70 border border-charcoal-300 rounded text-justify text-charcoal-900 whitespace-pre-wrap font-sans text-[11px]">
                    {showCopyModal.ocrExtractedText || showCopyModal.description}
                  </div>
                  <p className="text-[10px] text-charcoal-600 font-sans italic">
                    विलम्ब का कारण / Reasons for delay in reporting: {showCopyModal.delayReason || 'Internal audit and technical verification required prior to lodging statutory complaint.'}
                  </p>
                </div>

                {/* Form Grid 9: Official Signatures & Seal Block */}
                <div className="p-4 font-sans text-xs bg-white">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Complainant Signature */}
                    <div className="text-center space-y-1">
                      <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                        <span className="font-serif italic text-sm text-charcoal-700">{showCopyModal.complainantName?.split(' ')[0]} (Auth. Sign)</span>
                      </div>
                      <p className="text-[9px] font-bold uppercase text-charcoal-600">
                        शिकायतकर्ता के हस्ताक्षर / अंगूठा निशान<br />Signature of Complainant / Informant
                      </p>
                    </div>

                    {/* Official Circular Rubber Stamp */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-700 text-blue-800 flex flex-col items-center justify-center p-1 text-center rotate-[-6deg] shadow-sm bg-blue-50/30">
                        <span className="text-[7px] font-black uppercase tracking-tighter">★ STATE POLICE ★</span>
                        <span className="text-[8px] font-extrabold uppercase leading-tight">{showCopyModal.policeStation.slice(0, 18)}</span>
                        <span className="text-[7px] font-mono font-bold">SEAL OF SHO</span>
                        <span className="text-[7px] font-bold uppercase">MUMBAI / INDIA</span>
                      </div>
                      <span className="text-[8px] font-mono text-charcoal-400 mt-1">Certified ICJS Stamp</span>
                    </div>

                    {/* SHO Signature */}
                    <div className="text-center space-y-1">
                      <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                        <span className="font-serif italic text-sm text-charcoal-800 font-bold">{showCopyModal.inchargeOfficer?.split(',')[0]}</span>
                      </div>
                      <p className="text-[9px] font-bold uppercase text-charcoal-600">
                        हस्ताक्षर थाना प्रभारी / SHO<br />Signature of Officer-in-Charge
                      </p>
                      <p className="text-[8px] font-mono text-charcoal-500">Badge #{showCopyModal.firNumber.replace('FIR-', 'POL-')}</p>
                    </div>
                  </div>

                  {/* Dispatch Footer */}
                  <div className="mt-4 pt-2 border-t border-charcoal-300 flex flex-col sm:flex-row items-center justify-between text-[9px] text-charcoal-500 font-mono">
                    <span>Dispatch to JMFC: {showCopyModal.courtJurisdiction || 'Chief Judicial Magistrate Court'}</span>
                    <span>Certified True Copy Under Sec 76 Indian Evidence Act / BSA 2023</span>
                    <span>System Record Hash: #{showCopyModal.firNumber}-VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-beige-200 shrink-0">
              <span className="text-[11px] font-mono text-charcoal-500">
                Official Court-Admissible Format • Integrated Investigation Form - I (I.I.F.-I)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFirPdf(showCopyModal)}
                  disabled={isExportingPdf}
                  className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5 text-beige-300" />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download FIR (PDF)'}</span>
                </button>
                <button
                  onClick={() => setShowCopyModal(null)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs shadow-sm transition"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVIDENCE & FORENSIC PROOFS MODAL                                          */}
      {/* ========================================================================= */}
      <EvidenceViewerModal
        isOpen={!!evidenceModalFir}
        onClose={() => setEvidenceModalFir(null)}
        identifier={evidenceModalFir?.firNumber || ''}
        title={`FIR ${evidenceModalFir?.firNumber} - ${evidenceModalFir?.policeStation}`}
        evidenceList={evidenceModalFir?.evidence || []}
      />
    </div>
  );
}

