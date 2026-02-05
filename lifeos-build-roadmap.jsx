import { useState } from "react";

/* ═══════════════════════════════════
   COMPLETE BUILD ROADMAP DATA
   ═══════════════════════════════════ */

const SKILLS = [
  {
    id: "docker",
    name: "Docker & Docker Compose",
    priority: "🔴 CRITICAL",
    why: "Every service runs in Docker containers. If you can't read a docker-compose.yml or debug a crashed container, you're stuck.",
    whatToLearn: [
      "What a container is (an isolated mini-computer running one service)",
      "docker-compose.yml — read it, understand services/ports/volumes/environment",
      "docker compose up -d — start everything",
      "docker compose logs -f service_name — see what's happening inside",
      "docker compose down — stop everything",
      "docker compose pull && docker compose up -d — update to latest version",
      "Volumes — where data lives permanently (survives container restart)",
      "Port mapping — 5678:5678 means VPS port 5678 → container port 5678",
    ],
    dontNeed: [
      "Building custom Docker images from scratch (Coolify handles this)",
      "Docker networking deep-dive (Coolify auto-configures networks)",
      "Docker Swarm or Kubernetes",
      "Writing Dockerfiles (only needed if you customize Khoj/n8n)",
    ],
    timeToLearn: "2-3 hours",
    bestResource: "https://docs.docker.com/get-started/ — just Part 1 and 2",
    practiceTask: "Run 'docker compose up' on the Khoj docker-compose.yml locally. See it start. Read the logs. Stop it. Start it again. That's 80% of what you need.",
  },
  {
    id: "linux",
    name: "Basic Linux / SSH",
    priority: "🔴 CRITICAL",
    why: "Your VPS is Ubuntu Linux. You'll SSH into it to set up Coolify, check services, and debug issues.",
    whatToLearn: [
      "ssh root@your-vps-ip — connect to your server",
      "ls, cd, pwd — navigate folders",
      "cat filename — read a file",
      "nano filename — edit a file (Ctrl+X to save and exit)",
      "mkdir, cp, mv, rm — create/copy/move/delete",
      "df -h — check disk space",
      "free -h — check RAM usage",
      "htop — see what's using CPU/RAM (install with: apt install htop)",
      "systemctl status docker — is Docker running?",
      "ufw allow 443 — open a port in firewall",
    ],
    dontNeed: [
      "Shell scripting (bash scripts, loops, functions)",
      "Linux kernel tuning",
      "Package compilation from source",
      "Cron jobs (n8n handles all scheduling)",
    ],
    timeToLearn: "1-2 hours",
    bestResource: "https://linuxjourney.com — just the 'Command Line' section",
    practiceTask: "SSH into your Hostinger VPS. Navigate to /opt/. Create a test folder. Create a test file. Delete them. Check disk and RAM. Done.",
  },
  {
    id: "coolify",
    name: "Coolify (Deployment Platform)",
    priority: "🔴 CRITICAL",
    why: "This is your 'control panel' for everything. Deploy services, set domains, manage environment variables, view logs, restart containers — all from a web UI.",
    whatToLearn: [
      "Coolify dashboard → Projects → Add Resource",
      "Adding a Service from catalog (n8n — one click)",
      "Adding a Docker Compose resource (Khoj, Syncthing — paste your compose file)",
      "Adding a Git Application (your dashboard — connect GitHub, auto-deploy)",
      "Setting custom domains for each service",
      "Managing environment variables (where API keys go)",
      "Viewing real-time logs",
      "Clicking 'Redeploy' to update a service",
      "Setting up backup schedules for databases",
    ],
    dontNeed: [
      "Coolify API (you'll use the web UI)",
      "Multi-server setup (everything on one VPS)",
      "Docker Swarm mode in Coolify",
      "Custom build packs",
    ],
    timeToLearn: "1-2 hours (learning by doing — it's very visual)",
    bestResource: "https://coolify.io/docs/ — Getting Started section + Hostinger's Coolify tutorial",
    practiceTask: "Deploy n8n from Coolify catalog. Set its domain. Open n8n in your browser. That's it — if this works, you understand Coolify.",
  },
  {
    id: "n8n",
    name: "n8n Workflow Automation",
    priority: "🔴 CRITICAL",
    why: "This is the 'action engine' — every automation, every webhook, every scheduled bot lives here. You MUST be comfortable building workflows.",
    whatToLearn: [
      "The canvas — drag nodes, connect them with wires",
      "Webhook node — creates a URL that triggers the workflow when called",
      "HTTP Request node — call any API (Claude, Gmail, Telegram, Khoj)",
      "Code node — write small JavaScript to transform data",
      "IF node — branch logic (if email is urgent → do X, else → do Y)",
      "Schedule Trigger — run workflow at specific times (daily 8AM, weekly Sunday)",
      "Credentials — securely store API keys, OAuth tokens",
      "Read/Write Binary File — read/write files in your vault folder",
      "Expressions — {{ $json.message }} to reference data between nodes",
      "Error handling — what happens when a node fails",
    ],
    dontNeed: [
      "n8n's built-in AI agent nodes (you're using Claude API directly via HTTP Request)",
      "Sub-workflows (keep things simple at first)",
      "n8n's database nodes (you're writing to vault files, not databases)",
      "Community nodes beyond MCP client",
    ],
    timeToLearn: "3-5 hours (build your first 3 workflows)",
    bestResource: "https://docs.n8n.io/try-it-out/ — the interactive tutorial, then https://n8n.io/workflows/ for examples",
    practiceTask: "Build a workflow: Webhook trigger → HTTP Request to Claude API → return response. If this works, you can build everything.",
  },
  {
    id: "api-basics",
    name: "REST APIs & Webhooks",
    priority: "🟡 IMPORTANT",
    why: "Your dashboard talks to n8n via webhooks (POST requests). n8n talks to Claude, Gmail, Telegram via their APIs. You need to understand this communication pattern.",
    whatToLearn: [
      "What a REST API is — a URL that accepts/returns JSON data",
      "HTTP methods — GET (read), POST (send data), PUT (update), DELETE (remove)",
      "Headers — Content-Type: application/json, Authorization: Bearer <key>",
      "JSON — the data format everything uses: { \"key\": \"value\" }",
      "Webhook — a URL that another service calls when something happens",
      "Status codes — 200 (ok), 400 (bad request), 401 (unauthorized), 500 (server error)",
      "API keys — how you authenticate (Anthropic key, Gmail OAuth, Telegram bot token)",
      "Testing APIs with curl or Postman or n8n's HTTP Request node",
    ],
    dontNeed: [
      "Building APIs from scratch (Next.js API routes are simple)",
      "GraphQL",
      "WebSockets (except for chat streaming, which is optional)",
      "OAuth flow internals (n8n handles OAuth UI for Gmail/Slack)",
    ],
    timeToLearn: "2-3 hours",
    bestResource: "https://www.freecodecamp.org/news/how-to-use-rest-api/ — then practice in n8n's HTTP Request node",
    practiceTask: "Use n8n HTTP Request node to call Claude API. Send a message, get a response. That teaches you 80% of API skills you need.",
  },
  {
    id: "nextjs",
    name: "Next.js / React (Dashboard)",
    priority: "🟡 IMPORTANT",
    why: "Your dashboard is a Next.js app. You need basic understanding to modify it, add features, and fix issues.",
    whatToLearn: [
      "React components — functions that return HTML-like code (JSX)",
      "useState — how components remember things (like chat messages)",
      "useEffect — how components do things on load (like fetch data)",
      "Next.js API routes — /api/chat.js files that run on the server (hide API keys)",
      "fetch() — how the browser calls your API routes",
      "Tailwind CSS — utility classes for styling (p-4, bg-gray-900, text-white)",
      "Environment variables — .env.local file stores secrets",
    ],
    dontNeed: [
      "React class components (old style)",
      "Redux or complex state management",
      "Server components vs client components (keep everything simple)",
      "Next.js middleware, edge functions, ISR",
      "Testing frameworks (Jest, Cypress)",
    ],
    timeToLearn: "5-8 hours (if new to React) or 2-3 hours (if you know basics)",
    bestResource: "https://nextjs.org/learn — the official tutorial is excellent",
    practiceTask: "Clone the dashboard repo. Run 'npm run dev'. Change a text. See it update. Add a new button that calls an API route. That's your baseline.",
  },
  {
    id: "khoj",
    name: "Khoj Setup & Configuration",
    priority: "🟡 IMPORTANT",
    why: "Khoj is your memory layer. You need to set it up, point it to your vault, configure the AI model, and know how to trigger re-indexing.",
    whatToLearn: [
      "Khoj admin panel — /server/admin in your browser",
      "Configuring content source — point to your vault folder",
      "Choosing an AI model (Claude via Anthropic API key)",
      "Understanding indexing — when Khoj reads your vault and creates vectors",
      "Triggering re-index via API or admin panel",
      "Testing semantic search — does 'authentication issues' find your Firebase login notes?",
    ],
    dontNeed: [
      "Khoj's code internals",
      "Custom embedding models (defaults work fine)",
      "Building Khoj agents (use n8n + Claude instead)",
      "Khoj's Obsidian plugin (you're using the API directly)",
    ],
    timeToLearn: "1-2 hours",
    bestResource: "https://docs.khoj.dev/get-started/setup/ — self-host section",
    practiceTask: "Deploy Khoj via Docker Compose. Upload 5 test markdown files. Search for something. If results are relevant, you're done.",
  },
  {
    id: "dns",
    name: "DNS & Domain Configuration",
    priority: "🟢 QUICK WIN",
    why: "You need subdomains (app.yourdomain.com, n8n.yourdomain.com, etc.) pointing to your VPS. This is a one-time setup.",
    whatToLearn: [
      "A record — points a domain to an IP address",
      "Add A records for: app, n8n, khoj, sync → all pointing to your VPS IP",
      "Wait 5-30 minutes for DNS propagation",
      "Coolify auto-generates SSL certificates once DNS is set",
    ],
    dontNeed: [
      "CNAME records, MX records, TXT records",
      "DNS theory or how resolvers work",
      "CDN configuration",
    ],
    timeToLearn: "30 minutes",
    bestResource: "Your domain registrar's docs (Namecheap, Cloudflare, etc.)",
    practiceTask: "Add one A record. Wait. Visit the URL. If it loads, you're done.",
  },
  {
    id: "vault",
    name: "Obsidian Vault Structure",
    priority: "🟢 QUICK WIN",
    why: "Your vault is the foundation. A clean structure means n8n can write to predictable paths and Khoj indexes everything properly.",
    whatToLearn: [
      "Create the folder structure: 00-Inbox, 01-Daily, 02-Learning, 03-Office, 04-Projects, 05-References, 06-Reviews, 07-Agent-Memory, 99-System",
      "Daily note template — what n8n creates every day",
      "07-Agent-Memory/ files — preferences.md, goals-2026.md, agent-context.md",
      "Frontmatter (YAML at top of file) — tags, dates, metadata",
      "Markdown basics — headings (#), lists (-), bold (**text**), links ([[note]])",
    ],
    dontNeed: [
      "Obsidian plugins (keep minimal at first)",
      "Dataview queries (add later)",
      "Graph view optimization",
      "Custom CSS themes",
    ],
    timeToLearn: "1 hour",
    bestResource: "https://help.obsidian.md/Getting+started/Create+a+vault",
    practiceTask: "Create the 9 folders. Write your preferences.md and goals-2026.md. Create one daily note manually. This is your Day 0 vault.",
  },
  {
    id: "prompt",
    name: "Prompt Engineering",
    priority: "🟢 QUICK WIN",
    why: "The quality of your agent depends 70% on how well you write prompts. The system prompt, the planning prompt, the review prompt — these are what make the AI feel 'smart' or 'dumb'.",
    whatToLearn: [
      "System prompt design — tell Claude who it is, what it knows, how to respond",
      "Context injection — feed vault data INTO the prompt before Claude responds",
      "Structured output — tell Claude to respond in specific formats (markdown, JSON)",
      "Few-shot examples — show Claude 2-3 examples of what you want",
      "Prompt for specific tasks — planning prompt ≠ email summary prompt ≠ review prompt",
    ],
    dontNeed: [
      "Academic prompt engineering research",
      "Chain-of-thought notation",
      "Prompt optimization frameworks",
    ],
    timeToLearn: "2-3 hours (ongoing improvement)",
    bestResource: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering",
    practiceTask: "Write the system prompt for your agent. Test it in Claude.ai. Refine until the responses feel right. Then put it in 07-Agent-Memory/agent-context.md.",
  },
  {
    id: "git",
    name: "Git Basics",
    priority: "🟢 QUICK WIN",
    why: "Your dashboard code lives in GitHub. Pushing code = auto-deploy via Coolify. Also needed for vault backup.",
    whatToLearn: [
      "git add . — stage all changes",
      "git commit -m 'message' — save a snapshot",
      "git push — send to GitHub (triggers Coolify deploy)",
      "git pull — get latest code",
      "git clone — download a repo",
      "GitHub — create repo, connect to Coolify",
    ],
    dontNeed: [
      "Git branching strategies",
      "Merge conflict resolution (you're the only developer)",
      "Git rebase, cherry-pick, bisect",
      "GitHub Actions (Coolify replaces this)",
    ],
    timeToLearn: "1 hour",
    bestResource: "https://learngitbranching.js.org — just the intro levels",
    practiceTask: "Create a GitHub repo. Push one file. See it appear on GitHub. Connect it to Coolify. Push again. See Coolify auto-deploy.",
  },
];

const BUILD_PHASES = [
  {
    phase: "Phase 0",
    name: "Foundation",
    time: "Day 1 (3-4 hours)",
    goal: "VPS running with Coolify, n8n deployed, Telegram bot responding",
    steps: [
      { task: "Buy Hostinger KVM 2 VPS, choose Ubuntu 24.04 + Coolify", skill: "linux", time: "15 min" },
      { task: "SSH into VPS, verify Coolify is running at http://your-ip:8000", skill: "linux", time: "10 min" },
      { task: "Create Coolify admin account, complete onboarding", skill: "coolify", time: "10 min" },
      { task: "Add your domain — create A records pointing to VPS IP", skill: "dns", time: "20 min" },
      { task: "Deploy n8n from Coolify catalog, set domain n8n.yourdomain.com", skill: "coolify", time: "15 min" },
      { task: "Open n8n, create admin account", skill: "n8n", time: "5 min" },
      { task: "Create Telegram bot via @BotFather, get bot token", skill: "n8n", time: "10 min" },
      { task: "Build first n8n workflow: Telegram → Claude API → reply", skill: "n8n", time: "45 min" },
      { task: "Test: send /plan to Telegram bot → get AI response", skill: "n8n", time: "15 min" },
    ],
    milestone: "🎉 You can talk to Claude via Telegram, powered by n8n on your server",
  },
  {
    phase: "Phase 1",
    name: "Vault + Memory",
    time: "Day 2-3 (4-5 hours)",
    goal: "Obsidian vault on VPS, n8n writes daily notes, Khoj indexes and searches",
    steps: [
      { task: "Create vault folder on VPS: mkdir -p /opt/lifeos-vault/{00-Inbox,01-Daily,...}", skill: "linux", time: "15 min" },
      { task: "Write preferences.md, goals-2026.md, agent-context.md manually", skill: "vault", time: "30 min" },
      { task: "Build n8n workflow: /plan → read preferences → Claude → write daily note to vault", skill: "n8n", time: "60 min" },
      { task: "Build n8n workflow: /log → append text to today's daily note", skill: "n8n", time: "30 min" },
      { task: "Deploy Khoj Docker Compose via Coolify, set domain", skill: "coolify", time: "30 min" },
      { task: "Configure Khoj: point to /opt/lifeos-vault, set Claude API key, trigger index", skill: "khoj", time: "30 min" },
      { task: "Test Khoj search: ask about something in your notes, verify results", skill: "khoj", time: "15 min" },
      { task: "Build n8n workflow: /search → query Khoj API → return results to Telegram", skill: "n8n", time: "30 min" },
    ],
    milestone: "🎉 You can plan, log, and search your vault from Telegram. Khoj remembers everything.",
  },
  {
    phase: "Phase 2",
    name: "Dashboard",
    time: "Day 4-7 (6-8 hours)",
    goal: "Your single web dashboard — chat + data panels + vault browser, all connected",
    steps: [
      { task: "Clone or create the Next.js dashboard project on your computer", skill: "nextjs", time: "30 min" },
      { task: "Push to GitHub, connect to Coolify as Git Application", skill: "git", time: "20 min" },
      { task: "Build /api/chat route — proxies to Claude API (hides key)", skill: "nextjs", time: "60 min" },
      { task: "Build /api/search route — proxies to Khoj", skill: "nextjs", time: "30 min" },
      { task: "Build /api/action/* routes — proxies to n8n webhooks", skill: "nextjs", time: "45 min" },
      { task: "Build chat panel UI with message history", skill: "nextjs", time: "60 min" },
      { task: "Build quick action buttons (Plan, Log, Search, Remind)", skill: "nextjs", time: "30 min" },
      { task: "Build data panels (Today's plan, recent notes, email)", skill: "nextjs", time: "60 min" },
      { task: "Wire up context injection — agent reads Khoj before responding", skill: "prompt", time: "45 min" },
      { task: "Push to GitHub → auto-deploys to app.yourdomain.com", skill: "git", time: "5 min" },
    ],
    milestone: "🎉 One URL, one login, everything in one place. This is YOUR LifeOS.",
  },
  {
    phase: "Phase 3",
    name: "Integrations + Sync",
    time: "Week 2 (spread across days)",
    goal: "Email, CRM, scheduled bots, vault sync, full automation",
    steps: [
      { task: "Deploy Syncthing via Coolify, connect Mac + Windows", skill: "coolify", time: "45 min" },
      { task: "Connect Gmail OAuth in n8n — build email read/send workflows", skill: "n8n", time: "60 min" },
      { task: "Build morning briefing bot (Cron 8AM → plan → Telegram)", skill: "n8n", time: "30 min" },
      { task: "Build weekly review bot (Cron Sunday → read 7 daily notes → Claude → vault)", skill: "n8n", time: "45 min" },
      { task: "Build health monitor (Cron 15min → ping all services → alert on failure)", skill: "n8n", time: "20 min" },
      { task: "Connect CRM API in n8n if needed", skill: "n8n", time: "60 min" },
      { task: "Set up Coolify database backups to S3/remote storage", skill: "coolify", time: "30 min" },
      { task: "Set up git auto-commit on vault folder for version history", skill: "git", time: "20 min" },
      { task: "Refine all prompts based on real usage — this is ongoing", skill: "prompt", time: "ongoing" },
    ],
    milestone: "🎉 System is fully operational. Bots run automatically. Email works. Everything syncs. Vault is backed up.",
  },
];

const CONTROL_AREAS = [
  { area: "Add a new integration (e.g. Slack)", how: "Open n8n UI → create new workflow → add Slack node → configure OAuth → connect to webhook. No code, no redeploy.", skill: "n8n" },
  { area: "Change AI model (Claude → GPT)", how: "Coolify UI → dashboard → Environment variables → change API key/endpoint → restart. Update n8n LLM nodes.", skill: "coolify" },
  { area: "Dashboard looks wrong / needs change", how: "Edit code locally → git push → Coolify auto-redeploys. Or use Claude Code to help write the fix.", skill: "nextjs" },
  { area: "n8n workflow isn't working", how: "n8n UI → open workflow → check execution logs → see which node failed → check the error → fix → test again.", skill: "n8n" },
  { area: "Khoj search returns bad results", how: "Khoj admin panel → check if vault is indexed → trigger re-index → check embedding model → test search again.", skill: "khoj" },
  { area: "VPS is slow", how: "SSH in → htop to check CPU/RAM → see which container is eating resources → upgrade VPS plan or optimize.", skill: "linux" },
  { area: "Service is down", how: "Coolify UI → check service status → view logs → restart container. If persistent, check volumes and environment variables.", skill: "coolify" },
  { area: "Need to restore from backup", how: "New VPS → install Coolify → restore database volumes from S3 backup → redeploy services → point DNS to new IP.", skill: "coolify" },
  { area: "Want to add a new scheduled bot", how: "n8n UI → new workflow → Schedule Trigger node (set time) → build logic → activate. No code deployment needed.", skill: "n8n" },
  { area: "Vault notes are missing/conflicting", how: "Check Syncthing UI for sync conflicts → resolve manually → git log on vault folder to see history if auto-commit is on.", skill: "linux" },
];

/* ═══════════ COMPONENT ═══════════ */
export default function BuildRoadmap() {
  const [tab, setTab] = useState("skills");
  const [selSkill, setSelSkill] = useState("docker");
  const [checkedItems, setCheckedItems] = useState({});

  const toggle = (key) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  const skill = SKILLS.find(s => s.id === selSkill);
  const priColors = { "🔴 CRITICAL": "#ef4444", "🟡 IMPORTANT": "#eab308", "🟢 QUICK WIN": "#22c55e" };

  const tabs = [
    { id: "skills", l: "🎯 Skills You Need" },
    { id: "build", l: "🔨 Build Phases" },
    { id: "control", l: "🎛️ How To Control" },
    { id: "honest", l: "💬 Honest Talk" },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#05060a", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ffffff12;border-radius:8px}
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffffff08", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗺️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>LifeOS — What You Need to Start Building</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Skills · Build order · Control areas · Honest assessment</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
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

        {/* LEFT */}
        <div style={{ width: 280, minWidth: 280, borderRight: "1px solid #ffffff06", overflow: "auto", padding: 10 }}>
          {tab === "skills" && (
            <>
              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>SKILLS (click to explore)</div>
              {["🔴 CRITICAL", "🟡 IMPORTANT", "🟢 QUICK WIN"].map(pri => (
                <div key={pri}>
                  <div style={{ fontSize: 9, color: priColors[pri], fontWeight: 600, padding: "4px 4px 2px", letterSpacing: .5 }}>{pri}</div>
                  {SKILLS.filter(s => s.priority === pri).map(s => (
                    <div key={s.id} onClick={() => setSelSkill(s.id)} style={{
                      padding: "7px 10px", borderRadius: 5, cursor: "pointer", marginBottom: 2,
                      background: selSkill === s.id ? `${priColors[s.priority]}10` : "#ffffff02",
                      borderLeft: `3px solid ${selSkill === s.id ? priColors[s.priority] : "transparent"}`,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{s.name}</div>
                      <div style={{ fontSize: 9.5, color: "#475569" }}>{s.timeToLearn}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ padding: "8px 10px", marginTop: 8, borderRadius: 6, background: "#22c55e08", border: "1px solid #22c55e15" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#22c55e" }}>TOTAL LEARNING TIME</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#86efac" }}>~20-30 hours</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Spread across 1-2 weeks while building</div>
              </div>
            </>
          )}

          {tab === "build" && (
            <>
              <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>BUILD PHASES</div>
              {BUILD_PHASES.map((p, i) => (
                <div key={i} onClick={() => {}} style={{
                  padding: "8px 10px", borderRadius: 6, marginBottom: 3,
                  background: "#ffffff03", border: "1px solid #ffffff06",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{p.phase}: {p.name}</span>
                    <span style={{ fontSize: 9, color: "#8b5cf6" }}>{p.time}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{p.goal}</div>
                </div>
              ))}
              <div style={{ padding: "8px 10px", marginTop: 8, borderRadius: 6, background: "#8b5cf608", border: "1px solid #8b5cf615" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#8b5cf6" }}>FULL BUILD TIME</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>~2 weeks</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Phase 0-2 in first week, Phase 3 in second</div>
              </div>
            </>
          )}

          {(tab === "control" || tab === "honest") && (
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {tab === "control"
                  ? "This panel shows you exactly how to handle every situation you'll face while running your LifeOS system. Click through the scenarios on the right."
                  : "An honest assessment of what's hard, what's easy, and what you can delegate to AI tools like me."
                }
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }} key={tab}>

          {/* ═══ SKILLS ═══ */}
          {tab === "skills" && skill && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${priColors[skill.priority]}15`, color: priColors[skill.priority], fontWeight: 600 }}>{skill.priority}</span>
                <span style={{ fontSize: 17, fontWeight: 700 }}>{skill.name}</span>
              </div>
              <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5, marginBottom: 14 }}>{skill.why}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, letterSpacing: .8, marginBottom: 6 }}>✅ WHAT TO LEARN</div>
                  {skill.whatToLearn.map((item, i) => {
                    const key = `${skill.id}-learn-${i}`;
                    return (
                      <div key={i} onClick={() => toggle(key)} style={{ display: "flex", gap: 6, padding: "3px 0", cursor: "pointer", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 12, color: checkedItems[key] ? "#22c55e" : "#334155", minWidth: 16 }}>{checkedItems[key] ? "☑" : "☐"}</span>
                        <span style={{ fontSize: 11.5, color: checkedItems[key] ? "#64748b" : "#e2e8f0", textDecoration: checkedItems[key] ? "line-through" : "none", lineHeight: 1.4 }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 600, letterSpacing: .8, marginBottom: 6 }}>❌ DON'T NEED (skip these)</div>
                  {skill.dontNeed.map((item, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: "#475569", padding: "3px 0", lineHeight: 1.4 }}>• {item}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ padding: "8px 10px", borderRadius: 5, background: "#ffffff03", border: "1px solid #ffffff06" }}>
                  <div style={{ fontSize: 9, color: "#475569" }}>TIME TO LEARN</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#eab308" }}>{skill.timeToLearn}</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 5, background: "#ffffff03", border: "1px solid #ffffff06", gridColumn: "span 2" }}>
                  <div style={{ fontSize: 9, color: "#475569" }}>BEST RESOURCE</div>
                  <div style={{ fontSize: 11, color: "#06b6d4", wordBreak: "break-all" }}>{skill.bestResource}</div>
                </div>
              </div>

              <div style={{ padding: 10, borderRadius: 6, background: "#eab30808", border: "1px solid #eab30818" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#eab308", marginBottom: 3 }}>🧪 PRACTICE TASK (do this FIRST)</div>
                <div style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>{skill.practiceTask}</div>
              </div>
            </div>
          )}

          {/* ═══ BUILD PHASES ═══ */}
          {tab === "build" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>Build Sequence — Step by Step</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>Every task in order. Check them off as you go. Each phase builds on the previous one.</div>

              {BUILD_PHASES.map((phase, pi) => (
                <div key={pi} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c4b5fd" }}>{pi}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{phase.phase}: {phase.name}</div>
                      <div style={{ fontSize: 10.5, color: "#64748b" }}>{phase.time} · {phase.goal}</div>
                    </div>
                  </div>

                  {phase.steps.map((step, si) => {
                    const key = `phase-${pi}-${si}`;
                    const skillObj = SKILLS.find(s => s.id === step.skill);
                    return (
                      <div key={si} onClick={() => toggle(key)} style={{
                        display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", cursor: "pointer",
                        borderRadius: 4, background: checkedItems[key] ? "#22c55e08" : "#ffffff02", marginBottom: 2,
                        border: `1px solid ${checkedItems[key] ? "#22c55e15" : "#ffffff04"}`,
                      }}>
                        <span style={{ fontSize: 13, color: checkedItems[key] ? "#22c55e" : "#334155", minWidth: 16, marginTop: 1 }}>{checkedItems[key] ? "☑" : "☐"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: checkedItems[key] ? "#64748b" : "#e2e8f0", textDecoration: checkedItems[key] ? "line-through" : "none" }}>{step.task}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 8.5, padding: "1px 5px", borderRadius: 3, background: `${priColors[skillObj?.priority]}10`, color: priColors[skillObj?.priority] }}>{step.skill}</span>
                          <span style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{step.time}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ padding: "6px 10px", borderRadius: 4, background: "#22c55e08", border: "1px solid #22c55e12", marginTop: 4 }}>
                    <div style={{ fontSize: 11.5, color: "#86efac" }}>{phase.milestone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ CONTROL ═══ */}
          {tab === "control" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>How to Control Every Part of Your System</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 16 }}>Every scenario you'll face, and exactly how to handle it</div>

              {CONTROL_AREAS.map((c, i) => {
                const skillObj = SKILLS.find(s => s.id === c.skill);
                return (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 6, marginBottom: 4, background: "#ffffff03", border: "1px solid #ffffff06" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{c.area}</span>
                      <span style={{ fontSize: 8.5, padding: "1px 5px", borderRadius: 3, background: `${priColors[skillObj?.priority]}10`, color: priColors[skillObj?.priority] }}>{c.skill}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>{c.how}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ HONEST TALK ═══ */}
          {tab === "honest" && (
            <div style={{ animation: "fi .25s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Honest Assessment — What's Hard, What's Easy, What AI Can Do</div>

              {/* What AI (Claude) can do for you */}
              <div style={{ padding: 12, borderRadius: 6, background: "#22c55e06", border: "1px solid #22c55e15", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", marginBottom: 6, letterSpacing: .5 }}>✅ WHAT I (CLAUDE) CAN DO FOR YOU</div>
                {[
                  "Write ALL the code — dashboard, API routes, n8n workflow JSON, Docker Compose files",
                  "Design every prompt — system prompt, planning prompt, review prompt, email summary prompt",
                  "Debug errors — paste the error, I'll tell you exactly what to fix",
                  "Write documentation — setup guides, maintenance guides, troubleshooting",
                  "Design vault structure — templates, frontmatter schemas, folder organization",
                  "Build n8n workflows step-by-step — I can describe every node and connection",
                  "Explain any concept — Docker, APIs, DNS, vectors — in plain language",
                ].map((item, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: "#86efac", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span>•</span><span>{item}</span>
                  </div>
                ))}
              </div>

              {/* What YOU must understand */}
              <div style={{ padding: 12, borderRadius: 6, background: "#eab30806", border: "1px solid #eab30815", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#eab308", marginBottom: 6, letterSpacing: .5 }}>⚠️ WHAT YOU MUST UNDERSTAND YOURSELF</div>
                {[
                  "How to SSH into your VPS and navigate — nobody can do this for you when something's down at 2AM",
                  "How to read Docker Compose files — you don't need to write them, but you need to know what 'ports: 5678:5678' means",
                  "How to use the Coolify UI — deploy, restart, check logs, set environment variables",
                  "How to build basic n8n workflows — drag nodes, connect them, test them",
                  "How to read error logs — the error message tells you what's wrong, you need to understand it",
                  "How your data flows — which service talks to which, and where your files actually live",
                  "When to use which tool — is this a Coolify issue? An n8n issue? A code issue? A DNS issue?",
                ].map((item, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: "#fbbf24", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span>•</span><span>{item}</span>
                  </div>
                ))}
              </div>

              {/* What's actually hard */}
              <div style={{ padding: 12, borderRadius: 6, background: "#ef444406", border: "1px solid #ef444415", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 6, letterSpacing: .5 }}>🔴 THE ACTUALLY HARD PARTS (be ready)</div>
                {[
                  { h: "First-time VPS setup", d: "Networking, DNS propagation, firewall rules — these can eat hours if something's misconfigured. Don't panic, check Coolify logs." },
                  { h: "OAuth for Gmail/Slack", d: "Google's OAuth consent screen is confusing. You'll need to create a Google Cloud project, configure OAuth, get credentials. n8n helps but it's still a pain the first time." },
                  { h: "Sync conflicts", d: "Syncthing + n8n both writing to vault can cause conflicts. Solution: n8n only writes to specific folders, Syncthing resolves conflicts with 'newest wins'." },
                  { h: "Debugging across services", d: "When something fails, is it the dashboard? Claude API? n8n? Khoj? You need to check each service's logs. This gets easier fast but the first few times are confusing." },
                  { h: "Staying consistent", d: "The biggest risk isn't technical — it's building the system and then not using it. Start with just /plan and /log from Telegram. Use it for 7 days. Then expand." },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5" }}>{item.h}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{item.d}</div>
                  </div>
                ))}
              </div>

              {/* The real advice */}
              <div style={{
                padding: 16, borderRadius: 8,
                background: "linear-gradient(135deg, #22c55e08, #8b5cf608)",
                border: "1px solid #8b5cf620",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>🏛️</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>The Real Advice</div>
                <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
                  You don't need to understand everything before starting.
                  <span style={{ display: "block", color: "#86efac", fontWeight: 600, margin: "6px 0" }}>
                    Build Phase 0 (just Telegram + n8n + Claude). Use it for 3 days. That teaches you more than 20 hours of tutorials.
                  </span>
                  Then build Phase 1. Then Phase 2. Each phase teaches you the skills you need for the next one.
                  <span style={{ display: "block", color: "#c4b5fd", marginTop: 6 }}>
                    And whenever you're stuck — paste the error here. I'll fix it.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
