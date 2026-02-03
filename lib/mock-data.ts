// ══════════════════════════════════════
// VOID — Mock Data for Layer 3
// Replace with real API calls in Layer 4+
// ══════════════════════════════════════

import { Task, Email, VaultFile, Bot, Deal, SavedItem, Message } from './types';

// Current date for display
export const TODAY = "Sunday, Feb 2 2026";
export const TODAY_ISO = "2026-02-02";

// Get time-based greeting
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Tasks
export const MOCK_TASKS: Task[] = [
  { id: "1", text: "Review Q1 marketing strategy doc", tag: "Office", done: false, priority: "high", createdAt: new Date() },
  { id: "2", text: "Push Void dashboard to GitHub", tag: "Project", done: false, priority: "high", createdAt: new Date() },
  { id: "3", text: "Reply to Farhan's partnership email", tag: "Office", done: false, priority: "med", createdAt: new Date() },
  { id: "4", text: "Read Chapter 4 — Embeddings & Vectors", tag: "Learning", done: true, priority: "med", createdAt: new Date() },
  { id: "5", text: "Schedule dentist appointment", tag: "Personal", done: false, priority: "low", createdAt: new Date() },
  { id: "6", text: "Update CRM pipeline for Nexus deal", tag: "Office", done: false, priority: "med", createdAt: new Date() },
];

// Emails
export const MOCK_EMAILS: Email[] = [
  { id: "1", from: "Farhan Ahmed", subject: "RE: Partnership proposal — revised terms", preview: "Hi, I've reviewed the terms and...", time: "2h ago", urgent: true, read: false },
  { id: "2", from: "Google Cloud", subject: "Your Firebase billing summary - January", preview: "Your monthly billing summary is ready...", time: "4h ago", urgent: false, read: false },
  { id: "3", from: "Notion Team", subject: "What's new in Notion — February update", preview: "Check out the latest features...", time: "6h ago", urgent: false, read: true },
  { id: "4", from: "Arif Rahman", subject: "Meeting notes from Friday sync", preview: "Here are the notes from our meeting...", time: "8h ago", urgent: false, read: false },
  { id: "5", from: "AWS", subject: "Your January invoice is ready", preview: "Your AWS invoice for January...", time: "1d ago", urgent: false, read: true },
];

// Vault Files
export const MOCK_VAULT_FILES: VaultFile[] = [
  { name: "2026-02-02.md", folder: "01-Daily", modified: "Today 6:30 PM", size: "2.1 KB", path: "/vault/01-Daily/2026-02-02.md" },
  { name: "2026-02-01.md", folder: "01-Daily", modified: "Yesterday", size: "3.4 KB", path: "/vault/01-Daily/2026-02-01.md" },
  { name: "embeddings-vectors.md", folder: "02-Learning", modified: "Yesterday", size: "5.2 KB", path: "/vault/02-Learning/embeddings-vectors.md" },
  { name: "q1-marketing-plan.md", folder: "03-Office", modified: "Jan 30", size: "8.7 KB", path: "/vault/03-Office/q1-marketing-plan.md" },
  { name: "void-os-architecture.md", folder: "04-Projects", modified: "Today 3:00 PM", size: "12.1 KB", path: "/vault/04-Projects/void-os-architecture.md" },
  { name: "nexus-deal-notes.md", folder: "03-Office", modified: "Jan 28", size: "1.8 KB", path: "/vault/03-Office/nexus-deal-notes.md" },
  { name: "preferences.md", folder: "07-Agent-Memory", modified: "Jan 25", size: "0.9 KB", path: "/vault/07-Agent-Memory/preferences.md" },
  { name: "goals-2026.md", folder: "07-Agent-Memory", modified: "Jan 20", size: "1.2 KB", path: "/vault/07-Agent-Memory/goals-2026.md" },
];

// Saved Items
export const MOCK_SAVED_ITEMS: SavedItem[] = [
  { id: "1", title: "How vector databases actually work", type: "Article", source: "blog.pinecone.io", date: "Feb 1", url: "#" },
  { id: "2", title: "n8n webhook patterns for production", type: "Tutorial", source: "n8n.io", date: "Jan 30", url: "#" },
  { id: "3", title: "React Server Components explained", type: "Video", source: "YouTube", date: "Jan 28", url: "#" },
  { id: "4", title: "Prompt engineering for structured output", type: "Article", source: "docs.anthropic.com", date: "Jan 25", url: "#" },
  { id: "5", title: "Docker Compose best practices 2026", type: "Guide", source: "docs.docker.com", date: "Jan 22", url: "#" },
];

// Bots / Workflows
export const MOCK_BOTS: Bot[] = [
  { id: "1", name: "Morning Briefing", schedule: "Daily 8:00 AM", lastRun: "Today 8:00 AM", status: "ok", type: "cron" },
  { id: "2", name: "Night Capture", schedule: "Daily 9:00 PM", lastRun: "Yesterday 9:00 PM", status: "ok", type: "cron" },
  { id: "3", name: "Weekly Review", schedule: "Sunday 10:00 PM", lastRun: "Last Sunday", status: "ok", type: "cron" },
  { id: "4", name: "Health Monitor", schedule: "Every 15 min", lastRun: "2 min ago", status: "ok", type: "cron" },
  { id: "5", name: "Khoj Re-indexer", schedule: "Every 6 hours", lastRun: "3h ago", status: "ok", type: "cron" },
  { id: "6", name: "Email Manager", schedule: "On demand", lastRun: "Today 5:12 PM", status: "ok", type: "webhook" },
  { id: "7", name: "Quick Log", schedule: "On demand", lastRun: "Today 6:30 PM", status: "ok", type: "webhook" },
  { id: "8", name: "Daily Plan Creator", schedule: "On demand + 8AM", lastRun: "Today 8:00 AM", status: "ok", type: "both" },
  { id: "9", name: "CRM Query", schedule: "On demand", lastRun: "Jan 31", status: "warn", type: "webhook" },
  { id: "10", name: "Reminder Scheduler", schedule: "On demand", lastRun: "Today 3:45 PM", status: "ok", type: "webhook" },
  { id: "11", name: "Vault Search", schedule: "On demand", lastRun: "Today 4:20 PM", status: "ok", type: "webhook" },
  { id: "12", name: "Memory Updater", schedule: "On demand", lastRun: "Jan 29", status: "ok", type: "webhook" },
  { id: "13", name: "Telegram Router", schedule: "Always on", lastRun: "Now", status: "ok", type: "webhook" },
];

// CRM Deals
export const MOCK_DEALS: Deal[] = [
  { id: "1", name: "Nexus Corp — Enterprise License", stage: "Negotiation", value: "$24,000", probability: "70%", owner: "You" },
  { id: "2", name: "BlueStar — Consulting Package", stage: "Proposal", value: "$8,500", probability: "50%", owner: "You" },
  { id: "3", name: "Meridian Inc — Annual Retainer", stage: "Closed Won", value: "$36,000", probability: "100%", owner: "You" },
];

// Chat Messages
export const MOCK_CHAT_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Plan my tomorrow — I have 4 hours in office and a meeting at 2pm with Farhan about the partnership deal",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "assistant",
    content: `Here's your Monday plan based on your preferences and current priorities:

🗓️ Monday, Feb 3

08:00 — Morning briefing (auto-sent to Telegram)
09:00 — Deep work: Finish Q1 marketing strategy review
10:30 — Reply to Farhan's email with updated terms
11:00 — Push Void dashboard code to GitHub
12:00 — Lunch break
13:00 — Prep meeting notes for Farhan partnership
14:00 — 🔴 Meeting with Farhan — partnership deal
15:00 — Update CRM pipeline based on meeting outcome
15:30 — Schedule dentist + personal errands
16:00 — Learning: Chapter 5 — Attention mechanisms

I've prioritized the Farhan-related tasks before the 2PM meeting. Want me to save this to your vault and set Telegram reminders?`,
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    role: "user",
    content: "Yes, save it and remind me at 1:30pm to prep for the meeting",
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "4",
    role: "assistant",
    content: `Done ✓

• Saved to vault → 01-Daily/2026-02-03.md
• Reminder set → Telegram at 1:30 PM: "Prep meeting notes for Farhan partnership"
• Morning briefing will include this plan at 8:00 AM tomorrow`,
    timestamp: new Date(Date.now() - 120000),
  },
];

// Schedule/Time Blocks for Planner
export const MOCK_SCHEDULE = [
  { time: "08:00", block: "Morning briefing (auto)", type: "bot" as const },
  { time: "09:00", block: "Deep work — Q1 marketing strategy", type: "work" as const },
  { time: "10:30", block: "Reply to Farhan's email", type: "work" as const },
  { time: "11:00", block: "Push Void dashboard to GitHub", type: "project" as const },
  { time: "12:00", block: "Lunch break", type: "break" as const },
  { time: "13:00", block: "Prep Farhan meeting notes", type: "work" as const },
  { time: "14:00", block: "🔴 Meeting — Farhan partnership", type: "meeting" as const },
  { time: "15:00", block: "Update CRM pipeline", type: "work" as const },
  { time: "16:00", block: "Learning — Attention mechanisms", type: "learn" as const },
];

// Recent Research for Research Page
export const MOCK_RESEARCH_HISTORY = [
  { query: "How do transformer attention heads learn different patterns?", vaultMatches: 3, webResults: 5, date: "Yesterday" },
  { query: "n8n webhook authentication best practices", vaultMatches: 1, webResults: 4, date: "Jan 30" },
  { query: "Vector database comparison pgvector vs Qdrant", vaultMatches: 2, webResults: 6, date: "Jan 28" },
];

// Vault Folders
export const VAULT_FOLDERS = [
  "All",
  "00-Inbox",
  "01-Daily",
  "02-Learning",
  "03-Office",
  "04-Projects",
  "05-References",
  "06-Reviews",
  "07-Agent-Memory",
];

// Tag Colors
export const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Office: { bg: "rgba(37, 99, 235, 0.08)", color: "#60a5fa" },
  Project: { bg: "rgba(139, 92, 246, 0.08)", color: "#a78bfa" },
  Learning: { bg: "rgba(16, 185, 129, 0.08)", color: "#34d399" },
  Personal: { bg: "rgba(245, 158, 11, 0.08)", color: "#fbbf24" },
};

// Priority Colors
export const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  med: "#eab308",
  low: "#475569",
};

// Schedule Type Colors
export const SCHEDULE_COLORS: Record<string, string> = {
  work: "#60a5fa",
  project: "#a78bfa",
  meeting: "#ef4444",
  learn: "#34d399",
  break: "#52525b",
  bot: "#f59e0b",
};
