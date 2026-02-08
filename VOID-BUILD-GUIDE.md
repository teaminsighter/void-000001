# VOID — Complete Build Guide

> **One document. Everything you need. Open this in VS Code alongside Claude Code and build.**

---

## What is Void?

Void is your personal AI-powered operating system — a single web dashboard where you talk to an AI agent in natural language, and it plans your day, checks your email, searches your notes, manages your CRM pipeline, sets reminders, logs your thoughts, and runs automated bots. Everything saves to your markdown vault. Everything is searchable by meaning.

**Name:** Void
**Stack:** Next.js 16 + Tailwind CSS v4 + Claude API + n8n + Khoj + PostgreSQL
**Hosting:** Hostinger VPS (Ubuntu 24.04) + Coolify
**URL:** void.insighter.digital

---

## Architecture Overview

```
Browser (you)
    ↓ HTTPS
Coolify Reverse Proxy (:443) — auto SSL, routes by subdomain
    ↓ HTTP internal
Void Dashboard (:3000) — Next.js 16, hides API keys, proxies everything
    ↓ HTTPS              ↓ HTTP internal
Claude API             n8n (:5678) webhooks
  (thinks)               (complex integrations only)
                          ↓ HTTPS              ↓ Filesystem
                       Gmail/Telegram/CRM    /opt/void-vault
                                               (permanent storage)
                                                ↓ read-only mount
                                             Khoj (:42110)
                                                ↓ SQL
                                             pgvector DB (embeddings)
```

**Rules:**
- Dashboard hides all secrets — browser never sees API keys
- Claude only thinks, never acts directly
- Core actions (log, memory, save) bypass n8n and write directly to vault filesystem
- n8n handles complex integrations (email, reminders, CRM, scheduled plans)
- Vault is permanent markdown storage
- Khoj makes vault searchable via embeddings

---

## Tech Stack — Exact Versions

| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 16.1.6 (App Router) | Dashboard frontend + API routes |
| **React** | 19.2.3 | UI components |
| **Tailwind CSS** | v4 | Styling (CSS-first config) |
| **TypeScript** | 5.x | Type safety |
| **Anthropic SDK** | 0.72.1 | Claude API client |
| **n8n** | latest | Automation engine (Docker) |
| **Khoj** | latest | Vector search + semantic memory (Docker) |
| **PostgreSQL** | 16 + pgvector | n8n data + Khoj embeddings |
| **Coolify** | latest | Deployment platform (pre-installed on Hostinger) |
| **Node.js** | 20 LTS | Runtime |

---

## Project Folder Structure

```
void-000001/
├── .env.local                    # All secrets (NEVER commit)
├── .env.example                  # Template without real values (commit this)
├── .gitignore
├── package.json
├── postcss.config.mjs
├── tsconfig.json
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata
│   ├── page.tsx                  # Home page (dashboard overview)
│   ├── globals.css               # Tailwind v4 + custom CSS vars
│   ├── agent/page.tsx            # Agent chat page
│   ├── planner/page.tsx          # Daily planner page
│   ├── vault/page.tsx            # Vault browser page
│   ├── mail/page.tsx             # Email inbox page
│   ├── research/page.tsx         # Research page
│   ├── saved/page.tsx            # Saved items page
│   ├── bots/page.tsx             # Bot status page
│   ├── practice/page.tsx         # Practice page
│   │
│   └── api/                      # Server-side API routes
│       ├── chat/route.ts         # POST → Claude API + direct vault actions
│       ├── search/route.ts       # POST → Khoj search
│       ├── health/route.ts       # GET → health check
│       ├── planner/route.ts      # GET/POST → planner data
│       ├── speech/route.ts       # POST → ElevenLabs TTS
│       ├── practice/route.ts     # POST → practice mode
│       ├── action/
│       │   ├── log/route.ts      # Writes directly to vault
│       │   ├── memory/route.ts   # Writes directly to vault
│       │   ├── plan/route.ts     # POST → n8n webhook
│       │   ├── email/route.ts    # POST → n8n webhook
│       │   ├── remind/route.ts   # POST → n8n webhook
│       │   └── crm/route.ts      # POST → n8n webhook
│       └── vault/
│           ├── list/route.ts     # GET → list vault files
│           ├── read/route.ts     # POST → read vault file
│           └── write/route.ts    # POST → write vault file
│
├── components/
│   ├── layout/                   # Sidebar, Topbar, MainLayout, CommandPalette
│   ├── chat/                     # ChatPanel, ChatMessage, QuickPrompts
│   ├── dashboard/                # StatCard, TaskList, VaultRecent, QuickActions
│   └── ui/                       # Pill, Badge, Button
│
├── lib/                          # Utilities
│   ├── anthropic.ts              # Claude API wrapper
│   ├── vault.ts                  # Vault file operations
│   ├── prompts.ts                # AI system prompts + action parsing
│   ├── khoj.ts                   # Khoj search API
│   ├── n8n.ts                    # n8n webhook caller
│   ├── types.ts                  # TypeScript types
│   └── mock-data.ts              # Mock data fallbacks
│
├── hooks/                        # Custom React hooks
│   ├── useChat.ts
│   ├── useTasks.ts
│   └── useKeyboard.ts
│
├── docker/                       # Docker configs for VPS services
│   ├── docker-compose.yml
│   ├── docker-compose.n8n.yml
│   ├── docker-compose.khoj.yml
│   └── Dockerfile
│
├── vault-template/               # Vault starter structure
│   ├── 00-Inbox/ ... 06-Reviews/
│   ├── 07-Agent-Memory/          # Agent persistent memory
│   └── 99-System/templates/      # Note templates
│
├── n8n-workflows/                # Exported n8n workflow JSON files
├── scripts/                      # Docker management scripts
└── docs/                         # Documentation
```

---

## Docker Services on VPS

### 7 Containers (managed by Coolify)

| # | Service | Image | Port | URL | RAM |
|---|---------|-------|------|-----|-----|
| 1 | Coolify Proxy | traefik:v2.x | 80/443 | *.insighter.digital | 64 MB |
| 2 | Void Dashboard | node:20 (Next.js) | 3000 | void.insighter.digital | 256 MB |
| 3 | n8n | n8nio/n8n | 5678 | n8n.insighter.digital | 1 GB |
| 4 | n8n PostgreSQL | postgres:16-alpine | 5432 | internal only | 256 MB |
| 5 | Khoj | ghcr.io/khoj-ai/khoj | 42110 | khoj.insighter.digital | 2.5 GB |
| 6 | Khoj PostgreSQL | pgvector/pgvector:pg16 | 5433 | internal only | 512 MB |
| 7 | SearXNG | searxng/searxng | 8080 | internal only | 128 MB |

**Total RAM: ~5 GB of 8 GB** (Hostinger KVM 2)

---

## Environment Variables (.env.local)

```bash
# === AI (REQUIRED) ===
ANTHROPIC_API_KEY=sk-ant-...

# === n8n ===
N8N_WEBHOOK_BASE=http://n8n:5678/webhook

# === Khoj ===
KHOJ_BASE_URL=http://khoj:42110
KHOJ_API_KEY=your-khoj-api-token
USE_KHOJ=true

# === Vault ===
VAULT_PATH=/opt/void-vault

# === ElevenLabs (optional — for speech) ===
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# === Telegram (for notifications) ===
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# === Timezone ===
TIMEZONE=Asia/Dhaka
```

---

## API Routes — Specification

### Direct Actions (no n8n required)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Chat with Claude + auto-execute log/memory/save actions |
| `/api/action/log` | POST | Append to daily note (writes directly to vault) |
| `/api/action/memory` | POST | Save to agent memory (writes directly to vault) |
| `/api/vault/read` | POST | Read vault file |
| `/api/vault/write` | POST | Write vault file |
| `/api/vault/list` | GET | List vault files |
| `/api/search` | POST | Semantic search via Khoj |
| `/api/health` | GET | Health check |
| `/api/planner` | GET | Get today's tasks |
| `/api/speech` | POST | Text-to-speech via ElevenLabs |
| `/api/practice` | POST | Practice mode |

### n8n-Proxied Actions

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/action/plan` | POST | Trigger daily plan creation |
| `/api/action/email` | POST | Read/send email via Gmail |
| `/api/action/remind` | POST | Schedule Telegram reminder |
| `/api/action/crm` | POST | Query/update CRM pipeline |

---

## Markdown Vault Structure

```
/opt/void-vault/
├── 00-Inbox/                    # Quick capture, unsorted notes
├── 01-Daily/                    # Daily notes: 2026-02-02.md
├── 02-Learning/                 # Study notes, course notes
├── 03-Office/                   # Work-related notes
├── 04-Projects/                 # Project documentation
├── 05-References/               # Saved articles, bookmarks
├── 06-Reviews/                  # Weekly/monthly reviews
├── 07-Agent-Memory/             # Agent's persistent memory
│   ├── preferences.md
│   ├── goals.md
│   └── agent-context.md
└── 99-System/templates/         # Note templates
```

---

## Deployment Checklist

```
1. Buy Hostinger KVM 2 VPS — Ubuntu 24.04 + Coolify
2. SSH in, access Coolify, create admin account
3. Configure domain — add A records for: void, n8n, khoj → VPS IP
4. Deploy n8n via Coolify → n8n.insighter.digital
5. Deploy Khoj via Coolify → khoj.insighter.digital
6. Create vault: mkdir -p /opt/void-vault/{00-Inbox,...,07-Agent-Memory,99-System}
7. Write initial memory files: preferences.md, goals.md, agent-context.md
8. Configure Khoj: admin panel → point to vault → set Claude API key → index
9. Create Telegram bot via @BotFather → get token
10. Build n8n workflows
11. Push dashboard to GitHub
12. Deploy dashboard via Coolify (Nixpacks) → void.insighter.digital
13. Set environment variables in Coolify
14. Test full flow: chat → vault write → Khoj search
15. Set up Coolify database backups
```

---

## Quick Reference — Key Commands

```bash
# Local development
npm run dev                          # Start dashboard locally
npm run build                        # Production build
npm run lint                         # Check code quality

# Git → auto-deploy via Coolify
git add . && git commit -m "msg" && git push

# VPS access
ssh root@69.62.80.66
docker ps                            # See running containers
docker logs container_name -f        # Live logs
```
