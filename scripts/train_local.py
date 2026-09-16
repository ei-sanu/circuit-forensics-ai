"""CIRCUIT 2.0 — Standalone Local LoRA Fine-Tuning Engine.

Runs 100% locally on your machine (Apple Silicon MPS, NVIDIA CUDA, or CPU).
No Google Colab, no cloud GPUs, no external data leakage.

Usage:
  python scripts/train_local.py [--model-name unsloth/Llama-3.2-1B-Instruct] [--epochs 3] [--batch-size 2]
"""

import os
import sys
import json
import argparse
import logging
from typing import List, Dict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("CIRCUIT.TrainLocal")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT_DIR, "data", "train.jsonl")
VAL_DATA_PATH = os.path.join(ROOT_DIR, "data", "val.jsonl")
DEFAULT_OUTPUT_DIR = os.path.join(ROOT_DIR, "checkpoints", "circuit_llama3_lora")


def parse_args():
    parser = argparse.ArgumentParser(description="CIRCUIT 2.0 Local Fine-Tuning")
    parser.add_argument(
        "--model-name",
        type=str,
        default="meta-llama/Llama-3.2-1B-Instruct",
        help="HuggingFace model ID to fine-tune locally (e.g. meta-llama/Llama-3.2-1B-Instruct, Qwen/Qwen2.5-1.5B-Instruct)"
    )
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=2, help="Per-device train batch size")
    parser.add_argument("--grad-accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--output-dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Output directory for LoRA weights")
    parser.add_argument("--max-seq-length", type=int, default=1024, help="Maximum sequence length")
    return parser.parse_args()


def detect_device():
    import torch
    if torch.cuda.is_available():
        logger.info(f"NVIDIA CUDA GPU detected: {torch.cuda.get_device_name(0)}")
        return "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        logger.info("Apple Silicon Metal (MPS) detected. Training on unified GPU memory.")
        return "mps"
    else:
        logger.info("No dedicated accelerator detected. Training on multi-core CPU.")
        return "cpu"


def load_dataset_records(path: str) -> List[Dict[str, str]]:
    if not os.path.exists(path):
        logger.warning(f"Dataset path does not exist: {path}")
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    logger.info(f"Loaded {len(records)} samples from {os.path.basename(path)}")
    return records


def format_prompt(sample: Dict[str, str]) -> str:
    system_prompt = (
        "You are CIRCUIT AI, a specialized criminal intelligence and financial forensic analysis copilot. "
        "Analyze suspect networks, Hawala loops, vehicle convoys, and statutory violations under Indian law "
        "(IPC, BNS, PMLA, BSA Section 63). Give concise, evidence-grounded responses with citations."
    )
    instruction = sample.get("instruction", "")
    user_input = sample.get("input", "")
    output = sample.get("output", "")
    
    query = f"{instruction}\n\n{user_input}".strip() if user_input else instruction
    
    return (
        f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n"
        f"{system_prompt}<|eot_id|>\n"
        f"<|start_header_id|>user<|end_header_id|>\n"
        f"{query}<|eot_id|>\n"
        f"<|start_header_id|>assistant<|end_header_id|>\n"
        f"{output}<|eot_id|>"
    )


def main():
    args = parse_args()
    device = detect_device()

    logger.info("=" * 65)
    logger.info("  CIRCUIT 2.0 — LOCAL SOVEREIGN LO-RA FINE-TUNING")
    logger.info("=" * 65)
    logger.info(f"Base Model    : {args.model_name}")
    logger.info(f"Device        : {device}")
    logger.info(f"Epochs        : {args.epochs}")
    logger.info(f"Batch Size    : {args.batch_size} (Grad Accum: {args.grad_accum})")
    logger.info(f"Output Path   : {args.output_dir}")
    logger.info("=" * 65)

    # 1. Load data
    train_records = load_dataset_records(DATA_PATH)
    if not train_records:
        logger.error(f"No training data found at {DATA_PATH}. Aborting.")
        sys.exit(1)

    train_texts = [format_prompt(r) for r in train_records]

    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
        from peft import LoraConfig, get_peft_model, TaskType
        from datasets import Dataset
    except ImportError as e:
        logger.error(f"Missing fine-tuning dependencies: {e}")
        logger.info("Please install via: pip install torch transformers peft datasets accelerate")
        sys.exit(1)

    # 2. Tokenizer
    logger.info(f"Loading tokenizer: {args.model_name}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(args.model_name, trust_remote_code=True)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
    except Exception as e:
        logger.error(f"Failed to load tokenizer for {args.model_name}: {e}")
        logger.info("Tip: If accessing gated models like Meta Llama, ensure Hugging Face token is set: export HF_TOKEN=...")
        sys.exit(1)

    # 3. Model
    logger.info(f"Loading base model: {args.model_name}...")
    torch_dtype = torch.float16 if device in ("cuda", "mps") else torch.float32
    
    try:
        model = AutoModelForCausalLM.from_pretrained(
            args.model_name,
            torch_dtype=torch_dtype,
            trust_remote_code=True,
            low_cpu_mem_usage=True,
        )
    except Exception as e:
        logger.error(f"Could not load {args.model_name}: {e}")
        sys.exit(1)

    # 4. LoRA Config
    peft_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Tokenize dataset
    def tokenize_fn(examples):
        tokens = tokenizer(
            examples["text"],
            truncation=True,
            max_length=args.max_seq_length,
            padding="max_length",
        )
        tokens["labels"] = tokens["input_ids"].copy()
        return tokens

    raw_dataset = Dataset.from_dict({"text": train_texts})
    tokenized_dataset = raw_dataset.map(tokenize_fn, batched=True, remove_columns=["text"])

    # 6. Training Arguments
    os.makedirs(args.output_dir, exist_ok=True)
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        logging_steps=10,
        save_strategy="epoch",
        fp16=(device == "cuda"),
        bf16=False,
        use_mps_device=(device == "mps"),
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )

    logger.info("🚀 Starting local fine-tuning...")
    trainer.train()

    # 7. Save adapter weights and metadata
    logger.info(f"💾 Saving trained LoRA adapter to {args.output_dir}...")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    # Write adapter_config.json marker if not already created
    meta = {
        "base_model": args.model_name,
        "epochs": args.epochs,
        "device": device,
        "samples_count": len(train_records),
        "status": "trained_locally"
    }
    with open(os.path.join(args.output_dir, "training_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    logger.info("=================================================================")
    logger.info(f"✅ Local fine-tuning completed successfully!")
    logger.info(f"   Adapter saved: {args.output_dir}")
    logger.info("=================================================================")


if __name__ == "__main__":
    main()
