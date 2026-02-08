# Void Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR DEVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                           ┌─────────────┐                 │
│   │   Browser   │                           │  Telegram   │                 │
│   │ (Dashboard) │                           │  (Mobile)   │                 │
│   └──────┬──────┘                           └──────┬──────┘                 │
│          │                                         │                        │
└──────────┼─────────────────────────────────────────┼────────────────────────┘
           │ HTTPS                                   │ Telegram API
           │                                         │
           ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR VPS (69.62.80.66)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    Coolify (Traefik Proxy)                   │          │
│   │                    :80/:443 - SSL termination                │          │
│   └───────────┬──────────────────┬──────────────────┬───────────┘          │
│               │                  │                  │                       │
│               ▼                  ▼                  ▼                       │
│   ┌───────────────────┐ ┌───────────────┐ ┌───────────────┐                │
│   │     Dashboard     │ │     n8n       │ │     Khoj      │                │
│   │   (Next.js 16)    │ │  (Automation) │ │ (AI Search)   │                │
│   │    :3000          │ │    :5678      │ │   :42110      │                │
│   └─────────┬─────────┘ └───────┬───────┘ └───────┬───────┘                │
│             │                   │                 │                         │
│             │    ┌──────────────┼─────────────────┤                         │
│             │    │              │                 │                         │
│             ▼    ▼              ▼                 ▼                         │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    /opt/void-vault                           │          │
│   │                    (Markdown Vault)                          │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
           │
           │ HTTPS (Claude API)
           ▼
┌─────────────────────┐
│   api.anthropic.com │
│   (Claude's brain)  │
└─────────────────────┘
```

## Key Rules

1. **Dashboard hides all API secrets** — Browser never sees keys
2. **Claude thinks, dashboard acts** — Core actions (log, memory, save) execute directly via vault filesystem
3. **n8n for complex integrations** — Email, reminders, CRM, scheduled plans go through n8n webhooks
4. **Vault is permanent** — All data stored as markdown files, backed up
5. **Khoj makes vault searchable** — Semantic search via embeddings

## Data Flow: "Plan my day"

```
1. You type in Dashboard: "Plan my day, 4h office, meeting at 2pm"
2. Dashboard → POST /api/chat
3. API route → GET Khoj /api/search (get context from vault)
4. API route → POST Claude API (with context + your message)
5. Claude responds with plan + action block
6. API route → POST n8n /webhook/plan (trigger workflow)
7. n8n → reads preferences.md
8. n8n → writes 01-Daily/2026-02-03.md
9. n8n → sends Telegram notification
10. Response returns to Dashboard
11. You see the plan in chat
12. Khoj → re-indexes (next cycle)
```

## Data Flow: Quick Log (direct, no n8n)

```
1. You tell the agent: "log: finished the marketing review"
2. Dashboard → POST /api/chat
3. Claude responds with action block: {"type": "log", ...}
4. Chat route → handleActionDirect("log") → appends to vault daily note
5. Response returns instantly — no n8n involved
```

## Services

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Dashboard | 3000 | void.insighter.digital | Next.js frontend + API routes |
| n8n | 5678 | n8n.insighter.digital | Automation workflows |
| Khoj | 42110 | khoj.insighter.digital | AI semantic search |
| PostgreSQL | 5432 | internal | Database for n8n |
| pgvector | 5433 | internal | Vector DB for Khoj |
| SearXNG | 8080 | internal | Web search for Khoj |

## Folder Structure

```
void-000001/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── lib/           # Utilities and API helpers
├── hooks/         # React hooks
├── docker/        # Docker Compose files
├── vault-template/# Markdown vault starter
├── n8n-workflows/ # Workflow JSON exports
└── docs/          # Documentation
```

## Security

- All API keys stored in environment variables
- Dashboard API routes proxy to internal services
- n8n webhooks secured with auth headers
- Vault access controlled by file permissions
- SSL termination at Coolify/Traefik level
- Password authentication with JWT cookies (Layer 8)
