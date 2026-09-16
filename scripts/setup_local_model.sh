#!/usr/bin/env bash
# ==============================================================================
# CIRCUIT 2.0 — Local Forensic AI Model Setup Script
# Configures and registers the custom 'circuit-copilot' model directly into Ollama
# 100% Local, Sovereign, Offline-Ready (No Google Colab or Cloud GPU required)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE_MODEL="${1:-llama3.2:3b}"
TARGET_MODEL="circuit-copilot"

echo "================================================================="
echo "  CIRCUIT 2.0 — LOCAL SOVEREIGN AI MODEL INSTALLER"
echo "================================================================="
echo "Target Model : $TARGET_MODEL"
echo "Base Model   : $BASE_MODEL"
echo "Engine       : Ollama (Local macOS Metal / CUDA / CPU)"
echo "-----------------------------------------------------------------"

# 1. Verify Ollama installation
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed on this system."
    echo "👉 Please install Ollama from https://ollama.ai/download or run: brew install ollama"
    exit 1
fi

echo "✅ Ollama CLI detected: $(which ollama)"

# 2. Check if Ollama daemon is responding
echo "🔍 Checking Ollama daemon connectivity..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama service is not running on http://localhost:11434."
    echo "⏳ Attempting to launch Ollama in the background..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "❌ Could not start Ollama automatically. Please launch Ollama Desktop or run 'ollama serve' in another terminal."
        exit 1
    fi
fi

echo "✅ Ollama daemon is active and responsive on http://localhost:11434"

# 3. Pull base model if not already present
echo ""
echo "📦 Verifying base model '$BASE_MODEL'..."
if ! ollama list | grep -q "$BASE_MODEL"; then
    echo "⬇️ Pulling base model '$BASE_MODEL' (this only happens once)..."
    ollama pull "$BASE_MODEL"
else
    echo "✅ Base model '$BASE_MODEL' already present in local cache."
fi

# 4. Generate customized Modelfile with chosen base model
TEMP_MODELFILE="$SCRIPT_DIR/Modelfile.generated"
sed "s|^FROM .*|FROM $BASE_MODEL|" "$SCRIPT_DIR/Modelfile" > "$TEMP_MODELFILE"

# 5. Build and register the circuit-copilot model
echo ""
echo "🔨 Building custom forensic intelligence model '$TARGET_MODEL'..."
ollama create "$TARGET_MODEL" -f "$TEMP_MODELFILE"
rm -f "$TEMP_MODELFILE"

echo ""
echo "✅ Custom model '$TARGET_MODEL' successfully built in Ollama!"
ollama list | grep "$TARGET_MODEL"

# 6. Quick inference smoke test
echo ""
echo "🧪 Running inference smoke test..."
TEST_QUERY="Identify the primary statute under BNS 2023 for cheating and corporate fund diversion."
TEST_RESPONSE=$(ollama run "$TARGET_MODEL" "$TEST_QUERY" <<< "" 2>&1 | head -n 5)
echo "Sample Output:"
echo "$TEST_RESPONSE"
echo ""

echo "================================================================="
echo "🎉 SUCCESS: Local CIRCUIT AI Copilot is fully configured!"
echo "   - Model Name: $TARGET_MODEL"
echo "   - Endpoint  : http://localhost:11434"
echo "   - Status    : Ready for zero-latency local copilot queries"
echo "================================================================="
