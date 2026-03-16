# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VOID is a personal AI operating system - a Next.js dashboard where a Claude-powered agent manages tasks, notes, emails, and runs automated workflows. The agent has 37 function-calling tools for vault operations, task management, messaging (Telegram/Discord), email triage, and web search.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Architecture

### Core Flow
```
Browser → Next.js App Router → /api/chat-stream (SSE)
                                    ├── lib/anthropic.ts   — Claude API with tool loop
                                    ├── lib/tools.ts       — 37 tool definitions
                                    ├── lib/vault.ts       — Markdown file operations
                                    ├── lib/db.ts          — SQLite persistence
                                    ├── lib/khoj.ts        — Semantic search (RAG)
                                    └── lib/n8n.ts         — Automation webhooks
```

### Key Modules

**lib/anthropic.ts** - Claude API wrapper with streaming tool use. `streamChatWithTools()` handles the full message→tool_use→tool_result→response loop with SSE streaming. Max 10 tool rounds per request.

**lib/tools.ts** - VOID_TOOLS array defines all 37 Anthropic-format tool schemas. Tool execution logic lives in `/api/chat-stream/route.ts`.

**lib/vault.ts** - Filesystem operations for the markdown vault. Auto-versions files before overwrite (`.versions/`), soft-deletes to `.trash/`, syncs changes to Khoj for indexing.

**lib/db.ts** - SQLite via better-sqlite3. Stores conversations, messages, contacts (Telegram/Discord), and Gmail metadata. WAL mode enabled.

**lib/prompts.ts** - Builds the system prompt by loading agent memory files from vault (`07-Agent-Memory/`).

### Frontend Structure

Uses Next.js 16 App Router with DM Sans + JetBrains Mono fonts. Main layout in `components/layout/MainLayout.tsx` with Sidebar, Topbar, and content area.

Dashboard pages: `/` (home), `/vault`, `/planner`, `/agent`, `/mail`, `/research`, `/bots`, `/saved`, `/practice`

### External Integrations

- **Khoj** (port 42110) - Vector search + RAG for vault queries
- **n8n** (port 5678) - Automation workflows for email, reminders, CRM
- **SearXNG** - Web search backend
- **ElevenLabs** - Text-to-speech
- **Telegram/Discord** - Bot messaging

## Environment Setup

Copy `.env.example` to `.env.local`. Required variables:
- `ANTHROPIC_API_KEY` - Claude API
- `VOID_PASSWORD` / `VOID_JWT_SECRET` - Auth
- `VAULT_PATH` - Path to markdown vault (default: `./vault`)
- `VOID_DB_PATH` - SQLite database path (default: `./data/void.db`)

## Path Aliases

Uses `@/*` path alias mapping to project root (configured in tsconfig.json).

## Deployment

Push to `master` triggers Coolify auto-build via Nixpacks. Docker services (Khoj, n8n) run separately on the VPS.
