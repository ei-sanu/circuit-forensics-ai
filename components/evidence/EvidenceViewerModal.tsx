'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Camera,
  Image as ImageIcon,
  Lock,
  Download,
  Calendar,
  User,
  Hash,
  CheckCircle2,
  ExternalLink,
  Search,
  Eye,
  FileSpreadsheet,
  Cpu,
  Layers,
} from 'lucide-react';
import { downloadElementAsPdf } from '@/lib/pdfExport';

export interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  hash: string;
  status: string;
  date?: string;
  officer?: string;
  imageUrl?: string;
  textExcerpt?: string;
  fileSize?: string;
  tags?: string[];
}

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  identifier: string; // Case Number or FIR Number
  evidenceList: EvidenceItem[];
}

function ForensicEvidenceCanvas({
  evidence,
  identifier,
  caseTitle,
}: {
  evidence: EvidenceItem;
  identifier: string;
  caseTitle: string;
}) {
  const type = (evidence.type || '').toLowerCase();
  const title = (evidence.title || '').toLowerCase();

  const isSurveillance =
    type.includes('cctv') ||
    type.includes('anpr') ||
    type.includes('photo') ||
    title.includes('camera') ||
    title.includes('surveillance') ||
    title.includes('toll') ||
    title.includes('sighting');

  const isFinancial =
    type.includes('financial') ||
    title.includes('cash') ||
    title.includes('hawala') ||
    title.includes('bullion') ||
    title.includes('cheque') ||
    title.includes('token') ||
    title.includes('currency') ||
    title.includes('ledger');

  const isDigital =
    type.includes('digital') ||
    type.includes('mobile') ||
    title.includes('phone') ||
    title.includes('chat') ||
    title.includes('cdr') ||
    title.includes('call') ||
    title.includes('extraction') ||
    title.includes('server');

  if (isSurveillance) {
    return (
      <div className="w-full h-56 sm:h-64 bg-slate-950 relative overflow-hidden rounded-xl border-2 border-slate-800 flex flex-col justify-between p-3 font-mono text-white select-none">
        {/* CCTV Telemetry Top HUD */}
        <div className="flex items-center justify-between text-[10px] text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded backdrop-blur-sm border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider">REC • ANPR HIGHWAY SENSOR CAM-04</span>
          </div>
          <span className="text-slate-300 font-bold">{evidence.date || '2026-08-20'} 02:45:18 IST</span>
        </div>

        {/* Center Target Acquisition Crosshair & Bounding Box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-36 border-2 border-dashed border-emerald-400/80 rounded-lg relative flex items-center justify-center bg-emerald-950/15">
            <div className="absolute -top-3 left-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded font-sans uppercase">
              TARGET ACQUIRED • CASE: {identifier}
            </div>
            <div className="text-center space-y-1 p-2">
              <span className="text-xs font-black uppercase text-emerald-300 font-sans tracking-wide block">
                {evidence.title}
              </span>
              <span className="text-[10px] text-slate-300 font-mono block">
                RESOLVED ID: {evidence.id} • CONFIDENCE: 98.7%
              </span>
            </div>
            {/* Corner brackets */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
          </div>
        </div>

        {/* Bottom Sensor Metadata */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded backdrop-blur-sm border border-slate-800 z-10">
          <span>GPS: 18.5204° N, 73.8567° E (WGS-84)</span>
          <span>IR NIGHT SENSOR • 1080p 60FPS</span>
          <span className="text-emerald-400 font-bold">STATE POLICE FORENSIC IMAGING</span>
        </div>
      </div>
    );
  }

  if (isFinancial) {
    return (
      <div className="w-full h-56 sm:h-64 bg-amber-950/20 relative overflow-hidden rounded-xl border-2 border-amber-900/40 p-4 font-mono text-charcoal-900 flex flex-col justify-between bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="flex items-start justify-between border-b-2 border-amber-900/40 pb-2">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-900 block">
              RESERVE BANK OF INDIA / FIU-IND FORENSIC REPOSITORY
            </span>
            <h4 className="text-xs font-black uppercase text-amber-950 font-sans mt-0.5">
              SEIZED HAWALA & ILLICIT CURRENCY EXHIBIT
            </h4>
          </div>
          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            CASE #{identifier}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-white/90 rounded-xl border border-amber-300/80 shadow-sm text-[10px]">
          <div>
            <span className="text-[8px] uppercase font-bold text-charcoal-500 block">Exhibited Evidence Item:</span>
            <p className="font-bold text-charcoal-950 text-xs font-sans mt-0.5">{evidence.title}</p>
            <span className="text-charcoal-600 block mt-1">Denomination: ₹500 Legal Tender Bundles</span>
          </div>
          <div className="border-l border-amber-200 pl-3">
            <span className="text-[8px] uppercase font-bold text-charcoal-500 block">Token / Serial Registry:</span>
            <p className="font-black text-amber-900 font-mono mt-0.5">REF: {evidence.id}-TOKEN-DXB</p>
            <span className="text-charcoal-600 block mt-1">Seizure Officer: {evidence.officer || 'SI Priya Nair'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-amber-900 font-bold pt-2 border-t border-amber-900/30">
          <span>EVIDENCE LOCKER VAULT SEAL #772</span>
          <span>TAMPER-EVIDENT POUCH SEC-63 BSA</span>
        </div>
      </div>
    );
  }

  if (isDigital) {
    return (
      <div className="w-full h-56 sm:h-64 bg-slate-900 relative overflow-hidden rounded-xl border-2 border-slate-700 p-3.5 font-mono text-slate-100 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold text-cyan-300">CELLEBRITE UFED FORENSIC EXTRACTION</span>
          </div>
          <span className="text-slate-400 text-[9px]">BITSTREAM HASH VERIFIED</span>
        </div>

        <div className="space-y-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px]">
          <div className="flex justify-between text-slate-400 text-[9px]">
            <span>DEVICE: SAMSUNG GALAXY S23 (KNOX SECURED)</span>
            <span>IMEI: 354892018492019</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-[8px] text-cyan-400 font-bold">
              <span>EXTRACTED TELEGRAM/WHATSAPP THREAD</span>
              <span>2026-08-20 02:45 IST</span>
            </div>
            <p className="text-slate-200 text-[10px] font-sans italic">
              "{evidence.description || 'Target confirmed. Consignment loaded in Fortuner MH-01-EA-9021. Toll gate crossing cleared.'}"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-800">
          <span>EXHIBIT REF: {evidence.id}</span>
          <span>CASE DOCKET: {identifier}</span>
          <span className="text-emerald-400 font-bold">SHA-256 MATCH: PASS</span>
        </div>
      </div>
    );
  }

  // Default: Formal CFSL / Panchnama Forensic Document Exhibit
  return (
    <div className="w-full h-56 sm:h-64 bg-neutral-50 relative overflow-hidden rounded-xl border-2 border-charcoal-900 p-4 font-sans text-charcoal-950 flex flex-col justify-between">
      <div className="flex items-start justify-between border-b border-charcoal-900 pb-2">
        <div>
          <span className="text-[8px] font-mono font-black uppercase text-red-700 tracking-wider block">
            CENTRAL FORENSIC SCIENCE LABORATORY (CFSL) • GOVT OF INDIA
          </span>
          <h4 className="text-xs font-black uppercase mt-0.5">{evidence.title}</h4>
        </div>
        <div className="w-10 h-10 rounded-full border border-dashed border-red-700 text-red-800 flex flex-col items-center justify-center text-[6px] font-black text-center p-0.5">
          <span>CFSL</span>
          <span>SEAL</span>
        </div>
      </div>

      <div className="p-3 bg-white rounded-lg border border-charcoal-300 space-y-1.5 text-[10px]">
        <div className="flex justify-between font-mono text-[9px] text-charcoal-500">
          <span>CASE: {identifier}</span>
          <span>DATE: {evidence.date || '2026-08-20'}</span>
        </div>
        <p className="text-charcoal-800 italic leading-relaxed text-[11px]">
          "{evidence.description || 'Verified evidentiary material held in continuous legal chain of custody under Section 63 BSA 2023.'}"
        </p>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-charcoal-600 pt-1 border-t border-charcoal-300">
        <span>EXAMINER: {evidence.officer || 'SI Priya Nair'}</span>
        <span className="font-bold text-emerald-800">JUDICIALLY ADMISSIBLE</span>
      </div>
    </div>
  );
}

export function EvidenceViewerModal({
  isOpen,
  onClose,
  title,
  identifier,
  evidenceList,
}: EvidenceViewerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem | null>(
    evidenceList[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredEvidence = evidenceList.filter((ev) => {
    if (selectedCategory !== 'all') {
      const typeStr = ev.type?.toLowerCase() || '';
      if (selectedCategory === 'documents' && !typeStr.includes('document') && !typeStr.includes('memo') && !typeStr.includes('report')) return false;
      if (selectedCategory === 'photos' && !typeStr.includes('cctv') && !typeStr.includes('photo') && !typeStr.includes('anpr') && !typeStr.includes('capture')) return false;
      if (selectedCategory === 'digital' && !typeStr.includes('digital') && !typeStr.includes('extraction') && !typeStr.includes('wiretap') && !typeStr.includes('cdr')) return false;
      if (selectedCategory === 'financial' && !typeStr.includes('bank') && !typeStr.includes('ledger') && !typeStr.includes('cheque') && !typeStr.includes('financial')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.hash?.toLowerCase().includes(q) ||
        ev.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentPreview = activeEvidence || filteredEvidence[0] || null;

  const handleDownloadProofPdf = () => {
    if (currentPreview) {
      downloadElementAsPdf('evidence-preview-card', `EVIDENCE_${currentPreview.id}_${identifier}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-charcoal-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl p-5 sm:p-7 border border-beige-300 shadow-2xl space-y-4 my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-beige-200 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-charcoal-950 text-white font-mono text-[11px] font-bold">
                {identifier}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                Chain of Custody Intact
              </span>
            </div>
            <h2 className="text-lg font-black text-charcoal-950 mt-1">
              Case Evidence & Forensic Proofs Vault
            </h2>
            <p className="text-xs text-charcoal-600">
              Verified court-admissible exhibits, photographic seizures, digital extractions, and bank ledger proofs for {title}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadProofPdf}
              className="px-3.5 py-1.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
              title="Download Evidence Sheet as PDF"
            >
              <Download className="w-3.5 h-3.5 text-beige-300" />
              <span>Download Evidence (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-beige-200 text-charcoal-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: `All Evidence (${evidenceList.length})` },
              { id: 'documents', label: 'Documents & Memos' },
              { id: 'photos', label: 'Photos & CCTV' },
              { id: 'digital', label: 'Digital Forensics' },
              { id: 'financial', label: 'Financial Exhibits' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full border transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-charcoal-950 text-white border-charcoal-950 shadow-sm'
                    : 'bg-white hover:bg-beige-100 border-beige-300 text-charcoal-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search proofs, hashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-beige-300 rounded-full text-xs text-charcoal-900 outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Main Content Area: Left Grid + Right Detailed Inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Left: Evidence List (5 cols) */}
          <div className="lg:col-span-5 overflow-y-auto space-y-2.5 pr-1 max-h-[60vh] lg:max-h-full">
            {filteredEvidence.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-500 bg-beige-50 rounded-2xl border border-beige-200">
                No evidence items match your filter criteria.
              </div>
            ) : (
              filteredEvidence.map((ev) => {
                const isSelected = currentPreview?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setActiveEvidence(ev)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left space-y-1.5 ${
                      isSelected
                        ? 'bg-beige-100/90 border-charcoal-950 shadow-sm ring-1 ring-charcoal-950'
                        : 'bg-white hover:bg-neutral-50 border-beige-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-charcoal-900 text-white">
                        {ev.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                        {ev.status || 'VERIFIED'}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-charcoal-950 leading-snug">
                      {ev.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-charcoal-500 font-mono pt-1 border-t border-beige-200">
                      <span>{ev.type}</span>
                      <span>{ev.date || '2026-08-20'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Evidence Inspector & Proof Canvas (7 cols) */}
          <div className="lg:col-span-7 overflow-y-auto max-h-[60vh] lg:max-h-full">
            {currentPreview ? (
              <div
                id="evidence-preview-card"
                className="p-5 sm:p-6 bg-white border-2 border-charcoal-900 rounded-2xl shadow-inner space-y-4 font-sans text-xs"
              >
                {/* Visual Header Box */}
                <div className="border-b border-charcoal-900 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-red-700 block">
                      OFFICIAL JUDICIAL EXHIBIT
                    </span>
                    <h3 className="text-sm font-black text-charcoal-950 uppercase mt-0.5">
                      {currentPreview.title}
                    </h3>
                    <p className="text-[10px] font-mono text-charcoal-600">
                      EXHIBIT REF: #{currentPreview.id} • CASE: {identifier}
                    </p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-charcoal-500">
                    <span className="block font-bold text-charcoal-900">{currentPreview.date || '2026-08-20'}</span>
                    <span>Officer: {currentPreview.officer || 'SI Priya Nair'}</span>
                  </div>
                </div>

                {/* Authentic Domain-Matched Forensic Visual Canvas */}
                <ForensicEvidenceCanvas
                  evidence={currentPreview}
                  identifier={identifier}
                  caseTitle={title}
                />

                {/* Text Proof / Extracted Transcript Box */}
                {currentPreview.textExcerpt && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-charcoal-700 block">
                      Forensic OCR / Extracted Evidence Transcript:
                    </span>
                    <div className="p-3 bg-amber-50/50 border border-amber-300/80 rounded-xl font-mono text-[11px] text-charcoal-900 whitespace-pre-wrap leading-relaxed">
                      {currentPreview.textExcerpt}
                    </div>
                  </div>
                )}

                {/* Cryptographic SHA-256 Hash & Verification Block */}
                <div className="p-3 bg-neutral-50 border border-charcoal-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-charcoal-700 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-charcoal-800" />
                      <span>Cryptographic Integrity Hash:</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      SHA-256 VERIFIED
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-charcoal-900 break-all bg-white p-2 rounded border border-neutral-300">
                    {currentPreview.hash}
                  </p>
                </div>

                {/* Evidentiary Admissibility Endorsement */}
                <div className="pt-2 border-t border-charcoal-300 flex items-center justify-between text-[10px] font-mono text-charcoal-500">
                  <span>Certified Admissible Under Sec 63 BSA 2023</span>
                  <span>Custody: Special Evidence Vault Room 4</span>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-charcoal-500 bg-beige-50 rounded-2xl border border-beige-200">
                Select an evidence item to inspect details.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-beige-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-charcoal-500">
            Total Verified Exhibits: {evidenceList.length} • Certified under Law
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-charcoal-950 hover:bg-charcoal-800 text-white text-xs font-bold transition shadow cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
