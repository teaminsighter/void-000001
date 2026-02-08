# VOID

Personal AI Operating System — a single web dashboard where an AI agent plans your day, manages notes, searches your knowledge vault, and runs automated workflows.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4** + **TypeScript 5**
- **Claude API** (Anthropic SDK 0.72.1) for AI reasoning
- **Khoj** for semantic vault search
- **n8n** for workflow automation
- **PostgreSQL + pgvector** for embeddings

## Live URLs

| Service | URL |
|---------|-----|
| Dashboard | [void.insighter.digital](https://void.insighter.digital) |
| Khoj | [khoj.insighter.digital](https://khoj.insighter.digital) |
| n8n | [n8n.insighter.digital](https://n8n.insighter.digital) |

## Quick Start (Local Dev)

```bash
git clone <repo-url> void
cd void/void-000001
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
# Open http://localhost:3000
```

## Architecture

```
Browser → Coolify Proxy (SSL) → Dashboard (Next.js 16)
                                    ├── Claude API (thinks)
                                    ├── Vault (direct filesystem read/write)
                                    ├── Khoj (semantic search)
                                    └── n8n (complex integrations)
```

Core actions (log, memory, save) write directly to the vault. n8n handles complex integrations (email, reminders, CRM).

## Folder Structure

```
app/          Next.js pages + API routes
components/   React components (layout, chat, dashboard, ui)
lib/          Utilities (anthropic, vault, prompts, khoj, n8n)
hooks/        React hooks (useChat, useTasks, useKeyboard)
docker/       Docker Compose files for VPS services
docs/         Documentation (API, Architecture, Setup)
```

## Deployment

Deployed on **Coolify** (Hostinger VPS) using **Nixpacks** build. Push to main triggers auto-deploy.

## Environment Variables

See [`.env.example`](.env.example) for all required variables. Key ones:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key (required) |
| `KHOJ_BASE_URL` | Khoj API endpoint |
| `KHOJ_API_KEY` | Khoj auth token |
| `N8N_WEBHOOK_BASE` | n8n webhook URL |
| `VAULT_PATH` | Path to markdown vault |
| `TELEGRAM_BOT_TOKEN` | Telegram notifications |

## Documentation

- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Build Plan](VOID-LAYER-BUILD-PLAN.md)
- [Build Guide](VOID-BUILD-GUIDE.md)
