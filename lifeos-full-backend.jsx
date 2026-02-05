import { useState } from "react";

const S = {
  // Services
  services: [
    {
      id: "coolify-proxy", name: "Coolify Reverse Proxy (Traefik)", image: "traefik:v2.x (managed by Coolify)", port: "80 / 443", url: "*.yourdomain.com", cat: "infra", color: "#8b5cf6",
      ram: "64 MB", cpu: "0.1 core",
      desc: "Auto-routes all traffic by subdomain. Auto-generates and renews SSL/HTTPS certificates via Let's Encrypt. You never touch this — Coolify manages it.",
      env: [], vol: [], deps: [],
      apis: [
        { m: "→", p: "app.yourdomain.com", d: "→ Dashboard container :3000" },
        { m: "→", p: "n8n.yourdomain.com", d: "→ n8n container :5678" },
        { m: "→", p: "khoj.yourdomain.com", d: "→ Khoj container :42110" },
        { m: "→", p: "sync.yourdomain.com", d: "→ Syncthing container :8384" },
      ],
      coolify: "Built-in — Coolify handles this automatically when you add a domain to any service",
      redeploy: "Never needed — auto-managed by Coolify",
    },
    {
      id: "dashboard", name: "LifeOS Dashboard (Next.js)", image: "node:20-alpine → next build", port: "3000", url: "app.yourdomain.com", cat: "frontend", color: "#06b6d4",
      ram: "256 MB", cpu: "0.5 core",
      desc: "Your single UI — chat panel, data panels, vault browser. Server-side API routes proxy calls to Claude, n8n, and Khoj so API keys stay hidden from the browser.",
      env: ["ANTHROPIC_API_KEY=sk-ant-...", "N8N_WEBHOOK_BASE=http://n8n:5678/webhook", "KHOJ_BASE_URL=http://khoj-server:42110", "NEXTAUTH_SECRET=<random-secret>", "NEXTAUTH_URL=https://app.yourdomain.com"],
      vol: [],
      deps: ["n8n", "khoj-server"],
      apis: [
        { m: "GET", p: "/", d: "Serves the dashboard React app (SSR)" },
        { m: "POST", p: "/api/chat", d: "Browser → Next.js → Claude API (key hidden server-side)" },
        { m: "POST", p: "/api/search", d: "Browser → Next.js → Khoj /api/search" },
        { m: "POST", p: "/api/action/plan", d: "Browser → Next.js → n8n /webhook/plan" },
        { m: "POST", p: "/api/action/log", d: "Browser → Next.js → n8n /webhook/log" },
        { m: "POST", p: "/api/action/email", d: "Browser → Next.js → n8n /webhook/email" },
        { m: "POST", p: "/api/action/crm", d: "Browser → Next.js → n8n /webhook/crm" },
        { m: "POST", p: "/api/vault/read", d: "Browser → Next.js → reads /opt/lifeos-vault/*" },
        { m: "GET", p: "/api/health", d: "Health check for Coolify monitoring" },
      ],
      coolify: "Application — connect GitHub repo → auto-deploy on git push → Coolify builds Docker image → assigns domain → HTTPS",
      redeploy: "Push to GitHub → Coolify auto-detects → builds → deploys with zero downtime (blue-green). Or click 'Redeploy' in Coolify UI.",
    },
    {
      id: "n8n", name: "n8n Automation Engine", image: "n8nio/n8n:latest", port: "5678", url: "n8n.yourdomain.com", cat: "engine", color: "#f97316",
      ram: "1 GB", cpu: "1 core",
      desc: "ALL automations. Receives webhooks from Dashboard, runs workflows, talks to Gmail/Telegram/CRM/Slack, writes to vault, triggers scheduled bots. The 'hands' of your system.",
      env: ["N8N_ENCRYPTION_KEY=<random-64-char>", "DB_TYPE=postgresdb", "DB_POSTGRESDB_HOST=n8n-postgres", "DB_POSTGRESDB_PORT=5432", "DB_POSTGRESDB_DATABASE=n8n", "DB_POSTGRESDB_USER=n8n", "DB_POSTGRESDB_PASSWORD=<secret>", "WEBHOOK_URL=https://n8n.yourdomain.com", "N8N_SECURE_COOKIE=false", "GENERIC_TIMEZONE=Asia/Dhaka"],
      vol: ["n8n_data:/home/node/.n8n", "/opt/lifeos-vault:/vault"],
      deps: ["n8n-postgres"],
      apis: [
        { m: "POST", p: "/webhook/plan", d: "Create daily plan → write to vault" },
        { m: "POST", p: "/webhook/log", d: "Log entry → append to daily note" },
        { m: "POST", p: "/webhook/search", d: "Query Khoj → return results" },
        { m: "POST", p: "/webhook/email", d: "Fetch Gmail inbox / send email" },
        { m: "POST", p: "/webhook/telegram-cmd", d: "Process /plan /log /search from Telegram" },
        { m: "POST", p: "/webhook/crm", d: "Query CRM pipeline data" },
        { m: "POST", p: "/webhook/remind", d: "Schedule a Telegram reminder" },
        { m: "POST", p: "/webhook/weekly-review", d: "Generate weekly review from daily notes" },
        { m: "POST", p: "/webhook/save-memory", d: "Update 07-Agent-Memory/ files" },
        { m: "GET", p: "/webhook/health", d: "Health check" },
      ],
      coolify: "Service — one-click from Coolify catalog (search 'n8n with PostgreSQL'). Pre-configured Docker Compose with Postgres included.",
      redeploy: "Coolify UI → Services → n8n → Redeploy. Pulls latest image, restarts container. Data preserved in Docker volumes. Workflows/credentials untouched.",
    },
    {
      id: "n8n-postgres", name: "n8n PostgreSQL", image: "postgres:16-alpine", port: "5432 (internal only)", url: "— not exposed —", cat: "database", color: "#64748b",
      ram: "256 MB", cpu: "0.3 core",
      desc: "Stores n8n workflows, credentials (encrypted), execution history, webhook configs. Internal only — not accessible from internet.",
      env: ["POSTGRES_DB=n8n", "POSTGRES_USER=n8n", "POSTGRES_PASSWORD=<secret>", "POSTGRES_NON_ROOT_USER=n8n", "POSTGRES_NON_ROOT_PASSWORD=<secret>"],
      vol: ["n8n_pg_data:/var/lib/postgresql/data"],
      deps: [],
      apis: [],
      coolify: "Bundled with n8n service — auto-deployed when you add n8n from catalog",
      redeploy: "Usually never needed. If needed: Coolify UI → stop → redeploy. Volume preserves all data.",
    },
    {
      id: "khoj-server", name: "Khoj AI Server", image: "ghcr.io/khoj-ai/khoj:latest", port: "42110", url: "khoj.yourdomain.com", cat: "memory", color: "#ec4899",
      ram: "2.5 GB", cpu: "1 core",
      desc: "Vector indexer + semantic search + AI chat. Reads your vault, chunks markdown files, creates embeddings, stores in pgvector. Enables 'search by meaning' over all your notes.",
      env: ["KHOJ_ADMIN_PASSWORD=<secret>", "KHOJ_ADMIN_EMAIL=you@email.com", "KHOJ_DJANGO_SECRET_KEY=<random-50-char>", "ANTHROPIC_API_KEY=sk-ant-...", "KHOJ_DOMAIN=khoj.yourdomain.com", "KHOJ_NO_HTTPS=True", "POSTGRES_DB=khoj", "POSTGRES_USER=khoj", "POSTGRES_PASSWORD=<secret>", "POSTGRES_HOST=khoj-db", "POSTGRES_PORT=5432"],
      vol: ["khoj_models:/root/.cache/torch", "khoj_hf:/root/.cache/huggingface", "/opt/lifeos-vault:/data/vault:ro"],
      deps: ["khoj-db"],
      apis: [
        { m: "GET", p: "/api/search?q=..&t=markdown", d: "Semantic search over vault — returns ranked results" },
        { m: "POST", p: "/api/chat", d: "AI chat with vault context injected" },
        { m: "GET", p: "/api/content/markdown", d: "List all indexed markdown content" },
        { m: "POST", p: "/api/content/index", d: "Trigger manual re-index of vault" },
        { m: "GET", p: "/api/health", d: "Health check" },
      ],
      coolify: "Docker Compose — custom compose file deployed via Coolify. Includes Khoj server + pgvector DB + SearXNG.",
      redeploy: "Coolify UI → Docker Compose → Pull & Redeploy. Models re-cached on first boot (~2 min). Vectors preserved in pgvector volume.",
    },
    {
      id: "khoj-db", name: "Khoj PostgreSQL + pgvector", image: "pgvector/pgvector:pg16", port: "5433 (internal only)", url: "— not exposed —", cat: "database", color: "#64748b",
      ram: "512 MB", cpu: "0.5 core",
      desc: "Stores vector embeddings (1536-dim floats), document metadata, conversation history, user preferences. pgvector extension enables cosine similarity search for semantic matching.",
      env: ["POSTGRES_DB=khoj", "POSTGRES_USER=khoj", "POSTGRES_PASSWORD=<secret>"],
      vol: ["khoj_pg_data:/var/lib/postgresql/data"],
      deps: [],
      apis: [],
      coolify: "Bundled in Khoj Docker Compose stack",
      redeploy: "Rarely needed. If vault needs fresh vectors: Khoj admin panel → re-index. Database volume preserves all embeddings.",
      dbTables: [
        { name: "embeddings", desc: "Vector representations of each vault chunk (1536-dim float arrays)" },
        { name: "entries", desc: "Text chunks from vault files + metadata (file path, timestamps)" },
        { name: "conversations", desc: "Chat history between you and Khoj" },
        { name: "agents", desc: "Custom agent configurations" },
        { name: "search_models", desc: "Which embedding model is active" },
      ],
    },
    {
      id: "searxng", name: "SearXNG (Private Web Search)", image: "searxng/searxng:latest", port: "8080 (internal only)", url: "— not exposed —", cat: "memory", color: "#ec4899",
      ram: "128 MB", cpu: "0.2 core",
      desc: "Privacy-respecting meta search engine. Khoj uses it to search the web when you ask questions that need current information. No tracking, no ads.",
      env: [], vol: [], deps: [],
      apis: [{ m: "GET", p: "/search?q=...", d: "Returns web search results to Khoj" }],
      coolify: "Bundled in Khoj Docker Compose stack",
      redeploy: "Auto-restarts with Khoj stack",
    },
    {
      id: "syncthing", name: "Syncthing (Vault Sync)", image: "syncthing/syncthing:latest", port: "8384 + 22000", url: "sync.yourdomain.com", cat: "storage", color: "#22c55e",
      ram: "128 MB", cpu: "0.2 core",
      desc: "Real-time P2P file sync. Keeps /opt/lifeos-vault on VPS identical to vault folders on your Mac and Windows machines. No cloud middleman — direct encrypted sync.",
      env: [], vol: ["/opt/lifeos-vault:/var/syncthing/Sync"],
      deps: [],
      apis: [{ m: "GET", p: "/rest/system/status", d: "Sync status API" }],
      coolify: "Docker Compose — custom single-service compose file",
      redeploy: "Coolify UI → Pull & Redeploy. Sync state preserved. Devices auto-reconnect.",
    },
  ],

  // Automation workflows
  workflows: [
    { name: "📋 Daily Plan Creator", trigger: "Webhook /plan OR Telegram /plan OR Cron 8:00 AM", flow: "Receive input → Read 07-Agent-Memory/preferences.md → Read yesterday's daily note → Call Claude API → Generate plan → Write 01-Daily/YYYY-MM-DD.md → Send to Telegram" },
    { name: "📝 Quick Log", trigger: "Webhook /log OR Telegram /log", flow: "Receive text → Get today's date → Append to 01-Daily/YYYY-MM-DD.md under ## Log section → Confirm via response/Telegram" },
    { name: "🔍 Vault Search", trigger: "Webhook /search OR Telegram /search", flow: "Receive query → Call Khoj /api/search?q=query → Format top 5 results → Return to dashboard/Telegram" },
    { name: "📧 Email Manager", trigger: "Webhook /email", flow: "Action=read: Gmail API → fetch last 10 unread → Call Claude → summarize → return. Action=send: receive draft → Gmail API → send → log to vault" },
    { name: "💬 Telegram Router", trigger: "Telegram Bot webhook (incoming message)", flow: "Parse command (/plan, /log, /search, /remind) → Route to correct sub-workflow → Execute → Reply to user" },
    { name: "🏢 CRM Query", trigger: "Webhook /crm", flow: "HubSpot/Pipedrive API → fetch pipeline deals → Call Claude → summarize → return. Optional: write CRM summary to 03-Office/crm-update.md" },
    { name: "⏰ Reminder Scheduler", trigger: "Webhook /remind", flow: "Parse time + message → n8n Wait node → At scheduled time → Telegram Bot → send reminder" },
    { name: "📊 Weekly Review", trigger: "Cron: Sunday 10:00 PM", flow: "Read last 7 daily notes from 01-Daily/ → Read goals from 07-Agent-Memory/goals-2026.md → Call Claude with review prompt → Write 06-Reviews/Weekly-YYYY-WXX.md → Send summary to Telegram" },
    { name: "🌅 Morning Briefing", trigger: "Cron: 8:00 AM daily", flow: "Read today's calendar (Google Calendar API) → Read yesterday's unfinished tasks → Check email count → Call Claude → Generate briefing → Send to Telegram" },
    { name: "🌙 Night Capture", trigger: "Cron: 9:00 PM daily", flow: "Send Telegram prompt 'What did you accomplish today?' → Wait for reply → Append to daily note → Confirm" },
    { name: "🔄 Khoj Re-indexer", trigger: "Cron: every 6 hours", flow: "POST to Khoj /api/content/index → Log result → Alert via Telegram if failed" },
    { name: "❤️ Health Monitor", trigger: "Cron: every 15 minutes", flow: "Ping Dashboard /api/health → Ping Khoj /api/health → Ping n8n /webhook/health → If ANY fail → Telegram alert immediately" },
    { name: "🧠 Memory Updater", trigger: "Webhook /save-memory", flow: "Receive context update (preference, goal, decision) → Read current 07-Agent-Memory/*.md → Merge new info → Write updated file → Trigger Khoj re-index" },
  ],

  // Data flows
  flows: [
    {
      title: "\"Plan my day, 4h office, meeting at 2pm\"",
      steps: [
        { loc: "Browser", to: "Coolify Proxy :443", proto: "HTTPS", detail: "User types in dashboard chat" },
        { loc: "Proxy", to: "Dashboard :3000", proto: "HTTP (internal)", detail: "Traefik routes app.yourdomain.com" },
        { loc: "Dashboard /api/chat", to: "Khoj :42110", proto: "HTTP", detail: "GET /api/search?q=preferences goals schedule → gets your context" },
        { loc: "Khoj", to: "pgvector DB :5433", proto: "SQL", detail: "SELECT embedding similarity search → returns matching vault chunks" },
        { loc: "Dashboard /api/chat", to: "api.anthropic.com", proto: "HTTPS", detail: "POST /v1/messages — system prompt + vault context + user message → Claude thinks" },
        { loc: "Claude API", to: "Dashboard", proto: "HTTPS", detail: "Returns structured plan as markdown" },
        { loc: "Dashboard /api/action/plan", to: "n8n :5678", proto: "HTTP", detail: "POST /webhook/plan with plan markdown + date" },
        { loc: "n8n workflow", to: "/opt/lifeos-vault", proto: "Filesystem", detail: "Creates/updates 01-Daily/2026-02-02.md with plan content" },
        { loc: "n8n workflow", to: "api.telegram.org", proto: "HTTPS", detail: "Bot sends you a summary + sets 2PM meeting reminder" },
        { loc: "Syncthing", to: "Your Mac + Windows", proto: "P2P encrypted", detail: "New vault file syncs to all your devices within seconds" },
        { loc: "Khoj indexer", to: "pgvector DB", proto: "SQL", detail: "Next index cycle: chunks new file → creates embeddings → stores vectors" },
      ],
    },
    {
      title: "\"Check my email, anything urgent?\"",
      steps: [
        { loc: "Browser", to: "Dashboard :3000", proto: "HTTPS", detail: "Your message arrives via proxy" },
        { loc: "Dashboard /api/chat", to: "Claude API", proto: "HTTPS", detail: "Claude understands intent = 'read email, check urgency'" },
        { loc: "Dashboard /api/action/email", to: "n8n :5678", proto: "HTTP", detail: "POST /webhook/email with action=read" },
        { loc: "n8n Gmail node", to: "gmail.googleapis.com", proto: "HTTPS + OAuth2", detail: "Fetch last 10 unread emails (from, subject, body snippet)" },
        { loc: "Gmail API", to: "n8n", proto: "HTTPS", detail: "Returns email array as JSON" },
        { loc: "n8n", to: "Dashboard", proto: "HTTP", detail: "Webhook response returns email data" },
        { loc: "Dashboard /api/chat", to: "Claude API", proto: "HTTPS", detail: "Claude summarizes: '2 urgent from boss, 3 newsletters, 5 marketing'" },
        { loc: "Dashboard", to: "Browser", proto: "HTTPS", detail: "Chat shows summary + Mail panel updates with email list" },
      ],
    },
    {
      title: "Sunday 10PM — Auto Weekly Review (no user input)",
      steps: [
        { loc: "n8n Cron trigger", to: "n8n workflow", proto: "Internal", detail: "Fires automatically at 22:00 every Sunday" },
        { loc: "n8n", to: "/opt/lifeos-vault", proto: "Filesystem", detail: "Reads 01-Daily/2026-01-27.md through 2026-02-02.md (7 days)" },
        { loc: "n8n", to: "/opt/lifeos-vault", proto: "Filesystem", detail: "Reads 07-Agent-Memory/goals-2026.md for context" },
        { loc: "n8n HTTP Request", to: "api.anthropic.com", proto: "HTTPS", detail: "POST /v1/messages — 7 daily notes + goals + review prompt → Claude generates review" },
        { loc: "Claude API", to: "n8n", proto: "HTTPS", detail: "Returns: wins, challenges, patterns, next week focus" },
        { loc: "n8n", to: "/opt/lifeos-vault", proto: "Filesystem", detail: "Writes 06-Reviews/Weekly-2026-W05.md" },
        { loc: "n8n Telegram node", to: "api.telegram.org", proto: "HTTPS", detail: "Sends you review summary on Telegram" },
        { loc: "Syncthing", to: "Your devices", proto: "P2P", detail: "Review file appears in Obsidian on Mac/Windows" },
      ],
    },
  ],

  // Coolify projects
  coolifyProjects: [
    { name: "lifeos-dashboard", type: "Git Application", source: "GitHub → auto-deploy on push to main", domain: "app.yourdomain.com", deployMethod: "Nixpacks or Dockerfile", restart: "Push to GitHub OR click Redeploy" },
    { name: "n8n-automation", type: "One-Click Service", source: "Coolify catalog → 'n8n with PostgreSQL'", domain: "n8n.yourdomain.com", deployMethod: "Pre-built Docker image", restart: "Click Redeploy → pulls latest n8nio/n8n" },
    { name: "khoj-memory", type: "Docker Compose", source: "Custom docker-compose.yml (Khoj + pgvector + SearXNG)", domain: "khoj.yourdomain.com", deployMethod: "Docker Compose up", restart: "Click Redeploy → pulls latest images → re-starts all" },
    { name: "syncthing-vault", type: "Docker Compose", source: "Custom single-service compose", domain: "sync.yourdomain.com", deployMethod: "Docker image", restart: "Click Redeploy → preserves sync state" },
  ],

  // Redeploy scenarios
  redeploy: [
    { icon: "🔄", trigger: "You push code to GitHub", action: "Dashboard auto-redeploys", detail: "Coolify webhook detects push → builds new image → blue-green deploy → zero downtime", time: "~2 min", risk: "None" },
    { icon: "⬆️", trigger: "n8n new version released", action: "Update n8n container", detail: "Coolify UI → n8n service → Redeploy. Pulls latest image. Workflows + credentials preserved in Postgres volume.", time: "~1 min", risk: "None — test in n8n first" },
    { icon: "🧠", trigger: "Khoj update available", action: "Redeploy Khoj stack", detail: "Coolify UI → khoj-memory → Pull & Redeploy. All containers restart. Vectors preserved. Models re-cache on boot.", time: "~3 min", risk: "None — vectors in pgvector volume" },
    { icon: "🔑", trigger: "Change Claude → GPT-4", action: "Swap AI provider", detail: "Coolify UI → dashboard → Environment → change ANTHROPIC_API_KEY to OPENAI_API_KEY → Save → Restart. Update n8n LLM nodes to OpenAI.", time: "~5 min", risk: "Zero data loss" },
    { icon: "📧", trigger: "Add WhatsApp integration", action: "Add n8n workflow", detail: "Open n8n.yourdomain.com → create new workflow with Twilio/WhatsApp node → activate. No redeploy needed — n8n is live config.", time: "~30 min", risk: "None — other workflows unaffected" },
    { icon: "💥", trigger: "VPS crashes completely", action: "Full disaster recovery", detail: "1) Buy new Hostinger VPS → install Coolify\n2) Restore Docker volumes from backup (Coolify S3 backup)\n3) Vault already safe on your Mac/Windows via Syncthing\n4) Re-deploy all 4 Coolify projects\n5) Point DNS to new IP", time: "~2-3 hours", risk: "Zero data loss if backups configured" },
    { icon: "📈", trigger: "Need more resources", action: "Upgrade VPS plan", detail: "Hostinger panel → VPS → Upgrade plan (KVM2 → KVM4). Server restarts with more RAM/CPU. Coolify + all containers auto-start.", time: "~10 min", risk: "Brief downtime during VPS reboot" },
    { icon: "🗑️", trigger: "Remove Gmail, add Outlook", action: "Swap email integration", detail: "n8n UI → open email workflow → delete Gmail node → add Outlook node → configure OAuth → save → activate. No redeploy.", time: "~15 min", risk: "None" },
  ],
};

/* ═══════════ COMPONENT ═══════════ */
export default function BackendBlueprint() {
  const [tab, setTab] = useState("services");
  const [selSvc, setSelSvc] = useState("dashboard");
  const [expandedFlow, setExpandedFlow] = useState(0);
  const [expandedDeploy, setExpandedDeploy] = useState(-1);

  const svc = S.services.find(s => s.id === selSvc);
  const cats = ["infra", "frontend", "engine", "memory", "storage", "database"];
  const catLabels = { infra: "Infrastructure", frontend: "Frontend", engine: "Automation Engine", memory: "Memory & Search", storage: "File Storage", database: "Databases" };
  const catIcons = { infra: "🌐", frontend: "🖥️", engine: "⚙️", memory: "🧠", storage: "💾", database: "🗄️" };
  const methodColors = { GET: "#22c55e", POST: "#eab308", "→": "#8b5cf6" };
  const protoColors = { HTTPS: "#22c55e", HTTP: "#eab308", "HTTP (internal)": "#eab308", SQL: "#a78bfa", Filesystem: "#06b6d4", "P2P encrypted": "#ec4899", P2P: "#ec4899", Internal: "#64748b", "HTTPS + OAuth2": "#22c55e" };

  const tabs = [
    { id: "services", l: "🐳 Services & APIs" },
    { id: "flows", l: "🔀 Data Flows" },
    { id: "automations", l: "⚙️ n8n Workflows" },
    { id: "deploy", l: "🚀 Coolify & Redeploy" },
    { id: "resources", l: "💻 VPS Resources" },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#05060a", fontFamily: "'Segoe UI','SF Pro',system-ui,sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ffffff12;border-radius:8px}
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffffff08", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>LifeOS — Complete Backend Blueprint</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Hostinger VPS · Coolify · Docker · 8 containers · Every endpoint & data flow</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "5px 10px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500,
              background: tab === t.id ? "#8b5cf620" : "#ffffff05", color: tab === t.id ? "#c4b5fd" : "#475569",
              fontFamily: "inherit", transition: "all .15s",
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 52px)" }}>

        {/* LEFT SIDEBAR — always shows service list */}
        <div style={{ width: 270, minWidth: 270, borderRight: "1px solid #ffffff06", overflow: "auto", padding: 10 }}>
          <div style={{ padding: "6px 8px", marginBottom: 8, borderRadius: 6, background: "#ffffff04", border: "1px solid #ffffff06" }}>
            <div style={{ fontSize: 9, color: "#8b5cf6", fontWeight: 600, letterSpacing: 1 }}>🖥️ HOSTINGER VPS (KVM 2)</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[{ l: "CPU", v: "2 cores" }, { l: "RAM", v: "8 GB" }, { l: "Disk", v: "100 GB NVMe" }].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{s.v}</div>
                  <div style={{ fontSize: 8, color: "#475569" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 8.5, color: "#334155", textAlign: "center", marginTop: 3 }}>Ubuntu 24.04 + Coolify · $6.99/mo</div>
          </div>

          {cats.map(cat => {
            const items = S.services.filter(s => s.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 8.5, color: "#475569", fontWeight: 600, letterSpacing: 1, padding: "2px 4px" }}>{catIcons[cat]} {catLabels[cat].toUpperCase()}</div>
                {items.map(s => (
                  <div key={s.id} onClick={() => { setSelSvc(s.id); setTab("services"); }} style={{
                    padding: "7px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 2,
                    background: selSvc === s.id && tab === "services" ? `${s.color}10` : "#ffffff02",
                    borderLeft: `3px solid ${selSvc === s.id && tab === "services" ? s.color : "transparent"}`,
                    transition: "all .15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#e2e8f0" }}>{s.name.split("(")[0].trim()}</span>
                      <span style={{ fontSize: 9, color: s.color, fontFamily: "monospace" }}>{s.port.split(" ")[0]}</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#334155", marginTop: 1, fontFamily: "monospace" }}>{s.image.substring(0, 35)}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* RIGHT MAIN PANEL */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }} key={tab}>

          {/* ═══ SERVICES ═══ */}
          {tab === "services" && svc && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${svc.color}12`, border: `2px solid ${svc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐳</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{svc.name}</div>
                  <div style={{ fontSize: 11, color: svc.color, fontFamily: "monospace" }}>{svc.image} → :{svc.port}</div>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5, marginBottom: 14 }}>{svc.desc}</p>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 14 }}>
                {[
                  { l: "Public URL", v: svc.url, c: "#22c55e" },
                  { l: "CPU", v: svc.cpu, c: "#eab308" },
                  { l: "RAM", v: svc.ram, c: "#ec4899" },
                  { l: "Coolify Deploy", v: svc.coolify.split("—")[0].trim(), c: "#8b5cf6" },
                  { l: "Depends On", v: svc.deps.length ? svc.deps.join(", ") : "None", c: "#f97316" },
                  { l: "Redeploy", v: svc.redeploy.split(".")[0], c: "#06b6d4" },
                ].map((x, i) => (
                  <div key={i} style={{ padding: "7px 9px", borderRadius: 5, background: "#ffffff03", border: "1px solid #ffffff06" }}>
                    <div style={{ fontSize: 8.5, color: "#475569", letterSpacing: .5 }}>{x.l.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: x.c, fontWeight: 500, marginTop: 1 }}>{x.v}</div>
                  </div>
                ))}
              </div>

              {/* ENV */}
              {svc.env.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>ENVIRONMENT VARIABLES</div>
                  <div style={{ padding: 8, borderRadius: 5, background: "#0a0b10", border: "1px solid #ffffff06", maxHeight: 140, overflow: "auto" }}>
                    {svc.env.map((e, i) => <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#86efac", padding: "1px 0" }}>{e}</div>)}
                  </div>
                </div>
              )}

              {/* Volumes */}
              {svc.vol.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>VOLUMES (persistent data)</div>
                  <div style={{ padding: 8, borderRadius: 5, background: "#0a0b10", border: "1px solid #ffffff06" }}>
                    {svc.vol.map((v, i) => <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#fbbf24", padding: "1px 0" }}>{v}</div>)}
                  </div>
                </div>
              )}

              {/* DB Tables */}
              {svc.dbTables && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>DATABASE TABLES</div>
                  {svc.dbTables.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "4px 8px", background: i % 2 ? "#ffffff02" : "transparent", borderRadius: 3 }}>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#c4b5fd", minWidth: 140 }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{t.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* API Endpoints */}
              {svc.apis.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>API ENDPOINTS ({svc.apis.length})</div>
                  {svc.apis.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 3, marginBottom: 1, background: "#ffffff02" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: methodColors[a.m] || "#64748b", fontFamily: "monospace", minWidth: 32 }}>{a.m}</span>
                      <span style={{ fontSize: 10.5, color: "#c4b5fd", fontFamily: "monospace", minWidth: 180 }}>{a.p}</span>
                      <span style={{ fontSize: 10.5, color: "#64748b" }}>{a.d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ DATA FLOWS ═══ */}
          {tab === "flows" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Request Flows — Browser to Database</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>Every hop traced: protocol, port, what happens at each step</div>

              {S.flows.map((f, fi) => (
                <div key={fi} style={{ marginBottom: 10 }}>
                  <div onClick={() => setExpandedFlow(expandedFlow === fi ? -1 : fi)} style={{
                    padding: "10px 12px", borderRadius: expandedFlow === fi ? "8px 8px 0 0" : 8, cursor: "pointer",
                    background: expandedFlow === fi ? "#ffffff06" : "#ffffff03", border: "1px solid #ffffff06",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{f.title}</span>
                    <span style={{ fontSize: 10, color: "#475569" }}>{f.steps.length} hops {expandedFlow === fi ? "▲" : "▼"}</span>
                  </div>
                  {expandedFlow === fi && (
                    <div style={{ padding: "12px 14px", background: "#ffffff03", border: "1px solid #ffffff06", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
                      {f.steps.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 14 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: protoColors[s.proto] || "#64748b", boxShadow: `0 0 4px ${protoColors[s.proto] || "#64748b"}30` }} />
                            {i < f.steps.length - 1 && <div style={{ width: 1, height: 22, background: "#ffffff10" }} />}
                          </div>
                          <div>
                            <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{s.loc}</span>
                              <span style={{ fontSize: 9, color: "#334155" }}>→</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{s.to}</span>
                              <span style={{ fontSize: 8, padding: "0 4px", borderRadius: 3, background: `${protoColors[s.proto] || "#64748b"}15`, color: protoColors[s.proto] || "#64748b", fontFamily: "monospace" }}>{s.proto}</span>
                            </div>
                            <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 1 }}>{s.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ padding: 12, borderRadius: 6, background: "#22c55e08", border: "1px solid #22c55e18", marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", marginBottom: 3 }}>KEY PATTERN</div>
                <div style={{ fontSize: 11.5, color: "#86efac", lineHeight: 1.5 }}>
                  Browser → Dashboard (proxy API keys) → Claude (thinks) → n8n webhook (acts) → External API or vault (does) → Response back.
                  Claude never touches vault directly. n8n is always the "hands." Vault is always the final destination.
                </div>
              </div>
            </div>
          )}

          {/* ═══ AUTOMATIONS ═══ */}
          {tab === "automations" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>n8n Automation Workflows</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>Every bot running on n8n.yourdomain.com — triggers, actions, and data paths</div>

              {S.workflows.map((w, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 6, marginBottom: 4, background: "#ffffff03", border: "1px solid #ffffff06" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: "#f97316", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>Trigger:</span> {w.trigger}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, paddingLeft: 8, borderLeft: "2px solid #f9731630" }}>{w.flow}</div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ DEPLOY ═══ */}
          {tab === "deploy" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Coolify Deployment Control</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>Every project in Coolify, how to redeploy, and what-if scenarios</div>

              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>COOLIFY PROJECTS ON YOUR VPS</div>
              {S.coolifyProjects.map((p, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 6, marginBottom: 4, background: "#ffffff03", border: "1px solid #ffffff06" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                      <span style={{ fontSize: 9, color: "#22c55e" }}>running</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {[
                      { l: "Type", v: p.type },
                      { l: "Domain", v: p.domain },
                      { l: "Source", v: p.source },
                      { l: "Restart", v: p.restart },
                    ].map((x, j) => (
                      <div key={j} style={{ fontSize: 10.5, color: "#64748b" }}>
                        <span style={{ color: "#475569" }}>{x.l}:</span> <span style={{ color: "#94a3b8" }}>{x.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>REDEPLOY & UPDATE SCENARIOS</div>
              {S.redeploy.map((r, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div onClick={() => setExpandedDeploy(expandedDeploy === i ? -1 : i)} style={{
                    padding: "8px 12px", borderRadius: expandedDeploy === i ? "6px 6px 0 0" : 6, cursor: "pointer",
                    background: "#ffffff03", border: "1px solid #ffffff06",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 12, color: "#e2e8f0" }}>{r.icon} {r.trigger}</span>
                    <span style={{ fontSize: 9, color: "#eab308", fontFamily: "monospace" }}>{r.time}</span>
                  </div>
                  {expandedDeploy === i && (
                    <div style={{ padding: "8px 12px", background: "#ffffff02", border: "1px solid #ffffff06", borderTop: "none", borderRadius: "0 0 6px 6px" }}>
                      <div style={{ fontSize: 11, color: "#8b5cf6", marginBottom: 3 }}>{r.action}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5, whiteSpace: "pre-line" }}>{r.detail}</div>
                      <div style={{ marginTop: 4, fontSize: 10, color: "#22c55e" }}>Risk: {r.risk}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══ VPS RESOURCES ═══ */}
          {tab === "resources" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>VPS Resource Map</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>RAM, CPU, disk, and network allocation across all containers</div>

              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>RAM USAGE (8 GB total)</div>
              <div style={{ padding: 12, borderRadius: 6, background: "#ffffff03", border: "1px solid #ffffff06", marginBottom: 14 }}>
                {[
                  { svc: "Coolify platform", ram: 0.5, c: "#8b5cf6" },
                  { svc: "Dashboard (Next.js)", ram: 0.25, c: "#06b6d4" },
                  { svc: "n8n + Postgres", ram: 1.25, c: "#f97316" },
                  { svc: "Khoj + pgvector + SearXNG", ram: 3.1, c: "#ec4899" },
                  { svc: "Syncthing", ram: 0.13, c: "#22c55e" },
                  { svc: "System + buffer", ram: 1.0, c: "#475569" },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 11.5, color: "#e2e8f0" }}>{r.svc}</span>
                      <span style={{ fontSize: 10.5, color: r.c, fontFamily: "monospace" }}>{r.ram} GB</span>
                    </div>
                    <div style={{ width: "100%", height: 5, borderRadius: 3, background: "#ffffff08" }}>
                      <div style={{ width: `${(r.ram / 8) * 100}%`, height: "100%", borderRadius: 3, background: r.c }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #ffffff08" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#eab308", fontFamily: "monospace" }}>~6.2 GB / 8 GB</span>
                </div>
              </div>

              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>DISK LAYOUT (100 GB NVMe)</div>
              <div style={{ padding: 10, borderRadius: 6, background: "#0a0b10", border: "1px solid #ffffff06", marginBottom: 14 }}>
                {[
                  { path: "/opt/lifeos-vault/", desc: "Obsidian vault (your files)", size: "~50 MB → grows", c: "#22c55e" },
                  { path: "/var/lib/docker/volumes/", desc: "All Docker volumes (DBs, configs)", size: "~8-12 GB", c: "#f97316" },
                  { path: "/data/coolify/", desc: "Coolify platform data", size: "~500 MB", c: "#8b5cf6" },
                  { path: "/root/.cache/huggingface/", desc: "Khoj embedding models", size: "~2-4 GB", c: "#ec4899" },
                  { path: "/home/node/.n8n/", desc: "n8n community nodes + config", size: "~200 MB", c: "#f97316" },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, padding: "3px 0", alignItems: "center" }}>
                    <span style={{ fontSize: 10.5, fontFamily: "monospace", color: d.c, minWidth: 200 }}>{d.path}</span>
                    <span style={{ fontSize: 10.5, color: "#64748b", flex: 1 }}>{d.desc}</span>
                    <span style={{ fontSize: 9.5, color: "#475569", fontFamily: "monospace" }}>{d.size}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>INTERNAL DOCKER NETWORK</div>
              <div style={{ padding: 10, borderRadius: 6, background: "#0a0b10", border: "1px solid #ffffff06", marginBottom: 14 }}>
                {[
                  { f: "Internet :443", t: "Coolify Traefik Proxy", n: "Routes by subdomain, terminates SSL" },
                  { f: "app.yourdomain.com", t: "dashboard:3000", n: "Frontend serves React + API routes" },
                  { f: "n8n.yourdomain.com", t: "n8n:5678", n: "Workflow UI + all webhook endpoints" },
                  { f: "khoj.yourdomain.com", t: "khoj-server:42110", n: "Search API + chat + admin panel" },
                  { f: "dashboard:3000", t: "n8n:5678", n: "Internal — webhook calls (no internet hop)" },
                  { f: "dashboard:3000", t: "khoj-server:42110", n: "Internal — search calls" },
                  { f: "n8n:5678", t: "n8n-postgres:5432", n: "Internal TCP — workflow data" },
                  { f: "khoj-server:42110", t: "khoj-db:5432", n: "Internal TCP — vectors + metadata" },
                  { f: "khoj-server:42110", t: "searxng:8080", n: "Internal — web search queries" },
                  { f: "n8n:5678", t: "/opt/lifeos-vault", n: "Mounted volume — read/write vault files" },
                  { f: "khoj-server:42110", t: "/opt/lifeos-vault:ro", n: "Mounted volume — read-only vault indexing" },
                  { f: "syncthing:22000", t: "Your Mac/Win Syncthing", n: "P2P encrypted — vault sync" },
                ].map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, padding: "2px 0", fontSize: 10.5 }}>
                    <span style={{ color: "#c4b5fd", fontFamily: "monospace", minWidth: 155 }}>{n.f}</span>
                    <span style={{ color: "#334155" }}>→</span>
                    <span style={{ color: "#86efac", fontFamily: "monospace", minWidth: 155 }}>{n.t}</span>
                    <span style={{ color: "#475569" }}>{n.n}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: "#22c55e08", border: "1px solid #22c55e18" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", marginBottom: 3 }}>💡 SCALING RECOMMENDATION</div>
                <div style={{ fontSize: 11.5, color: "#86efac", lineHeight: 1.5 }}>
                  Start with KVM 2 (8GB, $6.99/mo). Runs everything with ~1.8GB headroom.
                  If Khoj indexing slows with 1000+ notes → upgrade to KVM 4 (16GB, $9.99/mo).
                  Coolify handles the transition — containers auto-restart with more resources after VPS reboot.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
