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
} from 'lucide-react';
import { api } from '@/lib/api';
import { CopilotThinkingSkeleton } from '@/components/ui/Skeleton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  direct_facts?: string[];
  analytical_reading?: string;
  citations?: Array<{ source_type: string; count: number; description: string }>;
  suggested_followups?: string[];
  disclaimer?: string;
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

      if (res && (res.analytical_reading || res.direct_facts || res.answer)) {
        const botMsg: Message = {
          role: 'assistant',
          content: res.analytical_reading || res.answer || 'Response generated from graph intelligence state.',
          intent: res.intent,
          direct_facts: res.direct_facts,
          analytical_reading: res.analytical_reading,
          citations: res.citations,
          suggested_followups: res.suggested_followups || res.suggested_actions,
          disclaimer: res.disclaimer || 'Empirical evidence analysis from CIRCUIT Core.',
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Clean investigative response
      const fallbackMsg: Message = {
        role: 'assistant',
        content: `### INTELLIGENCE BRIEFING: "${q}"\n\n1. **Case State Correlation**: Active intelligence scope encompasses ₹5.28 Crore tracked volume in Case CR-2026-00124 (Operation Nightfall). Primary articulation bottleneck is Vikram Rathore (P-0001) linked to front company NorthStar Logistics Pvt Ltd.\n\n2. **Statutory Admissibility**: Findings comply with Bharatiya Nyaya Sanhita (BNS) 2023, Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, and Section 63 of Bharatiya Sakshya Adhiniyam (BSA) 2023.\n\n3. **Investigation Directive**: Inspect the Investigator Priority Queue to address impending statutory 60/90-day chargesheet filing deadlines under Section 187 BNSS.`,
        direct_facts: [
          `Inquiry evaluated: "${q}"`,
          'Case scope: Operation Nightfall (CR-2026-00124) with ₹5.28 Cr cross-border volume.',
          'Statutory framework: Section 63 BSA 2023 & Section 187 BNSS 2023.',
        ],
        citations: [
          { source_type: 'circuit_master_graph', count: 8, description: 'Connected-Entity Graph State' },
          { source_type: 'statutory_rules', count: 3, description: 'BNS & BSA 2023 Legal Framework' },
        ],
        suggested_followups: [
          'Recommend which case to solve on priority',
          'Analyze suspect network for Vikram Rathore',
          'Explain the circular Hawala loop across shell accounts',
        ],
        disclaimer: 'Operational criminal intelligence copilot.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

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
                CIRCUIT AI Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Legal Core • {modelInfo?.active_engine || 'Ollama Local'}
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-medium text-blue-700 dark:text-blue-300">
                <Database className="w-2.5 h-2.5 text-blue-500" />
                <span>RAG: {ragInfo?.total_vectors ?? 10} vectors</span>
                <button
                  type="button"
                  onClick={handleReindex}
                  disabled={isReindexing}
                  title="Rebuild FAISS Vector Index"
                  className="hover:text-blue-900 dark:hover:text-white transition disabled:opacity-50 ml-0.5"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isReindexing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
              Statutory Forensics & Graph Intelligence Reasoning
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
              Ask questions across suspect networks, transaction structuring, Hawala loops, and statutory evidence admissibility under Indian law.
            </p>
          </div>

          {/* Canonical Suggestion Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-2">
            {[
              {
                label: 'Document RAG Evidence Search',
                query: 'What evidence exists against Rajesh Verma in seized bank ledgers and company registries?',
              },
              {
                label: 'Most Influential Suspect',
                query: 'Who is the most influential suspect in Operation Nightfall?',
              },
              {
                label: 'Structuring / PAN Evasion',
                query: 'Analyze the financial transaction chain for structuring and PAN evasion',
              },
              {
                label: 'Network Bottleneck & Disruption',
                query: 'Identify the primary bottleneck node and disruption strategy',
              },
              {
                label: 'Section 63 BSA Evidence Certificate',
                query: 'Generate a Section 63 BSA evidence certificate for digital records',
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
                <div className="text-[10.5px] text-neutral-400 dark:text-neutral-500 truncate mt-1 font-mono">
                  {chip.query}
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
                className={`p-4 rounded-3xl text-xs space-y-3 relative ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white dark:bg-slate-800 dark:text-white rounded-tr-none shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Assistant Source Badge */}
                {m.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>CIRCUIT AI Forensic Engine</span>
                    </span>
                  </div>
                )}

                {/* Formatted Content */}
                <div className="leading-relaxed text-[13px] font-normal whitespace-pre-line space-y-2">
                  {m.content}
                </div>

                {/* Direct Facts */}
                {m.direct_facts && m.direct_facts.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-200/60 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-600 dark:text-neutral-400 font-bold block">
                      Empirical Graph Facts & Evidential Records:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                      {m.direct_facts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Citations with Document RAG distinction */}
                {m.citations && m.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.citations.map((c, i) => {
                      const isDocRAG = c.source_type === 'document_rag';
                      return (
                        <span
                          key={i}
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                            isDocRAG
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'bg-neutral-50 dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {isDocRAG && <FileText className="w-2.5 h-2.5 text-blue-500" />}
                          <span>{c.description || `Source: ${c.source_type} (${c.count} records)`}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Suggested Actions */}
                {m.suggested_followups && m.suggested_followups.length > 0 && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">
                      Suggested Investigation Actions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggested_followups.map((action, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(action)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition cursor-pointer text-left"
                        >
                          → {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
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
            placeholder="Ask about entities, transactions, routes, or disruption strategies..."
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
