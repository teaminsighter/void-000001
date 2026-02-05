# VOID — Complete Build Guide

> **One document. Everything you need. Open this in VS Code alongside Claude Code and build.**

---

## What is Void?

Void is your personal AI-powered operating system — a single web dashboard where you talk to an AI agent in natural language, and it plans your day, checks your email, searches your notes, manages your CRM pipeline, sets reminders, logs your thoughts, and runs automated bots. Everything saves to your Obsidian vault. Everything is searchable by meaning. Everything syncs to your devices.

**Name:** Void  
**Stack:** Next.js 14 + Tailwind CSS + Claude API + n8n + Khoj + PostgreSQL + Obsidian Vault  
**Hosting:** Hostinger VPS (Ubuntu 24.04) + Coolify  
**URL:** app.yourdomain.com  

---

## Previous JSX Files — What They Are

You have 3 JSX reference files from our design phase. Here's what each one is:

| File | Purpose | Use it for |
|------|---------|-----------|
| `lifeos-architecture.jsx` | 6-layer system architecture visualization | Understanding how services connect — reference only |
| `lifeos-full-backend.jsx` | Complete backend blueprint (Docker, APIs, data flows, n8n, Coolify) | Understanding infrastructure — reference only |
| `void-dashboard.jsx` | **THE WIREFRAME** — full interactive dashboard with all 8 pages | **This is your design spec.** Build the real dashboard to match this exactly. |
| `lifeos-build-roadmap.jsx` | Skills, build phases, learning roadmap | Your personal learning tracker — reference only |

**Only `void-dashboard.jsx` becomes real code.** The others are documentation/visualization. The real Next.js app will recreate what `void-dashboard.jsx` shows, but with actual API connections, real data, and server-side routes.

---

## Architecture Overview

```
Browser (you)
    ↓ HTTPS
Coolify Reverse Proxy (:443) — auto SSL, routes by subdomain
    ↓ HTTP internal
Void Dashboard (:3000) — Next.js, hides API keys, proxies everything
    ↓ HTTPS              ↓ HTTP internal
Claude API             n8n (:5678) webhooks
  (thinks)               (acts)
                          ↓ HTTPS              ↓ Filesystem
                       Gmail/Telegram/CRM    /opt/void-vault
                       Slack/WhatsApp/MCP     (permanent storage)
                                                ↓ read-only mount
                                             Khoj (:42110)
                                                ↓ SQL
                                             pgvector DB (embeddings)
                                                ↓ P2P sync
                                             Syncthing → Your devices
```

**Rules:** Dashboard hides all secrets. Claude only thinks, never acts. n8n is the only thing that touches external services and vault. Vault is permanent. Khoj makes it searchable. Syncthing syncs everywhere.

---

## Tech Stack — Exact Versions

| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 14.x (App Router) | Dashboard frontend + API routes |
| **React** | 18.x | UI components |
| **Tailwind CSS** | 3.x | Styling |
| **TypeScript** | 5.x | Type safety (recommended but optional) |
| **Claude API** | claude-sonnet-4-20250514 | AI brain (via Anthropic SDK) |
| **n8n** | latest | Automation engine (Docker) |
| **Khoj** | latest | Vector search + semantic memory (Docker) |
| **PostgreSQL** | 16 + pgvector | n8n data + Khoj embeddings |
| **Syncthing** | latest | Vault file sync (Docker) |
| **Coolify** | latest | Deployment platform (pre-installed on Hostinger) |
| **Node.js** | 20 LTS | Runtime |

---

## Project Folder Structure

```
void/
├── .env.local                    # All secrets (NEVER commit)
├── .env.example                  # Template without real values (commit this)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json                 # If using TypeScript
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata, providers
│   ├── page.tsx                  # Home page (dashboard overview)
│   ├── globals.css               # Tailwind imports + custom CSS
│   │
│   ├── agent/
│   │   └── page.tsx              # Agent chat page
│   │
│   ├── planner/
│   │   └── page.tsx              # Daily planner page
│   │
│   ├── vault/
│   │   └── page.tsx              # Vault browser page
│   │
│   ├── mail/
│   │   └── page.tsx              # Email inbox page
│   │
│   ├── research/
│   │   └── page.tsx              # Research page (vault + web search)
│   │
│   ├── saved/
│   │   └── page.tsx              # Saved items / bookmarks page
│   │
│   ├── bots/
│   │   └── page.tsx              # Automation bots status page
│   │
│   └── api/                      # Server-side API routes (secrets stay here)
│       ├── chat/
│       │   └── route.ts          # POST — proxy to Claude API
│       │
│       ├── search/
│       │   └── route.ts          # POST — proxy to Khoj search API
│       │
│       ├── action/
│       │   ├── plan/
│       │   │   └── route.ts      # POST — trigger n8n /webhook/plan
│       │   ├── log/
│       │   │   └── route.ts      # POST — trigger n8n /webhook/log
│       │   ├── email/
│       │   │   └── route.ts      # POST — trigger n8n /webhook/email
│       │   ├── remind/
│       │   │   └── route.ts      # POST — trigger n8n /webhook/remind
│       │   ├── crm/
│       │   │   └── route.ts      # POST — trigger n8n /webhook/crm
│       │   └── save-memory/
│       │       └── route.ts      # POST — trigger n8n /webhook/save-memory
│       │
│       ├── vault/
│       │   ├── read/
│       │   │   └── route.ts      # POST — read vault file contents
│       │   ├── list/
│       │   │   └── route.ts      # GET — list vault files/folders
│       │   └── write/
│       │       └── route.ts      # POST — write/append to vault file
│       │
│       └── health/
│           └── route.ts          # GET — health check endpoint
│
├── components/                   # Shared UI components
│   ├── layout/
│   │   ├── Sidebar.tsx           # Collapsible navigation sidebar
│   │   ├── Topbar.tsx            # Top bar with search + agent button
│   │   └── CommandPalette.tsx    # ⌘K search overlay
│   │
│   ├── chat/
│   │   ├── ChatPanel.tsx         # Message list + input
│   │   ├── ChatMessage.tsx       # Single message bubble
│   │   └── QuickPrompts.tsx      # Suggested action buttons
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Stats display card
│   │   ├── TaskList.tsx          # Checkable task list
│   │   ├── EmailPreview.tsx      # Inbox preview widget
│   │   ├── VaultRecent.tsx       # Recent notes widget
│   │   ├── PipelineMini.tsx      # CRM pipeline mini widget
│   │   └── QuickActions.tsx      # Action buttons row
│   │
│   ├── planner/
│   │   ├── TimeBlocks.tsx        # Daily schedule with time slots
│   │   └── TaskManager.tsx       # Full task list with filters
│   │
│   ├── vault/
│   │   ├── FileTable.tsx         # File browser table
│   │   ├── FolderFilter.tsx      # Folder pill filter
│   │   └── NoteViewer.tsx        # Markdown note renderer
│   │
│   ├── mail/
│   │   ├── InboxList.tsx         # Email list
│   │   └── EmailDetail.tsx       # Single email view
│   │
│   └── ui/                       # Generic UI primitives
│       ├── Pill.tsx              # Tag/filter pill
│       ├── Badge.tsx             # Status badge
│       └── Modal.tsx             # Dialog/modal
│
├── lib/                          # Utilities and API helpers
│   ├── anthropic.ts              # Claude API client wrapper
│   ├── n8n.ts                    # n8n webhook caller helper
│   ├── khoj.ts                   # Khoj search API helper
│   ├── vault.ts                  # Vault file read/write helpers
│   ├── prompts.ts                # All AI system prompts
│   └── types.ts                  # TypeScript types/interfaces
│
├── hooks/                        # Custom React hooks
│   ├── useChat.ts                # Chat state management
│   ├── useTasks.ts               # Task state + persistence
│   └── useKeyboard.ts            # Keyboard shortcut handler (⌘K etc)
│
├── public/                       # Static assets
│   └── favicon.ico
│
└── docker/                       # Docker configs for VPS services (not the dashboard)
    ├── docker-compose.khoj.yml   # Khoj + pgvector + SearXNG
    ├── docker-compose.sync.yml   # Syncthing
    └── .env.docker               # Docker environment variables template
```

---

## Complete Feature List

### Page 1: Home (/)
- [ ] Greeting with current date and time-of-day awareness
- [ ] Summary line (X urgent tasks, Y unread emails, next scheduled bot)
- [ ] Quick action buttons: Plan my day, Quick log, Search vault, Check email, Set reminder, Ask agent
- [ ] Stat cards: Tasks today (done/total), Unread emails, Vault note count, Day streak
- [ ] Today's Tasks widget — checkable, shows tag + priority dot, links to Planner
- [ ] Inbox preview widget — shows 4 recent emails with urgency dot, links to Mail
- [ ] Recent Notes widget — shows 4 recent vault files with folder + modified date, links to Vault
- [ ] Pipeline mini widget — shows active CRM deals with stage + value

### Page 2: Agent (/agent)
- [ ] Full chat interface with message history
- [ ] Messages show "YOU" and "AGENT" labels with timestamps
- [ ] User messages: warm amber bubble, right-aligned
- [ ] Agent messages: dark surface, left-aligned, supports markdown rendering
- [ ] Quick prompt buttons at bottom: "Plan my day", "Check email", "Search vault", "Log something", "Set reminder", "CRM update"
- [ ] Input field with Enter-to-send
- [ ] Send button
- [ ] Context injection: before Claude responds, fetch relevant vault context from Khoj
- [ ] Agent can trigger n8n webhooks (plan, log, email, remind, crm, save-memory)
- [ ] Streaming responses (optional, nice-to-have)

### Page 3: Planner (/planner)
- [ ] Daily schedule with time blocks (color-coded by type: work, meeting, project, learning, break, bot)
- [ ] Full task list with checkbox toggle
- [ ] Task tags: Office, Project, Learning, Personal (color-coded)
- [ ] Priority indicators: high (red), medium (yellow), low (gray)
- [ ] Filter pills: All, Office, Project, Personal, Learning
- [ ] "+ Add task" button
- [ ] "AI Plan" button — triggers Claude to generate today's plan based on vault context
- [ ] Tasks persist (saved to vault daily note)

### Page 4: Vault (/vault)
- [ ] Folder filter pills: All, 00-Inbox, 01-Daily, 02-Learning, 03-Office, 04-Projects, 05-References, 06-Reviews, 07-Agent-Memory
- [ ] Semantic search bar (powered by Khoj API)
- [ ] File table: Name, Folder, Modified date, Size
- [ ] Click file → opens note viewer (rendered markdown)
- [ ] "+ New note" button
- [ ] File count + last index time display

### Page 5: Mail (/mail)
- [ ] Email list from Gmail (via n8n webhook)
- [ ] Shows: read/unread dot, urgent badge, sender, subject line, time
- [ ] "Compose" button → opens compose form (sends via n8n → Gmail API)
- [ ] "AI Summarize" button → sends all emails to Claude for summary
- [ ] Click email → shows full email body

### Page 6: Research (/research)
- [ ] Search input for research queries
- [ ] Split results: Left = vault results (Khoj), Right = web results (SearXNG via Khoj)
- [ ] Recent research history list
- [ ] "Research" button triggers both vault + web search
- [ ] Results show source, relevance, snippet

### Page 7: Saved (/saved)
- [ ] Saved items list: bookmarks, articles, tutorials, videos
- [ ] Filter pills: All, Articles, Tutorials, Videos, Guides
- [ ] Each item shows: title, source, type badge, saved date
- [ ] "+ Save URL" button — saves to vault 05-References/
- [ ] Items stored as markdown files in vault

### Page 8: Bots (/bots)
- [ ] Grid of all n8n automation workflows
- [ ] Each card shows: name, schedule, last run time, status (healthy/warning/error)
- [ ] Green = healthy, Yellow = warning, Red = error
- [ ] Status comes from n8n API or health monitor workflow

### Global Features
- [ ] Collapsible sidebar with icons + labels
- [ ] ⌘K / Ctrl+K command palette — search pages, notes, commands
- [ ] Topbar with current page name + search bar + Agent quick-access button
- [ ] Mail badge on sidebar (unread count)
- [ ] System health indicator (green dot) in sidebar footer
- [ ] User info display in sidebar footer
- [ ] Page transitions with fade-in animation
- [ ] Dark theme: Charcoal #0c0d10 base, warm surfaces #111218, amber accent #f59e0b
- [ ] Fonts: DM Sans (display) + JetBrains Mono (code/data)
- [ ] Responsive (works on desktop + tablet, basic mobile)

---

## API Routes — Complete Specification

### POST /api/chat
**Purpose:** Proxy chat messages to Claude API (hides API key from browser)
```
Request:  { message: string, context?: string[] }
Process:  1. Receive user message
          2. Call Khoj /api/search?q={message} for vault context
          3. Build system prompt from lib/prompts.ts + vault context
          4. Call Claude API with system prompt + conversation history + user message
          5. Parse response for action triggers (if Claude says "save to vault" → call n8n)
Response: { reply: string, actions?: { type: string, status: string }[] }
```

### POST /api/search
**Purpose:** Semantic search over vault via Khoj
```
Request:  { query: string, type?: "markdown" | "all" }
Process:  Call Khoj GET /api/search?q={query}&t={type}
Response: { results: { entry: string, file: string, score: number }[] }
```

### POST /api/action/plan
**Purpose:** Trigger daily plan creation via n8n
```
Request:  { date: string, input?: string }
Process:  POST to n8n /webhook/plan with { date, input, source: "dashboard" }
Response: { success: boolean, file: string, plan: string }
```

### POST /api/action/log
**Purpose:** Append quick log to today's daily note via n8n
```
Request:  { text: string }
Process:  POST to n8n /webhook/log with { text, date: today, source: "dashboard" }
Response: { success: boolean }
```

### POST /api/action/email
**Purpose:** Read or send email via n8n → Gmail
```
Request:  { action: "read" | "send", to?: string, subject?: string, body?: string }
Process:  POST to n8n /webhook/email with payload
Response: { emails?: EmailObject[], sent?: boolean }
```

### POST /api/action/remind
**Purpose:** Schedule a Telegram reminder via n8n
```
Request:  { message: string, time: string }
Process:  POST to n8n /webhook/remind with { message, time }
Response: { success: boolean, scheduled_for: string }
```

### POST /api/action/crm
**Purpose:** Query CRM pipeline data via n8n
```
Request:  { action: "list" | "update", deal_id?: string }
Process:  POST to n8n /webhook/crm with payload
Response: { deals: DealObject[] }
```

### POST /api/action/save-memory
**Purpose:** Update agent memory files in vault via n8n
```
Request:  { type: "preference" | "goal" | "context", content: string }
Process:  POST to n8n /webhook/save-memory with payload
Response: { success: boolean, file: string }
```

### POST /api/vault/read
**Purpose:** Read a vault file and return contents
```
Request:  { path: string }  // e.g., "01-Daily/2026-02-02.md"
Process:  Read file from /opt/void-vault/{path}
Response: { content: string, metadata: { size, modified } }
```

### GET /api/vault/list
**Purpose:** List vault files and folders
```
Query:    ?folder=01-Daily&limit=20
Process:  Read directory from /opt/void-vault/{folder}
Response: { files: { name, folder, modified, size }[] }
```

### POST /api/vault/write
**Purpose:** Write or append to a vault file
```
Request:  { path: string, content: string, mode: "write" | "append" }
Process:  Write to /opt/void-vault/{path}
Response: { success: boolean }
```

### GET /api/health
**Purpose:** Health check for monitoring
```
Response: { status: "ok", services: { n8n: bool, khoj: bool, vault: bool }, timestamp }
```

---

## Environment Variables (.env.local)

```bash
# === AI ===
ANTHROPIC_API_KEY=sk-ant-...                    # Claude API key
AI_MODEL=claude-sonnet-4-20250514                    # Model to use

# === n8n ===
N8N_WEBHOOK_BASE=http://n8n:5678/webhook        # Internal Docker URL (not public)
N8N_API_KEY=                                     # Optional: n8n API key for management

# === Khoj ===
KHOJ_BASE_URL=http://khoj-server:42110           # Internal Docker URL
KHOJ_API_KEY=                                    # If Khoj auth is enabled

# === Vault ===
VAULT_PATH=/opt/void-vault                       # Path to Obsidian vault on VPS

# === Auth ===
NEXTAUTH_SECRET=your-random-secret-here          # For session encryption
NEXTAUTH_URL=https://app.yourdomain.com          # Your dashboard URL

# === Telegram (used by n8n, not dashboard directly) ===
TELEGRAM_BOT_TOKEN=123456:ABC-DEF                # From @BotFather
TELEGRAM_CHAT_ID=your-chat-id                    # Your personal chat ID
```

---

## Obsidian Vault Structure

```
/opt/void-vault/
├── 00-Inbox/                    # Quick capture, unsorted notes
├── 01-Daily/                    # Daily notes: 2026-02-02.md
│   └── 2026-02-02.md           # Created by n8n daily plan workflow
├── 02-Learning/                 # Study notes, course notes, book summaries
├── 03-Office/                   # Work-related: meeting notes, strategies, reports
├── 04-Projects/                 # Project documentation
│   └── void-architecture.md    # This project's own documentation
├── 05-References/               # Saved articles, bookmarks, clippings
├── 06-Reviews/                  # Weekly reviews, monthly reviews
│   └── Weekly-2026-W05.md      # Auto-generated by n8n weekly review bot
├── 07-Agent-Memory/             # CRITICAL — agent's persistent memory
│   ├── preferences.md           # User preferences (work hours, tone, timezone)
│   ├── goals-2026.md            # Current goals and priorities
│   └── agent-context.md         # System prompt context, decisions, patterns
└── 99-System/                   # Templates, scripts, system files
    └── templates/
        └── daily-template.md    # Template for daily notes
```

### Daily Note Template (99-System/templates/daily-template.md)
```markdown
---
date: {{date}}
type: daily
tags: [daily]
---

# {{date}} — {{day_of_week}}

## Plan
<!-- AI-generated plan goes here -->

## Tasks
- [ ] Task 1
- [ ] Task 2

## Log
<!-- Quick logs appended here throughout the day -->

## Notes
<!-- Misc observations, thoughts -->

## Review
<!-- End of day reflection (auto or manual) -->
```

### preferences.md (07-Agent-Memory/)
```markdown
---
updated: 2026-02-02
---

# User Preferences

## Identity
- Name: [Your name]
- Location: Dhaka, Bangladesh
- Timezone: Asia/Dhaka (UTC+6)

## Work
- Office hours: Usually 4-6 hours per day
- Primary role: [Your role]
- Key tools: Firebase, GA4, CRM (HubSpot/Pipedrive)

## Communication
- Preferred tone: Direct, practical, no fluff
- Language: English
- Notification channel: Telegram

## Planning
- Morning briefing: 8:00 AM
- Night capture: 9:00 PM
- Weekly review: Sunday 10:00 PM
- Preferred planning style: Time-blocked schedule

## Learning
- Current focus: AI/ML, embeddings, system design
- Learning pace: 1 chapter or concept per day
```

---

## Docker Services on VPS

### 8 Containers (managed by Coolify)

| # | Service | Image | Port | URL | RAM |
|---|---------|-------|------|-----|-----|
| 1 | Coolify Proxy | traefik:v2.x | 80/443 | *.yourdomain.com | 64 MB |
| 2 | Void Dashboard | node:20 (Next.js) | 3000 | app.yourdomain.com | 256 MB |
| 3 | n8n | n8nio/n8n | 5678 | n8n.yourdomain.com | 1 GB |
| 4 | n8n PostgreSQL | postgres:16-alpine | 5432 | internal only | 256 MB |
| 5 | Khoj | ghcr.io/khoj-ai/khoj | 42110 | khoj.yourdomain.com | 2.5 GB |
| 6 | Khoj PostgreSQL | pgvector/pgvector:pg16 | 5433 | internal only | 512 MB |
| 7 | SearXNG | searxng/searxng | 8080 | internal only | 128 MB |
| 8 | Syncthing | syncthing/syncthing | 8384/22000 | sync.yourdomain.com | 128 MB |

**Total RAM: ~6.2 GB of 8 GB** (Hostinger KVM 2)

---

## n8n Workflows — 13 Total

| # | Name | Trigger | What it does |
|---|------|---------|-------------|
| 1 | Daily Plan Creator | Webhook + Cron 8AM | Read preferences → Claude → write daily note → Telegram |
| 2 | Quick Log | Webhook + Telegram /log | Append text to today's daily note |
| 3 | Vault Search | Webhook + Telegram /search | Query Khoj → return results |
| 4 | Email Manager | Webhook | Gmail API → read/send emails → return |
| 5 | Telegram Router | Telegram webhook | Parse /plan /log /search /remind → route to correct workflow |
| 6 | CRM Query | Webhook | HubSpot/Pipedrive API → return pipeline data |
| 7 | Reminder Scheduler | Webhook | Parse time → n8n Wait → Telegram alert |
| 8 | Weekly Review | Cron Sunday 10PM | Read 7 daily notes → Claude → write review → Telegram |
| 9 | Morning Briefing | Cron 8AM | Calendar + tasks + email count → Claude → Telegram |
| 10 | Night Capture | Cron 9PM | Telegram prompt → wait for reply → append to daily note |
| 11 | Khoj Re-indexer | Cron every 6 hours | POST Khoj /api/content/index |
| 12 | Health Monitor | Cron every 15 min | Ping all services → Telegram alert if any fail |
| 13 | Memory Updater | Webhook | Update 07-Agent-Memory/ files → trigger Khoj re-index |

---

## AI System Prompt (lib/prompts.ts)

```typescript
export const SYSTEM_PROMPT = `You are Void — a personal AI operating system.

You are the user's intelligent assistant embedded in their Void dashboard. You help them plan their day, manage tasks, check email, search their personal knowledge vault, track CRM deals, set reminders, and capture thoughts.

## Your capabilities (via n8n webhooks):
- PLAN: Create daily plans based on user preferences and current priorities
- LOG: Append quick notes to today's daily vault note
- EMAIL: Read inbox summaries or send emails via Gmail
- SEARCH: Semantically search the user's Obsidian vault via Khoj
- REMIND: Schedule Telegram reminders at specific times
- CRM: Query deal pipeline and update statuses
- MEMORY: Update your own persistent memory files

## How you work:
1. User speaks naturally — you understand intent
2. You THINK about what action to take
3. You TELL the user what you'll do
4. The dashboard triggers the correct n8n webhook
5. Results appear in the UI

## Context injection:
Before each response, you receive relevant vault context from Khoj semantic search. Use this context to personalize your responses — reference the user's goals, preferences, ongoing projects, and recent activity.

## Response format:
- Be direct and practical. No fluff.
- When creating plans, use time blocks with emojis
- When confirming actions, use ✓ checkmarks
- When showing data, format it cleanly
- If you need to trigger an action, include a JSON block:
  \`\`\`action
  { "type": "plan|log|email|search|remind|crm|memory", "payload": {...} }
  \`\`\`

## User context:
{vault_context}

## Current date: {current_date}
## Current time: {current_time} (Asia/Dhaka)
`;
```

---

## Design Tokens (tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        void: {
          bg: '#0c0d10',        // Main background
          surface: '#111218',    // Cards, panels
          border: '#1a1b20',     // Borders
          text: '#d4d4d8',       // Body text
          muted: '#71717a',      // Secondary text
          dim: '#52525b',        // Tertiary text
          faint: '#3f3f46',      // Timestamps, metadata
          accent: '#f59e0b',     // Primary amber accent
        },
        tag: {
          office: '#60a5fa',
          project: '#a78bfa',
          learning: '#34d399',
          personal: '#fbbf24',
        },
        status: {
          urgent: '#ef4444',
          warn: '#eab308',
          ok: '#22c55e',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

---

## Build Phases — What to Tell Claude Code

### Phase 1: Project Scaffold (30 min)

**Tell Claude Code:**
> "Create a new Next.js 14 project called 'void' with App Router, TypeScript, and Tailwind CSS. Set up the folder structure with app/, components/, lib/, hooks/ directories. Configure Tailwind with the custom color tokens from the design spec. Add DM Sans and JetBrains Mono fonts via Google Fonts in the layout. Create a root layout with dark background #0c0d10."

**Expected output:**
- Working Next.js project
- `npm run dev` shows a dark empty page
- Tailwind configured with custom colors
- Fonts loading correctly

### Phase 2: Layout Shell (1 hour)

**Tell Claude Code:**
> "Build the dashboard layout with a collapsible sidebar (200px expanded, 56px collapsed) and a topbar. The sidebar has navigation items: Home (⌂), Agent (◉), Planner (▦), Vault (◈), Mail (✉), Research (◎), Saved (◆), Bots (⚡). The topbar has the current page name, a search bar that opens a command palette on click, and an Agent quick-access button. Use the Void color tokens. The sidebar should have a 'V' logo with gradient background at the top, user info at the bottom, and a green system health dot. Add the ⌘K keyboard shortcut to open the command palette."

**Expected output:**
- Sidebar navigates between pages
- Topbar shows current page
- ⌘K opens a search overlay
- Sidebar collapses/expands on logo click
- All pages are empty but routable

### Phase 3: Home Page (1 hour)

**Tell Claude Code:**
> "Build the Home page (/). It should show: a greeting section with the current date (JetBrains Mono, uppercase, dim) and a time-aware greeting ('Good morning/afternoon/evening'). Below that, 6 quick action buttons in a row (Plan my day, Quick log, Search vault, Check email, Set reminder, Ask agent) — each with an icon and distinct color. Then 4 stat cards in a row (Tasks today, Unread emails, Vault notes, Day streak). Below that, a 2x2 grid of widgets: Today's Tasks (checkable), Inbox preview (4 emails), Recent Notes (4 vault files), Pipeline mini (3 CRM deals). Use mock data for now. Each widget header has a 'View all →' link that navigates to the relevant page."

**Expected output:**
- Looks like the Home page in void-dashboard.jsx wireframe
- Quick actions navigate to correct pages
- Task checkboxes toggle
- Widget links work

### Phase 4: Agent Chat Page (1.5 hours)

**Tell Claude Code:**
> "Build the Agent chat page (/agent). Full-height chat interface. Messages display in a scrollable area — user messages right-aligned with amber background, agent messages left-aligned with surface background. Each message has a 'YOU' or 'AGENT' label in JetBrains Mono. At the bottom: a row of quick prompt buttons ('Plan my day', 'Check email', 'Search vault', 'Log something', 'Set reminder', 'CRM update') that populate the input field. Below that, a text input with Send button. Enter key sends. Now create the /api/chat route that: 1) takes the user message, 2) calls Khoj search for context, 3) calls Claude API with system prompt + context + message, 4) returns the response. Use the Anthropic SDK. System prompt is in lib/prompts.ts."

**Expected output:**
- Chat UI matches wireframe
- Messages send and appear
- Claude API responds with real answers
- Khoj context is injected (may need n8n/Khoj running)

### Phase 5: Remaining Pages (2-3 hours)

**Tell Claude Code (for each page):**

**Planner:**
> "Build the Planner page. Show a daily schedule with time blocks (color-coded left borders: blue=work, red=meeting, purple=project, green=learning, gray=break, amber=bot). Below that, a full task list with checkboxes, tag pills, priority dots, and filter pills (All, Office, Project, Personal, Learning). Add an 'AI Plan' button that calls /api/action/plan."

**Vault:**
> "Build the Vault page. Folder filter pills at top. Semantic search input that calls /api/search. File table showing Name (with diamond icon), Folder, Modified, Size. Click a file to show its markdown content rendered. '+ New note' button."

**Mail:**
> "Build the Mail page. Email list showing read/unread indicator, urgent badge, sender name, subject, time. 'Compose' and 'AI Summarize' buttons. Calls /api/action/email to fetch emails from n8n → Gmail."

**Research:**
> "Build the Research page. Search input + Research button. Split results: left panel 'FROM YOUR VAULT' (Khoj results), right panel 'FROM THE WEB' (SearXNG results). Recent research history list at bottom."

**Saved:**
> "Build the Saved items page. List of saved bookmarks with title, source, type badge, date. Filter pills: All, Articles, Tutorials, Videos, Guides. '+ Save URL' button."

**Bots:**
> "Build the Bots status page. 2-column grid of cards. Each card shows bot name, schedule, last run time, status indicator (green=healthy, yellow=warning, red=error). Data comes from n8n execution history."

### Phase 6: API Routes (2-3 hours)

**Tell Claude Code:**
> "Create all the API routes under app/api/. Each route should: validate the request, call the appropriate external service (Claude API, Khoj, n8n webhook, or vault filesystem), handle errors gracefully, and return JSON. Create helper functions in lib/anthropic.ts, lib/n8n.ts, lib/khoj.ts, and lib/vault.ts. The n8n helper should have a generic function that calls any webhook URL with a payload. The vault helper should safely read/write files within VAULT_PATH only (no path traversal). All secrets come from process.env."

### Phase 7: Connect Frontend to APIs (2-3 hours)

**Tell Claude Code:**
> "Replace all mock data in the dashboard with real API calls. The Home page should call /api/vault/list for recent notes, /api/action/email with action=read for inbox count, /api/vault/read for today's daily note tasks. The Agent page should call /api/chat for real conversations. The Vault page should call /api/vault/list and /api/search. The Mail page should call /api/action/email. Add loading states and error handling to all components."

### Phase 8: Docker & Deployment (1-2 hours)

**Tell Claude Code:**
> "Create a Dockerfile for the Next.js app optimized for production (multi-stage build, standalone output). Create docker-compose.khoj.yml for Khoj + pgvector + SearXNG. Create docker-compose.sync.yml for Syncthing. Create .env.example with all required environment variables documented. Add a README.md with setup instructions for Coolify deployment."

---

## Deployment Checklist (on your VPS)

```
□ 1. Buy Hostinger KVM 2 VPS ($6.99/mo) — Ubuntu 24.04 + Coolify
□ 2. SSH in, access Coolify at http://your-ip:8000, create admin account
□ 3. Buy/configure domain — add A records for: app, n8n, khoj, sync → VPS IP
□ 4. In Coolify: Deploy n8n from catalog (one-click) → set domain n8n.yourdomain.com
□ 5. In Coolify: Deploy Khoj via Docker Compose → set domain khoj.yourdomain.com
□ 6. In Coolify: Deploy Syncthing via Docker Compose → set domain sync.yourdomain.com
□ 7. Create vault: mkdir -p /opt/void-vault/{00-Inbox,01-Daily,02-Learning,03-Office,04-Projects,05-References,06-Reviews,07-Agent-Memory,99-System}
□ 8. Write initial memory files: preferences.md, goals-2026.md, agent-context.md
□ 9. Configure Khoj: admin panel → point to /opt/void-vault → set Claude API key → index
□ 10. Create Telegram bot via @BotFather → get token
□ 11. Build n8n workflows (start with: Daily Plan, Quick Log, Vault Search, Health Monitor)
□ 12. Push Void dashboard to GitHub
□ 13. In Coolify: Deploy dashboard as Git Application → connect GitHub → set domain app.yourdomain.com
□ 14. Set environment variables in Coolify for dashboard
□ 15. Test: open app.yourdomain.com → chat with agent → verify plan saves to vault
□ 16. Configure Syncthing: pair VPS with Mac + Windows
□ 17. Set up Coolify database backups
□ 18. Connect Gmail OAuth in n8n
□ 19. Build remaining n8n workflows
□ 20. Use it daily. Refine prompts. Expand.
```

---

## Quick Reference — Key Commands

```bash
# Local development
npm run dev                          # Start dashboard locally (http://localhost:3000)
npm run build                        # Production build
npm run lint                         # Check code quality

# Git → auto-deploy
git add . && git commit -m "msg" && git push    # Coolify auto-deploys

# VPS access
ssh root@your-vps-ip                 # Connect to server
htop                                 # Check resource usage
docker ps                            # See running containers
docker logs container_name -f        # Live logs

# Vault
ls /opt/void-vault/01-Daily/         # List daily notes
cat /opt/void-vault/07-Agent-Memory/preferences.md   # Read preferences

# Coolify
# Open https://coolify.yourdomain.com → Projects → click service → Redeploy
```

---

## Start Here

1. Open VS Code
2. Open Claude Code terminal
3. Say: *"Create a new Next.js 14 project called 'void' with App Router, TypeScript, and Tailwind CSS. I'm building a personal AI dashboard. Here's the folder structure and design tokens..."* — then paste the relevant sections from this document
4. Build Phase 1 → Phase 2 → Phase 3 → test locally
5. Then connect APIs in Phase 4-7
6. Then deploy in Phase 8

**The void-dashboard.jsx wireframe is your visual target. This document is your technical spec. Claude Code writes the code. You guide it.**

Good luck, boss. Build the void. 🕳️
