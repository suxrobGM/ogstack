#!/usr/bin/env bash
# ============================================================================
# start-local-llm.sh — Start llama-server with Qwen3.5-9B for local inference
# ============================================================================
# Used as a local LLM backend for prompt building and page content analysis.
#
# Usage:
#   ./start-local-llm.sh                  # defaults: port 8080, 32k context
#   ./start-local-llm.sh --port 9090      # custom port
#   ./start-local-llm.sh --ctx 65536      # larger context
#   ./start-local-llm.sh --quant Q6_K     # higher quality quant
#
# Prerequisites:
#   - llama.cpp built with GPU support (llama-server on PATH)
#   - ~8 GB VRAM (dense 9B model fits fully on GPU)
# ============================================================================

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────────────────────
PORT="${PORT:-8080}"
CTX_SIZE="${CTX_SIZE:-32768}"
MODEL_ALIAS="qwen"
QUANT="UD-Q4_K_XL"
HF_REPO="unsloth/Qwen3.5-9B-GGUF"

# ── Parse CLI flags ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)    PORT="$2";     shift 2 ;;
    --ctx)     CTX_SIZE="$2"; shift 2 ;;
    --quant)   QUANT="$2";    shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--port PORT] [--ctx CTX_SIZE] [--quant QUANT]"
      echo ""
      echo "Quant options (Qwen3.5-9B — all fit fully on 16 GB VRAM):"
      echo "  UD-Q4_K_XL  ~6 GB    Default — Unsloth dynamic, near-Q5 quality at Q4 size"
      echo "  Q4_K_M      ~5.5 GB  Standard 4-bit, fastest"
      echo "  Q5_K_M      ~6.5 GB  Standard 5-bit"
      echo "  Q6_K        ~7.5 GB  Higher quality"
      echo "  Q8_0        ~9.5 GB  Near-lossless"
      echo ""
      echo "Context size guidance (model supports 262k):"
      echo "  32768    Default — fits prompt + page HTML comfortably"
      echo "  65536    Larger pages or multi-doc analysis"
      echo "  131072   Very large context"
      exit 0 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# ── Validate llama-server is available ──────────────────────────────────────
if ! command -v llama-server &>/dev/null; then
  echo "ERROR: llama-server not found on PATH."
  echo ""
  echo "Build it from source:"
  echo "  git clone https://github.com/ggml-org/llama.cpp"
  echo "  cmake llama.cpp -B llama.cpp/build -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=ON"
  echo "  cmake --build llama.cpp/build --config Release -j --target llama-server"
  echo "  cp llama.cpp/build/bin/llama-server ~/.local/bin/"
  echo ""
  echo "For Mac (Metal): use -DGGML_CUDA=OFF (Metal is on by default)"
  exit 1
fi

# ── Launch ──────────────────────────────────────────────────────────────────
echo "============================================"
echo " Local LLM Server — Qwen3.5-9B (dense)"
echo "============================================"
echo " Repo:      $HF_REPO"
echo " Quant:     $QUANT"
echo " Port:      $PORT"
echo " Context:   $CTX_SIZE tokens"
echo "============================================"
echo ""
echo "OpenAI-compatible endpoint:"
echo "  http://localhost:$PORT/v1/chat/completions"
echo ""
echo "Starting server..."
echo ""

exec llama-server \
  -hf "$HF_REPO:$QUANT" \
  --alias "$MODEL_ALIAS" \
  --port "$PORT" \
  --host 127.0.0.1 \
  --jinja \
  --flash-attn on \
  --cache-type-k q8_0 \
  --cache-type-v q8_0 \
  --ctx-size "$CTX_SIZE"
