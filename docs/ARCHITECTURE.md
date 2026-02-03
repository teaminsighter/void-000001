# Void Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR DEVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │   Browser   │     │  Obsidian   │     │  Telegram   │                  │
│   │ (Dashboard) │     │   (Mac)     │     │  (Mobile)   │                  │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                  │
│          │                   │                   │                          │
└──────────┼───────────────────┼───────────────────┼──────────────────────────┘
           │ HTTPS             │ Syncthing         │ Telegram API
           │                   │ (P2P sync)        │
           ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR VPS                                        │
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
│   │   (Next.js)       │ │  (Automation) │ │ (AI Search)   │                │
│   │    :3000          │ │    :5678      │ │   :42110      │                │
│   └─────────┬─────────┘ └───────┬───────┘ └───────┬───────┘                │
│             │                   │                 │                         │
│             │    ┌──────────────┼─────────────────┤                         │
│             │    │              │                 │                         │
│             ▼    ▼              ▼                 ▼                         │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    /opt/void-vault                           │          │
│   │                    (Obsidian Vault)                          │          │
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
2. **Claude only thinks** — n8n is the only thing that acts
3. **n8n is the integration hub** — Single point of connection to external services
4. **Vault is permanent** — Your data, backed up, version controlled
5. **Khoj makes vault searchable** — Semantic search via embeddings
6. **Syncthing syncs vault** — P2P sync to all your devices

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
12. Syncthing → syncs new file to your Mac
13. Khoj → re-indexes (next cycle)
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Dashboard | 3000 | Next.js frontend + API routes |
| n8n | 5678 | Automation workflows |
| Khoj | 42110 | AI semantic search |
| Syncthing | 8384 | P2P file sync |
| PostgreSQL | 5432 | Database for n8n |
| pgvector | 5433 | Vector DB for Khoj |

## Folder Structure

```
void/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── lib/           # Utilities and API helpers
├── hooks/         # React hooks
├── docker/        # Docker Compose files
├── vault-template/# Obsidian vault starter
├── n8n-workflows/ # Workflow JSON exports
└── docs/          # Documentation
```

## Security

- All API keys stored in environment variables
- Dashboard API routes proxy to internal services
- n8n webhooks can be secured with auth headers
- Vault access controlled by file permissions
- SSL termination at Coolify/Traefik level
