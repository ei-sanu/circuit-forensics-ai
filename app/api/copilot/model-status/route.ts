import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  let activeEngine = 'CIRCUIT Forensic Hybrid Agent';
  if (hasGeminiKey) activeEngine = 'Google Gemini 1.5/2.0 Flash';
  else if (hasGroqKey) activeEngine = 'Groq (Llama-3.3-70B)';
  else if (hasOpenAIKey) activeEngine = 'OpenAI (GPT-4o-mini)';

  return NextResponse.json({
    model_name: hasGeminiKey
      ? 'CIRCUIT-AI (Google Gemini)'
      : hasGroqKey
      ? 'CIRCUIT-AI (Groq Llama-3.3-70B)'
      : hasOpenAIKey
      ? 'CIRCUIT-AI (OpenAI GPT-4o)'
      : 'CIRCUIT-2.0-Forensic-Agent (Dual Mode: Live LLM / Legal Core)',
    training_samples_count: 206,
    active_engine: activeEngine,
    supports_api_keys: true,
    supported_providers: ['gemini', 'groq', 'openai', 'openrouter', 'offline'],
    supported_tasks: [
      'Case Prioritization & Investigator Dispatch',
      'Inside Case CR-2026-00124 (Operation Nightfall) Network Forensics',
      'Bilingual FIR Named Entity & Statute Extraction (BNS / BSA 2023)',
      'Structuring & Smurfing PAN Evasion Detection (Section 139A)',
      'Outside Cyber Security: MITRE ATT&CK, Ransomware, Incident Response',
      'Section 63 BSA / Section 65B IEA Evidence Certification',
    ],
  });
}
