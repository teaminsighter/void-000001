# VOID — Complete Build Guide

> **The single reference document for understanding and working on VOID.**

---

## What is VOID?

VOID is a personal AI operating system — a web dashboard where you talk to a Claude-powered agent in natural language. It plans your day, manages notes, searches your knowledge vault by meaning, handles file attachments (images/PDFs), speaks aloud, manages email, and runs automated workflows. Accessible via browser, Telegram, and Discord.

**Stack:** Next.js 16 + Tailwind CSS v4 + Claude API + SQLite + Khoj + n8n
**Hosting:** Hostinger VPS (Ubuntu) + Coolify
**URL:** void.insighter.digital
**Platforms:** Web | Telegram (bot) | Discord (/void slash command)

---

## Architecture

```
Browser (you)     Telegram (mobile)     Discord (/void)
    ↓ HTTPS           ↓ Telegram API        ↓ HTTP Interactions
Coolify Reverse Proxy (:443) — auto SSL, routes by subdomain
    ↓ HTTP internal
Void Dashboard (:3000) — Next.js 16, hides API keys
    ├── Claude API (reasoning + 30 tools)
    ├── Vault filesystem (/opt/void-vault — direct read/write)
    ├── SQLite DB (/app/data/void.db — conversations + contacts + emails)
    ├── Khoj (:42110 — semantic search + RAG)
    ├── n8n (:5678 — Gmail triage, reminders, scheduled workflows)
    └── ElevenLabs (TTS) / Web Speech API (STT)
```

**Key rules:**
- Dashboard hides all secrets — browser never sees API keys
- Claude reasons + calls tools, dashboard executes them
- Core vault operations are direct filesystem — no n8n needed
- n8n only for complex integrations (email, CRM, scheduled workflows)
- Vault is permanent markdown storage with auto-versioning
- Khoj makes vault searchable via embeddings, with local search fallback

---

## Tech Stack — Exact Versions

| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 16.1.6 (App Router) | Dashboard frontend + API routes |
| **React** | 19.2.3 | UI components |
| **Tailwind CSS** | v4 | Styling (CSS-first config) |
| **TypeScript** | 5.x | Type safety |
| **Anthropic SDK** | 0.72.1 | Claude API client |
| **better-sqlite3** | latest | Conversation persistence |
| **pdf-parse** | latest | PDF text extraction |
| **jose** | latest | JWT auth (signing + verification) |
| **n8n** | latest | Automation engine (Docker) |
| **Khoj** | latest | Vector search + semantic memory (Docker) |
| **PostgreSQL** | 16 + pgvector | Khoj embeddings + n8n data |
| **Coolify** | latest | Deployment platform on Hostinger VPS |
| **Node.js** | 20 LTS | Runtime |

---

## Project Folder Structure (Current)

```
void-000001/
├── .env.local                      # Secrets (NEVER commit)
├── .env.example                    # Template for secrets
├── .gitignore
├── package.json
├── next.config.ts                  # serverExternalPackages: better-sqlite3, pdf-parse
├── middleware.ts                   # JWT auth guard (PUBLIC_PATHS whitelist)
├── tsconfig.json
├── postcss.config.mjs
│
├── app/                            # === NEXT.JS PAGES ===
│   ├── layout.tsx                  # Root layout (fonts, theme)
│   ├── globals.css                 # Tailwind v4 + custom styles
│   ├── page.tsx                    # Home dashboard (/)
│   ├── agent/page.tsx              # AI chat (/agent)
│   ├── planner/page.tsx            # Daily planner (/planner)
│   ├── vault/page.tsx              # Vault browser (/vault)
│   ├── mail/page.tsx               # Email inbox (/mail)
│   ├── research/page.tsx           # Research (/research)
│   ├── saved/page.tsx              # Saved items (/saved)
│   ├── bots/page.tsx               # Bot status (/bots)
│   ├── practice/page.tsx           # Voice practice (/practice)
│   ├── login/page.tsx              # Password login (/login)
│   │
│   └── api/                        # === BACKEND API ROUTES ===
│       ├── chat/route.ts           # POST → Claude + 21 tools (non-streaming)
│       ├── chat-stream/route.ts    # POST → SSE streaming chat (same tools)
│       ├── upload/route.ts         # POST → file upload (image/PDF)
│       ├── auth/
│       │   ├── login/route.ts      # POST → JWT login
│       │   └── logout/route.ts     # POST → clear JWT cookie
│       ├── conversations/
│       │   ├── route.ts            # GET/POST → list/create conversations
│       │   └── [id]/
│       │       ├── route.ts        # GET/DELETE → get/delete conversation
│       │       └── messages/route.ts # GET → messages for conversation
│       ├── telegram/
│       │   ├── webhook/route.ts    # POST → Telegram bot (owner agent + auto-reply)
│       │   └── setup/route.ts      # POST → register Telegram webhook
│       ├── discord/
│       │   ├── interactions/route.ts # POST → Discord slash command handler
│       │   └── setup/route.ts      # GET/POST → register /void slash command
│       ├── gmail/
│       │   ├── triage/route.ts     # POST → receives classified emails from n8n
│       │   └── stats/route.ts      # GET → email statistics for reports
│       ├── contacts/route.ts       # GET → list Telegram + Discord contacts
│       ├── health/route.ts         # GET → health check
│       ├── planner/route.ts        # GET/POST → today's tasks
│       ├── speech/route.ts         # POST → ElevenLabs TTS
│       ├── search/route.ts         # POST → Khoj search
│       ├── practice/route.ts       # POST → practice mode
│       ├── vault/
│       │   ├── list/route.ts       # GET → list vault files
│       │   ├── read/route.ts       # POST → read vault file
│       │   └── write/route.ts      # POST → write vault file
│       └── action/                 # n8n-proxied actions
│           ├── log/route.ts        # POST → daily note (direct)
│           ├── memory/route.ts     # POST → agent memory (direct)
│           ├── plan/route.ts       # POST → n8n /webhook/plan
│           ├── email/route.ts      # POST → n8n /webhook/email
│           ├── remind/route.ts     # POST → n8n /webhook/remind
│           └── crm/route.ts        # POST → n8n /webhook/crm
│
├── components/
│   ├── layout/                     # App shell
│   │   ├── MainLayout.tsx          # Sidebar + content area
│   │   ├── LayoutWrapper.tsx       # Client wrapper for layout
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Topbar.tsx              # Top bar (breadcrumb, actions)
│   │   └── CommandPalette.tsx      # ⌘K command palette
│   ├── chat/                       # Chat UI
│   │   ├── ChatPanel.tsx           # Full chat (streaming, attachments, voice)
│   │   ├── ChatMessage.tsx         # Message bubble (markdown, TTS, attachments)
│   │   ├── ToolActions.tsx         # Tool execution badges
│   │   ├── QuickPrompts.tsx        # Suggested prompts
│   │   ├── FileUpload.tsx          # Drag-drop file upload
│   │   ├── VoiceButton.tsx         # Hold-to-talk STT mic button
│   │   └── SpeakButton.tsx         # TTS play button on messages
│   ├── dashboard/                  # Home page widgets
│   │   ├── StatCard.tsx, TaskList.tsx, VaultRecent.tsx
│   │   ├── EmailPreview.tsx, PipelineMini.tsx
│   │   ├── HomeRightPanel.tsx, QuickActions.tsx
│   ├── agent/                      # Agent page
│   │   └── AgentRightPanel.tsx
│   ├── ui/                         # Shared UI primitives
│   │   ├── Button.tsx, Badge.tsx, Pill.tsx
│   ├── vault/                      # Vault browser
│   │   ├── FileTable.tsx, FolderFilter.tsx, VaultSearch.tsx
│   ├── planner/                    # Planner page
│   │   ├── TaskManager.tsx, TimeBlocks.tsx
│   ├── research/, mail/, saved/, bots/
│
├── lib/                            # === CORE LIBRARIES ===
│   ├── anthropic.ts                # Claude API: chat(), chatWithTools(), streamChatWithTools()
│   ├── vault.ts                    # Vault: read/write/list/move/delete + versioning
│   ├── tools.ts                    # 30 tool schemas for Claude function calling
│   ├── prompts.ts                  # System prompt builder + persona prompt
│   ├── khoj.ts                     # Khoj search + RAG: searchWithKhoj(), khojChat()
│   ├── db.ts                       # SQLite: conversations + messages + contacts + emails
│   ├── auth.ts                     # JWT: signToken(), verifyToken()
│   ├── uploads.ts                  # File upload: saveUpload(), cleanOldUploads()
│   ├── telegram.ts                 # Telegram Bot API helpers
│   ├── discord.ts                  # Discord API helpers (ed25519 signature, DMs)
│   ├── gmail.ts                    # Gmail helpers (n8n webhook callers + vault storage)
│   ├── events.ts                   # Event bus: emitDataChanged()
│   ├── types.ts                    # TypeScript types
│   ├── n8n.ts                      # n8n webhook caller
│   └── mock-data.ts                # Mock data fallbacks
│
├── hooks/                          # React hooks
│   ├── useChat.ts, useTasks.ts, useKeyboard.ts, useTheme.ts
│
├── docker/                         # Docker configs for VPS
│   ├── Dockerfile                  # Dashboard multi-stage build
│   ├── docker-compose.yml          # Main orchestrator (includes khoj + n8n)
│   ├── docker-compose.khoj.yml     # Khoj + pgvector + SearXNG
│   ├── docker-compose.n8n.yml      # n8n + PostgreSQL
│   └── .env                        # Production env vars template
│
├── vault-template/                 # Vault starter structure
│   ├── 00-Inbox/ through 04-Projects/
│   ├── 05-References/              # Personal knowledge base (agent saves here)
│   │   ├── websites/               # URLs, tools, design resources
│   │   ├── videos/                 # YouTube, tutorials, talks
│   │   ├── contacts/               # Phone numbers, addresses, people
│   │   ├── emails/                 # Important email references
│   │   └── notes/                  # Tips, code snippets, how-tos
│   ├── 06-Reviews/ + 07-Agent-Memory/
│   └── 99-System/templates/daily.md
│
├── n8n-workflows/                  # 15 exported n8n workflow JSONs
│   ├── 01-daily-plan.json through 15-weekly-email-report.json
│   └── README.md
│
├── scripts/
│   ├── setup-telegram-webhook.sh   # Register Telegram webhook
│   ├── start-n8n.sh, stop-n8n.sh
│   └── start-khoj.sh, stop-khoj.sh
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── SETUP.md
```

---

## 34 Agent Tools

The Claude agent has 34 function-calling tools defined in `lib/tools.ts`:

| # | Tool | Category | What it does |
|---|------|----------|-------------|
| 1 | task_add | Tasks | Add a task to today's planner |
| 2 | task_remove | Tasks | Remove a task by text match |
| 3 | task_toggle | Tasks | Toggle task done/undone |
| 4 | task_list | Tasks | List today's tasks |
| 5 | plan_generate | Planning | AI-generate daily plan with time blocks |
| 6 | plan_set_schedule | Planning | Set specific time blocks in schedule |
| 7 | log_entry | Notes | Append timestamped entry to daily note |
| 8 | save_note | Notes | Create/overwrite a vault file |
| 9 | save_memory | Notes | Save to agent memory (preference/goal/context) |
| 10 | vault_read | Vault | Read a vault file |
| 11 | vault_list | Vault | List files in a vault folder |
| 12 | vault_search | Vault | Semantic search via Khoj (fallback: local grep) |
| 13 | vault_move | Vault | Move/rename a vault file |
| 14 | vault_delete | Vault | Soft-delete to .trash/ |
| 15 | vault_ask | Knowledge | RAG question about vault content via Khoj |
| 16 | vault_versions | Version | List version history of a file |
| 17 | vault_restore | Version | Restore a previous version |
| 18 | save_attachment | Files | Move uploaded file to vault permanently |
| 19 | gmail_inbox | Gmail | List emails with category/priority/status filters |
| 20 | gmail_read | Gmail | Read a specific email by subject/sender search |
| 21 | gmail_reply | Gmail | Reply to email (human-in-the-loop confirmation) |
| 22 | gmail_archive | Gmail | Archive emails matching a query |
| 23 | gmail_search | Gmail | Search emails by keyword |
| 24 | set_reminder | n8n | Schedule a reminder notification |
| 25 | crm_update | n8n | Query/update CRM deals and contacts |
| 26 | telegram_send | Telegram | Send message to a saved contact |
| 27 | telegram_contacts | Telegram | List/search Telegram contacts |
| 28 | telegram_history | Telegram | Read conversation history with a contact |
| 29 | discord_send | Discord | Send DM to a saved contact |
| 30 | discord_contacts | Discord | List/search Discord contacts |
| 31 | discord_history | Discord | Read conversation history with a contact |
| 32 | web_fetch | Web | Fetch URL metadata (title, description, OG tags, content) |
| 33 | web_search | Web | Search the web via SearXNG (user must explicitly ask) |

---

## Docker Services on VPS

### 7 Containers

| # | Service | Image | Port | URL |
|---|---------|-------|------|-----|
| 1 | Coolify Proxy | traefik:v2.x | 80/443 | *.insighter.digital (SSL) |
| 2 | Dashboard | node:20-alpine (Next.js standalone) | 3000 | void.insighter.digital |
| 3 | n8n | n8nio/n8n | 5678 | n8n.insighter.digital |
| 4 | n8n PostgreSQL | postgres:16-alpine | 5432 | internal only |
| 5 | Khoj | ghcr.io/khoj-ai/khoj | 42110 | khoj.insighter.digital |
| 6 | Khoj PostgreSQL | pgvector/pgvector:pg16 | 5432 | internal only |
| 7 | SearXNG | searxng/searxng | 8080 | internal only |

---

## Environment Variables (.env.local)

```bash
# === AI (REQUIRED) ===
ANTHROPIC_API_KEY=sk-ant-...

# === n8n ===
N8N_WEBHOOK_BASE=http://n8n:5678/webhook    # Docker internal
# N8N_WEBHOOK_BASE=http://localhost:5678/webhook  # Local dev

# === Khoj ===
KHOJ_BASE_URL=http://khoj:42110              # Docker internal
# KHOJ_BASE_URL=http://localhost:42110        # Local dev
KHOJ_API_KEY=your-khoj-api-token
USE_KHOJ=true

# === Vault ===
VAULT_PATH=/opt/void-vault                   # Production
# VAULT_PATH=./vault                          # Local dev

# === Auth ===
VOID_PASSWORD=your-secure-password
VOID_JWT_SECRET=<openssl rand -hex 32>

# === Database ===
VOID_DB_PATH=/app/data/void.db               # Production
# VOID_DB_PATH=./data/void.db                 # Local dev

# === ElevenLabs (optional) ===
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# === Telegram ===
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# === Discord ===
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_APPLICATION_ID=your-discord-app-id
DISCORD_PUBLIC_KEY=your-discord-public-key
DISCORD_OWNER_ID=your-discord-user-id

# === Gmail Triage ===
GMAIL_TRIAGE_SECRET=shared-secret-between-n8n-and-void

# === Timezone ===
TIMEZONE=Asia/Dhaka
TZ=Asia/Dhaka
```

---

## Data Flows

### Chat (Browser)
```
1. User types message in /agent page
2. ChatPanel → POST /api/chat-stream (SSE) or fallback /api/chat
3. Route searches Khoj for vault context
4. Route calls streamChatWithTools() with 21 tools
5. Claude reasons, calls tools (e.g., save_note, search_vault)
6. Tool results fed back to Claude for next round (max 10 rounds)
7. Tokens stream back via SSE events: token → tool_start → tool_done → done
8. ChatPanel renders tokens as they arrive
9. Messages persisted to SQLite via db.ts
```

### Chat (Telegram — Owner)
```
1. Owner sends message to Telegram bot
2. Telegram → POST /api/telegram/webhook
3. Webhook checks isOwnerChat() → routes to handleOwnerMessage()
4. Uses same chatWithTools() pipeline as browser (30 tools)
5. Response sent back via Telegram sendMessage API
6. Long messages auto-split at 4096 chars
```

### Chat (Telegram — External User)
```
1. External user messages the bot
2. Webhook checks isOwnerChat() → routes to handleExternalMessage()
3. Auto-registers contact in telegram_contacts table
4. Reads persona.md + today's schedule for context
5. Uses chat() (no tools) with persona prompt → replies as Imran
6. Owner gets notification with message + auto-reply preview
```

### Chat (Discord — /void command)
```
1. User types /void message in Discord server
2. Discord → POST /api/discord/interactions
3. Verifies ed25519 signature, returns DEFERRED response (3-sec limit)
4. Async: isDiscordOwner() → full agent or persona auto-reply
5. editInteractionResponse() sends reply to Discord
6. External users auto-registered, owner notified via DM
```

### Gmail Auto-Triage
```
1. n8n polls Gmail every 5 minutes for unread emails
2. Each email → Claude API classifies (category/priority/action/summary)
3. Classified email → POST /api/gmail/triage
4. Triage endpoint stores in vault (00-Inbox/emails/) + SQLite
5. Urgent emails → instant Telegram notification to owner
6. Spam/newsletters → auto-archived in Gmail
7. User asks VOID "check my email" → gmail_inbox tool queries SQLite
8. User says "reply to Ahmed" → gmail_reply tool (confirms first)
```

### Saving References (Personal Knowledge Base)
```
1. User says "save this URL, it's great for button designs" (web/Telegram/Discord)
2. Agent calls web_fetch → gets real title, description, content preview
3. Agent calls vault_write → 05-References/websites/site-name.md (enriched note)
4. Khoj indexes the note automatically
5. User later asks "what site is good for button design?"
6. Agent calls vault_ask → Khoj semantic search finds the note → returns URL + context
Works for: URLs, YouTube videos, phone numbers, addresses, code tips, email refs
```

### Web Search
```
1. User says "search the web for best CSS framework 2026"
2. Agent calls web_search → queries self-hosted SearXNG
3. SearXNG returns top results (titles, URLs, snippets)
4. Claude reads results and synthesizes a smart answer
Only triggered when user explicitly asks — vault search is always preferred
```

### File Upload
```
1. User drags image/PDF into chat (FileUpload component)
2. POST /api/upload → saves to uploads/<date>/<uuid>_<filename>
3. For PDFs: extracts text via pdf-parse
4. Attachment data sent with next chat message
5. Claude sees image description or PDF text as context
6. Agent can call save_attachment to move to vault permanently
7. Old uploads auto-cleaned after 30 days
```

### Version History
```
1. Any writeFile() call in vault.ts → saveVersion() first
2. Current content saved to .versions/<filepath>/<ISO-timestamp>.md
3. User asks "show versions of goals.md" → vault_versions tool
4. User asks "restore yesterday's version" → vault_restore tool
5. Restore saves current as new version, then overwrites with old content
```

---

## Deployment

### Auto-deploy (Dashboard)
```bash
git push   # Coolify watches master branch → auto-builds via Nixpacks
```

### Manual Docker services (SSH to VPS)
```bash
ssh root@69.62.80.66
cd /path/to/docker
docker-compose -f docker-compose.khoj.yml up -d
docker-compose -f docker-compose.n8n.yml up -d
```

### Telegram Webhook Setup
```bash
./scripts/setup-telegram-webhook.sh
# Registers https://void.insighter.digital/api/telegram/webhook with Telegram
```

---

## Build Notes / Gotchas

- `pdf-parse` must use `require()`, not dynamic import — no `.default` in ESM
- Both `better-sqlite3` and `pdf-parse` in `serverExternalPackages` (next.config.ts)
- Next.js 16 shows middleware deprecation warning — prefers "proxy" convention
- `chatWithTools()` only accepts `Message[]` with string content, not Anthropic ContentBlock arrays
- `addMessage()` signature: `addMessage(conversationId, { id, role, content })` — NOT positional args
- Version filenames use dashes (2026-02-08T06-14-53-069Z.md), restoreVersion does flexible matching
- Telegram webhook is in PUBLIC_PATHS (no JWT) — validates by checking TELEGRAM_CHAT_ID instead

---

## Quick Reference Commands

```bash
# Local development
npm run dev                          # Start dashboard locally
npm run build                        # Production build
npm run lint                         # Check code quality

# Git → auto-deploy
git add . && git commit -m "msg" && git push

# VPS access
ssh root@69.62.80.66
docker ps                            # See running containers
docker logs container_name -f        # Live logs
```
