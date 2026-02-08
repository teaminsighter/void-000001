# VOID — Layer-by-Layer Build Plan

> **One layer at a time. Test before moving on. Ship clean code.**

---

## Overview: 8 Layers

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
│ LAYER 8: Auth, Theme, UI Overhaul, Widget Dashboard  IN PROGRESS│
│ Password auth, dark/light theme, Linear-style UI, widgets       │
│ TEST: Full system works end-to-end with auth + configurable UI  │
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

## Complete Folder Structure (Current State)

```
void-000001/
├── .env.local                      # Secrets (NEVER commit)
├── .env.example                    # Template for secrets (commit)
├── .gitignore
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
│
├── app/                            # === NEXT.JS APP ===
│   ├── layout.tsx                  # Root layout (fonts, theme)
│   ├── page.tsx                    # Home page (/)
│   ├── globals.css                 # Tailwind v4 + custom styles
│   ├── agent/page.tsx              # Chat with AI (/agent)
│   ├── planner/page.tsx            # Daily planner (/planner)
│   ├── vault/page.tsx              # Vault browser (/vault)
│   ├── mail/page.tsx               # Email inbox (/mail)
│   ├── research/page.tsx           # Research (/research)
│   ├── saved/page.tsx              # Saved items (/saved)
│   ├── bots/page.tsx               # Bot status (/bots)
│   ├── practice/page.tsx           # Practice (/practice)
│   └── api/                        # === BACKEND API ROUTES ===
│       ├── health/route.ts
│       ├── chat/route.ts           # POST → Claude API (direct vault writes)
│       ├── planner/route.ts
│       ├── speech/route.ts
│       ├── search/route.ts         # POST → Khoj
│       ├── practice/route.ts
│       ├── vault/
│       │   ├── list/route.ts
│       │   ├── read/route.ts
│       │   └── write/route.ts
│       └── action/
│           ├── plan/route.ts       # POST → n8n /webhook/plan
│           ├── log/route.ts        # POST → writes directly to vault
│           ├── memory/route.ts     # POST → writes directly to vault
│           ├── email/route.ts      # POST → n8n /webhook/email
│           ├── remind/route.ts     # POST → n8n /webhook/remind
│           └── crm/route.ts        # POST → n8n /webhook/crm
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MainLayout.tsx
│   │   ├── CommandPalette.tsx
│   │   └── index.ts
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── QuickPrompts.tsx
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── EmailPreview.tsx
│   │   ├── VaultRecent.tsx
│   │   ├── PipelineMini.tsx
│   │   ├── QuickActions.tsx
│   │   └── index.ts
│   └── ui/
│       ├── Pill.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── index.ts
│
├── lib/
│   ├── anthropic.ts                # Claude API wrapper
│   ├── vault.ts                    # Vault file operations (direct filesystem)
│   ├── prompts.ts                  # AI system prompts + action parsing
│   ├── khoj.ts                     # Khoj search API
│   ├── types.ts                    # TypeScript types
│   ├── n8n.ts                      # n8n webhook caller
│   └── mock-data.ts                # Mock data fallbacks
│
├── hooks/
│   ├── useChat.ts
│   ├── useTasks.ts
│   └── useKeyboard.ts
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.n8n.yml
│   ├── docker-compose.khoj.yml
│   ├── Dockerfile
│   ├── .env
│   └── .env.example
│
├── vault-template/                 # Vault starter folders
│   ├── 00-Inbox/
│   ├── 01-Daily/
│   ├── 02-Learning/
│   ├── 03-Office/
│   ├── 04-Projects/
│   ├── 05-References/
│   ├── 06-Reviews/
│   ├── 07-Agent-Memory/
│   │   ├── preferences.md
│   │   ├── goals.md
│   │   └── agent-context.md
│   └── 99-System/templates/daily.md
│
├── n8n-workflows/                  # Exported n8n workflow JSON files
│   ├── README.md
│   └── 01-daily-plan.json ... 13-memory-updater.json
│
├── scripts/                        # Docker management scripts
│   ├── start-n8n.sh / stop-n8n.sh
│   ├── start-khoj.sh / stop-khoj.sh
│   └── docker-compose.*.yml
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

## Layer 8 Roadmap (Current)

| Phase | Feature | Status |
|-------|---------|--------|
| 8.1 | Password authentication (JWT + middleware) | In progress |
| 8.2 | Dark/Light theme toggle | Planned |
| 8.3 | UI overhaul (Linear-style cleanup) | Planned |
| 8.4 | Widget dashboard system | Planned |
| 8.5 | Agent widget creation action | Planned |
| 8.6 | Chart widgets (Recharts) | Planned |

---

> **Note:** Layer 4 step 4.1 code samples were initial scaffolds — real implementations now exist in `lib/`. See the actual source files for current API logic.
