#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOID — Khoj Stop Script
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.khoj.yml"

echo "→ Stopping Khoj..."
docker compose -f "${COMPOSE_FILE}" down

echo "✓ Khoj stopped"
echo ""
echo "Note: Data is preserved in Docker volumes."
echo "To remove all data: docker compose -f ${COMPOSE_FILE} down -v"
