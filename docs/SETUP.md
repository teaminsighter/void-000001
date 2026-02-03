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
git clone https://github.com/YOUR_USERNAME/void.git
cd void
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

## Production Deployment

See the Layer-by-Layer Build Plan for detailed deployment instructions:

1. **Layer 5**: VPS setup + Docker services
2. **Layer 6**: n8n workflows
3. **Layer 7**: Dashboard deployment
4. **Layer 8**: Polish + sync setup

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
| `VAULT_PATH` | Path to vault folder | Yes |
| `NEXTAUTH_SECRET` | Auth secret | Yes |
| `NEXTAUTH_URL` | App URL | Yes |

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

## Need Help?

- Check the [Layer Build Plan](../VOID-LAYER-BUILD-PLAN.md)
- Review [Architecture docs](./ARCHITECTURE.md)
- Check [API documentation](./API.md)
