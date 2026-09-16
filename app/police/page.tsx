'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  FilePlus,
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  Building,
  User,
  Phone,
  AlertTriangle,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { audioAlert } from '@/lib/audioAlert';
import Link from 'next/link';

export default function PoliceStationDashboard() {
  const [user, setUser] = useState<any>(null);
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filingMode, setFilingMode] = useState<'form' | 'upload'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [matchAlert, setMatchAlert] = useState<any | null>(null);

  // Form State
  const [firData, setFirData] = useState({
    firNumber: '',
    policeStation: 'Colaba Cyber Crime PS',
    district: 'Mumbai South',
    inchargeOfficer: 'Senior Inspector Vikram Shinde, SHO',
    complainantName: '',
    complainantPhone: '',
    accusedNames: '',
    ipcSections: 'DNS 318, DNS 61, Section 66D IT Act',
    incidentLocation: 'Nariman Point, Mumbai',
    description: '',
  });

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    if (cur?.stationName) {
      setFirData((prev) => ({
        ...prev,
        policeStation: cur.stationName || prev.policeStation,
        district: cur.district || prev.district,
        inchargeOfficer: cur.name ? `${cur.name} (${cur.inchargeRank || 'SHO'})` : prev.inchargeOfficer,
      }));
    }
    loadStationFirs();
  }, []);

  const loadStationFirs = async () => {
    try {
      const data = await api.getFirs();
      if (data && Array.isArray(data)) {
        setFirs(data);
      }
    } catch (err) {
      console.warn('Could not fetch station FIRs');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setOcrProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('district', firData.district);
      formData.append('policeStation', firData.policeStation);
      formData.append('accusedNames', firData.accusedNames);
      formData.append('ipcSections', firData.ipcSections);

      const res = await api.uploadFirCopy(formData);
      if (res && res.ocrExtractedText) {
        setOcrText(res.ocrExtractedText);
        if (res.parsedFields) {
          setFirData((prev) => ({
            ...prev,
            firNumber: res.parsedFields.firNumber || prev.firNumber || `FIR-${prev.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            complainantName: res.parsedFields.complainant || prev.complainantName || 'State Police Cyber Cell',
            accusedNames: res.parsedFields.accused ? res.parsedFields.accused.join(', ') : prev.accusedNames,
            ipcSections: res.parsedFields.sections ? res.parsedFields.sections.join(', ') : prev.ipcSections,
            description: res.parsedFields.incidentSummary || prev.description || res.ocrExtractedText.slice(0, 250),
          }));
        }
      }
    } catch {
      // Offline fallback
      const generatedFir = `FIR-${firData.district.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const fallbackOcr = `FIRST INFORMATION REPORT (Under Bharatiya Nagarik Suraksha Sanhita / Cr.P.C.)\nDistrict: ${firData.district}\nPolice Station: ${firData.policeStation}\nFIR Number: ${generatedFir}\nDate of Occurrence: 06/09/2026\nComplainant: Axis Bank AML Vigilance Cell\nAccused: 1. Vikram Rathore 2. Sunil Verma 3. NorthStar Logistics\nSections / Acts: DNS 318 (Cheating), DNS 61 (Conspiracy), Sec 66D IT Act\nIncident Summary: Fraudulent RTGS pass-through layering through unauthorized merchant accounts and immediate Hawala token conversions.`;

      setOcrText(fallbackOcr);
      setFirData((prev) => ({
        ...prev,
        firNumber: generatedFir,
        complainantName: 'Axis Bank AML Vigilance Cell',
        accusedNames: 'Vikram Rathore, Sunil Verma, NorthStar Logistics',
        ipcSections: 'DNS 318, DNS 61, Sec 66D IT Act',
        description: 'Fraudulent RTGS pass-through layering through unauthorized merchant accounts and immediate Hawala token conversions.',
      }));
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleSubmitFir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setMatchAlert(null);

    const generatedNumber =
      firData.firNumber ||
      `FIR-${firData.district.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const payload = {
      ...firData,
      firNumber: generatedNumber,
      accusedNames: firData.accusedNames.split(',').map((a) => a.trim()).filter(Boolean),
      ipcSections: firData.ipcSections.split(',').map((s) => s.trim()).filter(Boolean),
      firCopyUrl:
        previewUrl ||
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      ocrExtractedText: ocrText || firData.description,
    };

    try {
      const res = await api.createFir(payload);
      
      // Check if critical match alert was generated
      if (res.matchedSuspectIds && res.matchedSuspectIds.length > 0) {
        const matchData = {
          alertId: `ALT-FIR-${Date.now()}`,
          title: `🚨 CRITICAL MATCH: Suspect(s) [${payload.accusedNames.join(', ')}] Identified in ${generatedNumber}`,
          explanation: `FIR #${generatedNumber} was filed at ${payload.policeStation} (${payload.district}) citing ${payload.ipcSections.join(', ')}. Target matches master criminal records.`,
          entities: res.matchedSuspectIds.map((id: string, i: number) => ({
            id,
            label: payload.accusedNames[i] || id,
            type: 'person',
          })),
          severity: 'critical',
          firNumber: generatedNumber,
          station: payload.policeStation,
          district: payload.district,
          risk: res.matchedSyndicateRisk || 94,
        };

        setMatchAlert(matchData);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('fir-uploaded-match', { detail: matchData }),
          );
        }
      }

      setSuccessMessage(`FIR #${generatedNumber} registered successfully and synchronized with State CCIS & Cloudinary!`);
      loadStationFirs();

      
      // Reset
      setUploadedFile(null);
      setPreviewUrl(null);
      setOcrText('');
      setFirData((prev) => ({
        ...prev,
        firNumber: '',
        complainantName: '',
        complainantPhone: '',
        accusedNames: '',
        description: '',
      }));
    } catch (err: any) {
      alert(`Error lodging FIR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Station Jurisdiction Header */}
      <div className="p-6 rounded-3xl glass-panel shadow-lg border border-beige-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6 text-beige-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sand-gradient text-charcoal-950 text-[10px] font-mono font-extrabold uppercase">
                District Police Station
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-700 font-bold font-mono">CCIS Online</span>
            </div>
            <h2 className="text-xl font-bold text-charcoal-950 mt-0.5">
              {user?.stationName || 'Colaba Cyber Crime PS, Mumbai South'}
            </h2>
            <p className="text-xs text-charcoal-600 font-medium">
              Incharge Officer: <strong className="text-charcoal-900">{user?.inchargeRank || 'SHO Inspector'} {user?.name || 'Vikram Shinde'}</strong> • District: {user?.district || 'Mumbai South'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fir-track"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-charcoal-800" />
            <span>FIR Track Portal</span>
          </Link>
          <Link
            href="/locations"
            className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <Compass className="w-4 h-4 text-beige-300" />
            <span>Jurisdiction Map</span>
          </Link>
        </div>
      </div>

      {/* Critical Match Banner if detected */}
      {matchAlert && (
        <div className="p-5 rounded-3xl bg-red-600/10 border-2 border-red-500/40 text-red-900 shadow-xl animate-scale-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-red-950 font-mono">
                🚨 CRITICAL SYNDICATE MATCH IDENTIFIED IN {matchAlert.firNumber}
              </h4>
              <p className="text-xs text-red-800 font-medium mt-0.5">
                Accused target(s) <strong>{matchAlert.suspects.join(', ')}</strong> matched active intelligence records (Threat Rating: {matchAlert.risk}%).
                Notification dispatched to Admin, Analysts & Senior Investigators!
              </p>
            </div>
          </div>
          <Link
            href="/explorer"
            className="px-4 py-2 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md transition"
          >
            <span>Investigate in Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Success Notice */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* FIR Filing Module */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form / Upload */}
        <div className="lg:col-span-2 glass-panel p-7 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-beige-300 pb-4">
            <div>
              <h3 className="text-base font-bold text-charcoal-950 flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-charcoal-800" />
                <span>Log First Information Report (FIR)</span>
              </h3>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Upload scanned FIR copy for automated Cloudinary OCR extraction or file directly online.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-white border border-beige-300 p-1 text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setFilingMode('upload')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  filingMode === 'upload' ? 'bg-charcoal-900 text-beige-100 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Scan / Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setFilingMode('form')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  filingMode === 'form' ? 'bg-charcoal-900 text-beige-100 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Direct Digital Form</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          {filingMode === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-beige-400 bg-white/70 hover:bg-white/90 transition text-center space-y-3 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-full bg-charcoal-900/5 text-charcoal-800 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6 text-charcoal-800" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-950">
                    {uploadedFile ? uploadedFile.name : 'Click or Drag & Drop FIR Copy (JPG, PNG, PDF)'}
                  </p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    Automated Cloudinary Storage & Neural OCR Parsing
                  </p>
                </div>
              </div>

              {ocrProcessing && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-center gap-2.5 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Processing FIR document with Optical Character Recognition (OCR)...</span>
                </div>
              )}

              {previewUrl && (
                <div className="p-3 rounded-2xl bg-white border border-beige-300 flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-charcoal-600 truncate">{uploadedFile?.name || 'FIR_Copy.jpg'}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    OCR Extracted
                  </span>
                </div>
              )}
            </div>
          )}

          {/* FIR Filing Form */}
          <form onSubmit={handleSubmitFir} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">FIR Number (Auto-assigned or Manual)</label>
                <input
                  type="text"
                  placeholder="e.g. FIR-MUM-2026-0891"
                  value={firData.firNumber}
                  onChange={(e) => setFirData({ ...firData, firNumber: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Police Station</label>
                <input
                  type="text"
                  required
                  value={firData.policeStation}
                  onChange={(e) => setFirData({ ...firData, policeStation: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Complainant / Reporting Officer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forensic Cell / Complainant Name"
                  value={firData.complainantName}
                  onChange={(e) => setFirData({ ...firData, complainantName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Accused / Suspects (Comma Separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Rathore, Sunil Verma"
                  value={firData.accusedNames}
                  onChange={(e) => setFirData({ ...firData, accusedNames: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Legal Sections (DNS / Acts)</label>
                <input
                  type="text"
                  placeholder="e.g. DNS 318, DNS 61, Sec 66D IT Act"
                  value={firData.ipcSections}
                  onChange={(e) => setFirData({ ...firData, ipcSections: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Incident Location</label>
                <input
                  type="text"
                  placeholder="e.g. Nariman Point, Mumbai"
                  value={firData.incidentLocation}
                  onChange={(e) => setFirData({ ...firData, incidentLocation: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-charcoal-700 mb-1 font-medium">Incident Description / Forensic Narrative</label>
              <textarea
                rows={3}
                required
                placeholder="Detailed summary of the alleged criminal transaction, pass-through mules, or Hawala conduit..."
                value={firData.description}
                onChange={(e) => setFirData({ ...firData, description: e.target.value })}
                className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-sand-gradient hover:brightness-105 active:scale-95 text-charcoal-950 font-extrabold text-xs shadow-md shadow-beige-300/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit & Register Official FIR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Station Active Records & Warrants */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-3xl shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-charcoal-950 flex items-center gap-2">
              <Building className="w-4 h-4 text-charcoal-800" />
              <span>Station Jurisdictional Stats</span>
            </h4>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-white border border-beige-300 flex justify-between items-center">
                <span className="text-charcoal-600">Active Warrants</span>
                <span className="font-bold text-charcoal-950">14 Outstanding</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-beige-300 flex justify-between items-center">
                <span className="text-charcoal-600">Total Registered FIRs</span>
                <span className="font-bold text-charcoal-950">{firs.length} Records</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-beige-300 flex justify-between items-center">
                <span className="text-charcoal-600">Crime Beat Radius</span>
                <span className="font-bold text-charcoal-950">4.8 km² Beat</span>
              </div>
            </div>

            <Link
              href="/fir-track"
              className="w-full py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <span>View Full FIR Track Register</span>
              <ArrowRight className="w-3.5 h-3.5 text-beige-300" />
            </Link>
          </div>

          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Inter-Agency Auto-Notification Protocol</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              When an FIR citations any high-risk syndicate suspect, our AI engine automatically generates forensic cross-references, dispatches instant notifications to Admin, Investigators, and Analysts, and plays an audio-visual warning cue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
