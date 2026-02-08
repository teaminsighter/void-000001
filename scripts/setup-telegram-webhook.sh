#!/bin/bash
# ══════════════════════════════════════
# VOID — Telegram Webhook Setup
# Run once to register your domain with Telegram Bot API
# ══════════════════════════════════════

# Load from .env.local if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep TELEGRAM_BOT_TOKEN | xargs)
fi

TOKEN="${TELEGRAM_BOT_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "Error: TELEGRAM_BOT_TOKEN not set"
  echo "Set it in .env.local or export it before running this script"
  exit 1
fi

DOMAIN="${1:-https://void.insighter.digital}"
WEBHOOK_URL="${DOMAIN}/api/telegram/webhook"

echo "Setting Telegram webhook..."
echo "URL: ${WEBHOOK_URL}"
echo ""

curl -s "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}" | python3 -m json.tool

echo ""
echo "Done. Verify with:"
echo "curl https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
