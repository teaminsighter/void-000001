import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════
   Void Dashboard — Full Wireframe
   Design: Warm dark editorial / refined
   Font: DM Sans (display) + JetBrains Mono (code/data)
   Palette: Charcoal #0c0d10 / Warm surfaces / Amber accent
   ══════════════════════════════════════ */

const PAGES = [
  { id: "home", icon: "⌂", label: "Home" },
  { id: "chat", icon: "◉", label: "Agent" },
  { id: "plan", icon: "▦", label: "Planner" },
  { id: "vault", icon: "◈", label: "Vault" },
  { id: "mail", icon: "✉", label: "Mail" },
  { id: "research", icon: "◎", label: "Research" },
  { id: "saved", icon: "◆", label: "Saved" },
  { id: "bots", icon: "⚡", label: "Bots" },
];

// Simulated data
const TODAY = "Sunday, Feb 2 2026";
const GREETING = "Good evening, boss.";
const TASKS = [
  { t: "Review Q1 marketing strategy doc", tag: "Office", done: false, pri: "high" },
  { t: "Push Void dashboard to GitHub", tag: "Project", done: false, pri: "high" },
  { t: "Reply to Farhan's partnership email", tag: "Office", done: false, pri: "med" },
  { t: "Read Chapter 4 — Embeddings & Vectors", tag: "Learning", done: true, pri: "med" },
  { t: "Schedule dentist appointment", tag: "Personal", done: false, pri: "low" },
  { t: "Update CRM pipeline for Nexus deal", tag: "Office", done: false, pri: "med" },
];
const EMAILS = [
  { from: "Farhan Ahmed", sub: "RE: Partnership proposal — revised terms", time: "2h ago", urgent: true, read: false },
  { from: "Google Cloud", sub: "Your Firebase billing summary - January", time: "4h ago", urgent: false, read: false },
  { from: "Notion Team", sub: "What's new in Notion — February update", time: "6h ago", urgent: false, read: true },
  { from: "Arif Rahman", sub: "Meeting notes from Friday sync", time: "8h ago", urgent: false, read: false },
  { from: "AWS", sub: "Your January invoice is ready", time: "1d ago", urgent: false, read: true },
];
const VAULT_FILES = [
  { name: "2026-02-02.md", folder: "01-Daily", mod: "Today 6:30 PM", size: "2.1 KB" },
  { name: "2026-02-01.md", folder: "01-Daily", mod: "Yesterday", size: "3.4 KB" },
  { name: "embeddings-vectors.md", folder: "02-Learning", mod: "Yesterday", size: "5.2 KB" },
  { name: "q1-marketing-plan.md", folder: "03-Office", mod: "Jan 30", size: "8.7 KB" },
  { name: "void-os-architecture.md", folder: "04-Projects", mod: "Today 3:00 PM", size: "12.1 KB" },
  { name: "nexus-deal-notes.md", folder: "03-Office", mod: "Jan 28", size: "1.8 KB" },
  { name: "preferences.md", folder: "07-Agent-Memory", mod: "Jan 25", size: "0.9 KB" },
  { name: "goals-2026.md", folder: "07-Agent-Memory", mod: "Jan 20", size: "1.2 KB" },
];
const SAVED_ITEMS = [
  { title: "How vector databases actually work", type: "Article", src: "blog.pinecone.io", date: "Feb 1" },
  { title: "n8n webhook patterns for production", type: "Tutorial", src: "n8n.io", date: "Jan 30" },
  { title: "React Server Components explained", type: "Video", src: "YouTube", date: "Jan 28" },
  { title: "Prompt engineering for structured output", type: "Article", src: "docs.anthropic.com", date: "Jan 25" },
  { title: "Docker Compose best practices 2026", type: "Guide", src: "docs.docker.com", date: "Jan 22" },
];
const BOTS = [
  { name: "Morning Briefing", schedule: "Daily 8:00 AM", last: "Today 8:00 AM", status: "ok", type: "cron" },
  { name: "Night Capture", schedule: "Daily 9:00 PM", last: "Yesterday 9:00 PM", status: "ok", type: "cron" },
  { name: "Weekly Review", schedule: "Sunday 10:00 PM", last: "Last Sunday", status: "ok", type: "cron" },
  { name: "Health Monitor", schedule: "Every 15 min", last: "2 min ago", status: "ok", type: "cron" },
  { name: "Khoj Re-indexer", schedule: "Every 6 hours", last: "3h ago", status: "ok", type: "cron" },
  { name: "Email Manager", schedule: "On demand", last: "Today 5:12 PM", status: "ok", type: "webhook" },
  { name: "Quick Log", schedule: "On demand", last: "Today 6:30 PM", status: "ok", type: "webhook" },
  { name: "Daily Plan Creator", schedule: "On demand + 8AM", last: "Today 8:00 AM", status: "ok", type: "both" },
  { name: "CRM Query", schedule: "On demand", last: "Jan 31", status: "warn", type: "webhook" },
  { name: "Reminder Scheduler", schedule: "On demand", last: "Today 3:45 PM", status: "ok", type: "webhook" },
];
const CHAT_MSGS = [
  { role: "user", text: "Plan my tomorrow — I have 4 hours in office and a meeting at 2pm with Farhan about the partnership deal" },
  { role: "ai", text: "Here's your Monday plan based on your preferences and current priorities:\n\n🗓️ Monday, Feb 3\n\n08:00 — Morning briefing (auto-sent to Telegram)\n09:00 — Deep work: Finish Q1 marketing strategy review\n10:30 — Reply to Farhan's email with updated terms\n11:00 — Push Void dashboard code to GitHub\n12:00 — Lunch break\n13:00 — Prep meeting notes for Farhan partnership\n14:00 — 🔴 Meeting with Farhan — partnership deal\n15:00 — Update CRM pipeline based on meeting outcome\n15:30 — Schedule dentist + personal errands\n16:00 — Learning: Chapter 5 — Attention mechanisms\n\nI've prioritized the Farhan-related tasks before the 2PM meeting. Want me to save this to your vault and set Telegram reminders?" },
  { role: "user", text: "Yes, save it and remind me at 1:30pm to prep for the meeting" },
  { role: "ai", text: "Done ✓\n\n• Saved to vault → 01-Daily/2026-02-03.md\n• Reminder set → Telegram at 1:30 PM: \"Prep meeting notes for Farhan partnership\"\n• Morning briefing will include this plan at 8:00 AM tomorrow" },
];
const CRM_DEALS = [
  { name: "Nexus Corp — Enterprise License", stage: "Negotiation", value: "$24,000", prob: "70%", owner: "You" },
  { name: "BlueStar — Consulting Package", stage: "Proposal", value: "$8,500", prob: "50%", owner: "You" },
  { name: "Meridian Inc — Annual Retainer", stage: "Closed Won", value: "$36,000", prob: "100%", owner: "You" },
];

const tagColors = {
  Office: { bg: "#2563eb15", c: "#60a5fa" },
  Project: { bg: "#8b5cf615", c: "#a78bfa" },
  Learning: { bg: "#10b98115", c: "#34d399" },
  Personal: { bg: "#f59e0b15", c: "#fbbf24" },
};
const priDot = { high: "#ef4444", med: "#eab308", low: "#475569" };

export default function VoidDashboard() {
  const [page, setPage] = useState("home");
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [msgs, setMsgs] = useState(CHAT_MSGS);
  const [taskList, setTaskList] = useState(TASKS);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const chatEnd = useRef(null);
  const cmdRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleTask = (i) => setTaskList(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    setMsgs(prev => [...prev, { role: "user", text: chatInput }]);
    const input = chatInput;
    setChatInput("");
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        role: "ai",
        text: `Processing: "${input.slice(0, 50)}..."\n\nI've analyzed your request against your vault context and current priorities. Here's what I'll do:\n\n1. Search vault for related context via Khoj\n2. Execute the appropriate n8n workflow\n3. Save results to your vault\n4. Confirm completion\n\n✓ Action queued. You'll see updates in real-time.`
      }]);
    }, 1200);
  };

  const sw = sideCollapsed ? 56 : 200;

  /* ═══ STYLES ═══ */
  const S = {
    root: { width: "100%", height: "100vh", display: "flex", background: "#0c0d10", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#d4d4d8", overflow: "hidden", fontSize: 13 },
    side: { width: sw, minWidth: sw, height: "100%", borderRight: "1px solid #1a1b20", display: "flex", flexDirection: "column", transition: "width .2s ease, min-width .2s ease", background: "#0a0b0e", overflow: "hidden" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: { height: 48, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid #1a1b20", gap: 10 },
    content: { flex: 1, overflow: "auto", padding: 0 },
  };

  const Pill = ({ children, active, color }) => (
    <span style={{
      fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 500,
      background: active ? `${color || "#f59e0b"}18` : "#ffffff06",
      color: active ? (color || "#fbbf24") : "#64748b",
      letterSpacing: .2,
    }}>{children}</span>
  );

  const StatCard = ({ label, value, sub, accent }) => (
    <div style={{ padding: "14px 16px", borderRadius: 8, background: "#111218", border: "1px solid #1a1b20", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 10, color: "#52525b", fontWeight: 500, letterSpacing: .6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || "#f5f5f5", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  /* ═══ PAGES ═══ */
  const renderPage = () => {
    switch (page) {
      /* ═══ HOME ═══ */
      case "home": return (
        <div style={{ padding: 24, maxWidth: 1100 }}>
          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#52525b", fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{TODAY}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fafafa", marginTop: 4 }}>{GREETING}</div>
            <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>3 urgent tasks · 2 unread emails · Weekly review tonight at 10 PM</div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { icon: "▦", label: "Plan my day", color: "#f59e0b" },
              { icon: "✎", label: "Quick log", color: "#60a5fa" },
              { icon: "◎", label: "Search vault", color: "#34d399" },
              { icon: "✉", label: "Check email", color: "#f472b6" },
              { icon: "⏰", label: "Set reminder", color: "#a78bfa" },
              { icon: "◉", label: "Ask agent", color: "#fb923c" },
            ].map((a, i) => (
              <button key={i} onClick={() => a.label === "Ask agent" ? setPage("chat") : a.label === "Plan my day" ? setPage("plan") : a.label === "Check email" ? setPage("mail") : a.label === "Search vault" ? setPage("vault") : null} style={{
                padding: "10px 16px", borderRadius: 8, border: `1px solid ${a.color}18`, background: `${a.color}08`,
                color: a.color, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
              }}
                onMouseEnter={e => { e.target.style.background = `${a.color}15`; e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.background = `${a.color}08`; e.target.style.transform = "translateY(0)"; }}
              >
                <span style={{ fontSize: 14 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Tasks Today" value={`${taskList.filter(t => t.done).length}/${taskList.length}`} sub="2 high priority remaining" accent="#f59e0b" />
            <StatCard label="Unread Emails" value={EMAILS.filter(e => !e.read).length} sub="1 urgent from Farhan" accent="#ef4444" />
            <StatCard label="Vault Notes" value="247" sub="+3 today" accent="#34d399" />
            <StatCard label="Week Streak" value="12d" sub="Longest: 18 days" accent="#a78bfa" />
          </div>

          {/* Two column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Today's Tasks */}
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1b20", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>Today's Tasks</span>
                <span style={{ fontSize: 10, color: "#52525b", cursor: "pointer" }} onClick={() => setPage("plan")}>View all →</span>
              </div>
              <div style={{ padding: 8 }}>
                {taskList.slice(0, 5).map((t, i) => (
                  <div key={i} onClick={() => toggleTask(i)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6,
                    cursor: "pointer", transition: "background .1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ width: 15, height: 15, borderRadius: 4, border: t.done ? "none" : `1.5px solid ${priDot[t.pri]}`, background: t.done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0 }}>{t.done ? "✓" : ""}</span>
                    <span style={{ flex: 1, fontSize: 12, color: t.done ? "#52525b" : "#d4d4d8", textDecoration: t.done ? "line-through" : "none" }}>{t.t}</span>
                    <span style={{ ...tagColors[t.tag] ? { background: tagColors[t.tag].bg, color: tagColors[t.tag].c } : {}, fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 500 }}>{t.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent emails */}
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1b20", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>Inbox</span>
                <span style={{ fontSize: 10, color: "#52525b", cursor: "pointer" }} onClick={() => setPage("mail")}>Open mail →</span>
              </div>
              <div style={{ padding: 8 }}>
                {EMAILS.slice(0, 4).map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6 }}
                    onMouseEnter={ev => ev.currentTarget.style.background = "#ffffff04"}
                    onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.urgent ? "#ef4444" : e.read ? "transparent" : "#3b82f6", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: e.read ? 400 : 600, color: e.read ? "#52525b" : "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.from}</div>
                      <div style={{ fontSize: 10.5, color: "#52525b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.sub}</div>
                    </div>
                    <span style={{ fontSize: 9.5, color: "#3f3f46", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{e.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent vault activity */}
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1b20", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>Recent Notes</span>
                <span style={{ fontSize: 10, color: "#52525b", cursor: "pointer" }} onClick={() => setPage("vault")}>Browse vault →</span>
              </div>
              <div style={{ padding: 8 }}>
                {VAULT_FILES.slice(0, 4).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6 }}
                    onMouseEnter={ev => ev.currentTarget.style.background = "#ffffff04"}
                    onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 13, color: "#52525b" }}>◇</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: "#d4d4d8" }}>{f.name}</div>
                      <div style={{ fontSize: 9.5, color: "#3f3f46" }}>{f.folder}</div>
                    </div>
                    <span style={{ fontSize: 9.5, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{f.mod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CRM mini */}
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1b20", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>Pipeline</span>
                <span style={{ fontSize: 10, color: "#52525b" }}>3 deals active</span>
              </div>
              <div style={{ padding: 8 }}>
                {CRM_DEALS.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.prob === "100%" ? "#22c55e" : d.prob === "70%" ? "#eab308" : "#3b82f6", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: "#d4d4d8" }}>{d.name}</div>
                      <div style={{ fontSize: 9.5, color: "#52525b" }}>{d.stage} · {d.prob}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa", fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      /* ═══ AGENT CHAT ═══ */
      case "chat": return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "70%", padding: "10px 14px", borderRadius: 10,
                  background: m.role === "user" ? "#f59e0b15" : "#111218",
                  border: `1px solid ${m.role === "user" ? "#f59e0b25" : "#1a1b20"}`,
                }}>
                  <div style={{ fontSize: 9, color: m.role === "user" ? "#f59e0b" : "#52525b", fontWeight: 600, marginBottom: 4, letterSpacing: .5, fontFamily: "'JetBrains Mono', monospace" }}>
                    {m.role === "user" ? "YOU" : "AGENT"}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#d4d4d8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #1a1b20", background: "#0a0b0e" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {["Plan my day", "Check email", "Search vault", "Log something", "Set reminder", "CRM update"].map((q, i) => (
                <button key={i} onClick={() => { setChatInput(q); }} style={{
                  padding: "4px 10px", borderRadius: 5, border: "1px solid #1a1b20", background: "#111218",
                  color: "#71717a", fontSize: 10.5, cursor: "pointer", fontFamily: "inherit",
                }}>{q}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
                placeholder="Tell your agent what to do..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #1a1b20", background: "#111218",
                  color: "#fafafa", fontSize: 13, fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={sendMsg} style={{
                padding: "10px 20px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#0c0d10",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>Send</button>
            </div>
          </div>
        </div>
      );

      /* ═══ PLANNER ═══ */
      case "plan": return (
        <div style={{ padding: 24, maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Daily Planner</div>
              <div style={{ fontSize: 11, color: "#52525b" }}>{TODAY} · {taskList.filter(t => t.done).length}/{taskList.length} complete</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #f59e0b30", background: "#f59e0b10", color: "#f59e0b", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add task</button>
              <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1a1b20", background: "#111218", color: "#71717a", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>AI Plan ◉</button>
            </div>
          </div>

          {/* Time blocks */}
          <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1b20" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fafafa" }}>Schedule</span>
            </div>
            {[
              { time: "08:00", block: "Morning briefing (auto)", type: "bot" },
              { time: "09:00", block: "Deep work — Q1 marketing strategy", type: "work" },
              { time: "10:30", block: "Reply to Farhan's email", type: "work" },
              { time: "11:00", block: "Push Void dashboard to GitHub", type: "project" },
              { time: "12:00", block: "Lunch break", type: "break" },
              { time: "13:00", block: "Prep Farhan meeting notes", type: "work" },
              { time: "14:00", block: "🔴 Meeting — Farhan partnership", type: "meeting" },
              { time: "15:00", block: "Update CRM pipeline", type: "work" },
              { time: "16:00", block: "Learning — Attention mechanisms", type: "learn" },
            ].map((b, i) => {
              const colors = { work: "#60a5fa", project: "#a78bfa", meeting: "#ef4444", learn: "#34d399", break: "#52525b", bot: "#f59e0b" };
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid #ffffff04" }}>
                  <span style={{ fontSize: 11, color: "#52525b", fontFamily: "'JetBrains Mono', monospace", minWidth: 40 }}>{b.time}</span>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: colors[b.type] || "#52525b" }} />
                  <span style={{ fontSize: 12, color: b.type === "break" ? "#52525b" : "#d4d4d8" }}>{b.block}</span>
                </div>
              );
            })}
          </div>

          {/* Task list */}
          <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1b20", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fafafa" }}>All Tasks</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["All", "Office", "Project", "Personal", "Learning"].map(f => (
                  <Pill key={f} active={f === "All"}>{f}</Pill>
                ))}
              </div>
            </div>
            {taskList.map((t, i) => (
              <div key={i} onClick={() => toggleTask(i)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
                borderBottom: "1px solid #ffffff04", cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ width: 16, height: 16, borderRadius: 4, border: t.done ? "none" : `1.5px solid ${priDot[t.pri]}`, background: t.done ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0 }}>{t.done ? "✓" : ""}</span>
                <span style={{ flex: 1, fontSize: 12.5, color: t.done ? "#3f3f46" : "#d4d4d8", textDecoration: t.done ? "line-through" : "none" }}>{t.t}</span>
                <span style={{ ...tagColors[t.tag] ? { background: tagColors[t.tag].bg, color: tagColors[t.tag].c } : {}, fontSize: 9.5, padding: "2px 7px", borderRadius: 3, fontWeight: 500 }}>{t.tag}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: priDot[t.pri] }} />
              </div>
            ))}
          </div>
        </div>
      );

      /* ═══ VAULT ═══ */
      case "vault": return (
        <div style={{ padding: 24, maxWidth: 1000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Vault</div>
              <div style={{ fontSize: 11, color: "#52525b" }}>247 notes · 9 folders · Last indexed 42 min ago by Khoj</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Semantic search..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #1a1b20", background: "#111218", color: "#d4d4d8", fontSize: 11, width: 200, fontFamily: "inherit", outline: "none" }} />
              <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1a1b20", background: "#111218", color: "#71717a", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>+ New note</button>
            </div>
          </div>

          {/* Folder browser */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {["All", "00-Inbox", "01-Daily", "02-Learning", "03-Office", "04-Projects", "05-References", "06-Reviews", "07-Agent-Memory"].map((f, i) => (
              <Pill key={f} active={i === 0} color="#34d399">{f}</Pill>
            ))}
          </div>

          {/* File list */}
          <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 60px", padding: "8px 16px", borderBottom: "1px solid #1a1b20" }}>
              {["Name", "Folder", "Modified", "Size"].map(h => (
                <span key={h} style={{ fontSize: 9.5, color: "#3f3f46", fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>
            {VAULT_FILES.map((f, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 60px", padding: "9px 16px", borderBottom: "1px solid #ffffff04", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 12, color: "#d4d4d8", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#52525b" }}>◇</span>{f.name}
                </span>
                <span style={{ fontSize: 11, color: "#52525b" }}>{f.folder}</span>
                <span style={{ fontSize: 10.5, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{f.mod}</span>
                <span style={{ fontSize: 10.5, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{f.size}</span>
              </div>
            ))}
          </div>
        </div>
      );

      /* ═══ MAIL ═══ */
      case "mail": return (
        <div style={{ padding: 24, maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Mail</div>
              <div style={{ fontSize: 11, color: "#52525b" }}>{EMAILS.filter(e => !e.read).length} unread · {EMAILS.filter(e => e.urgent).length} urgent · via Gmail API</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #60a5fa30", background: "#60a5fa10", color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Compose</button>
              <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1a1b20", background: "#111218", color: "#71717a", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>AI Summarize ◉</button>
            </div>
          </div>
          <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
            {EMAILS.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #ffffff04", cursor: "pointer" }}
                onMouseEnter={ev => ev.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.urgent ? "#ef4444" : e.read ? "transparent" : "#3b82f6", flexShrink: 0, border: !e.urgent && e.read ? "1px solid #27272a" : "none" }} />
                <div style={{ width: 140, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: e.read ? 400 : 600, color: e.read ? "#52525b" : "#fafafa" }}>{e.from}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: e.read ? "#3f3f46" : "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.sub}</div>
                </div>
                {e.urgent && <span style={{ fontSize: 8.5, padding: "1px 6px", borderRadius: 3, background: "#ef444418", color: "#ef4444", fontWeight: 600 }}>URGENT</span>}
                <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace", minWidth: 50, textAlign: "right" }}>{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      );

      /* ═══ RESEARCH ═══ */
      case "research": return (
        <div style={{ padding: 24, maxWidth: 900 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Research</div>
            <div style={{ fontSize: 11, color: "#52525b" }}>Deep search across vault + web · powered by Khoj + SearXNG</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input placeholder="What do you want to research?" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #1a1b20", background: "#111218", color: "#d4d4d8", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#34d399", color: "#0c0d10", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Research</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", padding: 16 }}>
              <div style={{ fontSize: 11, color: "#34d399", fontWeight: 600, marginBottom: 8, letterSpacing: .5 }}>FROM YOUR VAULT</div>
              <div style={{ fontSize: 12, color: "#52525b", fontStyle: "italic" }}>Search results from your personal notes will appear here. Khoj uses vector similarity to find semantically related content.</div>
            </div>
            <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", padding: 16 }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600, marginBottom: 8, letterSpacing: .5 }}>FROM THE WEB</div>
              <div style={{ fontSize: 12, color: "#52525b", fontStyle: "italic" }}>Web search results via SearXNG (private, no tracking). Agent can combine web + vault context for comprehensive answers.</div>
            </div>
          </div>
          <div style={{ marginTop: 20, background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", padding: 16 }}>
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 8, letterSpacing: .5 }}>RECENT RESEARCH</div>
            {[
              { q: "How do transformer attention heads learn different patterns?", notes: 3, web: 5, date: "Yesterday" },
              { q: "n8n webhook authentication best practices", notes: 1, web: 4, date: "Jan 30" },
              { q: "Vector database comparison pgvector vs Qdrant", notes: 2, web: 6, date: "Jan 28" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < 2 ? "1px solid #ffffff04" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#d4d4d8" }}>{r.q}</div>
                  <div style={{ fontSize: 10, color: "#3f3f46" }}>{r.notes} vault matches · {r.web} web results</div>
                </div>
                <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      );

      /* ═══ SAVED ═══ */
      case "saved": return (
        <div style={{ padding: 24, maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Saved Items</div>
              <div style={{ fontSize: 11, color: "#52525b" }}>Bookmarks, clippings, references · stored in vault 05-References/</div>
            </div>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #a78bfa30", background: "#a78bfa10", color: "#a78bfa", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Save URL</button>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {["All", "Articles", "Tutorials", "Videos", "Guides"].map((f, i) => (
              <Pill key={f} active={i === 0} color="#a78bfa">{f}</Pill>
            ))}
          </div>
          <div style={{ background: "#111218", borderRadius: 10, border: "1px solid #1a1b20", overflow: "hidden" }}>
            {SAVED_ITEMS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #ffffff04", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14, color: "#52525b" }}>◆</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "#d4d4d8", fontWeight: 500 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#3f3f46" }}>{s.src}</div>
                </div>
                <Pill active color="#a78bfa">{s.type}</Pill>
                <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{s.date}</span>
              </div>
            ))}
          </div>
        </div>
      );

      /* ═══ BOTS ═══ */
      case "bots": return (
        <div style={{ padding: 24, maxWidth: 1000 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fafafa" }}>Automation Bots</div>
            <div style={{ fontSize: 11, color: "#52525b" }}>{BOTS.length} workflows · {BOTS.filter(b => b.status === "ok").length} healthy · powered by n8n</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BOTS.map((b, i) => (
              <div key={i} style={{ background: "#111218", borderRadius: 8, border: "1px solid #1a1b20", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 7,
                  background: b.status === "ok" ? "#22c55e10" : "#eab30810",
                  border: `1px solid ${b.status === "ok" ? "#22c55e20" : "#eab30820"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: b.status === "ok" ? "#22c55e" : "#eab308",
                }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: "#52525b" }}>{b.schedule}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: b.status === "ok" ? "#22c55e" : "#eab308", fontWeight: 600, letterSpacing: .5 }}>{b.status === "ok" ? "HEALTHY" : "WARNING"}</div>
                  <div style={{ fontSize: 9.5, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>{b.last}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ffffff08;border-radius:8px}
        ::placeholder{color:#3f3f46}
      `}</style>

      {/* ═══ Command palette overlay ═══ */}
      {cmdOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120, backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setCmdOpen(false)}>
          <div ref={cmdRef} style={{ width: 500, background: "#111218", border: "1px solid #1a1b20", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px #00000060", animation: "fi .15s ease" }}>
            <input autoFocus placeholder="Search everything... (pages, notes, commands)" style={{ width: "100%", padding: "14px 18px", border: "none", borderBottom: "1px solid #1a1b20", background: "transparent", color: "#fafafa", fontSize: 14, fontFamily: "inherit", outline: "none" }}
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <div style={{ padding: 8, maxHeight: 300, overflow: "auto" }}>
              {PAGES.filter(p => p.label.toLowerCase().includes(searchQ.toLowerCase()) || searchQ === "").map(p => (
                <div key={p.id} onClick={() => { setPage(p.id); setCmdOpen(false); setSearchQ(""); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14, color: "#52525b", width: 24, textAlign: "center" }}>{p.icon}</span>
                  <span style={{ fontSize: 13, color: "#d4d4d8" }}>{p.label}</span>
                </div>
              ))}
              {searchQ && VAULT_FILES.filter(f => f.name.toLowerCase().includes(searchQ.toLowerCase())).map((f, i) => (
                <div key={`v-${i}`} onClick={() => { setPage("vault"); setCmdOpen(false); setSearchQ(""); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14, color: "#52525b", width: 24, textAlign: "center" }}>◇</span>
                  <span style={{ fontSize: 13, color: "#d4d4d8" }}>{f.name}</span>
                  <span style={{ fontSize: 10, color: "#3f3f46", marginLeft: "auto" }}>{f.folder}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <div style={S.side}>
        {/* Logo */}
        <div style={{ padding: sideCollapsed ? "14px 0" : "14px 14px", display: "flex", alignItems: "center", gap: 10, justifyContent: sideCollapsed ? "center" : "flex-start", borderBottom: "1px solid #1a1b20", cursor: "pointer" }} onClick={() => setSideCollapsed(v => !v)}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>V</div>
          {!sideCollapsed && <span style={{ fontSize: 14, fontWeight: 700, color: "#fafafa", letterSpacing: -.3 }}>Void</span>}
        </div>

        {/* Nav items */}
        <div style={{ padding: "8px 6px", flex: 1, overflow: "auto" }}>
          {PAGES.map(p => (
            <div key={p.id} onClick={() => setPage(p.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: sideCollapsed ? "9px 0" : "9px 10px",
              justifyContent: sideCollapsed ? "center" : "flex-start",
              borderRadius: 6, cursor: "pointer", marginBottom: 1,
              background: page === p.id ? "#f59e0b0c" : "transparent",
              transition: "background .1s",
            }}
              onMouseEnter={e => { if (page !== p.id) e.currentTarget.style.background = "#ffffff06"; }}
              onMouseLeave={e => { if (page !== p.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                fontSize: 15, width: 24, textAlign: "center", flexShrink: 0,
                color: page === p.id ? "#f59e0b" : "#52525b",
              }}>{p.icon}</span>
              {!sideCollapsed && <span style={{
                fontSize: 12.5, fontWeight: page === p.id ? 600 : 400,
                color: page === p.id ? "#fafafa" : "#71717a",
              }}>{p.label}</span>}
              {!sideCollapsed && p.id === "mail" && <span style={{ marginLeft: "auto", fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#ef444420", color: "#ef4444", fontWeight: 600 }}>3</span>}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: sideCollapsed ? "10px 0" : "10px 12px", borderTop: "1px solid #1a1b20", display: "flex", flexDirection: "column", gap: 6 }}>
          {!sideCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: "#52525b" }}>All systems healthy</span>
            </div>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
            borderRadius: 6, background: "#ffffff04", justifyContent: sideCollapsed ? "center" : "flex-start",
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#f59e0b20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>U</div>
            {!sideCollapsed && (
              <div>
                <div style={{ fontSize: 11, color: "#d4d4d8", fontWeight: 500 }}>User</div>
                <div style={{ fontSize: 9, color: "#3f3f46" }}>Dhaka, BD</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#52525b" }}>{PAGES.find(p => p.id === page)?.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>{PAGES.find(p => p.id === page)?.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div onClick={() => setCmdOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "5px 12px",
              borderRadius: 6, border: "1px solid #1a1b20", background: "#111218",
              cursor: "pointer", minWidth: 200,
            }}>
              <span style={{ fontSize: 11, color: "#3f3f46" }}>Search everything...</span>
              <span style={{ marginLeft: "auto", fontSize: 9, padding: "1px 5px", borderRadius: 3, border: "1px solid #27272a", color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace" }}>⌘K</span>
            </div>
            <button onClick={() => setPage("chat")} style={{
              padding: "5px 12px", borderRadius: 6, border: "1px solid #f59e0b30",
              background: "#f59e0b10", color: "#f59e0b", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
            }}>◉ Agent</button>
          </div>
        </div>

        {/* Content */}
        <div style={S.content}>
          <div style={{ animation: "fi .2s ease" }} key={page}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}
