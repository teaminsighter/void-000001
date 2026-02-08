# Void Setup Guide

## Prerequisites

- **Node.js 20+** — [Download](https://nodejs.org/)
- **Docker & Docker Compose** — [Download](https://www.docker.com/)
- **VPS** — Hostinger KVM 2 recommended (~$7/month)
- **Domain name** — For production deployment
- **Anthropic API key** — [Get here](https://console.anthropic.com/)
- **Telegram Bot Token** — From [@BotFather](https://t.me/botfather)

## Local Development

### 1. Clone the repository

```bash
git clone <repo-url> void
cd void/void-000001
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys.

### 4. Create local vault

```bash
cp -r vault-template vault
```

### 5. Start development server

```bash
npm run dev
```

### 6. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Production Deployment (Coolify)

1. Push code to GitHub
2. In Coolify: Add Resource → Git Application → connect GitHub repo
3. Set build pack to **Nixpacks** (auto-detects Next.js)
4. Set domain: `void.insighter.digital`
5. Add environment variables (see below)
6. Deploy

Coolify auto-deploys on push to main.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `N8N_WEBHOOK_BASE` | n8n webhook URL | Yes |
| `KHOJ_BASE_URL` | Khoj API URL | Yes |
| `KHOJ_API_KEY` | Khoj auth token | Yes |
| `USE_KHOJ` | Enable Khoj search (`true`/`false`) | Yes |
| `VAULT_PATH` | Path to vault folder | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS key | No |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | No |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | No |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | No |
| `TIMEZONE` | Timezone (default: Asia/Dhaka) | No |

## Troubleshooting

### API errors
- Check that `ANTHROPIC_API_KEY` is valid
- Verify n8n and Khoj services are running

### Vault not found
- Ensure `VAULT_PATH` points to a valid directory
- For local dev, copy `vault-template` to `vault`

### Build failures
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall

### Khoj search not working
- Verify `USE_KHOJ=true` in env
- Check Khoj is running and accessible
- Verify `KHOJ_API_KEY` is correct

## Need Help?

- Check the [Layer Build Plan](../VOID-LAYER-BUILD-PLAN.md)
- Review [Architecture docs](./ARCHITECTURE.md)
- Check [API documentation](./API.md)
