# VOID — Layer-by-Layer Build Plan

> **One layer at a time. Test before moving on. Ship clean code.**

---

## Overview: 8 Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: Project Scaffold                                       │
│ Create project, folders, configs, Docker files, vault template  │
│ TEST: npm run dev shows empty dark page                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: Layout Shell                                           │
│ Sidebar, Topbar, CommandPalette, page routing                   │
│ TEST: Can navigate between 8 empty pages, ⌘K works              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: UI Pages (Mock Data)                                   │
│ All 8 pages built with hardcoded fake data                      │
│ TEST: Dashboard looks complete, interactions work (no real API) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: API Routes (Local)                                     │
│ All /api/* routes created, return mock responses                │
│ TEST: curl localhost:3000/api/health returns JSON               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: VPS + Docker Services                                  │
│ Deploy Khoj, n8n, Syncthing on VPS via Docker Compose           │
│ TEST: n8n.yourdomain.com and khoj.yourdomain.com load           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 6: n8n Workflows                                          │
│ Build all automation workflows in n8n                           │
│ TEST: Telegram /plan command creates a daily note in vault      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 7: Deploy Dashboard + Connect                             │
│ Deploy dashboard to VPS, connect to real Khoj/n8n/Claude        │
│ TEST: Chat with agent → creates real vault file                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 8: Polish + Sync                                          │
│ Bug fixes, Syncthing setup, Obsidian connection, refinements    │
│ TEST: Full system works end-to-end, syncs to your devices       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Folder Structure (Final State)

```
void/
│
├── .env.local                      # Secrets (NEVER commit)
├── .env.example                    # Template for secrets (commit)
├── .gitignore                      # What to ignore
├── package.json                    # Dependencies
├── next.config.js                  # Next.js config
├── tailwind.config.js              # Tailwind theme + colors
├── postcss.config.js               # PostCSS for Tailwind
├── tsconfig.json                   # TypeScript config
├── README.md                       # Project overview
│
├── app/                            # === NEXT.JS APP ===
│   ├── layout.tsx                  # Root layout (fonts, theme)
│   ├── page.tsx                    # Home page (/)
│   ├── globals.css                 # Tailwind + custom styles
│   │
│   ├── agent/
│   │   └── page.tsx                # Chat with AI (/agent)
│   ├── planner/
│   │   └── page.tsx                # Daily planner (/planner)
│   ├── vault/
│   │   └── page.tsx                # Vault browser (/vault)
│   ├── mail/
│   │   └── page.tsx                # Email inbox (/mail)
│   ├── research/
│   │   └── page.tsx                # Research (/research)
│   ├── saved/
│   │   └── page.tsx                # Saved items (/saved)
│   ├── bots/
│   │   └── page.tsx                # Bot status (/bots)
│   │
│   └── api/                        # === BACKEND API ROUTES ===
│       ├── health/
│       │   └── route.ts            # GET /api/health
│       ├── chat/
│       │   └── route.ts            # POST /api/chat → Claude API
│       ├── search/
│       │   └── route.ts            # POST /api/search → Khoj
│       ├── vault/
│       │   ├── list/
│       │   │   └── route.ts        # GET /api/vault/list
│       │   ├── read/
│       │   │   └── route.ts        # POST /api/vault/read
│       │   └── write/
│       │       └── route.ts        # POST /api/vault/write
│       └── action/
│           ├── plan/
│           │   └── route.ts        # POST → n8n /webhook/plan
│           ├── log/
│           │   └── route.ts        # POST → n8n /webhook/log
│           ├── email/
│           │   └── route.ts        # POST → n8n /webhook/email
│           ├── remind/
│           │   └── route.ts        # POST → n8n /webhook/remind
│           ├── crm/
│           │   └── route.ts        # POST → n8n /webhook/crm
│           └── memory/
│               └── route.ts        # POST → n8n /webhook/save-memory
│
├── components/                     # === UI COMPONENTS ===
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Topbar.tsx              # Top bar
│   │   └── CommandPalette.tsx      # ⌘K search modal
│   ├── chat/
│   │   ├── ChatPanel.tsx           # Full chat interface
│   │   ├── ChatMessage.tsx         # Single message
│   │   └── QuickPrompts.tsx        # Suggestion buttons
│   ├── dashboard/
│   │   ├── StatCard.tsx            # Stat display
│   │   ├── TaskList.tsx            # Checkable tasks
│   │   ├── EmailPreview.tsx        # Inbox widget
│   │   ├── VaultRecent.tsx         # Recent notes widget
│   │   ├── PipelineMini.tsx        # CRM widget
│   │   └── QuickActions.tsx        # Action buttons
│   ├── planner/
│   │   ├── TimeBlocks.tsx          # Schedule view
│   │   └── TaskManager.tsx         # Full task list
│   ├── vault/
│   │   ├── FileTable.tsx           # File browser
│   │   ├── FolderFilter.tsx        # Folder pills
│   │   └── NoteViewer.tsx          # Markdown renderer
│   └── ui/
│       ├── Pill.tsx                # Tag pill
│       ├── Badge.tsx               # Status badge
│       └── Button.tsx              # Button variants
│
├── lib/                            # === UTILITIES ===
│   ├── anthropic.ts                # Claude API helper
│   ├── khoj.ts                     # Khoj API helper
│   ├── n8n.ts                      # n8n webhook helper
│   ├── vault.ts                    # Vault file helpers
│   ├── prompts.ts                  # AI system prompts
│   └── types.ts                    # TypeScript types
│
├── hooks/                          # === REACT HOOKS ===
│   ├── useChat.ts                  # Chat state
│   ├── useTasks.ts                 # Task state
│   └── useKeyboard.ts              # Keyboard shortcuts
│
├── docker/                         # === DOCKER (for VPS) ===
│   ├── docker-compose.yml          # All services together
│   ├── docker-compose.khoj.yml     # Khoj + pgvector + SearXNG
│   ├── docker-compose.n8n.yml      # n8n + PostgreSQL
│   ├── docker-compose.sync.yml     # Syncthing
│   ├── Dockerfile                  # Dashboard production build
│   └── .env.example                # Docker env template
│
├── vault-template/                 # === VAULT STARTER ===
│   ├── 00-Inbox/
│   │   └── .gitkeep
│   ├── 01-Daily/
│   │   └── .gitkeep
│   ├── 02-Learning/
│   │   └── .gitkeep
│   ├── 03-Office/
│   │   └── .gitkeep
│   ├── 04-Projects/
│   │   └── .gitkeep
│   ├── 05-References/
│   │   └── .gitkeep
│   ├── 06-Reviews/
│   │   └── .gitkeep
│   ├── 07-Agent-Memory/
│   │   ├── preferences.md          # User preferences template
│   │   ├── goals.md                # Goals template
│   │   └── agent-context.md        # Agent context template
│   └── 99-System/
│       └── templates/
│           └── daily.md            # Daily note template
│
├── n8n-workflows/                  # === N8N WORKFLOW EXPORTS ===
│   ├── README.md                   # How to import these
│   ├── 01-daily-plan.json          # Daily plan creator
│   ├── 02-quick-log.json           # Quick log appender
│   ├── 03-vault-search.json        # Vault search via Khoj
│   ├── 04-email-manager.json       # Gmail read/send
│   ├── 05-telegram-router.json     # Telegram command router
│   ├── 06-reminder.json            # Reminder scheduler
│   ├── 07-weekly-review.json       # Weekly review generator
│   ├── 08-morning-briefing.json    # Morning briefing
│   ├── 09-night-capture.json       # Night capture prompt
│   ├── 10-health-monitor.json      # Service health checker
│   ├── 11-khoj-reindex.json        # Khoj re-indexer
│   ├── 12-crm-query.json           # CRM pipeline query
│   └── 13-memory-updater.json      # Agent memory updater
│
└── docs/                           # === DOCUMENTATION ===
    ├── SETUP.md                    # Full setup guide
    ├── ARCHITECTURE.md             # System architecture
    ├── API.md                      # API documentation
    └── N8N-WORKFLOWS.md            # Workflow documentation
```

---

## .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/

# Environment (secrets)
.env
.env.local
.env.production
docker/.env

# Local vault (personal data)
vault/

# Docker volumes (on VPS)
docker/data/
docker/volumes/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# TypeScript
*.tsbuildinfo

# Testing
coverage/
```

---

# LAYER 1: Project Scaffold

**Goal:** Create the complete project structure with all folders, configs, and templates.

**Time:** 45-60 minutes

---

## Step 1.1: Create Next.js Project

**Tell Claude Code:**

```
Create a new Next.js 14 project called "void" with:
- App Router (not pages)
- TypeScript
- Tailwind CSS
- ESLint
- src/ directory: NO (use root app/)
- Import alias: @/*

After creation, verify it runs with npm run dev.
```

**Expected:** Project created, `npm run dev` shows Next.js default page at localhost:3000

---

## Step 1.2: Configure Tailwind Theme

**Tell Claude Code:**

```
Update tailwind.config.js with these custom colors and fonts:

Colors:
- void-bg: #0c0d10 (main background)
- void-surface: #111218 (cards, panels)
- void-border: #1a1b20 (borders)
- void-text: #d4d4d8 (body text)
- void-muted: #71717a (secondary text)
- void-dim: #52525b (tertiary text)
- void-faint: #3f3f46 (timestamps)
- void-accent: #f59e0b (amber accent)

Tag colors:
- tag-office: #60a5fa
- tag-project: #a78bfa
- tag-learning: #34d399
- tag-personal: #fbbf24

Status colors:
- status-urgent: #ef4444
- status-warn: #eab308
- status-ok: #22c55e
- status-info: #3b82f6

Fonts:
- sans: ['DM Sans', 'system-ui', 'sans-serif']
- mono: ['JetBrains Mono', 'monospace']
```

---

## Step 1.3: Set Up Root Layout with Fonts

**Tell Claude Code:**

```
Update app/layout.tsx to:
1. Import DM Sans and JetBrains Mono from Google Fonts using next/font/google
2. Set the page background to void-bg (#0c0d10)
3. Set default text color to void-text
4. Add metadata: title "Void" and description "Personal AI Operating System"
5. Apply the fonts to the body
```

---

## Step 1.4: Create Folder Structure

**Tell Claude Code:**

```
Create all these empty folders and placeholder files:

app/
  agent/page.tsx (just export default function with "Agent Page" text)
  planner/page.tsx
  vault/page.tsx
  mail/page.tsx
  research/page.tsx
  saved/page.tsx
  bots/page.tsx
  api/health/route.ts (return { status: "ok", timestamp: Date.now() })

components/
  layout/.gitkeep
  chat/.gitkeep
  dashboard/.gitkeep
  planner/.gitkeep
  vault/.gitkeep
  ui/.gitkeep

lib/
  types.ts (empty, add "// Types will go here")
  prompts.ts (empty)
  anthropic.ts (empty)
  khoj.ts (empty)
  n8n.ts (empty)
  vault.ts (empty)

hooks/
  useChat.ts (empty)
  useTasks.ts (empty)
  useKeyboard.ts (empty)
```

---

## Step 1.5: Create Docker Folder

**Tell Claude Code:**

```
Create docker/ folder with these files:

docker/docker-compose.yml:
# Main compose file that includes all services
# We'll fill this in Layer 5

docker/docker-compose.khoj.yml:
```yaml
version: '3.8'
services:
  khoj-db:
    image: pgvector/pgvector:pg16
    container_name: khoj-db
    environment:
      POSTGRES_DB: khoj
      POSTGRES_USER: khoj
      POSTGRES_PASSWORD: ${KHOJ_DB_PASSWORD}
    volumes:
      - khoj_db_data:/var/lib/postgresql/data
    restart: unless-stopped

  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    restart: unless-stopped

  khoj:
    image: ghcr.io/khoj-ai/khoj:latest
    container_name: khoj
    depends_on:
      - khoj-db
      - searxng
    ports:
      - "42110:42110"
    environment:
      KHOJ_ADMIN_EMAIL: ${KHOJ_ADMIN_EMAIL}
      KHOJ_ADMIN_PASSWORD: ${KHOJ_ADMIN_PASSWORD}
      KHOJ_DJANGO_SECRET_KEY: ${KHOJ_SECRET_KEY}
      POSTGRES_HOST: khoj-db
      POSTGRES_PORT: 5432
      POSTGRES_DB: khoj
      POSTGRES_USER: khoj
      POSTGRES_PASSWORD: ${KHOJ_DB_PASSWORD}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SEARXNG_URL: http://searxng:8080
    volumes:
      - ${VAULT_PATH}:/data/vault:ro
      - khoj_models:/root/.cache/torch
    restart: unless-stopped

volumes:
  khoj_db_data:
  khoj_models:
```

docker/docker-compose.n8n.yml:
```yaml
version: '3.8'
services:
  n8n-db:
    image: postgres:16-alpine
    container_name: n8n-db
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${N8N_DB_PASSWORD}
    volumes:
      - n8n_db_data:/var/lib/postgresql/data
    restart: unless-stopped

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    depends_on:
      - n8n-db
    ports:
      - "5678:5678"
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: n8n-db
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      WEBHOOK_URL: ${N8N_WEBHOOK_URL}
      GENERIC_TIMEZONE: Asia/Dhaka
    volumes:
      - n8n_data:/home/node/.n8n
      - ${VAULT_PATH}:/vault
    restart: unless-stopped

volumes:
  n8n_db_data:
  n8n_data:
```

docker/docker-compose.sync.yml:
```yaml
version: '3.8'
services:
  syncthing:
    image: syncthing/syncthing:latest
    container_name: syncthing
    hostname: void-vps
    ports:
      - "8384:8384"
      - "22000:22000/tcp"
      - "22000:22000/udp"
    volumes:
      - ${VAULT_PATH}:/var/syncthing/vault
      - syncthing_config:/var/syncthing/config
    restart: unless-stopped

volumes:
  syncthing_config:
```

docker/.env.example:
```bash
# Khoj
KHOJ_ADMIN_EMAIL=admin@yourdomain.com
KHOJ_ADMIN_PASSWORD=change-this-password
KHOJ_SECRET_KEY=generate-a-random-secret-key
KHOJ_DB_PASSWORD=change-this-password

# n8n
N8N_DB_PASSWORD=change-this-password
N8N_ENCRYPTION_KEY=generate-a-random-encryption-key
N8N_WEBHOOK_URL=https://n8n.yourdomain.com

# Claude
ANTHROPIC_API_KEY=sk-ant-...

# Vault path on VPS
VAULT_PATH=/opt/void-vault
```
```

---

## Step 1.6: Create Vault Template

**Tell Claude Code:**

```
Create vault-template/ folder with this structure:

vault-template/
├── 00-Inbox/.gitkeep
├── 01-Daily/.gitkeep
├── 02-Learning/.gitkeep
├── 03-Office/.gitkeep
├── 04-Projects/.gitkeep
├── 05-References/.gitkeep
├── 06-Reviews/.gitkeep
├── 07-Agent-Memory/
│   ├── preferences.md
│   ├── goals.md
│   └── agent-context.md
└── 99-System/
    └── templates/
        └── daily.md

Contents of preferences.md:
---
updated: 2026-01-01
---

# User Preferences

## Identity
- Name: [Your name]
- Location: [Your city]
- Timezone: Asia/Dhaka

## Work Style
- Office hours: 4-6 hours per day
- Planning style: Time-blocked schedule
- Preferred tone: Direct, practical, no fluff

## Notifications
- Morning briefing: 8:00 AM
- Night capture: 9:00 PM
- Weekly review: Sunday 10:00 PM

## Current Focus
- [Add your current priorities here]


Contents of goals.md:
---
updated: 2026-01-01
---

# Goals 2026

## Q1 Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Ongoing
- [Add ongoing priorities]


Contents of agent-context.md:
---
updated: 2026-01-01
---

# Agent Context

This file contains context that helps the AI agent understand you better.

## Important Decisions
- [Record important decisions here]

## Patterns & Preferences
- [Things the agent should remember]

## Do Not
- [Things to avoid]


Contents of daily.md (template):
---
date: {{date}}
day: {{day}}
type: daily
---

# {{date}} — {{day}}

## Plan
<!-- AI-generated plan -->

## Tasks
- [ ] 

## Log
<!-- Quick logs throughout the day -->

## Notes
<!-- Observations, thoughts -->
```

---

## Step 1.7: Create n8n Workflows Folder

**Tell Claude Code:**

```
Create n8n-workflows/ folder with:

n8n-workflows/README.md:
# n8n Workflows

This folder contains exported n8n workflows for the Void system.

## How to Import

1. Open n8n at n8n.yourdomain.com
2. Go to Workflows → Import
3. Upload the JSON file
4. Update credentials (API keys, tokens)
5. Activate the workflow

## Workflows

| File | Purpose | Trigger |
|------|---------|---------|
| 01-daily-plan.json | Create daily plan | Webhook + Cron 8AM |
| 02-quick-log.json | Append to daily note | Webhook |
| 03-vault-search.json | Search vault via Khoj | Webhook |
| 04-email-manager.json | Read/send Gmail | Webhook |
| 05-telegram-router.json | Route Telegram commands | Telegram trigger |
| 06-reminder.json | Schedule reminders | Webhook |
| 07-weekly-review.json | Generate weekly review | Cron Sunday 10PM |
| 08-morning-briefing.json | Morning summary | Cron 8AM |
| 09-night-capture.json | End of day prompt | Cron 9PM |
| 10-health-monitor.json | Check service health | Cron 15min |
| 11-khoj-reindex.json | Trigger Khoj re-index | Cron 6h |
| 12-crm-query.json | Query CRM data | Webhook |
| 13-memory-updater.json | Update agent memory | Webhook |

Create empty JSON files for each workflow (we'll build them in Layer 6):
- 01-daily-plan.json through 13-memory-updater.json
Each with just: { "name": "workflow-name", "nodes": [], "connections": {} }
```

---

## Step 1.8: Create Environment Files

**Tell Claude Code:**

```
Create .env.example at project root:

# === AI ===
ANTHROPIC_API_KEY=sk-ant-...

# === n8n ===
N8N_WEBHOOK_BASE=http://n8n:5678/webhook
# Use http://localhost:5678/webhook for local dev

# === Khoj ===  
KHOJ_BASE_URL=http://khoj:42110
# Use http://localhost:42110 for local dev

# === Vault ===
VAULT_PATH=/opt/void-vault
# Use ./vault for local dev

# === App ===
NEXTAUTH_SECRET=generate-random-secret
NEXTAUTH_URL=https://app.yourdomain.com
# Use http://localhost:3000 for local dev


Create .env.local (copy of above with placeholder values - this file is gitignored)
```

---

## Step 1.9: Create Documentation

**Tell Claude Code:**

```
Create docs/ folder with:

docs/SETUP.md:
# Void Setup Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- VPS (Hostinger KVM 2 recommended)
- Domain name
- Anthropic API key
- Telegram Bot Token (from @BotFather)

## Local Development
1. Clone repo: git clone [repo] void
2. Install: cd void && npm install
3. Copy env: cp .env.example .env.local
4. Edit .env.local with your API keys
5. Run: npm run dev
6. Open: http://localhost:3000

## VPS Deployment
See Layer 5-7 in the build guide.


docs/ARCHITECTURE.md:
# Void Architecture

[We'll add the architecture diagram here]


docs/API.md:
# API Documentation

[We'll document all endpoints here]
```

---

## Step 1.10: Initialize Git

**Tell Claude Code:**

```
Initialize git repository:
1. git init
2. Create the .gitignore file (from above)
3. git add .
4. git commit -m "Layer 1: Project scaffold complete"

Do NOT push yet - we'll push after Layer 4 when the dashboard is ready.
```

---

## Layer 1 Checklist

```
□ Next.js project created and runs
□ Tailwind configured with Void colors
□ Root layout has fonts and dark background
□ All page routes created (empty)
□ /api/health returns JSON
□ components/, lib/, hooks/ folders exist
□ docker/ folder with all compose files
□ vault-template/ with all folders and memory files
□ n8n-workflows/ with README and empty JSON files
□ docs/ folder with SETUP.md
□ .env.example created
□ .gitignore created
□ Git initialized with first commit
```

**TEST:** Run `npm run dev` → see dark page at localhost:3000 → visit /agent, /planner, etc → each shows placeholder text

---

# LAYER 2: Layout Shell

**Goal:** Build the navigation shell — Sidebar, Topbar, CommandPalette, page routing.

**Time:** 1-1.5 hours

---

## Step 2.1: Create Sidebar Component

**Tell Claude Code:**

```
Create components/layout/Sidebar.tsx:

A collapsible sidebar with:
- Width: 200px expanded, 56px collapsed
- Logo at top: "V" in gradient box (amber to red) + "Void" text (hidden when collapsed)
- Click logo to toggle collapse
- Navigation items (each with icon + label):
  - Home (⌂) → /
  - Agent (◉) → /agent
  - Planner (▦) → /planner
  - Vault (◈) → /vault
  - Mail (✉) → /mail (show badge with number 3)
  - Research (◎) → /research
  - Saved (◆) → /saved
  - Bots (⚡) → /bots
- Active item: amber accent color, light amber background
- Hover: subtle background
- Bottom section:
  - System health dot (green, pulsing)
  - User info: avatar + name (hidden when collapsed)
- Use void-surface background, void-border for border
- Smooth width transition on collapse

Use next/navigation for routing (usePathname to detect active).
Accept collapsed state as prop from parent.
```

---

## Step 2.2: Create Topbar Component

**Tell Claude Code:**

```
Create components/layout/Topbar.tsx:

A top bar with:
- Height: 48px
- Left: Current page icon + page name (from PAGES constant)
- Right side:
  - Search bar (looks like input, actually a button)
    - Placeholder: "Search everything..."
    - Shows "⌘K" badge on right
    - On click: calls onSearchClick prop
  - Agent button: amber border/bg, "◉ Agent" text, navigates to /agent
- Use void-border for bottom border
- Background: transparent (shows through from main bg)

Accept currentPage and onSearchClick as props.
```

---

## Step 2.3: Create Command Palette

**Tell Claude Code:**

```
Create components/layout/CommandPalette.tsx:

A modal overlay for ⌘K search:
- Full screen semi-transparent backdrop (#00000080)
- Centered modal: 500px wide, void-surface background, rounded corners
- Search input at top (auto-focused)
- Results list below:
  - Shows all pages (filtered by search query)
  - Shows matching vault files (mock data for now)
  - Each item: icon + name + optional badge
  - Click or Enter: navigate to that page/file, close modal
- Escape key closes modal
- Click backdrop closes modal
- Animate in (fade + slide up)

Accept isOpen, onClose, and optionally pages list as props.
Use useState for search query.
```

---

## Step 2.4: Create Keyboard Hook

**Tell Claude Code:**

```
Create hooks/useKeyboard.ts:

A hook that:
- Listens for ⌘K (Mac) or Ctrl+K (Windows) globally
- Returns { isCommandPaletteOpen, setCommandPaletteOpen }
- Also listens for Escape to close

Use useEffect to add/remove event listeners.
```

---

## Step 2.5: Create Main Layout

**Tell Claude Code:**

```
Update app/layout.tsx to include:

1. Import Sidebar, Topbar, CommandPalette
2. Use useState for sidebarCollapsed
3. Use useKeyboard hook for command palette
4. Layout structure:
   - Flex container, full height
   - Sidebar on left (passes collapsed state)
   - Main area:
     - Topbar at top (passes current page, search click handler)
     - Content area (children) with overflow-auto
   - CommandPalette overlay (controlled by hook)

The pages constant should be defined here or in a constants file:
const PAGES = [
  { id: 'home', path: '/', icon: '⌂', label: 'Home' },
  { id: 'agent', path: '/agent', icon: '◉', label: 'Agent' },
  { id: 'planner', path: '/planner', icon: '▦', label: 'Planner' },
  { id: 'vault', path: '/vault', icon: '◈', label: 'Vault' },
  { id: 'mail', path: '/mail', icon: '✉', label: 'Mail' },
  { id: 'research', path: '/research', icon: '◎', label: 'Research' },
  { id: 'saved', path: '/saved', icon: '◆', label: 'Saved' },
  { id: 'bots', path: '/bots', icon: '⚡', label: 'Bots' },
];
```

---

## Step 2.6: Test Navigation

**Test manually:**
- Click each sidebar item → URL changes, page shows placeholder
- Click logo → sidebar collapses/expands
- Press ⌘K → command palette opens
- Type in command palette → filters results
- Press Escape → closes
- Click backdrop → closes
- Active page highlighted in sidebar

---

## Layer 2 Checklist

```
□ Sidebar renders with all 8 nav items
□ Sidebar collapses on logo click
□ Active page is highlighted
□ Topbar shows current page name
□ ⌘K opens command palette
□ Command palette filters pages
□ Escape closes command palette
□ Navigation works between all pages
□ Layout looks like the wireframe
□ Git commit: "Layer 2: Layout shell complete"
```

---

# LAYER 3: UI Pages (Mock Data)

**Goal:** Build all 8 pages with hardcoded fake data. No real API calls yet.

**Time:** 3-4 hours

---

## Step 3.1: Create Mock Data File

**Tell Claude Code:**

```
Create lib/mock-data.ts with all the mock data:

- TASKS array (6 items with: text, tag, done, priority)
- EMAILS array (5 items with: from, subject, time, urgent, read)
- VAULT_FILES array (8 items with: name, folder, modified, size)
- SAVED_ITEMS array (5 items with: title, type, source, date)
- BOTS array (13 items with: name, schedule, lastRun, status, type)
- CRM_DEALS array (3 items with: name, stage, value, probability)
- CHAT_MESSAGES array (4 items with: role, text)

Use the data from void-dashboard.jsx wireframe as reference.
```

---

## Step 3.2: Create UI Primitives

**Tell Claude Code:**

```
Create these small reusable components in components/ui/:

Pill.tsx - Small tag/filter pill
- Props: children, active?, color?
- Styles: small text, rounded, background changes when active

Badge.tsx - Status badge
- Props: children, variant (urgent/warn/ok/info)
- Styles: tiny text, uppercase, colored background

Button.tsx - Button variants  
- Props: children, variant (primary/secondary/ghost), size (sm/md)
- Primary: amber background
- Secondary: surface background with border
- Ghost: transparent, subtle hover
```

---

## Step 3.3: Build Home Page

**Tell Claude Code:**

```
Build app/page.tsx (Home page) with these sections:

1. Greeting section:
   - Date in JetBrains Mono, uppercase, dim color
   - "Good morning/afternoon/evening" based on time
   - Summary line: "X tasks · Y unread · next bot"

2. Quick Actions row:
   - 6 buttons: Plan my day, Quick log, Search vault, Check email, Set reminder, Ask agent
   - Each with icon, distinct color, hover effect
   - Clicking navigates to relevant page

3. Stat cards row (4 cards):
   - Tasks today (done/total)
   - Unread emails
   - Vault notes (hardcode 247)
   - Day streak (hardcode 12d)

4. 2x2 grid of widgets:
   - TaskList widget (from dashboard/TaskList.tsx)
   - EmailPreview widget (from dashboard/EmailPreview.tsx)
   - VaultRecent widget (from dashboard/VaultRecent.tsx)
   - PipelineMini widget (from dashboard/PipelineMini.tsx)

Each widget:
- Surface background, border, rounded
- Header with title + "View all →" link
- Content from mock data

Create the widget components in components/dashboard/.
Import mock data from lib/mock-data.ts.
```

---

## Step 3.4: Build Agent Page

**Tell Claude Code:**

```
Build app/agent/page.tsx:

1. Chat messages area (scrollable, flex-grow):
   - Map over CHAT_MESSAGES from mock data
   - User messages: right-aligned, amber background
   - Agent messages: left-aligned, surface background
   - Each has "YOU" or "AGENT" label in mono font
   - Support markdown-like formatting (newlines, bullets)

2. Bottom section (fixed height):
   - Quick prompt buttons row: "Plan my day", "Check email", "Search vault", "Log something", "Set reminder", "CRM update"
   - Clicking a button puts that text in the input
   - Text input with placeholder "Tell your agent what to do..."
   - Send button (amber)
   - Enter key sends (for now, just adds message to local state)

Create components/chat/ChatPanel.tsx, ChatMessage.tsx, QuickPrompts.tsx.
Use useState to manage messages locally (add new user messages on send).
For now, add a fake AI response after 1 second delay.
```

---

## Step 3.5: Build Planner Page

**Tell Claude Code:**

```
Build app/planner/page.tsx:

1. Header:
   - "Daily Planner" title
   - Date + completion count
   - "+ Add task" and "AI Plan ◉" buttons

2. Schedule section (TimeBlocks component):
   - List of time blocks: 08:00, 09:00, 10:30, etc.
   - Each has: time (mono font), colored left border, description
   - Colors: blue=work, red=meeting, purple=project, green=learning, gray=break, amber=bot

3. Task list section (TaskManager component):
   - Filter pills: All, Office, Project, Personal, Learning
   - Task list with: checkbox, text, tag pill, priority dot
   - Clicking checkbox toggles done state
   - Use mock TASKS data

Create components/planner/TimeBlocks.tsx and TaskManager.tsx.
```

---

## Step 3.6: Build Vault Page

**Tell Claude Code:**

```
Build app/vault/page.tsx:

1. Header:
   - "Vault" title
   - Stats: "247 notes · 9 folders · Last indexed 42 min ago"
   - Search input + "+ New note" button

2. Folder filter pills:
   - All, 00-Inbox, 01-Daily, 02-Learning, etc.
   - Clicking changes active filter (local state)

3. File table:
   - Columns: Name (with ◇ icon), Folder, Modified, Size
   - Rows from mock VAULT_FILES
   - Hover effect on rows
   - Filter by selected folder (or show all)

Create components/vault/FileTable.tsx and FolderFilter.tsx.
```

---

## Step 3.7: Build Mail Page

**Tell Claude Code:**

```
Build app/mail/page.tsx:

1. Header:
   - "Mail" title
   - Stats: "X unread · Y urgent · via Gmail API"
   - "Compose" button (blue) + "AI Summarize ◉" button

2. Email list:
   - Each row: read/unread dot, sender, subject (truncated), urgent badge, time
   - Unread: bolder text
   - Urgent: red dot + "URGENT" badge
   - Hover effect on rows

Use mock EMAILS data.
```

---

## Step 3.8: Build Research Page

**Tell Claude Code:**

```
Build app/research/page.tsx:

1. Header:
   - "Research" title
   - Description: "Deep search across vault + web"

2. Search section:
   - Large input field
   - "Research" button (green)

3. Results (two columns):
   - Left: "FROM YOUR VAULT" header, placeholder text
   - Right: "FROM THE WEB" header, placeholder text

4. Recent research section:
   - List of 3 recent searches with query, match counts, date
```

---

## Step 3.9: Build Saved Page

**Tell Claude Code:**

```
Build app/saved/page.tsx:

1. Header:
   - "Saved Items" title
   - Description: "Bookmarks, clippings, references"
   - "+ Save URL" button

2. Filter pills:
   - All, Articles, Tutorials, Videos, Guides

3. Saved items list:
   - Each row: ◆ icon, title, source domain, type badge, date
   - Hover effect

Use mock SAVED_ITEMS data.
```

---

## Step 3.10: Build Bots Page

**Tell Claude Code:**

```
Build app/bots/page.tsx:

1. Header:
   - "Automation Bots" title
   - Stats: "13 workflows · 12 healthy"

2. Bot grid (2 columns):
   - Each card: icon, name, schedule, last run, status indicator
   - Status: green dot = healthy, yellow = warning, red = error
   - Surface background, border, rounded

Use mock BOTS data.
```

---

## Layer 3 Checklist

```
□ Home page matches wireframe with all widgets
□ Agent page has working chat (local state)
□ Planner page has schedule + task list
□ Vault page has folder filter + file table
□ Mail page has email list
□ Research page has search + split results
□ Saved page has items list + filter
□ Bots page has bot grid
□ All pages use consistent styling
□ Task checkboxes toggle
□ Filter pills work
□ Git commit: "Layer 3: All UI pages complete with mock data"
```

---

# LAYER 4: API Routes

**Goal:** Create all backend API routes. Return mock data for now — real connections come later.

**Time:** 2-3 hours

---

## Step 4.1: Create Helper Libraries

**Tell Claude Code:**

```
Create lib/anthropic.ts:

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function chat(messages: Array<{role: string, content: string}>, systemPrompt: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });
  
  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
}

---

Create lib/khoj.ts:

const KHOJ_BASE = process.env.KHOJ_BASE_URL || 'http://localhost:42110';

export async function search(query: string, type: string = 'markdown') {
  // For now, return mock data
  // Later: call Khoj API
  return {
    results: [
      { entry: 'Mock search result for: ' + query, file: '01-Daily/2026-02-02.md', score: 0.95 },
    ]
  };
}

export async function reindex() {
  // Later: POST to Khoj /api/content/index
  return { success: true };
}

---

Create lib/n8n.ts:

const N8N_BASE = process.env.N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook';

export async function triggerWorkflow(workflow: string, payload: any) {
  // For now, return mock response
  // Later: POST to n8n webhook
  console.log(`[n8n] Would trigger ${workflow} with:`, payload);
  return { success: true, mock: true };
}

---

Create lib/vault.ts:

import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault';

export async function readFile(filePath: string): Promise<string> {
  const fullPath = path.join(VAULT_PATH, filePath);
  // Security: ensure path doesn't escape vault
  if (!fullPath.startsWith(path.resolve(VAULT_PATH))) {
    throw new Error('Invalid path');
  }
  return fs.readFile(fullPath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const fullPath = path.join(VAULT_PATH, filePath);
  if (!fullPath.startsWith(path.resolve(VAULT_PATH))) {
    throw new Error('Invalid path');
  }
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

export async function listFiles(folder: string = ''): Promise<Array<{name: string, folder: string, modified: string, size: string}>> {
  // For now, return mock data
  // Later: read actual directory
  return [
    { name: '2026-02-02.md', folder: '01-Daily', modified: 'Today', size: '2.1 KB' },
  ];
}
```

---

## Step 4.2: Create System Prompts

**Tell Claude Code:**

```
Create lib/prompts.ts:

export const SYSTEM_PROMPT = `You are Void — a personal AI operating system.

You help the user:
- Plan their day with time-blocked schedules
- Log quick thoughts and notes
- Search their personal knowledge vault
- Manage emails and set reminders
- Track CRM deals and projects

## Context
You have access to the user's vault via semantic search. Before answering, relevant context from their notes is provided.

## Actions
When you need to perform an action, include this at the end of your response:
\`\`\`action
{"type": "plan|log|email|remind|crm|memory", "payload": {...}}
\`\`\`

## Style
- Be direct and practical
- Use time blocks for schedules (08:00, 09:30, etc.)
- Use ✓ for confirmations
- Format plans with emojis for visual scanning

Current date: {date}
Current time: {time}
Timezone: Asia/Dhaka

## User Context
{context}
`;

export function buildPrompt(context: string = ''): string {
  const now = new Date();
  return SYSTEM_PROMPT
    .replace('{date}', now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('{time}', now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    .replace('{context}', context || 'No additional context.');
}
```

---

## Step 4.3: Create API Routes

**Tell Claude Code:**

```
Create all API routes:

app/api/health/route.ts:
- GET: return { status: 'ok', timestamp, services: { n8n: true, khoj: true, vault: true } }

app/api/chat/route.ts:
- POST: receive { message, history }
- Call Khoj search for context (mock for now)
- Build system prompt with context
- Call Claude API
- Return { reply, actions? }

app/api/search/route.ts:
- POST: receive { query, type }
- Call Khoj search
- Return { results }

app/api/vault/list/route.ts:
- GET: receive ?folder query param
- Call listFiles
- Return { files }

app/api/vault/read/route.ts:
- POST: receive { path }
- Call readFile
- Return { content, metadata }

app/api/vault/write/route.ts:
- POST: receive { path, content, mode }
- Call writeFile (or append)
- Return { success }

app/api/action/plan/route.ts:
- POST: receive { date, input }
- Call n8n.triggerWorkflow('plan', payload)
- Return result

app/api/action/log/route.ts:
- POST: receive { text }
- Call n8n.triggerWorkflow('log', payload)
- Return result

app/api/action/email/route.ts:
- POST: receive { action, to?, subject?, body? }
- Call n8n.triggerWorkflow('email', payload)
- Return { emails? } or { sent: true }

app/api/action/remind/route.ts:
- POST: receive { message, time }
- Call n8n.triggerWorkflow('remind', payload)
- Return { success, scheduled_for }

app/api/action/crm/route.ts:
- POST: receive { action }
- Call n8n.triggerWorkflow('crm', payload)
- Return { deals }

app/api/action/memory/route.ts:
- POST: receive { type, content }
- Call n8n.triggerWorkflow('save-memory', payload)
- Return { success }
```

---

## Step 4.4: Test API Routes

**Test with curl or browser:**

```bash
# Health check
curl http://localhost:3000/api/health

# Chat (need API key)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'

# Vault list
curl http://localhost:3000/api/vault/list
```

---

## Step 4.5: Push to GitHub

**Tell Claude Code:**

```
1. Create a new repository on GitHub called "void"
2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/void.git
3. Push: git push -u origin main

The repo now has:
- Complete Next.js dashboard (UI only, mock data)
- All API routes (returning mock/test responses)
- Docker compose files (ready for VPS)
- Vault template (ready to copy)
- n8n workflow placeholders (ready to build)
```

---

## Layer 4 Checklist

```
□ lib/anthropic.ts created with chat function
□ lib/khoj.ts created with search function
□ lib/n8n.ts created with triggerWorkflow function
□ lib/vault.ts created with read/write/list functions
□ lib/prompts.ts created with system prompt
□ All API routes created and return responses
□ /api/health works
□ /api/chat works with Claude API (test with real key)
□ Code pushed to GitHub
□ Git commit: "Layer 4: API routes complete"
```

---

# LAYER 5: VPS + Docker Services

**Goal:** Deploy Khoj, n8n, Syncthing on your VPS.

**Time:** 2-3 hours

---

## Step 5.1: Buy and Access VPS

```
1. Go to hostinger.com
2. Buy VPS → KVM 2 ($6.99/mo) → Ubuntu 24.04 with Coolify
3. Note your VPS IP address
4. SSH in: ssh root@YOUR_VPS_IP
5. Verify Coolify: open http://YOUR_VPS_IP:8000 in browser
6. Create Coolify admin account
```

---

## Step 5.2: Configure Domain

```
In your domain registrar (Namecheap, Cloudflare, etc.):

Add A records:
- app.yourdomain.com → YOUR_VPS_IP
- n8n.yourdomain.com → YOUR_VPS_IP
- khoj.yourdomain.com → YOUR_VPS_IP
- sync.yourdomain.com → YOUR_VPS_IP

Wait 5-30 minutes for DNS propagation.
Test: ping n8n.yourdomain.com (should resolve to your IP)
```

---

## Step 5.3: Clone Repo on VPS

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Clone your repo
cd /opt
git clone https://github.com/YOUR_USERNAME/void.git

# Copy vault template to actual vault location
cp -r /opt/void/vault-template /opt/void-vault

# Create Docker env file
cp /opt/void/docker/.env.example /opt/void/docker/.env

# Edit with your real values
nano /opt/void/docker/.env
```

---

## Step 5.4: Deploy n8n via Coolify

```
Option A: Use Coolify's one-click n8n (recommended)
1. Coolify dashboard → Projects → Add
2. Name: "void-automation"
3. Add Resource → search "n8n" → select n8n with PostgreSQL
4. Set domain: n8n.yourdomain.com
5. Deploy

Option B: Use your Docker Compose
1. Coolify → Projects → Add
2. Name: "void-n8n"
3. Add Resource → Docker Compose
4. Paste contents of docker/docker-compose.n8n.yml
5. Set environment variables
6. Set domain: n8n.yourdomain.com
7. Deploy
```

---

## Step 5.5: Deploy Khoj via Coolify

```
1. Coolify → Projects → "void-automation" → Add Resource
2. Docker Compose
3. Paste contents of docker/docker-compose.khoj.yml
4. Set environment variables (from your .env)
5. Set domain: khoj.yourdomain.com (for the khoj service)
6. Deploy
7. Wait for containers to start
8. Access Khoj admin: https://khoj.yourdomain.com/server/admin
9. Configure Khoj:
   - Add content source: /data/vault (this is mounted from /opt/void-vault)
   - Set up Claude/Anthropic as the chat model
   - Trigger initial indexing
```

---

## Step 5.6: Deploy Syncthing via Coolify

```
1. Coolify → Add Resource → Docker Compose
2. Paste contents of docker/docker-compose.sync.yml
3. Set VAULT_PATH=/opt/void-vault
4. Set domain: sync.yourdomain.com
5. Deploy
6. Access: https://sync.yourdomain.com
7. Set up Syncthing password
8. Note the Device ID
```

---

## Step 5.7: Test Services

```bash
# Test n8n
curl https://n8n.yourdomain.com/healthz

# Test Khoj
curl https://khoj.yourdomain.com/api/health

# Test Syncthing
# Open https://sync.yourdomain.com in browser

# Check containers
docker ps

# Check logs
docker logs n8n -f
docker logs khoj -f
```

---

## Layer 5 Checklist

```
□ VPS purchased and accessible via SSH
□ Coolify running and accessible
□ Domain DNS configured (all subdomains)
□ Repo cloned to /opt/void
□ Vault created at /opt/void-vault
□ n8n deployed and accessible at n8n.yourdomain.com
□ Khoj deployed and accessible at khoj.yourdomain.com
□ Khoj configured to index /opt/void-vault
□ Syncthing deployed and accessible
□ All services show healthy in Coolify
```

---

# LAYER 6: n8n Workflows

**Goal:** Build all automation workflows in n8n.

**Time:** 3-4 hours

---

## Step 6.1: Create Telegram Bot

```
1. Open Telegram, message @BotFather
2. /newbot → name it "Void Bot" or similar
3. Copy the bot token
4. Message your bot to start a chat
5. Get your chat ID: visit https://api.telegram.org/bot<TOKEN>/getUpdates
6. Note: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
```

---

## Step 6.2: Set Up n8n Credentials

```
In n8n (https://n8n.yourdomain.com):

1. Settings → Credentials → Add
2. Add these credentials:
   - Anthropic: your API key
   - Telegram: bot token
   - Gmail: OAuth2 (follow n8n's guide)
   - HTTP Header Auth: for webhook security (optional)
```

---

## Step 6.3: Build Core Workflows

**Build these workflows in n8n's visual editor:**

### Workflow 1: Daily Plan Creator
```
Trigger: Webhook (POST /webhook/plan)
         + Schedule Trigger (8:00 AM daily)
↓
Read File: /vault/07-Agent-Memory/preferences.md
↓
Read File: /vault/01-Daily/[yesterday].md
↓
HTTP Request: Claude API
  - System: "Create a daily plan..."
  - User: preferences + yesterday's notes + user input
↓
Write File: /vault/01-Daily/[today].md
↓
Telegram: Send plan summary to user
↓
Respond to Webhook: { success: true, plan: "..." }
```

### Workflow 2: Quick Log
```
Trigger: Webhook (POST /webhook/log)
↓
Get today's date
↓
Read File: /vault/01-Daily/[today].md
↓
Append text under "## Log" section
↓
Write File: /vault/01-Daily/[today].md
↓
Respond to Webhook: { success: true }
```

### Workflow 3: Vault Search
```
Trigger: Webhook (POST /webhook/search)
↓
HTTP Request: Khoj API
  - GET /api/search?q=[query]&t=markdown
↓
Format results
↓
Respond to Webhook: { results: [...] }
```

### Workflow 4: Telegram Router
```
Trigger: Telegram Trigger (on message)
↓
IF: message starts with /plan
  → Execute Workflow: Daily Plan Creator
IF: message starts with /log
  → Execute Workflow: Quick Log  
IF: message starts with /search
  → Execute Workflow: Vault Search
ELSE:
  → Telegram: "Unknown command. Try /plan, /log, or /search"
```

### Workflow 5: Health Monitor
```
Trigger: Schedule (every 15 minutes)
↓
HTTP Request: Dashboard /api/health
HTTP Request: Khoj /api/health
↓
IF: any failed
  → Telegram: "⚠️ Service down: [name]"
```

---

## Step 6.4: Export Workflows

```
After building each workflow in n8n:
1. Open the workflow
2. Click ... menu → Export
3. Save JSON to your local n8n-workflows/ folder
4. Commit and push to GitHub

This keeps your workflows version-controlled.
```

---

## Step 6.5: Test Workflows

```
Test via Telegram:
- Send /plan → should create daily note
- Send /log test message → should append to daily note
- Send /search embeddings → should return vault results

Test via curl:
curl -X POST https://n8n.yourdomain.com/webhook/plan \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-03", "input": "4 hours office, meeting at 2pm"}'
```

---

## Layer 6 Checklist

```
□ Telegram bot created
□ n8n credentials configured (Anthropic, Telegram, Gmail)
□ Daily Plan workflow works
□ Quick Log workflow works
□ Vault Search workflow works
□ Telegram Router works (/plan, /log, /search commands)
□ Health Monitor workflow runs and alerts on failure
□ Workflows exported to n8n-workflows/ folder
□ Git commit: "Layer 6: n8n workflows complete"
```

---

# LAYER 7: Deploy Dashboard + Connect

**Goal:** Deploy the Next.js dashboard and connect it to real services.

**Time:** 2-3 hours

---

## Step 7.1: Update API Routes for Real Services

**Tell Claude Code:**

```
Update lib/khoj.ts to make real API calls:

export async function search(query: string, type: string = 'markdown') {
  const response = await fetch(
    `${process.env.KHOJ_BASE_URL}/api/search?q=${encodeURIComponent(query)}&t=${type}`,
    { headers: { 'Authorization': `Bearer ${process.env.KHOJ_API_KEY}` } }
  );
  return response.json();
}

Update lib/n8n.ts to make real webhook calls:

export async function triggerWorkflow(workflow: string, payload: any) {
  const response = await fetch(`${process.env.N8N_WEBHOOK_BASE}/${workflow}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

Update lib/vault.ts to work with real vault path on VPS.
```

---

## Step 7.2: Deploy Dashboard via Coolify

```
1. Coolify → Projects → "void-automation" → Add Resource
2. Application → GitHub
3. Connect your GitHub account
4. Select repository: void
5. Branch: main
6. Build: Nixpacks (auto-detects Next.js)
7. Set domain: app.yourdomain.com
8. Environment variables:
   - ANTHROPIC_API_KEY=sk-ant-...
   - N8N_WEBHOOK_BASE=http://n8n:5678/webhook (internal Docker network)
   - KHOJ_BASE_URL=http://khoj:42110 (internal Docker network)
   - VAULT_PATH=/opt/void-vault
   - NEXTAUTH_SECRET=random-secret
   - NEXTAUTH_URL=https://app.yourdomain.com
9. Deploy
```

---

## Step 7.3: Connect UI to Real APIs

**Tell Claude Code:**

```
Update the frontend components to call real APIs instead of using mock data:

1. Home page:
   - Fetch recent vault files from /api/vault/list
   - Fetch task count from today's daily note

2. Agent page:
   - Connect ChatPanel to /api/chat
   - Remove mock delay, use real Claude responses
   - Parse action blocks from Claude's response
   - Trigger appropriate /api/action/* when actions detected

3. Vault page:
   - Connect FileTable to /api/vault/list
   - Connect search to /api/search
   - Connect NoteViewer to /api/vault/read

4. Mail page:
   - Connect to /api/action/email with action="read"

Add loading states and error handling to all components.
```

---

## Step 7.4: Test Full Flow

```
1. Open https://app.yourdomain.com
2. Chat: "Plan my day, 4 hours office, meeting at 2pm"
3. Verify:
   - Claude responds with a plan
   - n8n workflow triggers
   - Daily note created in vault
   - Telegram notification received
4. Chat: "Log: finished the marketing review"
5. Verify: text appended to daily note
6. Open Vault page:
   - See today's daily note in list
   - Click to view content
7. Search: "marketing"
8. Verify: Khoj returns relevant results
```

---

## Layer 7 Checklist

```
□ Dashboard deployed to app.yourdomain.com
□ Environment variables set correctly
□ /api/chat calls real Claude API
□ /api/search calls real Khoj
□ /api/action/* calls real n8n webhooks
□ /api/vault/* reads/writes real vault files
□ Full flow works: chat → n8n → vault → visible in dashboard
□ Git commit: "Layer 7: Dashboard connected to all services"
```

---

# LAYER 8: Polish + Sync

**Goal:** Bug fixes, Syncthing setup, Obsidian connection, refinements.

**Time:** Ongoing

---

## Step 8.1: Connect Syncthing to Your Devices

```
On your Mac/Windows:
1. Download Syncthing: https://syncthing.net/downloads/
2. Run Syncthing, open http://localhost:8384
3. Add Remote Device: paste VPS Syncthing Device ID
4. On VPS Syncthing: accept the connection
5. Share the vault folder:
   - VPS: /var/syncthing/vault
   - Local: ~/Vault (or wherever you want)
6. Wait for initial sync

Now your vault syncs automatically between VPS and your computer.
```

---

## Step 8.2: Set Up Obsidian

```
1. Download Obsidian: https://obsidian.md
2. Open folder as vault: ~/Vault (the Syncthing folder)
3. Your notes from VPS appear!
4. Any edits in Obsidian → sync to VPS → Khoj re-indexes

Recommended Obsidian plugins:
- Calendar (for daily notes navigation)
- Dataview (for queries)
- Tasks (for task management)
```

---

## Step 8.3: Remaining Workflows

Build the remaining n8n workflows:
- Morning Briefing (cron 8AM)
- Night Capture (cron 9PM)
- Weekly Review (cron Sunday 10PM)
- Email Manager (Gmail integration)
- CRM Query (if using HubSpot/Pipedrive)
- Reminder Scheduler
- Memory Updater

---

## Step 8.4: Polish

```
- Add loading skeletons to all pages
- Add error boundaries
- Improve mobile responsiveness
- Refine AI prompts based on actual usage
- Add more quick actions
- Set up Coolify database backups
- Set up uptime monitoring (e.g., UptimeRobot)
```

---

## Layer 8 Checklist

```
□ Syncthing connected to Mac/Windows
□ Obsidian opens the vault
□ Edits sync in both directions
□ All 13 n8n workflows built
□ Morning briefing sends at 8AM
□ Weekly review generates on Sunday
□ Email integration works
□ Error handling improved
□ Mobile layout reasonable
□ Backups configured
□ System used daily for 1 week
```

---

# Connection Diagram

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
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐   │          │
│   │  │01-Daily │ │02-Learn │ │03-Office│ │07-Agent-Memory   │   │          │
│   │  └─────────┘ └─────────┘ └─────────┘ └──────────────────┘   │          │
│   └─────────────────────────────────────────────────────────────┘          │
│             │                                     │                         │
│             │ Syncthing                           │ Read-only mount         │
│             ▼                                     │                         │
│   ┌───────────────────┐                          │                         │
│   │    Syncthing      │                          │                         │
│   │ :8384/:22000      │                          │                         │
│   └───────────────────┘                          │                         │
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

# Data Flow Examples

## Flow 1: "Plan my day"

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
12. Syncthing → syncs new file to your Mac
13. Khoj → re-indexes (next cycle) → file is searchable
```

## Flow 2: Telegram /log

```
1. You send to Telegram: "/log finished marketing review"
2. Telegram → n8n Telegram trigger
3. n8n → routes to Quick Log workflow
4. n8n → reads 01-Daily/2026-02-03.md
5. n8n → appends under "## Log" section
6. n8n → writes file back
7. n8n → replies on Telegram: "✓ Logged"
8. Syncthing → syncs to your Mac
9. Obsidian → shows updated note
```

---

# Start Here

```
1. Open VS Code
2. Open Claude Code
3. Copy "Step 1.1" from Layer 1
4. Paste to Claude Code
5. Let it create the project
6. Test: npm run dev
7. Continue with Step 1.2, 1.3, etc.
8. One step at a time
9. Test after each step
10. Commit after each layer

You've got this. Build the void. 🕳️
```
