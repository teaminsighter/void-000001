#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOID — n8n Stop Script
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.n8n.yml"

echo "→ Stopping n8n..."
docker compose -f "${COMPOSE_FILE}" down

echo "✓ n8n stopped"
echo ""
echo "Note: Data is preserved in Docker volumes."
echo "To remove all data: docker compose -f ${COMPOSE_FILE} down -v"
