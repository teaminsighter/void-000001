# VOID — Layer-by-Layer Build Plan

> **One layer at a time. Test before moving on. Ship clean code.**

---

## Overview: 10 Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: Project Scaffold                                 DONE  │
│ Create project, folders, configs, Docker files, vault template  │
│ TEST: npm run dev shows empty dark page                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: Layout Shell                                     DONE  │
│ Sidebar, Topbar, CommandPalette, page routing                   │
│ TEST: Can navigate between 8 empty pages, ⌘K works              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: UI Pages (Mock Data)                             DONE  │
│ All 8 pages built with hardcoded fake data                      │
│ TEST: Dashboard looks complete, interactions work (no real API) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: API Routes (Local)                               DONE  │
│ All /api/* routes created, connected to Claude + Khoj + vault   │
│ TEST: curl localhost:3000/api/health returns JSON               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: VPS + Docker Services                            DONE  │
│ Deploy Khoj, n8n on VPS via Coolify                             │
│ TEST: n8n.insighter.digital and khoj.insighter.digital load     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 6: n8n Workflows                                    DONE  │
│ Build all automation workflows in n8n                           │
│ TEST: Telegram /plan command creates a daily note in vault      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 7: Deploy Dashboard + Connect                       DONE  │
│ Deploy dashboard to VPS, connect to real Khoj/n8n/Claude        │
│ TEST: Chat with agent → creates real vault file                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 8 / PHASE 2: Streaming, Auth, Voice, Telegram, Files DONE │
│ SSE streaming, JWT auth, ElevenLabs TTS, Telegram agent,        │
│ file uploads, version history, conversation persistence          │
│ TEST: Full end-to-end — browser + Telegram, streaming + tools   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 9: Telegram Auto-Reply + Discord Agent               DONE  │
│ Owner/external split, persona auto-reply as Imran, contacts,     │
│ outbound messaging, Discord /void slash command, notifications   │
│ TEST: External user messages → persona reply + owner notified    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 10: Gmail Auto-Triage Pipeline                       DONE  │
│ n8n polls Gmail → Claude classifies → vault + SQLite storage,    │
│ urgent alerts, spam auto-archive, 5 Gmail tools, weekly report  │
│ TEST: "check my email" returns classified inbox, reply works     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Actual Tech Stack

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
| **Coolify** | latest | Deployment platform on Hostinger VPS |
| **Node.js** | 20 LTS | Runtime |

**Deployment:** Coolify on Hostinger VPS (69.62.80.66) with Nixpacks build
**Domains:** void.insighter.digital | khoj.insighter.digital | n8n.insighter.digital

---

## Architecture

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

**Key rules:**
- Dashboard hides all secrets — browser never sees API keys
- Claude thinks, dashboard acts directly for core operations
- Core actions (log, memory, save) write directly to vault filesystem — no n8n needed
- n8n handles complex integrations only (email, reminders, CRM, plans)
- Vault is permanent markdown storage
- Khoj makes vault searchable via embeddings

---

## Complete Folder Structure (Current State — Post Phase 2)

```
void-000001/
├── .env.local                      # Secrets (NEVER commit)
├── .env.example                    # Template for secrets (commit)
├── .gitignore
├── package.json
├── next.config.ts                  # serverExternalPackages: better-sqlite3, pdf-parse
├── middleware.ts                   # JWT auth guard (PUBLIC_PATHS whitelist)
├── postcss.config.mjs
├── tsconfig.json
├── README.md
│
├── app/                            # === NEXT.JS APP ===
│   ├── layout.tsx                  # Root layout (fonts, theme)
│   ├── page.tsx                    # Home dashboard (/)
│   ├── globals.css                 # Tailwind v4 + custom styles
│   ├── agent/page.tsx              # AI chat (/agent)
│   ├── planner/page.tsx            # Daily planner (/planner)
│   ├── vault/page.tsx              # Vault browser (/vault)
│   ├── login/page.tsx              # Password login (/login)
│   ├── mail/page.tsx               # Email inbox (/mail)
│   ├── research/page.tsx           # Research (/research)
│   ├── saved/page.tsx              # Saved items (/saved)
│   ├── bots/page.tsx               # Bot status (/bots)
│   ├── practice/page.tsx           # Voice practice (/practice)
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
│       │   └── webhook/route.ts    # POST → Telegram bot (full agent)
│       ├── health/route.ts         # GET → health check
│       ├── planner/route.ts        # GET/POST → today's tasks
│       ├── speech/route.ts         # POST → ElevenLabs TTS
│       ├── search/route.ts         # POST → Khoj semantic search
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
│   │   ├── MainLayout.tsx, LayoutWrapper.tsx
│   │   ├── Sidebar.tsx, Topbar.tsx
│   │   └── CommandPalette.tsx
│   ├── chat/                       # Chat UI
│   │   ├── ChatPanel.tsx           # Full chat (streaming, attachments, voice)
│   │   ├── ChatMessage.tsx         # Message bubble (markdown, TTS)
│   │   ├── ToolActions.tsx         # Tool execution badges
│   │   ├── QuickPrompts.tsx        # Suggested prompts
│   │   ├── FileUpload.tsx          # Drag-drop file upload
│   │   ├── VoiceButton.tsx         # Hold-to-talk STT mic
│   │   └── SpeakButton.tsx         # TTS play button
│   ├── dashboard/                  # Home page widgets
│   │   ├── StatCard.tsx, TaskList.tsx, VaultRecent.tsx
│   │   ├── EmailPreview.tsx, PipelineMini.tsx
│   │   ├── HomeRightPanel.tsx, QuickActions.tsx
│   ├── agent/AgentRightPanel.tsx
│   ├── vault/                      # Vault browser
│   │   ├── FileTable.tsx, FolderFilter.tsx, VaultSearch.tsx
│   ├── planner/TaskManager.tsx, TimeBlocks.tsx
│   ├── ui/Button.tsx, Badge.tsx, Pill.tsx
│   └── research/, mail/, saved/, bots/
│
├── lib/                            # === CORE LIBRARIES ===
│   ├── anthropic.ts                # Claude API: chat(), chatWithTools(), streamChatWithTools()
│   ├── tools.ts                    # 21 tool schemas for Claude function calling
│   ├── vault.ts                    # Vault: read/write/list/move/delete + versioning
│   ├── prompts.ts                  # System prompt builder
│   ├── khoj.ts                     # Khoj search + RAG: search(), khojChat()
│   ├── db.ts                       # SQLite: conversations + messages
│   ├── auth.ts                     # JWT: signToken(), verifyToken()
│   ├── uploads.ts                  # File upload: saveUpload(), moveToVault()
│   ├── telegram.ts                 # Telegram Bot API helpers
│   ├── events.ts                   # Event bus: emitDataChanged()
│   ├── types.ts                    # TypeScript types
│   ├── n8n.ts                      # n8n webhook caller
│   └── mock-data.ts                # Mock data fallbacks
│
├── hooks/
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
│   ├── 00-Inbox/ through 06-Reviews/
│   ├── 07-Agent-Memory/            # goals.md, preferences.md, agent-context.md
│   └── 99-System/templates/daily.md
│
├── n8n-workflows/                  # 13 exported n8n workflow JSONs
│   ├── 01-daily-plan.json through 13-memory-updater.json
│   └── README.md
│
├── scripts/
│   ├── setup-telegram-webhook.sh
│   ├── start-n8n.sh, stop-n8n.sh
│   └── start-khoj.sh, stop-khoj.sh
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── SETUP.md
```

---

## Connection Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR DEVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │   Browser   │    │  Telegram   │    │  Discord    │                    │
│   │ (Dashboard) │    │  (Mobile)   │    │ (/void cmd) │                    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
│          │                  │                  │                            │
└──────────┼──────────────────┼──────────────────┼────────────────────────────┘
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
│   │ void.insighter.   │ │ n8n.insighter.│ │ khoj.insighter│                │
│   │   digital         │ │   digital     │ │   .digital    │                │
│   └─────────┬─────────┘ └───────┬───────┘ └───────┬───────┘                │
│             │                   │                 │                         │
│             │    ┌──────────────┼─────────────────┤                         │
│             │    │              │                 │                         │
│             ▼    ▼              ▼                 ▼                         │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    /opt/void-vault                           │          │
│   │                    (Markdown Vault)                          │          │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐   │          │
│   │  │01-Daily │ │02-Learn │ │03-Office│ │07-Agent-Memory   │   │          │
│   │  └─────────┘ └─────────┘ └─────────┘ └──────────────────┘   │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                  │                         │
│                                                  │ Read-only mount         │
│                                                  ▼                         │
│                                        ┌───────────────┐                   │
│                                        │   pgvector    │                   │
│                                        │  (Embeddings) │                   │
│                                        │    :5433      │                   │
│                                        └───────────────┘                   │
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

---

## Data Flow Examples

### Flow 1: "Plan my day"

```
1. You type in Dashboard: "Plan my day, 4h office, meeting at 2pm"
2. Dashboard → POST /api/chat
3. API route → GET Khoj /api/search?q=preferences+goals (get context)
4. API route → POST Claude API (with context + your message)
5. Claude responds with plan + action block
6. API route → POST n8n /webhook/plan (trigger workflow)
7. n8n → reads preferences.md
8. n8n → writes 01-Daily/2026-02-03.md
9. n8n → sends Telegram notification
10. Response returns to Dashboard
11. You see the plan in chat
12. Khoj → re-indexes (next cycle) → file is searchable
```

### Flow 2: Telegram /log

```
1. You send to Telegram: "/log finished marketing review"
2. Telegram → n8n Telegram trigger
3. n8n → routes to Quick Log workflow
4. n8n → reads 01-Daily/2026-02-03.md
5. n8n → appends under "## Log" section
6. n8n → writes file back
7. n8n → replies on Telegram: "✓ Logged"
```

### Flow 3: Dashboard Quick Log (direct)

```
1. You tell the agent: "log: finished the marketing review"
2. Dashboard → POST /api/chat
3. Claude responds with action block: {"type": "log", "payload": {"text": "..."}}
4. Chat route → calls handleActionDirect("log", ...) → writes directly to vault
5. No n8n involved — faster, simpler
```

---

## Layer 8 / Phase 2 — COMPLETED (commit 5bcab80)

**87 files changed, 6674 insertions, 3923 deletions**

| Feature | What was built |
|---------|---------------|
| SSE Streaming | `/api/chat-stream` — token-by-token streaming with fallback to `/api/chat` |
| JWT Auth | Password login at `/login`, middleware guards all routes, `jose` library |
| File Uploads | Drag-drop images/PDFs, `/api/upload`, PDF text extraction via `pdf-parse` |
| Version History | Auto-snapshots in `.versions/` before every overwrite, restore any version |
| Voice | `VoiceButton` (STT via Web Speech API) + `SpeakButton` (TTS via ElevenLabs) |
| Telegram Agent | `/api/telegram/webhook` — full tool pipeline, same 21 tools as browser |
| Conversations | SQLite persistence via `better-sqlite3`, `/api/conversations` CRUD |
| Khoj Upgrade | Semantic search + `khojChat()` RAG with local grep fallback |
| 21 Tools | 17 original + `vault_versions` + `vault_restore` + `vault_ask` + `save_attachment` |

## Layer 9 — Telegram Auto-Reply + Discord Agent — COMPLETED

| Feature | What was built |
|---------|---------------|
| Telegram Auto-Reply | Owner gets full agent (27 tools), external users get persona auto-reply as Imran |
| Persona System | `buildPersonaPrompt()` reads `07-Agent-Memory/persona.md` for tone/rules |
| Contact Registry | `telegram_contacts` + `discord_contacts` tables with auto-registration |
| 6 Messaging Tools | `telegram_send/contacts/history` + `discord_send/contacts/history` |
| Discord Slash Command | `/void message` via HTTP Interactions (no WebSocket) |
| ed25519 Verification | Discord signature verification in `lib/discord.ts` |
| Owner Notifications | Owner gets DM/message when external users interact |
| Contacts API | `/api/contacts` returns both Telegram + Discord contacts |
| Setup Endpoints | `/api/telegram/setup` + `/api/discord/setup` for webhook/command registration |

## Layer 10 — Gmail Auto-Triage Pipeline — COMPLETED

| Feature | What was built |
|---------|---------------|
| Auto-Triage | n8n polls Gmail every 5 min → Claude classifies (category/priority/action/summary) |
| Vault Storage | Classified emails saved to `00-Inbox/emails/` as markdown with YAML frontmatter |
| SQLite Storage | `gmail_emails` table with 6 CRUD functions for fast querying |
| Smart Notifications | Urgent emails → instant Telegram alert; spam → auto-archived |
| 5 Gmail Tools | `gmail_inbox`, `gmail_read`, `gmail_reply`, `gmail_archive`, `gmail_search` |
| Human-in-the-Loop | `gmail_reply` always asks user to confirm before sending |
| Morning Briefing | Enhanced with email summary (unread count, urgent emails, pending replies) |
| Weekly Report | n8n workflow (Sunday 9 PM) — Claude analyzes patterns, saves to vault |
| Email Manager | Upgraded n8n workflow with read/send/archive/search actions |
| Triage API | `/api/gmail/triage` (POST from n8n) + `/api/gmail/stats` (GET for reports) |

## Layer 10b — Personal Knowledge Base (References) — COMPLETED

| Feature | What was built |
|---------|---------------|
| Vault Structure | `05-References/` with subfolders: websites/, videos/, contacts/, emails/, notes/ |
| Agent Instructions | System prompt updated — agent saves references with YAML frontmatter + context |
| Template Notes | 4 example notes (website, video, contact, code tip) showing consistent format |
| Natural Recall | "What site is good for button design?" → vault_ask finds it via Khoj semantic search |
| Cross-Platform | Works from web chat, Telegram, Discord — same vault_write + vault_ask tools |
| No New Code | Zero new tools, APIs, or DB tables — leverages existing vault + Khoj infrastructure |

## Layer 11 — Web Fetch & Search — COMPLETED

| Feature | What was built |
|---------|---------------|
| `web_fetch` tool | Fetches any URL → extracts title, description, OG tags, content preview (2000 char limit) |
| `web_search` tool | Queries self-hosted SearXNG → returns top results for Claude to synthesize |
| YouTube oEmbed | YouTube URLs get clean metadata via oEmbed API (title, author, thumbnail) |
| SSRF Protection | Blocks private IPs (localhost, 10.x, 172.x, 192.168.x, metadata endpoints) |
| Privacy Control | web_search only fires when user explicitly asks; vault search always preferred |
| `lib/web.ts` | New helper library — zero dependencies (native fetch + regex HTML parsing) |
| All 4 Platforms | Tool cases added to chat, chat-stream, Telegram webhook, Discord interactions |
| `SEARXNG_URL` env | Configurable SearXNG endpoint (self-hosted, no API keys needed) |

## What's Next (Phase 3 — Planned)

| Feature | Description |
|---------|-------------|
| UI Overhaul | Linear-style cleanup, better dark theme |
| Widget Dashboard | Configurable home page widgets |
| Agent Widgets | Agent can create/update dashboard widgets |
| Chart Widgets | Data visualization (Recharts or similar) |
| Mobile PWA | Progressive web app for mobile access |
| WhatsApp Integration | WhatsApp Business API via n8n (when ready) |

---

> **Note:** All layers 1-11 are complete. The codebase is fully functional across web, Telegram, Discord, and Gmail. 34 tools total.
