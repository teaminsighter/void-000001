import { useState, useCallback } from "react";

/* ════════ ARCHITECTURE DATA ════════ */
const LAYERS = [
  {
    id: "L1",
    num: "01",
    name: "YOU",
    subtitle: "Control Surfaces",
    color: "#22d3ee",
    desc: "Where you interact with the system. Every input starts here.",
    parts: [
      { id: "dashboard", name: "Web Dashboard", desc: "Your single URL — chat, data, controls, everything in one screen", status: "build", swappable: false, required: true },
      { id: "telegram", name: "Telegram Bot", desc: "Quick commands from phone — /plan /log /search /remind", status: "ready", swappable: "Signal, Discord, WhatsApp", required: false },
      { id: "obsidian-app", name: "Obsidian App", desc: "Desktop app for deep writing, reading, graph view", status: "ready", swappable: "Any markdown editor", required: false },
    ],
    flows_down: ["You type naturally → Agent understands → Action happens"],
  },
  {
    id: "L2",
    num: "02",
    name: "AGENT BRAIN",
    subtitle: "AI That Thinks",
    color: "#a78bfa",
    desc: "The AI model that understands your words and decides what to do. This is the MOST swappable layer.",
    parts: [
      { id: "claude", name: "Claude API", desc: "Primary AI — understands natural language, plans, writes, reasons", status: "active", swappable: "GPT-4, Gemini, Llama, Mistral, DeepSeek — ANY LLM", required: true },
      { id: "system-prompt", name: "System Prompt", desc: "Instructions loaded from 07-Agent-Memory/ in your vault. Tells AI who you are, what you want, your style", status: "active", swappable: false, required: true },
    ],
    flows_down: ["Agent decides action → Calls n8n webhook → OR → Calls Khoj search"],
    upgrade_note: "Change API key + endpoint = new brain. Takes 5 minutes. Your data, memory, workflows — ZERO changes needed.",
  },
  {
    id: "L3",
    num: "03",
    name: "ACTION ENGINE",
    subtitle: "n8n — Does Things",
    color: "#f97316",
    desc: "The automation layer. Every action in the real world goes through here. Visual drag-and-drop — no code needed.",
    parts: [
      { id: "n8n-core", name: "n8n Core", desc: "Self-hosted workflow engine — 500+ built-in integrations", status: "active", swappable: "Make.com, Zapier (but less control)", required: true },
      { id: "webhooks", name: "Webhooks", desc: "Dashboard + Telegram call these URLs to trigger any workflow", status: "active", swappable: false, required: true },
      { id: "mcp-client", name: "MCP Client", desc: "Connects to ANY MCP server — unlimited integrations", status: "active", swappable: false, required: false },
      { id: "schedulers", name: "Scheduled Bots", desc: "Morning planner, night review, weekly summary — run automatically", status: "active", swappable: false, required: false },
    ],
    flows_down: ["n8n executes → Writes files to vault → Sends messages → Calls APIs"],
    upgrade_note: "Add new integration = add new n8n node (visual, 2 min). Remove integration = delete the node. Everything else keeps working.",
  },
  {
    id: "L4",
    num: "04",
    name: "CONNECTIONS",
    subtitle: "Services & Integrations",
    color: "#38bdf8",
    desc: "Everything your agent can talk to. Each is a plug-in — add or remove without breaking anything else.",
    parts: [
      { id: "gmail", name: "Gmail", desc: "Read inbox, send emails, draft replies", status: "active", swappable: "Outlook, ProtonMail", required: false },
      { id: "telegram-api", name: "Telegram API", desc: "Send/receive messages, set reminders", status: "active", swappable: "Slack, Discord, WhatsApp", required: false },
      { id: "slack", name: "Slack", desc: "Read channels, reply to mentions, post updates", status: "active", swappable: "Discord, Teams", required: false },
      { id: "crm", name: "CRM", desc: "HubSpot/Pipedrive — leads, pipeline, contacts", status: "active", swappable: "Any CRM with API", required: false },
      { id: "whatsapp", name: "WhatsApp", desc: "Via Twilio/360dialog — messages in/out", status: "ready", swappable: false, required: false },
      { id: "calendar", name: "Google Calendar", desc: "Events, meetings, scheduling", status: "ready", swappable: "Outlook Calendar", required: false },
      { id: "notion", name: "Notion", desc: "Sync pages, databases", status: "ready", swappable: false, required: false },
      { id: "github", name: "GitHub", desc: "PR notifications, issue tracking", status: "ready", swappable: "GitLab, Bitbucket", required: false },
      { id: "gdrive", name: "Google Drive", desc: "Search, index, upload files", status: "ready", swappable: "Dropbox, OneDrive", required: false },
      { id: "mcp-500", name: "+ 500 more via MCP", desc: "Any MCP-compatible service — Jira, Linear, Stripe, Figma...", status: "ready", swappable: false, required: false },
    ],
    flows_down: ["Data flows back → n8n processes → Saves to vault → OR → Returns to agent"],
    upgrade_note: "Each connection is independent. Add Gmail today, Stripe tomorrow, remove Slack next week — nothing else changes. Plug and play.",
  },
  {
    id: "L5",
    num: "05",
    name: "MEMORY & SEARCH",
    subtitle: "Khoj — Remembers Everything",
    color: "#ec4899",
    desc: "Reads your entire vault, converts to vectors, enables semantic search. This is how the AI 'remembers' you.",
    parts: [
      { id: "khoj-indexer", name: "Vault Indexer", desc: "Reads every .md file → chunks → creates embedding vectors", status: "active", swappable: false, required: true },
      { id: "khoj-search", name: "Semantic Search", desc: "Search by meaning, not just keywords — 'what did I learn about auth?' finds Firebase notes", status: "active", swappable: false, required: true },
      { id: "khoj-chat", name: "AI Chat over Vault", desc: "Ask questions about YOUR data — Khoj reads notes before answering", status: "active", swappable: false, required: false },
      { id: "vector-db", name: "Vector Database", desc: "Embeddings stored internally. Can upgrade to Qdrant/pgvector later for scale", status: "active", swappable: "Qdrant, pgvector, Weaviate, Pinecone", required: true },
    ],
    flows_down: ["Khoj reads vault → Agent gets context → Responds with YOUR knowledge"],
    upgrade_note: "Khoj auto-indexes. Add more notes = more memory automatically. Upgrade vector DB later if vault grows past 10K notes.",
  },
  {
    id: "L6",
    num: "06",
    name: "PERMANENT STORAGE",
    subtitle: "Obsidian Vault — Source of Truth",
    color: "#22c55e",
    desc: "Plain markdown files on YOUR disk. Survives everything — AI changes, service shutdowns, 50 years from now. This is what you truly own.",
    parts: [
      { id: "daily", name: "01-Daily/", desc: "Every day's plan, logs, reflections — auto-created by n8n", status: "active", swappable: false, required: true },
      { id: "learning", name: "02-Learning/", desc: "All learning notes — created by you or by agent", status: "active", swappable: false, required: true },
      { id: "office", name: "03-Office/", desc: "Work updates, SOPs, meeting notes", status: "active", swappable: false, required: false },
      { id: "projects", name: "04-Projects/", desc: "Project docs, plans, specs", status: "active", swappable: false, required: false },
      { id: "reviews", name: "06-Reviews/", desc: "Weekly + monthly reviews — auto-generated", status: "active", swappable: false, required: true },
      { id: "agent-mem", name: "07-Agent-Memory/", desc: "THE KEY — preferences, goals, context, conversation logs. Loaded into every AI call.", status: "active", swappable: false, required: true },
      { id: "sync", name: "Vault Sync", desc: "Syncthing/Obsidian Sync — VPS ↔ Mac ↔ Windows", status: "active", swappable: "Git sync, Syncthing, Obsidian Sync, Dropbox", required: true },
    ],
    flows_down: [],
    upgrade_note: "This NEVER changes. Everything above can be swapped. This stays forever. Your files, your rules, your data.",
  },
];

const SCENARIOS = [
  {
    title: "Switch Claude → GPT-4",
    icon: "🔄",
    steps: [
      { layer: "L2", action: "Change API endpoint + key in config", time: "5 min" },
      { layer: "L3", action: "Update n8n LLM node to point to OpenAI", time: "2 min" },
    ],
    unchanged: ["L1 Dashboard", "L4 All connections", "L5 Khoj memory", "L6 Vault"],
    risk: "Zero data loss",
  },
  {
    title: "Add WhatsApp Integration",
    icon: "📱",
    steps: [
      { layer: "L3", action: "Add Twilio/WhatsApp node in n8n", time: "30 min" },
      { layer: "L4", action: "Configure WhatsApp Business API", time: "1 hour" },
      { layer: "L1", action: "WhatsApp appears in dashboard connections", time: "Auto" },
    ],
    unchanged: ["L2 AI brain", "L5 Memory", "L6 Vault", "All other connections"],
    risk: "Zero disruption",
  },
  {
    title: "Upgrade Khoj → Qdrant",
    icon: "🧠",
    steps: [
      { layer: "L5", action: "Deploy Qdrant, re-index vault", time: "2 hours" },
      { layer: "L3", action: "Update n8n search endpoint", time: "5 min" },
    ],
    unchanged: ["L1 Dashboard", "L2 AI", "L4 Connections", "L6 Vault"],
    risk: "Zero data loss — vault is source, vectors are rebuilt",
  },
  {
    title: "VPS Crashes Completely",
    icon: "💥",
    steps: [
      { layer: "L6", action: "Vault is safe on your Mac + Windows (synced)", time: "0 min" },
      { layer: "L3", action: "Redeploy n8n from Docker compose", time: "1 hour" },
      { layer: "L5", action: "Redeploy Khoj, re-index vault", time: "1 hour" },
      { layer: "L1", action: "Redeploy dashboard", time: "30 min" },
    ],
    unchanged: ["L6 All your data", "L4 API keys (in your password manager)"],
    risk: "Full recovery in 2-3 hours. Zero data loss.",
  },
  {
    title: "Remove Gmail, Add Outlook",
    icon: "📧",
    steps: [
      { layer: "L4", action: "Delete Gmail node in n8n, add Outlook node", time: "15 min" },
    ],
    unchanged: ["Everything else — literally nothing changes"],
    risk: "Zero disruption",
  },
  {
    title: "5 Years Later, New AI Exists",
    icon: "🚀",
    steps: [
      { layer: "L2", action: "Point to new AI API", time: "10 min" },
      { layer: "L5", action: "Re-embed vault with new model if needed", time: "2 hours" },
    ],
    unchanged: ["L6 Your vault — 5 years of notes, still plain markdown, still readable"],
    risk: "Your knowledge compounds. AI gets smarter. You lose nothing.",
  },
];

const FLOW_EXAMPLES = [
  {
    title: "You: 'Plan my day, 4h office'",
    steps: [
      { layer: "L1", label: "Dashboard", detail: "You type in chat" },
      { layer: "L2", label: "Claude API", detail: "Understands intent → generates plan" },
      { layer: "L5", label: "Khoj", detail: "Pulls your preferences + yesterday's plan" },
      { layer: "L2", label: "Claude API", detail: "Creates plan with YOUR context" },
      { layer: "L3", label: "n8n", detail: "Writes 01-Daily/2026-02-02.md" },
      { layer: "L6", label: "Vault", detail: "File saved permanently" },
      { layer: "L5", label: "Khoj", detail: "Auto-indexes new note" },
      { layer: "L1", label: "Dashboard", detail: "Shows plan in left panel" },
    ],
  },
  {
    title: "You: 'Check my email'",
    steps: [
      { layer: "L1", label: "Dashboard", detail: "You ask naturally" },
      { layer: "L3", label: "n8n", detail: "Calls Gmail API → fetches inbox" },
      { layer: "L4", label: "Gmail", detail: "Returns 5 recent emails" },
      { layer: "L2", label: "Claude", detail: "Summarizes: 2 important, 3 can wait" },
      { layer: "L1", label: "Dashboard", detail: "Agent tells you + mail panel updates" },
    ],
  },
  {
    title: "Weekly Auto-Review (Sunday 10PM)",
    steps: [
      { layer: "L3", label: "n8n Scheduler", detail: "Triggers automatically" },
      { layer: "L6", label: "Vault", detail: "n8n reads last 7 daily notes" },
      { layer: "L2", label: "Claude", detail: "Generates wins/issues/next plan" },
      { layer: "L3", label: "n8n", detail: "Saves to 06-Reviews/Weekly-W05.md" },
      { layer: "L6", label: "Vault", detail: "Review saved permanently" },
      { layer: "L5", label: "Khoj", detail: "Indexes review for future search" },
      { layer: "L4", label: "Telegram", detail: "Sends you summary on phone" },
    ],
  },
];

/* ════════ STYLES ════════ */
const lc = { L1: "#22d3ee", L2: "#a78bfa", L3: "#f97316", L4: "#38bdf8", L5: "#ec4899", L6: "#22c55e" };

/* ════════ COMPONENTS ════════ */
function LayerCard({ layer, isActive, onClick }) {
  const active = isActive;
  return (
    <div onClick={onClick} style={{
      padding: "14px 16px", borderRadius: 10, cursor: "pointer",
      background: active ? `${layer.color}10` : "rgba(255,255,255,0.015)",
      border: `1px solid ${active ? `${layer.color}40` : "rgba(255,255,255,0.04)"}`,
      borderLeft: `4px solid ${layer.color}`,
      transition: "all .25s", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: layer.color, fontWeight: 600 }}>{layer.num}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{layer.name}</span>
        <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>{layer.subtitle}</span>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{layer.desc}</div>
      {active && layer.flows_down.length > 0 && (
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: `${layer.color}08`, border: `1px solid ${layer.color}15` }}>
          <div style={{ fontSize: 10, color: layer.color, fontWeight: 600, marginBottom: 2 }}>↓ DATA FLOWS DOWN</div>
          {layer.flows_down.map((f, i) => <div key={i} style={{ fontSize: 11, color: "#94a3b8" }}>{f}</div>)}
        </div>
      )}
      {active && layer.upgrade_note && (
        <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
          <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginBottom: 2 }}>🔧 UPDATE / SWAP</div>
          <div style={{ fontSize: 11, color: "#86efac" }}>{layer.upgrade_note}</div>
        </div>
      )}
    </div>
  );
}

function PartRow({ part, layerColor }) {
  const statusColors = { active: "#22c55e", ready: "#f59e0b", build: "#38bdf8" };
  const statusLabels = { active: "Connected", ready: "Ready to add", build: "To build" };
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8, marginBottom: 4,
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
      animation: "fadeIn .3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[part.status], boxShadow: `0 0 6px ${statusColors[part.status]}40` }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{part.name}</span>
          {part.required && <span style={{ fontSize: 8, background: `${layerColor}20`, color: layerColor, padding: "1px 5px", borderRadius: 6, fontWeight: 600 }}>REQUIRED</span>}
        </div>
        <span style={{ fontSize: 9.5, color: statusColors[part.status], background: `${statusColors[part.status]}12`, padding: "1px 7px", borderRadius: 8 }}>
          {statusLabels[part.status]}
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.4 }}>{part.desc}</div>
      {part.swappable && part.swappable !== false && (
        <div style={{ marginTop: 4, fontSize: 10, color: "#64748b" }}>
          🔄 Can swap with: <span style={{ color: "#a78bfa" }}>{part.swappable}</span>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario, isOpen, onClick }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div onClick={onClick} style={{
        padding: "10px 14px", borderRadius: isOpen ? "8px 8px 0 0" : 8, cursor: "pointer",
        background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{scenario.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{scenario.title}</span>
        </div>
        <span style={{ fontSize: 12, color: "#475569", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
      </div>
      {isOpen && (
        <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
          <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600, marginBottom: 6, letterSpacing: .8 }}>STEPS:</div>
          {scenario.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, paddingLeft: 4 }}>
              <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", color: lc[s.layer], background: `${lc[s.layer]}15`, padding: "1px 6px", borderRadius: 4, minWidth: 20 }}>{s.layer.replace("L","")}</span>
              <span style={{ fontSize: 12, color: "#cbd5e1", flex: 1 }}>{s.action}</span>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono',monospace" }}>{s.time}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: "#22c55e", fontWeight: 600, letterSpacing: .8 }}>UNCHANGED:</div>
          <div style={{ fontSize: 11, color: "#86efac", marginTop: 2 }}>{scenario.unchanged.join(" · ")}</div>
          <div style={{ marginTop: 6, padding: "4px 8px", background: "rgba(34,197,94,0.08)", borderRadius: 4, fontSize: 11, color: "#4ade80", fontWeight: 500 }}>
            Risk: {scenario.risk}
          </div>
        </div>
      )}
    </div>
  );
}

function FlowDiagram({ flow }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{flow.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {flow.steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: lc[s.layer], boxShadow: `0 0 6px ${lc[s.layer]}40` }} />
              {i < flow.steps.length - 1 && <div style={{ width: 1, height: 14, background: `${lc[s.layer]}30` }} />}
            </div>
            <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", color: lc[s.layer], minWidth: 55, fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{s.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ MAIN ════════ */
export default function LifeOSArchitecture() {
  const [activeLayer, setActiveLayer] = useState("L1");
  const [view, setView] = useState("layers");
  const [openScenario, setOpenScenario] = useState(0);

  const currentLayer = LAYERS.find(l => l.id === activeLayer);

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#060609",
      fontFamily: "'IBM Plex Sans','Segoe UI',system-ui,sans-serif",
      color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:10px}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "18px 28px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6d28d9,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc", letterSpacing: -.3 }}>LifeOS Architecture Blueprint</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>6 layers · Every connection · Full control over every part</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "layers", label: "📐 Layers & Parts" },
            { id: "flows", label: "🔀 Data Flows" },
            { id: "scenarios", label: "🔧 What-If Scenarios" },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: view === v.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
              color: view === v.id ? "#c4b5fd" : "#64748b",
              fontSize: 12, fontWeight: 500, transition: "all .2s",
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* LAYER LEGEND BAR */}
      <div style={{ padding: "10px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {LAYERS.map(l => (
          <button key={l.id} onClick={() => { setActiveLayer(l.id); setView("layers"); }} style={{
            padding: "4px 12px", borderRadius: 16, border: `1px solid ${activeLayer === l.id ? `${l.color}50` : "rgba(255,255,255,0.06)"}`,
            background: activeLayer === l.id ? `${l.color}12` : "transparent",
            color: activeLayer === l.id ? l.color : "#64748b",
            fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all .2s",
            fontFamily: "'IBM Plex Sans',sans-serif", display: "flex", alignItems: "center", gap: 5,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
            {l.num} {l.name}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", height: "calc(100vh - 108px)" }}>

        {/* LEFT — Layer Stack */}
        <div style={{ width: 400, minWidth: 400, borderRight: "1px solid rgba(255,255,255,0.05)", overflow: "auto", padding: 16 }}>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" }}>
            System Layers (click to explore)
          </div>

          {/* Visual stack */}
          {LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <LayerCard
                layer={layer}
                isActive={activeLayer === layer.id}
                onClick={() => setActiveLayer(layer.id)}
              />
              {i < LAYERS.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 1, height: 8, background: `linear-gradient(${layer.color}, ${LAYERS[i + 1].color})` }} />
                    <div style={{ fontSize: 8, color: "#334155" }}>▼</div>
                    <div style={{ width: 1, height: 4, background: `${LAYERS[i + 1].color}40` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT — Detail Panel */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }} key={`${view}-${activeLayer}`}>

          {view === "layers" && currentLayer && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${currentLayer.color}18`, border: `2px solid ${currentLayer.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: currentLayer.color, fontSize: 15 }}>
                  {currentLayer.num}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Layer {currentLayer.num}: {currentLayer.name}</div>
                  <div style={{ fontSize: 13, color: currentLayer.color }}>{currentLayer.subtitle}</div>
                </div>
              </div>

              <div style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20, maxWidth: 600 }}>
                {currentLayer.desc}
              </div>

              <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" }}>
                Parts in this layer ({currentLayer.parts.length})
              </div>

              <div style={{ display: "grid", gridTemplateColumns: currentLayer.parts.length > 5 ? "1fr 1fr" : "1fr", gap: 6 }}>
                {currentLayer.parts.map(p => <PartRow key={p.id} part={p} layerColor={currentLayer.color} />)}
              </div>

              {currentLayer.upgrade_note && (
                <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", marginBottom: 4, letterSpacing: .5 }}>🔧 HOW TO UPDATE THIS LAYER</div>
                  <div style={{ fontSize: 13, color: "#86efac", lineHeight: 1.5 }}>{currentLayer.upgrade_note}</div>
                </div>
              )}

              {/* Connection map for this layer */}
              <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 8, letterSpacing: .5 }}>CONNECTS TO</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {LAYERS.filter(l => l.id !== currentLayer.id).map(l => {
                    const layerIdx = LAYERS.findIndex(la => la.id === currentLayer.id);
                    const otherIdx = LAYERS.findIndex(la => la.id === l.id);
                    const direction = otherIdx > layerIdx ? "↓ sends to" : "↑ receives from";
                    return (
                      <div key={l.id} onClick={() => setActiveLayer(l.id)} style={{
                        padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                        background: `${l.color}08`, border: `1px solid ${l.color}20`,
                        fontSize: 11, color: l.color, transition: "all .2s",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{ fontSize: 9, color: "#64748b" }}>{direction}</span>
                        <span style={{ fontWeight: 600 }}>{l.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === "flows" && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Data Flow Examples</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>See exactly how data moves through every layer for real actions</div>
              {FLOW_EXAMPLES.map((flow, i) => (
                <div key={i} style={{
                  padding: 16, borderRadius: 10, marginBottom: 12,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <FlowDiagram flow={flow} />
                </div>
              ))}

              {/* Key Principle */}
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)", marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginBottom: 6 }}>🔑 The Key Principle</div>
                <div style={{ fontSize: 13, color: "#86efac", lineHeight: 1.6 }}>
                  Data always flows DOWN to the vault (Layer 06) and gets INDEXED by Khoj (Layer 05).
                  The AI brain (Layer 02) always reads FROM the vault before responding.
                  This means: <b style={{ color: "#f0fdf4" }}>change the brain, keep the memory. Change the tools, keep the data. Everything is permanent because the vault is permanent.</b>
                </div>
              </div>
            </div>
          )}

          {view === "scenarios" && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>What-If Scenarios</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>What happens when you need to change, upgrade, or fix any part?</div>

              {SCENARIOS.map((s, i) => (
                <ScenarioCard
                  key={i}
                  scenario={s}
                  isOpen={openScenario === i}
                  onClick={() => setOpenScenario(openScenario === i ? -1 : i)}
                />
              ))}

              {/* Control principle */}
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>🎛️ Your Control Rules</div>
                {[
                  "Every layer is independent — change one, others keep working",
                  "AI brain (Layer 02) is the MOST swappable — 5 minute change, zero data loss",
                  "Connections (Layer 04) are plug-and-play — add Gmail today, Stripe tomorrow",
                  "Vault (Layer 06) NEVER changes — this is your permanent foundation",
                  "Khoj (Layer 05) rebuilds from vault — even if vectors are lost, vault regenerates them",
                  "n8n (Layer 03) is visual — drag-drop to add/remove/modify any automation",
                  "Dashboard (Layer 01) is just a frontend — redesign anytime, zero backend changes",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                    <span style={{ color: "#22c55e", fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.5 }}>{rule}</span>
                  </div>
                ))}
              </div>

              {/* The golden rule */}
              <div style={{
                marginTop: 16, padding: 20, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(109,40,217,0.08))",
                border: "1px solid rgba(34,197,94,0.2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>🏛️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>The Golden Rule</div>
                <div style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
                  AI models come and go. APIs change. Services shut down.<br />
                  <b style={{ color: "#22c55e" }}>Your markdown files in the vault are forever.</b><br />
                  Everything else in this system exists to <i>serve</i> the vault.<br />
                  The vault serves <i>you</i>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
