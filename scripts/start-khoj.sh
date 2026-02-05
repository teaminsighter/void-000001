#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOID — Khoj Startup Script
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.khoj.yml"
KHOJ_PORT=42110

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  VOID — Starting Khoj Semantic Search                                      ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if already running
if docker ps --format '{{.Names}}' | grep -q "^void-khoj$"; then
    echo "✓ Khoj is already running"
    echo "  → http://localhost:${KHOJ_PORT}"
    echo "  → Config: http://localhost:${KHOJ_PORT}/config"
    exit 0
fi

# Start with docker compose
echo "→ Starting Khoj + PostgreSQL..."
docker compose -f "${COMPOSE_FILE}" up -d

# Wait for Khoj to be ready
echo ""
echo "→ Waiting for Khoj to initialize (this may take a minute)..."
for i in {1..60}; do
    if curl -s "http://localhost:${KHOJ_PORT}/api/health" > /dev/null 2>&1; then
        echo ""
        echo "╔═══════════════════════════════════════════════════════════════════════════╗"
        echo "║  ✓ Khoj is running!                                                        ║"
        echo "╠═══════════════════════════════════════════════════════════════════════════╣"
        echo "║  Web UI:  http://localhost:${KHOJ_PORT}                                       ║"
        echo "║  Config:  http://localhost:${KHOJ_PORT}/config                                ║"
        echo "║  Admin:   admin@void.local / void_admin_123                                ║"
        echo "╚═══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Next steps:"
        echo "  1. Open http://localhost:${KHOJ_PORT}/server/admin"
        echo "  2. Login with admin@void.local / void_admin_123"
        echo "  3. Configure content source to index your vault"
        echo ""

        # Try to open in browser (macOS)
        if command -v open > /dev/null 2>&1; then
            read -p "Open Khoj in browser? [Y/n] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
                open "http://localhost:${KHOJ_PORT}"
            fi
        fi

        exit 0
    fi
    printf "."
    sleep 2
done

echo ""
echo "❌ Khoj failed to start. Check logs with:"
echo "   docker compose -f ${COMPOSE_FILE} logs"
exit 1
