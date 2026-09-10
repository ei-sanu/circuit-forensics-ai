'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  Briefcase,
  Users,
  CreditCard,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileCode,
  ShieldAlert,
  Lock,
  Stamp,
  ExternalLink,
} from 'lucide-react';
import {
  MASTER_CASES,
  MASTER_ENTITIES,
  MASTER_TRANSACTIONS,
  MASTER_COMMUNICATIONS,
  MASTER_ALERTS,
  CaseRecord,
} from '@/lib/data';
import { downloadElementAsPdf } from '@/lib/pdfExport';

export default function ReportsPage() {
  const [selectedCase, setSelectedCase] = useState('CR-2026-00124');
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeCdr, setIncludeCdr] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [classificationLevel, setClassificationLevel] = useState(
    'CONFIDENTIAL // LAW ENFORCEMENT ONLY'
  );

  // Read caseNumber from URL query params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('caseNumber');
      if (c && MASTER_CASES.some((m) => m.caseNumber === c)) {
        setSelectedCase(c);
      }
    }
  }, []);

  const activeCaseObj = useMemo(() => {
    return (
      MASTER_CASES.find((c) => c.caseNumber === selectedCase) || MASTER_CASES[0]
    );
  }, [selectedCase]);

  const caseTransactions = useMemo(() => {
    return MASTER_TRANSACTIONS.filter((tx) => tx.caseId === selectedCase);
  }, [selectedCase]);

  const caseCommunications = useMemo(() => {
    return MASTER_COMMUNICATIONS.filter((c) => c.caseId === selectedCase);
  }, [selectedCase]);

  const caseAlerts = useMemo(() => {
    return MASTER_ALERTS.filter((a) => a.caseId === selectedCase);
  }, [selectedCase]);

  const caseSuspects = useMemo(() => {
    const suspectIds = activeCaseObj.entityIds || [];
    return MASTER_ENTITIES.filter((e) => suspectIds.includes(e.entityId));
  }, [activeCaseObj]);

  const totalIllicitVolume = useMemo(() => {
    if (caseTransactions.length > 0) {
      return caseTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    }
    return activeCaseObj.totalVolume || 0;
  }, [caseTransactions, activeCaseObj]);

  const handleDownloadReportPdf = async () => {
    setIsExportingPdf(true);
    await downloadElementAsPdf('printable-report-document', `OFFICIAL_REPORT_${activeCaseObj.caseNumber}.pdf`);
    setIsExportingPdf(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      docketNumber: `DGCFI/REPORT/2026/${activeCaseObj.caseNumber}`,
      statutoryMandate: 'Section 176 BNSS 2023 & Section 66 PMLA 2002',
      caseNumber: activeCaseObj.caseNumber,
      title: activeCaseObj.title,
      classification: classificationLevel,
      leadInvestigator: activeCaseObj.leadInvestigator,
      department: activeCaseObj.department,
      region: activeCaseObj.region,
      dateGenerated: new Date().toISOString(),
      statutorySummary: activeCaseObj.description,
      totalVolumeRupees: totalIllicitVolume,
      suspects: caseSuspects,
      transactions: includeFinancials ? caseTransactions : [],
      communications: includeCdr ? caseCommunications : [],
      alerts: includeAnomalies ? caseAlerts : [],
      certification: 'Certified under Section 63 Bharatiya Sakshya Adhiniyam, 2023',
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `OFFICIAL_REPORT_${selectedCase}_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleExportCSV = () => {
    const headers = [
      'Record Type',
      'Identifier',
      'Label/Name',
      'Amount/Value (INR)',
      'Statutory Category / Risk',
      'Timestamp / Date',
      'Evidentiary Custody',
    ];
    const rows: any[] = [];

    caseSuspects.forEach((s) => {
      rows.push([
        'PRIMARY_SUSPECT',
        s.entityId,
        `"${s.label}"`,
        `Score: ${s.influenceScore}/100`,
        s.riskFlag ? 'HIGH_RISK_SYNDICATE' : 'IDENTIFIED_ASSOCIATE',
        activeCaseObj.filedDate,
        'KYC Verified / FIU-IND Flagged',
      ]);
    });

    if (includeFinancials) {
      caseTransactions.forEach((tx) => {
        rows.push([
          'FINANCIAL_TRANSACTION',
          tx.transactionId,
          `"${tx.fromName} -> ${tx.toName}"`,
          `₹${tx.amount.toLocaleString('en-IN')}`,
          tx.riskLevel.toUpperCase(),
          tx.timestamp,
          `Channel: ${tx.channel} | Provisional Freeze Sec 106 BNSS`,
        ]);
      });
    }

    if (includeCdr) {
      caseCommunications.forEach((c) => {
        rows.push([
          'CDR_COMMUNICATION',
          c.commId,
          `"${c.callerName} -> ${c.recipientName}"`,
          `${c.durationSec}s Duration`,
          c.isOddHour ? 'HIGH_ODD_HOURS' : c.riskLevel.toUpperCase(),
          c.timestamp,
          `Tower: ${c.cellTowerId} (${c.city})`,
        ]);
      });
    }

    if (includeAnomalies) {
      caseAlerts.forEach((a) => {
        rows.push([
          'AI_GRAPH_ANOMALY',
          a.alertId,
          `"${a.title.replace(/"/g, '""')}"`,
          `Confidence: ${(a.confidence * 100).toFixed(0)}%`,
          a.severity.toUpperCase(),
          a.createdAt,
          'Circuit Deep Graph Neural Network Node Anomaly',
        ]);
      });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OFFICIAL_REPORT_${selectedCase}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Header Bar - UI Only (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-charcoal-800" />
            <span>Official Case Reports & Evidentiary Records</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Court-admissible special investigation dockets, statutory annexures, financial forensics audits, and verified digital evidence certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
            title="Download Full Ledger as CSV"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
            title="Download Structured Report JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleDownloadReportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
            title="Download Court-Admissible PDF"
          >
            <Download className="w-3.5 h-3.5 text-beige-300" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-800 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Print Court Copy"
          >
            <Printer className="w-3.5 h-3.5 text-charcoal-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Control Panel - UI Only (Hidden during print) */}
      <div className="p-4 rounded-3xl glass-panel space-y-3.5 shadow-md no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Select Case / Investigation File:
            </label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-950 font-bold outline-none shadow-sm cursor-pointer"
            >
              {MASTER_CASES.map((c) => (
                <option key={c.caseNumber} value={c.caseNumber}>
                  {c.caseNumber} • {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Statutory Security Classification:
            </label>
            <select
              value={classificationLevel}
              onChange={(e) => setClassificationLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-950 font-bold outline-none shadow-sm cursor-pointer"
            >
              <option value="CONFIDENTIAL // LAW ENFORCEMENT ONLY">
                CONFIDENTIAL // LAW ENFORCEMENT ONLY
              </option>
              <option value="SECRET // JUDICIAL PROCEEDING (SPECIAL COURT)">
                SECRET // JUDICIAL PROCEEDING (SPECIAL COURT)
              </option>
              <option value="TOP SECRET // MULTI-AGENCY STRIKE COMMAND">
                TOP SECRET // MULTI-AGENCY STRIKE COMMAND
              </option>
              <option value="RESTRICTED // INTER-STATE ENFORCEMENT BRIEF">
                RESTRICTED // INTER-STATE ENFORCEMENT BRIEF
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-charcoal-600 mb-1">
              Include Evidentiary Annexures:
            </label>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFinancials}
                  onChange={(e) => setIncludeFinancials(e.target.checked)}
                  className="rounded text-charcoal-900 cursor-pointer"
                />
                <span>Annexure-B ({caseTransactions.length} Txs)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCdr}
                  onChange={(e) => setIncludeCdr(e.target.checked)}
                  className="rounded text-charcoal-900 cursor-pointer"
                />
                <span>Annexure-C ({caseCommunications.length} CDRs)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnomalies}
                  onChange={(e) => setIncludeAnomalies(e.target.checked)}
                  className="rounded text-charcoal-900 cursor-pointer"
                />
                <span>Annexure-D ({caseAlerts.length} Findings)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC OFFICIAL GOVERNMENT OF INDIA INTELLIGENCE DOSSIER CANVAS        */}
      {/* (Formally structured court-admissible document)                          */}
      {/* ========================================================================= */}
      <div
        id="printable-report-document"
        className="p-8 sm:p-14 bg-white border-2 border-charcoal-900 rounded-2xl shadow-2xl space-y-7 max-w-4xl mx-auto text-charcoal-950 font-serif leading-relaxed relative select-text"
      >
        {/* Official Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
          <div className="text-center -rotate-45">
            <p className="text-7xl sm:text-9xl font-black font-sans uppercase text-charcoal-950 tracking-widest leading-none">
              CONFIDENTIAL
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-sans uppercase text-charcoal-950 tracking-widest mt-2">
              GOVERNMENT OF INDIA • FORENSIC EVIDENCE
            </p>
          </div>
        </div>

        {/* Top Security Header Rule */}
        <div className="border-b-2 border-charcoal-900 pb-3 text-center space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-black tracking-widest text-red-700 uppercase">
            <span>[STRICTLY RESTRICTED]</span>
            <span className="bg-red-700 text-white px-2.5 py-0.5 rounded-sm">
              {classificationLevel}
            </span>
            <span>[OFFICIAL SECRETS ACT, 1923]</span>
          </div>
          <p className="text-[9px] font-mono text-charcoal-500 uppercase tracking-tight">
            DISCLOSURE, DISSEMINATION OR COPYING STRICTLY PROHIBITED EXCEPT UNDER STATUTORY JUDICIAL MANDATE
          </p>
        </div>

        {/* National Emblem & Government Department Header */}
        <div className="text-center space-y-1 pt-1">
          {/* Ashoka Lion Capital SVG Insignia */}
          <div className="mx-auto w-14 h-14 mb-1.5 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-14 h-14 text-charcoal-950 fill-current">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M38 38 L62 62 M38 62 L62 38" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="4" fill="currentColor" />
            </svg>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-charcoal-800 font-sans uppercase">
            सत्यमेव जयते • SATYAMEVA JAYATE
          </p>
          <h1 className="text-base sm:text-lg font-black tracking-wide font-serif uppercase">
            भारत सरकार / GOVERNMENT OF INDIA
          </h1>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider font-sans text-charcoal-800 uppercase">
            गृह मंत्रालय / MINISTRY OF HOME AFFAIRS
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold tracking-wide font-mono text-charcoal-950 uppercase">
            वित्तीय आसूचना एवं अपराध अन्वेषण महानिदेशालय
          </h3>
          <p className="text-[11px] font-sans font-bold uppercase tracking-tight text-charcoal-700">
            DIRECTORATE GENERAL OF CRIME & FINANCIAL INTELLIGENCE (DGCFI)
          </p>
          <p className="text-[10px] font-mono text-charcoal-500">
            CENTRAL FORENSICS, CYBER CRIME & MULTI-AGENCY COORDINATION CELL • NEW DELHI — 110001
          </p>
        </div>

        {/* Formal Document Title Banner */}
        <div className="bg-neutral-100 border-y-2 border-charcoal-900 py-2.5 px-4 text-center">
          <h2 className="text-sm sm:text-base font-black tracking-wide uppercase font-serif text-charcoal-950">
            SPECIAL CRIME INVESTIGATION & FORENSIC INTELLIGENCE REPORT
          </h2>
          <p className="text-[10px] font-mono font-bold text-charcoal-700 mt-0.5">
            DOCKET REF NO: DGCFI/ND/2026/{activeCaseObj.caseNumber} • COURT EXHIBIT SPECIFICATION
          </p>
        </div>

        {/* Master Case Metadata Table */}
        <div className="border border-charcoal-900 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 bg-neutral-50/70">
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Case File No.</span>
              <span className="font-mono font-black text-charcoal-950 text-[12px]">{activeCaseObj.caseNumber}</span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Registration Date</span>
              <span className="font-mono font-bold text-charcoal-950 text-[11px]">{activeCaseObj.filedDate}</span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Investigation Priority</span>
              <span className="font-mono font-extrabold uppercase text-[11px] text-red-700">
                {activeCaseObj.priority} PRIORITY
              </span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Current Status</span>
              <span className="font-mono font-extrabold uppercase text-[11px] text-emerald-800">
                {activeCaseObj.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 border-t border-charcoal-900 p-0">
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Lead Investigating Officer</span>
              <span className="font-bold text-charcoal-950 text-[11px]">{activeCaseObj.leadInvestigator}</span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Enforcement Wing / Department</span>
              <span className="font-bold text-charcoal-900 text-[11px]">{activeCaseObj.department}</span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Jurisdictional Region</span>
              <span className="font-bold text-charcoal-900 text-[11px]">{activeCaseObj.region}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-charcoal-900 border-t border-charcoal-900 bg-neutral-50/50 p-0">
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Statutory Mandate</span>
              <span className="font-mono text-[10px] text-charcoal-900 font-semibold">
                Sec 176 BNSS 2023 • Sec 66 PMLA 2002 • Sec 79A Information Technology Act 2000
              </span>
            </div>
            <div className="p-2.5">
              <span className="text-[9px] font-mono uppercase font-bold text-charcoal-600 block">Audited Illicit Volume</span>
              <span className="font-mono font-black text-emerald-800 text-[12px]">
                ₹{totalIllicitVolume.toLocaleString('en-IN')} (Estimated Proceeds of Crime)
              </span>
            </div>
          </div>
        </div>

        {/* PART I: Executive Summary & Predicate Offence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-charcoal-900 pb-1">
            <h3 className="text-xs font-mono uppercase font-black text-charcoal-950 tracking-wider">
              PART I: STATUTORY OPERATIONAL SUMMARY & PREDICATE CHARGES
            </h3>
            <span className="text-[10px] font-mono text-charcoal-500">Exhibit Index: EX-01</span>
          </div>
          <div className="p-3 bg-neutral-50/70 border border-charcoal-300 rounded text-xs text-charcoal-900 leading-relaxed text-justify font-sans">
            <p className="font-bold text-charcoal-950 mb-1">
              Matter: {activeCaseObj.title}
            </p>
            <p>
              {activeCaseObj.description}
            </p>
            <p className="mt-2 text-[11px] text-charcoal-700 italic">
              Predicated upon inter-agency financial disclosures, suspicious transaction reports (STRs) transmitted under Section 12 PMLA, 
              and verified telecommunications surveillance authorized by the Competent Authority under Section 5(2) of the Indian Telegraph Act, 1885.
            </p>
          </div>
        </div>

        {/* PART II (ANNEXURE-A): Primary Syndicate Targets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-charcoal-900 pb-1">
            <h3 className="text-xs font-mono uppercase font-black text-charcoal-950 tracking-wider">
              PART II (ANNEXURE-A): CHARGE-SHEETED PRIMARY TARGETS & SHELL DIRECTORS
            </h3>
            <span className="text-[10px] font-mono text-charcoal-500">
              Total Entities Identified: {caseSuspects.length}
            </span>
          </div>
          <div className="border border-charcoal-900 rounded overflow-hidden text-xs font-sans">
            <table className="w-full text-left">
              <thead className="bg-neutral-100 font-mono font-bold text-[9px] text-charcoal-700 uppercase border-b border-charcoal-900">
                <tr>
                  <th className="p-2 border-r border-charcoal-300">Target ID</th>
                  <th className="p-2 border-r border-charcoal-300">Legal Name & Aliases</th>
                  <th className="p-2 border-r border-charcoal-300">Syndicate Function</th>
                  <th className="p-2 border-r border-charcoal-300">PAN / KYC Identifiers</th>
                  <th className="p-2 border-r border-charcoal-300">Influence Score</th>
                  <th className="p-2">Statutory Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-200">
                {caseSuspects.map((s, idx) => (
                  <tr key={s.entityId} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                    <td className="p-2 font-mono font-bold text-charcoal-950 border-r border-charcoal-200">
                      {s.entityId}
                    </td>
                    <td className="p-2 font-bold text-charcoal-950 border-r border-charcoal-200">
                      <div>{s.label}</div>
                      {s.aliases && s.aliases.length > 0 && (
                        <div className="text-[10px] font-normal text-charcoal-500 italic">
                          aka {s.aliases.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-charcoal-800 border-r border-charcoal-200">
                      {s.properties?.designation || s.type}
                    </td>
                    <td className="p-2 font-mono text-[10px] text-charcoal-700 border-r border-charcoal-200">
                      {s.properties?.pan || s.properties?.aadhaar || 'CONFIDENTIAL KYC ATTACHED'}
                    </td>
                    <td className="p-2 font-mono font-extrabold text-charcoal-900 border-r border-charcoal-200">
                      <span className={s.influenceScore > 80 ? 'text-red-700' : 'text-amber-800'}>
                        {s.influenceScore || 75}/100
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold text-[10px] uppercase">
                      {s.riskFlag ? (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          RED FLAGGED
                        </span>
                      ) : (
                        <span className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                          MONITORED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PART III (ANNEXURE-B): Mapped Forensic Financial Transactions */}
        {includeFinancials && caseTransactions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-charcoal-900 pb-1">
              <h3 className="text-xs font-mono uppercase font-black text-charcoal-950 tracking-wider">
                PART III (ANNEXURE-B): FORENSIC AUDIT OF FINANCIAL TRANSACTIONS & PROCEEDS OF CRIME
              </h3>
              <span className="text-[10px] font-mono text-charcoal-500">
                Audited Transactions: {caseTransactions.length}
              </span>
            </div>
            <div className="border border-charcoal-900 rounded overflow-hidden text-xs font-sans">
              <table className="w-full text-left">
                <thead className="bg-neutral-100 font-mono font-bold text-[9px] text-charcoal-700 uppercase border-b border-charcoal-900">
                  <tr>
                    <th className="p-2 border-r border-charcoal-300">Transaction ID / UTR</th>
                    <th className="p-2 border-r border-charcoal-300">Originating Entity</th>
                    <th className="p-2 border-r border-charcoal-300">Beneficiary Conduit</th>
                    <th className="p-2 border-r border-charcoal-300">Amount (INR)</th>
                    <th className="p-2 border-r border-charcoal-300">Banking Channel</th>
                    <th className="p-2">Sec 106 BNSS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-200">
                  {caseTransactions.map((tx, idx) => (
                    <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="p-2 font-mono font-bold text-charcoal-950 border-r border-charcoal-200">
                        {tx.transactionId}
                      </td>
                      <td className="p-2 font-medium border-r border-charcoal-200">{tx.fromName}</td>
                      <td className="p-2 font-medium border-r border-charcoal-200">{tx.toName}</td>
                      <td className="p-2 font-mono font-bold text-emerald-800 border-r border-charcoal-200">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 font-mono text-[10px] uppercase text-charcoal-700 border-r border-charcoal-200">
                        {tx.channel.replace('_', ' ')}
                      </td>
                      <td className="p-2 font-mono font-bold text-[10px]">
                        <span className="text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                          PROVISIONALLY FROZEN
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PART IV (ANNEXURE-C): Telecommunications & CDR Forensics */}
        {includeCdr && caseCommunications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-charcoal-900 pb-1">
              <h3 className="text-xs font-mono uppercase font-black text-charcoal-950 tracking-wider">
                PART IV (ANNEXURE-C): TELECOMMUNICATIONS INTERCEPT & CELL TOWER FORENSICS
              </h3>
              <span className="text-[10px] font-mono text-charcoal-500">
                Logged Sessions: {caseCommunications.length}
              </span>
            </div>
            <div className="border border-charcoal-900 rounded overflow-hidden text-xs font-sans">
              <table className="w-full text-left">
                <thead className="bg-neutral-100 font-mono font-bold text-[9px] text-charcoal-700 uppercase border-b border-charcoal-900">
                  <tr>
                    <th className="p-2 border-r border-charcoal-300">Intercept ID</th>
                    <th className="p-2 border-r border-charcoal-300">Transmitting Subscriber</th>
                    <th className="p-2 border-r border-charcoal-300">Receiving Target</th>
                    <th className="p-2 border-r border-charcoal-300">Duration</th>
                    <th className="p-2 border-r border-charcoal-300">BTS Tower Location</th>
                    <th className="p-2">Surveillance Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-200">
                  {caseCommunications.map((comm, idx) => (
                    <tr key={comm.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="p-2 font-mono font-bold text-charcoal-950 border-r border-charcoal-200">
                        {comm.commId}
                      </td>
                      <td className="p-2 font-medium border-r border-charcoal-200">{comm.callerName}</td>
                      <td className="p-2 font-medium border-r border-charcoal-200">{comm.recipientName}</td>
                      <td className="p-2 font-mono border-r border-charcoal-200">{comm.durationSec}s</td>
                      <td className="p-2 text-charcoal-700 border-r border-charcoal-200">
                        {comm.cellTowerId} ({comm.city})
                      </td>
                      <td className="p-2 font-mono font-bold text-[10px]">
                        {comm.isOddHour ? (
                          <span className="text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                            ODD HOURS (00-05 AM)
                          </span>
                        ) : (
                          <span className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">
                            STANDARD INTERCEPT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PART V (ANNEXURE-D): AI Graph Anomaly Findings */}
        {includeAnomalies && caseAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-charcoal-900 pb-1">
              <h3 className="text-xs font-mono uppercase font-black text-charcoal-950 tracking-wider">
                PART V (ANNEXURE-D): AI GRAPH TOPOLOGICAL ANOMALIES & FORENSIC FINDINGS
              </h3>
              <span className="text-[10px] font-mono text-charcoal-500">
                Algorithm: Circuit Deep Graph Neural Network
              </span>
            </div>
            <div className="border border-charcoal-900 rounded divide-y divide-charcoal-300 font-sans text-xs">
              {caseAlerts.map((al) => (
                <div key={al.alertId} className="p-3 space-y-1 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal-950 text-[11px]">{al.title}</span>
                    <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                      {al.severity} SEVERITY • {(al.confidence * 100).toFixed(0)}% CONFIDENCE
                    </span>
                  </div>
                  <p className="text-charcoal-700 leading-relaxed text-[11px]">
                    {al.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PART VI: Statutory Restraint Directive */}
        <div className="space-y-1.5 p-3.5 bg-neutral-100 border border-charcoal-900 rounded font-sans text-xs">
          <h4 className="font-mono font-black uppercase text-[10px] text-charcoal-900 tracking-wider">
            PART VI: STATUTORY PROVISIONAL RESTRAINT & ATTACHMENT ORDER
          </h4>
          <p className="text-charcoal-800 text-[11px] leading-relaxed">
            Pursuant to Section 106 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (read with Section 102 Cr.P.C.) and Section 17 of the Prevention of Money Laundering Act, 2002, all referenced bank accounts, transit vehicles, and digital crypto assets identified under Annexures B & C are hereby placed under provisional judicial restraint. Financial intermediaries shall freeze all debit facilities forthwith.
          </p>
        </div>

        {/* PART VII: Formal Evidentiary Certificate under Section 63 BSA 2023 */}
        <div className="space-y-2 p-3.5 border border-charcoal-900 rounded bg-white font-sans text-xs">
          <h4 className="font-mono font-black uppercase text-[10px] text-charcoal-900 tracking-wider">
            PART VII: CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023
          </h4>
          <p className="text-charcoal-700 text-[10px] leading-relaxed italic">
            "I hereby solemnly declare and certify that the digital intelligence data, call detail records, banking logs, and topological graphs incorporated within this Investigation Report were generated and maintained under continuous lawful custody on secure, tamper-evident forensic nodes. The electronic evidence conforms strictly to the requirements of Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA) and is admissible in all judicial proceedings."
          </p>
        </div>

        {/* Official Endorsements, Rubber Stamps & Signatures */}
        <div className="pt-4 border-t-2 border-charcoal-900 font-sans text-xs">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Investigating Officer Signature */}
            <div className="text-center space-y-1">
              <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                <span className="font-serif italic font-bold text-sm text-charcoal-900">
                  {activeCaseObj.leadInvestigator}
                </span>
              </div>
              <p className="font-mono font-bold text-[10px] text-charcoal-950 uppercase">
                Investigating Officer / Compiler
              </p>
              <p className="text-[9px] font-mono text-charcoal-500">
                Badge #{activeCaseObj.caseNumber.replace('CR-', 'DGCFI-')}
              </p>
            </div>

            {/* Official Government Rubber Seal Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-700 text-red-800 flex flex-col items-center justify-center p-1 text-center rotate-[-4deg] shadow-sm bg-red-50/40">
                <span className="text-[7px] font-black uppercase tracking-tight">★ GOVT OF INDIA ★</span>
                <span className="text-[8px] font-extrabold uppercase leading-tight">DGCFI FORENSICS</span>
                <span className="text-[7px] font-mono font-bold">OFFICIAL SEAL</span>
                <span className="text-[7px] font-bold uppercase">NEW DELHI</span>
              </div>
              <span className="text-[8px] font-mono text-charcoal-500 mt-1">Certified Official Seal</span>
            </div>

            {/* Supervisory Authority Endorsement */}
            <div className="text-center space-y-1">
              <div className="h-10 border-b border-charcoal-400 border-dashed flex items-end justify-center pb-1">
                <span className="font-serif italic font-bold text-sm text-charcoal-900">
                  Dr. R. K. Mathur, IPS
                </span>
              </div>
              <p className="font-mono font-bold text-[10px] text-charcoal-950 uppercase">
                Special Director of Operations
              </p>
              <p className="text-[9px] font-mono text-charcoal-500">
                Directorate General of Crime Intelligence
              </p>
            </div>
          </div>

          {/* Verification Barcode & Verification Hash */}
          <div className="mt-5 pt-3 border-t border-charcoal-300 flex flex-col sm:flex-row items-center justify-between text-[9px] text-charcoal-500 font-mono">
            <span>DOCKET DISPATCH REGISTRY: SEC-MHA-DGCFI-2026</span>
            <span>EVIDENTIARY HASH: SHA-256: 7f8a92b0c41e8d77a23c</span>
            <span>PAGE 1 OF 1 • END OF OFFICIAL REPORT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
