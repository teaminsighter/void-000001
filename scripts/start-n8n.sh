#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOID — n8n Startup Script
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.n8n.yml"
N8N_PORT=5678

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  VOID — Starting n8n Workflow Automation                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if already running
if docker ps --format '{{.Names}}' | grep -q "^void-n8n$"; then
    echo "✓ n8n is already running"
    echo "  → http://localhost:${N8N_PORT}"
    exit 0
fi

# Start with docker compose
echo "→ Starting n8n..."
docker compose -f "${COMPOSE_FILE}" up -d

# Wait for n8n to be ready
echo ""
echo "→ Waiting for n8n to initialize..."
for i in {1..30}; do
    if curl -s "http://localhost:${N8N_PORT}/healthz" > /dev/null 2>&1; then
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════════════════╗"
        echo "║  ✓ n8n is running!                                                         ║"
        echo "╠═══════════════════════════════════════════════════════════════════════════╣"
        echo "║  Web UI:   http://localhost:${N8N_PORT}                                       ║"
        echo "║  Webhooks: http://localhost:${N8N_PORT}/webhook/                              ║"
        echo "╚═══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Next steps:"
        echo "  1. Open http://localhost:${N8N_PORT}"
        echo "  2. Create account (first time only)"
        echo "  3. Import workflows from n8n-workflows/ folder"
        echo ""
        echo "Workflow files available:"
        ls -1 "${SCRIPT_DIR}/../n8n-workflows/"*.json 2>/dev/null | xargs -I {} basename {} | head -10
        echo ""

        # Try to open in browser (macOS)
        if command -v open > /dev/null 2>&1; then
            read -p "Open n8n in browser? [Y/n] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
                open "http://localhost:${N8N_PORT}"
            fi
        fi

        exit 0
    fi
    printf "."
    sleep 2
done

echo ""
echo "❌ n8n failed to start. Check logs with:"
echo "   docker compose -f ${COMPOSE_FILE} logs"
exit 1
