# n8n Workflows

This folder contains exported n8n workflows for the Void system.

## How to Import

1. Open n8n at `n8n.yourdomain.com`
2. Go to **Workflows → Import**
3. Upload the JSON file
4. Update credentials (API keys, tokens)
5. Activate the workflow

## Workflows

| # | File | Purpose | Trigger |
|---|------|---------|---------|
| 01 | `01-daily-plan.json` | Create daily plan | Webhook + Cron 8AM |
| 02 | `02-quick-log.json` | Append to daily note | Webhook |
| 03 | `03-vault-search.json` | Search vault via Khoj | Webhook |
| 04 | `04-email-manager.json` | Read/send Gmail | Webhook |
| 05 | `05-telegram-router.json` | Route Telegram commands | Telegram trigger |
| 06 | `06-reminder.json` | Schedule reminders | Webhook |
| 07 | `07-weekly-review.json` | Generate weekly review | Cron Sunday 10PM |
| 08 | `08-morning-briefing.json` | Morning summary | Cron 8AM |
| 09 | `09-night-capture.json` | End of day prompt | Cron 9PM |
| 10 | `10-health-monitor.json` | Check service health | Cron 15min |
| 11 | `11-khoj-reindex.json` | Trigger Khoj re-index | Cron 6h |
| 12 | `12-crm-query.json` | Query CRM data | Webhook |
| 13 | `13-memory-updater.json` | Update agent memory | Webhook |

## Required Credentials

Set up these credentials in n8n before importing:

- **Anthropic**: Claude API key
- **Telegram**: Bot token (from @BotFather)
- **Gmail**: OAuth2 connection
- **HTTP Header Auth**: For webhook security (optional)

## Telegram Commands

After setting up the Telegram Router workflow:

- `/plan` — Create daily plan
- `/log <text>` — Quick log entry
- `/search <query>` — Search vault
- `/remind <time> <message>` — Set reminder

## Webhook Endpoints

All webhooks are available at:

```
https://n8n.yourdomain.com/webhook/<endpoint>
```

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/plan` | POST | Create daily plan |
| `/log` | POST | Append to log |
| `/search` | POST | Search vault |
| `/email` | POST | Email operations |
| `/remind` | POST | Set reminder |
| `/crm` | POST | CRM operations |
| `/memory` | POST | Save to memory |

## Testing Webhooks

```bash
# Test plan webhook
curl -X POST https://n8n.yourdomain.com/webhook/plan \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-03", "input": "4 hours office, meeting at 2pm"}'

# Test log webhook
curl -X POST https://n8n.yourdomain.com/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"text": "Finished the marketing review"}'

# Test search webhook
curl -X POST https://n8n.yourdomain.com/webhook/search \
  -H "Content-Type: application/json" \
  -d '{"query": "marketing strategy"}'
```

## Building Workflows

These JSON files are placeholders. Build each workflow in n8n's visual editor, then export:

1. Open the workflow in n8n
2. Click **...** menu → **Export**
3. Save JSON to this folder
4. Commit to version control

## Notes

- Workflows are built in Layer 6 of the build plan
- Start with core workflows: Daily Plan, Quick Log, Telegram Router
- Test each workflow before moving to the next
- Keep workflows simple — one purpose per workflow
