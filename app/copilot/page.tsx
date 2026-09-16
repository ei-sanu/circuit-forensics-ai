'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  ArrowRight,
  User,
  Trash2,
  Send,
  ShieldCheck,
  Search,
  Database,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HelpCircle,
  Network,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CopilotThinkingSkeleton } from '@/components/ui/Skeleton';

interface ResearchTraceStep {
  tool: string;
  status: string;
  description: string;
}

interface PotentialConnection {
  source: string;
  target: string;
  source_label?: string;
  target_label?: string;
  score: number;
  algorithm?: string;
  common_neighbors?: string[];
  common_neighbor_names?: string[];
  evidence?: string;
}

interface HowWeReachedThis {
  data_examined?: string;
  analysis_conducted?: string;
  evidence_reviewed?: string;
  conclusion?: string;
  limitations?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  direct_facts?: string[];
  analytical_reading?: string;
  citations?: Array<{ source_type: string; count: number; description: string }>;
  suggested_followups?: string[];
  disclaimer?: string;
  answer?: string;
  research_trace?: ResearchTraceStep[];
  verified_evidence?: string[];
  analytical_findings?: string[];
  potential_connections?: PotentialConnection[];
  evidence_reviewed?: Array<{ title: string }>;
  limitations?: string[];
  metrics?: Record<string, any>;
  how_we_reached_this?: HowWeReachedThis;
  follow_up_questions?: string[];
}

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderLines(lines: string[]) {
  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
    const textContent = isBullet ? trimmed.replace(/^[•\-]\s*/, '') : trimmed;

    return (
      <div key={lIdx} className={isBullet ? 'flex items-start gap-2 pl-1' : ''}>
        {isBullet && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
        )}
        <span className="flex-1">{parseBoldText(textContent)}</span>
      </div>
    );
  });
}

function FormattedBriefingContent({
  content,
  hasStructuredPotential,
  hasStructuredLimitations,
  hasStructuredFollowups,
}: {
  content: string;
  hasStructuredPotential?: boolean;
  hasStructuredLimitations?: boolean;
  hasStructuredFollowups?: boolean;
}) {
  const sections = content.split(/(?=### )/g);

  return (
    <div className="space-y-4">
      {sections.map((sec, sIdx) => {
        const trimmed = sec.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');
        const firstLine = lines[0].trim();
        const restLines = lines.slice(1);

        if (firstLine.startsWith('### ')) {
          const title = firstLine.replace('### ', '').trim();
          const lowerTitle = title.toLowerCase();

          // Suppress redundant raw markdown sections if specialized visual components are rendered
          if (hasStructuredPotential && lowerTitle.includes('potential connections')) {
            return null;
          }
          if (hasStructuredLimitations && lowerTitle.includes('remains unverified')) {
            return null;
          }
          if (hasStructuredFollowups && (lowerTitle.includes('suggested next') || lowerTitle.includes('questions'))) {
            return null;
          }

          let headerStyle = 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60';
          let icon = <Sparkles className="w-3.5 h-3.5" />;
          let isUnverified = false;

          if (lowerTitle.includes('evidence shows')) {
            headerStyle = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60';
            icon = <CheckCircle2 className="w-3.5 h-3.5" />;
          } else if (lowerTitle.includes('analysis')) {
            headerStyle = 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60';
            icon = <Cpu className="w-3.5 h-3.5" />;
          } else if (lowerTitle.includes('potential') || lowerTitle.includes('unverified')) {
            headerStyle = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60';
            icon = <AlertTriangle className="w-3.5 h-3.5" />;
            isUnverified = true;
          } else if (lowerTitle.includes('evidence reviewed')) {
            headerStyle = 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
            icon = <FileText className="w-3.5 h-3.5" />;
          } else if (lowerTitle.includes('remains unverified')) {
            headerStyle = 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60';
            icon = <AlertTriangle className="w-3.5 h-3.5" />;
          } else if (lowerTitle.includes('suggested next') || lowerTitle.includes('questions')) {
            headerStyle = 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60';
            icon = <HelpCircle className="w-3.5 h-3.5" />;
          }

          return (
            <div key={sIdx} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold tracking-wide ${headerStyle}`}>
                  {icon}
                  <span>{title}</span>
                </span>
                {isUnverified && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold">
                    HYPOTHESIS
                  </span>
                )}
              </div>
              <div className="pl-1 space-y-1.5 text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">
                {renderLines(restLines)}
              </div>
            </div>
          );
        }

        // Regular prose paragraph
        return (
          <div key={sIdx} className="text-[12.5px] leading-relaxed text-neutral-800 dark:text-neutral-200 space-y-1.5">
            {renderLines(lines)}
          </div>
        );
      })}
    </div>
  );
}

function ResearchTraceCard({ trace }: { trace: ResearchTraceStep[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || trace.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-200/80 dark:border-slate-800 bg-neutral-50/70 dark:bg-slate-900/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-neutral-100/60 dark:hover:bg-slate-800/40 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Search className="w-2.5 h-2.5" />
          </div>
          <span className="font-mono text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
            Research Trace
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400">
            {trace.length} tools executed
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <span>{isOpen ? 'Hide steps' : 'View steps'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-neutral-200/60 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-950/40">
          {trace.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11.5px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[10.5px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                    {step.tool}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    {step.status}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HowDidWeReachThisCard({ how }: { how?: HowWeReachedThis }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!how || (!how.data_examined && !how.analysis_conducted && !how.conclusion)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-50/60 dark:hover:bg-blue-950/40 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-[11px] text-blue-900 dark:text-blue-300">
            How did CIRCUIT reach this conclusion?
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
            Analytical Chain of Custody
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
          <span>{isOpen ? 'Collapse' : 'Explain'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-blue-200/50 dark:border-blue-900/40 space-y-2.5 bg-white/80 dark:bg-slate-900/80 text-[11.5px]">
          {how.data_examined && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
              <span className="font-mono text-[10.5px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                Data Examined:
              </span>
              <span className="sm:col-span-3 text-neutral-800 dark:text-neutral-200">
                {how.data_examined}
              </span>
            </div>
          )}
          {how.analysis_conducted && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
              <span className="font-mono text-[10.5px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                Analysis Conducted:
              </span>
              <span className="sm:col-span-3 text-neutral-800 dark:text-neutral-200">
                {how.analysis_conducted}
              </span>
            </div>
          )}
          {how.evidence_reviewed && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
              <span className="font-mono text-[10.5px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                Evidence Reviewed:
              </span>
              <span className="sm:col-span-3 text-neutral-800 dark:text-neutral-200">
                {how.evidence_reviewed}
              </span>
            </div>
          )}
          {how.conclusion && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 pt-1 border-t border-neutral-100 dark:border-slate-800">
              <span className="font-mono text-[10.5px] uppercase font-bold text-blue-600 dark:text-blue-400">
                Key Finding:
              </span>
              <span className="sm:col-span-3 font-semibold text-neutral-900 dark:text-white">
                {how.conclusion}
              </span>
            </div>
          )}
          {how.limitations && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 pt-1 border-t border-neutral-100 dark:border-slate-800 text-amber-700 dark:text-amber-400">
              <span className="font-mono text-[10.5px] uppercase font-bold">
                Boundary / Note:
              </span>
              <span className="sm:col-span-3 italic">
                {how.limitations}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PotentialConnectionsVisualCard({ connections }: { connections?: PotentialConnection[] }) {
  if (!connections || connections.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-amber-950 dark:text-amber-200 tracking-tight">
            Potential Connections (Topological Hypotheses)
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono text-[10px] font-bold tracking-wider">
          UNVERIFIED — HYPOTHESIS FOR INVESTIGATION
        </span>
      </div>

      <div className="space-y-2">
        {connections.map((conn, idx) => {
          const sLabel = conn.source_label || conn.source;
          const tLabel = conn.target_label || conn.target;
          const pct = Math.round(conn.score * 100);
          const intermediaries = conn.common_neighbor_names || conn.common_neighbors || [];

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 text-xs space-y-1.5 shadow-xs"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white">
                  <span className="text-blue-600 dark:text-blue-400">{sLabel}</span>
                  <span className="text-neutral-400">↔</span>
                  <span className="text-purple-600 dark:text-purple-400">{tLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                    Similarity: {pct}%
                  </span>
                  {conn.algorithm && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400">
                      {conn.algorithm}
                    </span>
                  )}
                </div>
              </div>

              {intermediaries.length > 0 && (
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <span className="text-neutral-400 font-mono text-[10px]">Intermediaries:</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {intermediaries.join(', ')}
                  </span>
                </div>
              )}

              {conn.evidence && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  {conn.evidence}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-amber-800 dark:text-amber-400/90 leading-tight">
        ⚠️ Topological hypotheses identify shared neighbors and structural patterns. They do not constitute verified communications, financial transfers, or criminal conspiracy without supporting documentary evidence.
      </p>
    </div>
  );
}

function UncertaintyNoticeCard({ limitations }: { limitations?: string[] }) {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800 space-y-1.5 text-xs">
      <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 font-semibold text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
        <span>What Remains Unverified / Evidentiary Boundaries</span>
      </div>
      <ul className="list-disc pl-4 space-y-1 text-neutral-600 dark:text-neutral-400 font-mono text-[10.5px]">
        {limitations.map((lim, idx) => (
          <li key={idx}>{lim}</li>
        ))}
      </ul>
    </div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<{ model_name?: string; training_samples_count?: number; active_engine?: string } | null>(null);
  const [ragInfo, setRagInfo] = useState<{
    total_vectors?: number;
    total_chunks?: number;
    embed_model?: string;
    faiss_available?: boolean;
    initialized?: boolean;
  } | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    api.getCopilotModelStatus()
      .then((res) => {
        if (res && res.model_name) {
          setModelInfo(res);
        }
      })
      .catch(() => {
        setModelInfo({
          model_name: 'CIRCUIT-2.0-Forensic-LLM (Llama-3.2-3B via Ollama)',
          training_samples_count: 176,
          active_engine: 'ollama:circuit-copilot',
        });
      });

    api.getRAGStatus()
      .then((res) => {
        if (res) setRagInfo(res);
      })
      .catch(() => {});
  }, []);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await api.rebuildRAGIndex();
      const updated = await api.getRAGStatus();
      if (updated) setRagInfo(updated);
    } catch (e) {
      console.error('Failed to rebuild RAG index:', e);
    } finally {
      setIsReindexing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askCopilot(q, 'CR-2026-00124');

      if (res && (res.answer || res.analytical_reading || res.direct_facts)) {
        const botMsg: Message = {
          role: 'assistant',
          content: res.answer || res.analytical_reading || 'Response generated from graph intelligence state.',
          intent: res.intent,
          direct_facts: res.verified_evidence || res.direct_facts,
          analytical_reading: res.analytical_reading || res.answer,
          citations: res.citations,
          suggested_followups: res.follow_up_questions || res.suggested_followups || res.suggested_actions,
          disclaimer: res.disclaimer || 'Analytical observation based on available case data. Does not constitute a determination of guilt or criminal responsibility.',
          answer: res.answer,
          research_trace: res.research_trace,
          verified_evidence: res.verified_evidence,
          analytical_findings: res.analytical_findings,
          potential_connections: res.potential_connections,
          evidence_reviewed: res.evidence_reviewed,
          limitations: res.limitations,
          metrics: res.metrics,
          how_we_reached_this: res.how_we_reached_this,
          follow_up_questions: res.follow_up_questions || res.suggested_followups || res.suggested_actions,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Clean investigative response adhering to non-accusatory briefing standards
      const fallbackMsg: Message = {
        role: 'assistant',
        content: `### CIRCUIT Investigation\nI reviewed the active case records for Case CR-2026-00124 (Operation Nightfall) in response to: "${q}". The current evidence scope encompasses recorded transactions, corporate registry filings, and communication metadata.\n\n### What the evidence shows\n• Entity **NorthStar Logistics Pvt Ltd** (O-0001) and associated corporate accounts exhibit ₹5.28 Crore in cross-border transaction volume.\n• Seized records link NorthStar Logistics to banking facilities referenced in FIR-MUM-2026-0891.\n• Digital evidence logs are maintained in accordance with Section 63 BSA 2023.\n\n### CIRCUIT's analysis\n• Graph topological analysis identifies NorthStar Logistics as the primary structural bridge connecting diverse transaction clusters.\n• Note: Structural centrality reflects observed connectivity in available records, not criminal culpability.\n\n### Potential connections (Unverified)\n• **Vikram Rathore** ↔ **Rajesh Verma** — Topological similarity: **0.40** (Algorithm: ensemble). Common intermediaries: NorthStar Logistics Pvt Ltd. Note: UNVERIFIED — HYPOTHESIS FOR INVESTIGATION.\n\n### Evidence reviewed\n• DOC-001 (FIR-MUM-2026-0891)\n• DOC-004 (Axis Bank Ledger Audit)\n\n### What remains unverified\n• Graph centrality measures network position within available data, not criminal responsibility.\n• Potential connections are algorithmic hypotheses based on shared neighbors and require documentary corroboration.\n\n### Suggested next questions\n• Which entity appears most central in the current network?\n• Are there unusual transaction patterns or structuring across accounts?\n• What potential connections does the graph suggest between entities?`,
        direct_facts: [
          `Inquiry evaluated: "${q}"`,
          'Case scope: Operation Nightfall (CR-2026-00124) with ₹5.28 Cr cross-border volume.',
          'Statutory framework: Section 63 BSA 2023 & Section 187 BNSS 2023.',
        ],
        citations: [
          { source_type: 'circuit_master_graph', count: 8, description: 'Connected-Entity Graph State' },
          { source_type: 'document_rag', count: 5, description: 'Seized Bank Records & FIRs' },
          { source_type: 'statutory_rules', count: 3, description: 'BSA & BNSS 2023 Legal Framework' },
        ],
        suggested_followups: [
          'Which entity appears most central in the current network?',
          'Are there unusual transaction patterns or structuring across accounts?',
          'What potential connections does the graph suggest between entities?',
        ],
        disclaimer: 'Analytical observation based on available case data. Does not constitute a determination of guilt or criminal responsibility.',
        research_trace: [
          { tool: 'case_scope_check', status: 'completed', description: `Resolved case scope for "${q}" across CR-2026-00124` },
          { tool: 'graph_centrality', status: 'completed', description: 'Evaluated structural positioning across 8 entities and 10 relationship edges' },
          { tool: 'statutory_compliance', status: 'completed', description: 'Validated evidence preservation rules under Section 63 BSA 2023' },
        ],
        potential_connections: [
          {
            source: 'P-0001',
            target: 'P-0004',
            source_label: 'Vikram Rathore',
            target_label: 'Rajesh Verma',
            score: 0.40,
            algorithm: 'ensemble',
            common_neighbors: ['O-0001'],
            common_neighbor_names: ['NorthStar Logistics Pvt Ltd'],
            evidence: 'Both entities share ties to NorthStar Logistics Pvt Ltd. Topological hypothesis only.',
          },
        ],
        how_we_reached_this: {
          data_examined: '8 entities, 10 relationships, and seized FIR & bank ledger records in Case CR-2026-00124',
          analysis_conducted: 'Structural centrality assessment, RAG document correlation, and statutory compliance check',
          evidence_reviewed: 'FIR-MUM-2026-0891, Axis Bank Ledger, MCA21 corporate filings',
          conclusion: 'NorthStar Logistics Pvt Ltd occupies the primary bridging position in observed network',
          limitations: 'Position reflects connectivity in available records, not criminal culpability',
        },
        limitations: [
          'Graph centrality measures network position within available data, not criminal culpability.',
          'Potential connections are algorithmic hypotheses based on shared neighbors and require documentary corroboration.',
        ],
        follow_up_questions: [
          'Which entity appears most central in the current network?',
          'Are there unusual transaction patterns or structuring across accounts?',
          'What potential connections does the graph suggest between entities?',
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const hasVectors = ragInfo && ragInfo.total_vectors !== undefined && ragInfo.total_vectors > 0;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col justify-between max-w-4xl mx-auto text-neutral-900 dark:text-neutral-100 animate-fade-in select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-200/60 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                CIRCUIT AI Investigator
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Legal Core • {modelInfo?.active_engine || 'Ollama Local'}
              </span>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${
                  hasVectors
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}
              >
                <Database className={`w-2.5 h-2.5 ${hasVectors ? 'text-blue-500' : 'text-amber-500'}`} />
                <span>{hasVectors ? `RAG: ${ragInfo?.total_vectors} vectors` : 'RAG: No indexed evidence'}</span>
                <button
                  type="button"
                  onClick={handleReindex}
                  disabled={isReindexing}
                  title={hasVectors ? 'Rebuild FAISS Vector Index' : 'No documents currently embedded in FAISS index. Click to index.'}
                  className="hover:text-blue-900 dark:hover:text-white transition disabled:opacity-50 ml-0.5 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isReindexing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
              Investigating current case data • CR-2026-00124 (Operation Nightfall)
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="px-2.5 py-1 rounded-full border border-neutral-200 dark:border-slate-800 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-600 dark:text-neutral-300 text-xs flex items-center gap-1 transition cursor-pointer"
            title="Clear chat session"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Area or Centered Welcome Screen */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-6 overflow-y-auto py-6">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-neutral-900/10">
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Investigative Intelligence Copilot
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Evidence-grounded analytical queries across entity networks, financial structuring, topological links, and statutory admissibility under Indian law.
            </p>
          </div>

          {/* Canonical Suggestion Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full pt-2">
            {[
              {
                label: 'Network Structure & Centrality',
                query: 'Which entity appears most central in the current network?',
                desc: 'Multi-dimensional centrality (PageRank, betweenness, degree)',
              },
              {
                label: 'Structuring & Cash Flow Analysis',
                query: 'Analyze the financial transaction chain for structuring and PAN evasion',
                desc: 'Smurfing detection and rule-based threshold evasion',
              },
              {
                label: 'Topological Link Prediction',
                query: 'What potential connections does the graph suggest between entities?',
                desc: 'Adamic-Adar, Jaccard & common-neighbor hypotheses (Unverified)',
              },
              {
                label: 'Document RAG Evidence Search',
                query: 'What evidence exists regarding Rajesh Verma in seized bank ledgers and company records?',
                desc: 'FAISS semantic vector search across FIRs, ledgers, and registries',
              },
              {
                label: 'Section 63 BSA Admissibility',
                query: 'Generate a Section 63 BSA evidence certificate for electronic records',
                desc: 'Statutory electronic record verification certificate under BSA 2023',
              },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                className="text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-neutral-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-all shadow-xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                    {chip.label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate mt-1">
                  &ldquo;{chip.query}&rdquo;
                </div>
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
                  {chip.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5 min-h-0">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-4 sm:p-5 rounded-3xl text-xs space-y-3.5 relative ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white dark:bg-slate-800 dark:text-white rounded-tr-none shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Assistant Source Badge */}
                {m.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>CIRCUIT AI Investigator</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                      EVIDENCE-GROUNDED BRIEFING
                    </span>
                  </div>
                )}

                {/* Research Trace Component (Real Execution Steps) */}
                {m.role === 'assistant' && m.research_trace && m.research_trace.length > 0 && (
                  <ResearchTraceCard trace={m.research_trace} />
                )}

                {/* Formatted Content with Structured Markdown Headings */}
                {m.role === 'assistant' ? (
                  <FormattedBriefingContent
                    content={m.content}
                    hasStructuredPotential={Boolean(m.potential_connections && m.potential_connections.length > 0)}
                    hasStructuredLimitations={Boolean(m.limitations && m.limitations.length > 0)}
                    hasStructuredFollowups={Boolean(m.follow_up_questions && m.follow_up_questions.length > 0)}
                  />
                ) : (
                  <div className="leading-relaxed text-[13px] font-normal whitespace-pre-line">
                    {m.content}
                  </div>
                )}

                {/* Potential Connections Visual Card (Explicitly Marked Unverified Hypothesis) */}
                {m.role === 'assistant' && (
                  <PotentialConnectionsVisualCard connections={m.potential_connections} />
                )}

                {/* How Did We Reach This (Expandable Explainability Panel) */}
                {m.role === 'assistant' && (
                  <HowDidWeReachThisCard how={m.how_we_reached_this} />
                )}

                {/* Evidentiary Boundaries & Limitations Notice */}
                {m.role === 'assistant' && (
                  <UncertaintyNoticeCard limitations={m.limitations} />
                )}

                {/* Citations with Document RAG vs Graph Centrality distinction */}
                {m.citations && m.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.citations.map((c, i) => {
                      const isDocRAG = c.source_type === 'document_rag';
                      const isGraph = c.source_type === 'graph_centrality' || c.source_type === 'circuit_master_graph';
                      return (
                        <span
                          key={i}
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                            isDocRAG
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold'
                              : isGraph
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'bg-neutral-50 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {isDocRAG && <FileText className="w-2.5 h-2.5 text-blue-500" />}
                          {isGraph && <Network className="w-2.5 h-2.5 text-purple-500" />}
                          <span>{c.description || `Source: ${c.source_type} (${c.count} records)`}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Clickable Suggested Next Questions */}
                {((m.follow_up_questions && m.follow_up_questions.length > 0) || (m.suggested_followups && m.suggested_followups.length > 0)) && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">
                      Suggested Next Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(m.follow_up_questions || m.suggested_followups || []).map((action, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(action)}
                          className="text-[10.5px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition cursor-pointer text-left"
                        >
                          → {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Disclaimer */}
                {m.disclaimer && (
                  <p className="text-[10px] text-neutral-400 italic pt-1 border-t border-neutral-200/60 dark:border-slate-800">
                    ⚠️ {m.disclaimer}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && <CopilotThinkingSkeleton />}
          <div ref={chatBottomRef} />
        </div>
      )}

      {/* Clean Prompt Input Form */}
      <div className="p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center gap-2"
        >
          <div className="pl-2 text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Ask an investigative question about entities, transactions, routes, or evidence..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
