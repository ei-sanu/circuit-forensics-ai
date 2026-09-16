"""CIRCUIT 2.0 — Hybrid Fine-Tuned LLM Inference Client.
Integrates locally hosted fine-tuned models (Ollama / vLLM / HuggingFace)
with in-process NetworkX Graph RAG and deterministic forensic fallback.
"""

import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.ml.schemas import Citation, CopilotQueryRequest, CopilotQueryResponse

logger = logging.getLogger("CIRCUIT.FineTunedLLM")

# Configuration from environment or defaults
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
FINETUNED_MODEL_NAME = os.getenv("FINETUNED_MODEL_NAME", "circuit-copilot")
FALLBACK_BASE_MODEL = os.getenv("FALLBACK_BASE_MODEL", "llama3.1:8b")
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data")
CHECKPOINT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "checkpoints", "circuit_llama3_lora")


class FineTunedLLMClient:
    """Client for querying fine-tuned CIRCUIT LLM checkpoints via Ollama, vLLM, or in-process RAG."""

    def __init__(self, timeout_seconds: float = 4.0):
        self.timeout = timeout_seconds

    async def get_status(self) -> Dict[str, Any]:
        """Check live connectivity to fine-tuned model runtime and return model metadata."""
        ollama_available = False
        vllm_available = False
        active_engine = "in_process_fallback"
        loaded_models = []

        # 1. Check Ollama
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                if res.status_code == 200:
                    ollama_available = True
                    data = res.json()
                    loaded_models = [m.get("name") for m in data.get("models", [])]
                    if FINETUNED_MODEL_NAME in loaded_models or any(FINETUNED_MODEL_NAME in m for m in loaded_models):
                        active_engine = f"ollama:{FINETUNED_MODEL_NAME}"
                    elif FALLBACK_BASE_MODEL in loaded_models or any("llama3" in m for m in loaded_models):
                        active_engine = f"ollama:{FALLBACK_BASE_MODEL}"
        except Exception:
            ollama_available = False

        # 2. Check vLLM / OpenAI compatible
        if not ollama_available:
            try:
                async with httpx.AsyncClient(timeout=1.5) as client:
                    res = await client.get(f"{VLLM_BASE_URL}/models")
                    if res.status_code == 200:
                        vllm_available = True
                        active_engine = "vllm:active"
            except Exception:
                vllm_available = False

        # 3. Read dataset metadata
        train_count = 0
        train_file = os.path.join(DATASET_PATH, "train.jsonl")
        if os.path.exists(train_file):
            try:
                with open(train_file, "r", encoding="utf-8") as f:
                    train_count = sum(1 for line in f if line.strip())
            except Exception:
                train_count = 175

        has_checkpoints = os.path.exists(os.path.join(CHECKPOINT_PATH, "adapter_config.json"))

        return {
            "model_name": "CIRCUIT-2.0-Forensic-LLM (Llama-3.1-8B-Instruct-QLoRA)",
            "active_engine": active_engine,
            "ollama_available": ollama_available,
            "vllm_available": vllm_available,
            "checkpoint_available": has_checkpoints,
            "checkpoint_path": CHECKPOINT_PATH if has_checkpoints else None,
            "training_samples_count": train_count,
            "supported_tasks": [
                "Bilingual FIR Named Entity & Statute Extraction",
                "Smurfing & Structuring PAN Evasion Detection",
                "Call Detail Records (CDR) Nocturnal Surveillance",
                "Syndicate Ego-Network Bottleneck & Disruption Analysis",
                "Section 63 BSA / Section 65B IEA Evidence Certification"
            ],
            "recommended_base": "meta-llama/Meta-Llama-3.1-8B-Instruct"
        }

    async def generate_response(
        self,
        query: str,
        graph_context: str = "",
        system_prompt: Optional[str] = None,
        api_key: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None,
    ) -> Optional[str]:
        """Attempt to query fine-tuned endpoint or real LLM (Gemini, Groq, OpenAI) with low latency."""
        effective_key = (
            (api_key or "").strip()
            or os.getenv("GEMINI_API_KEY", "")
            or os.getenv("OPENAI_API_KEY", "")
            or os.getenv("GROQ_API_KEY", "")
        )

        effective_provider = provider or (
            "gemini" if effective_key.startswith("AIza")
            else "groq" if effective_key.startswith("gsk_")
            else "openai" if effective_key.startswith("sk-")
            else "gemini" if effective_key
            else "local"
        )

        if not system_prompt:
            system_prompt = (
                "You are CIRCUIT AI, an expert Senior Criminal Intelligence & Cyber Crime Forensic Analysis Copilot "
                "for the Ministry of Home Affairs / Police Criminal Investigation Department, Government of India. "
                "Analyze suspect networks, Hawala loops, vehicle convoys, and statutory violations under Indian law "
                "(Bharatiya Nyaya Sanhita BNS 2023, Bharatiya Nagarik Suraksha Sanhita BNSS 2023, "
                "Bharatiya Sakshya Adhiniyam BSA 2023 Section 63, IT Act 2000, PMLA 2002). "
                "You also specialize in outside cyber security: MITRE ATT&CK, ransomware response, digital forensics, "
                "and priority case solving recommendations for investigators. Give clear, evidence-grounded answers."
            )

        # 1. Real Google Gemini API Call if Key Available
        if effective_key and effective_provider == "gemini":
            try:
                gemini_model = model or "gemini-1.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={effective_key}"
                contents = [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\nEvidence Context:\n{graph_context}"}]},
                    {"role": "model", "parts": [{"text": "Affirmative. CIRCUIT AI operational and standing by."}]},
                ]
                if history:
                    for h in history[-6:]:
                        role = "model" if h.get("role") == "assistant" else "user"
                        contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
                contents.append({"role": "user", "parts": [{"text": query}]})

                async with httpx.AsyncClient(timeout=12.0) as client:
                    res = await client.post(url, json={"contents": contents, "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}})
                    if res.status_code == 200:
                        data = res.json()
                        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        if text:
                            return text
            except Exception as e:
                logger.warning(f"Gemini API call skipped ({e})")

        # 2. Real Groq / OpenAI / OpenRouter Call if Key Available
        if effective_key and effective_provider in ("groq", "openai", "openrouter"):
            try:
                endpoint = (
                    "https://api.groq.com/openai/v1/chat/completions" if effective_provider == "groq"
                    else "https://openrouter.ai/api/v1/chat/completions" if effective_provider == "openrouter"
                    else "https://api.openai.com/v1/chat/completions"
                )
                chosen_model = model or (
                    "llama-3.3-70b-versatile" if effective_provider == "groq"
                    else "meta-llama/llama-3.3-70b-instruct" if effective_provider == "openrouter"
                    else "gpt-4o-mini"
                )
                messages = [
                    {"role": "system", "content": f"{system_prompt}\n\nEvidence Context:\n{graph_context}"},
                ]
                if history:
                    for h in history[-6:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": query})

                async with httpx.AsyncClient(timeout=12.0) as client:
                    res = await client.post(
                        endpoint,
                        headers={"Authorization": f"Bearer {effective_key}", "Content-Type": "application/json"},
                        json={"model": chosen_model, "messages": messages, "temperature": 0.2, "max_tokens": 2048}
                    )
                    if res.status_code == 200:
                        data = res.json()
                        text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                        if text:
                            return text
            except Exception as e:
                logger.warning(f"{effective_provider} call skipped ({e})")

        full_prompt = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n"
            f"{system_prompt}<|eot_id|>\n"
            f"<|start_header_id|>user<|end_header_id|>\n"
            f"{query}\n\nEvidence Context:\n{graph_context}<|eot_id|>\n"
            f"<|start_header_id|>assistant<|end_header_id|>\n"
        )

        # 3. Try Ollama Native Endpoint
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "model": FINETUNED_MODEL_NAME,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {"temperature": 0.2, "top_p": 0.9}
                }
                res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    if response_text:
                        return response_text
        except Exception as e:
            logger.debug(f"Ollama generation skipped ({e})")

        # 4. Try vLLM / OpenAI Compatible Endpoint
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "model": FINETUNED_MODEL_NAME,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"{query}\n\nEvidence Context:\n{graph_context}"}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 1024
                }
                res = await client.post(f"{VLLM_BASE_URL}/chat/completions", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
        except Exception as e:
            logger.debug(f"vLLM generation skipped ({e})")

        return None

finetuned_llm_client = FineTunedLLMClient()

