# VOID — Home Tab Redesign Plan

## Current Problems (from screenshots)

1. **Light mode broken** — Stat card accent values (#f59e0b, #34d399, #a78bfa) are hardcoded colors not tied to theme. On white background, some text vanishes. `--void-surface` (#f8f9fa) too close to `--void-bg` (#ffffff) — cards blend into background
2. **Text too small** — Stat labels 10px, metadata 9.5px, widget titles 12px. Everything feels like footnotes
3. **Flat 2-column grid wastes space** — Today's Tasks column is half-empty, Inbox shows "not connected" dead-end, Void-Haki search box is redundant (already have ⌘K)
4. **No overview of all tabs** — Home should be a command center showing a slice of every area. Currently missing: Bots status, Saved items, Practice, Research history
5. **No push/motivation** — Static dashboard. Nothing moves, nothing urges action. No sense of progress or urgency
6. **Right sidebar disconnected** — Agent Notes and System Status feel like afterthought data, not part of the main flow
7. **Border overlap** — Cards have border + rounded-lg but inner header has border-b creating doubled line effect

---

## Design Philosophy

**Apple-style principles:**
- Generous whitespace (padding 20-24px, gaps 16-20px)
- Large readable type (min 13px body, 14px labels, 28px hero numbers)
- Subtle depth via shadows not borders (cards use `box-shadow` + thin border)
- Frosted glass for elevated surfaces
- Color used sparingly — accent on interactive, not decorative
- Smooth micro-animations (0.2s ease transitions)
- Works beautifully in BOTH dark and light mode

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┬──────────────┐
│  MAIN CONTENT (scrollable)                                              │ RIGHT SIDEBAR │
│                                                                         │   (300px)     │
│  ┌─── GREETING BAR ────────────────────────────────────────────────┐   │               │
│  │  SUNDAY, FEB 2 2026                                              │   │  Focus Timer  │
│  │  Good evening, boss.                                             │   │  or Weekly    │
│  │  2 urgent · 13 notes · 8 bots active                            │   │  Activity     │
│  └──────────────────────────────────────────────────────────────────┘   │               │
│                                                                         │  System       │
│  ┌─── FOCUS BANNER (animated accent border) ───────────────────────┐   │  Status       │
│  │  💡 "You have 2 high-priority tasks. Farhan's email needs a     │   │               │
│  │      reply." · "Press ⌘K to search"   [→ Go to Planner]        │   │  Quick Stats  │
│  └──────────────────────────────────────────────────────────────────┘   │               │
│                                                                         │  Motivation   │
│  ┌─── STAT CARDS ROW (4 cards, equal width) ───────────────────────┐   │  Ticker       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │               │
│  │  │▎Tasks    │ │▎Vault    │ │▎Mail     │ │▎Agent    │           │   │               │
│  │  │ 2/6     │ │ 13       │ │ —        │ │ Ready    │           │   │               │
│  │  │ 2 high  │ │ search ✓ │ │ connect  │ │ online   │           │   │               │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │               │
│  └──────────────────────────────────────────────────────────────────┘   │               │
│                                                                         │               │
│  ┌─── 3-COLUMN WIDGET GRID ───────────────────────────────────────┐   │               │
│  │                                                                  │   │               │
│  │  ┌─ Today's Tasks ─┐ ┌─ Recent Notes ──┐ ┌─ Tab Shortcuts ──┐ │   │               │
│  │  │ View all →       │ │ Browse vault →  │ │                  │ │   │               │
│  │  │                  │ │                  │ │  ✉ Mail  ·  —   │ │   │               │
│  │  │ ☐ Review Q1...  │ │ ◇ 2026-02-04   │ │  ◎ Research · 3  │ │   │               │
│  │  │ ☐ Push Void...  │ │ ◇ agent-ctx    │ │  ◆ Saved   · 5   │ │   │               │
│  │  │ ☑ Read Ch.4...  │ │ ◇ goals.md     │ │  ⚡ Bots  · 8/12 │ │   │               │
│  │  │ ☐ Reply email   │ │ ◇ preferences  │ │  🎤 Practice      │ │   │               │
│  │  │ ☐ Dentist       │ │ ◇ void-arch    │ │  ▦ Planner · 6   │ │   │               │
│  │  │                  │ │                  │ │                  │ │   │               │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘ │   │               │
│  └──────────────────────────────────────────────────────────────────┘   │               │
│                                                                         │               │
│  ┌─── AI INSIGHT CARD (full-width, frosted glass) ─────────────────┐   │               │
│  │  ◉ Agent Insight                                                 │   │               │
│  │  "2 tasks from yesterday are still pending. Your vault grew by   │   │               │
│  │   3 notes this week. Next scheduled bot: Morning Briefing 8AM"  │   │               │
│  │                                              [Ask Agent →]       │   │               │
│  └──────────────────────────────────────────────────────────────────┘   │               │
│                                                                         │               │
└──────────────────────────────────────────────────────────────────────────┴──────────────┘
```

---

## Section-by-Section Design

### A. GREETING BAR (top)

**Current:** Date + "Good evening, boss." + "0 urgent tasks · 13 vault notes"
**New:**
- Date: font-mono, 11px (up from 10px), `--void-dim`, uppercase tracking
- Greeting: 26px bold, `--void-white`, letter-spacing -0.02em
- Subtitle: 14px (up from 13px), `--void-muted`, richer info: `"2 urgent · 13 notes · 8 bots active · 5 saved"`
- **Remove** the QuickActions pill row entirely — those actions move to the Tab Shortcuts widget and the Focus Banner CTA

**Why remove QuickActions row:** It takes up vertical space, most actions are redundant with sidebar nav, and the colored pill buttons don't look good in light mode. The new Tab Shortcuts widget + Focus Banner replaces this functionality.

### B. FOCUS BANNER (new — motivational push element)

**Purpose:** The "push" you asked for. A slim, full-width card with a subtle animated left accent border (pulsing amber glow). Shows the most important thing you should do right now.

**Design:**
- Height: ~56px, single line
- Background: `void-glass` (frosted)
- Left border: 3px solid `--void-accent` with subtle CSS pulse animation
- Icon: 💡 or ◉ (accent colored)
- Text: 14px `--void-text`, one sentence
- Right: a small CTA link → goes to relevant page
- **Rotates** between messages every 8 seconds (CSS + JS):
  - High priority task reminder → links to /planner
  - Unread email count → links to /mail
  - "You haven't journaled today" → links to /vault
  - Keyboard tip: "Press ⌘K to search everything" → opens command palette
  - Random motivational: "Small steps compound. Keep building."

**CSS animation:** `@keyframes accentPulse` — the left border opacity pulses between 0.5 and 1.0

### C. STAT CARDS ROW (redesigned)

**Current problems:**
- Value text uses hardcoded `accent` color prop → invisible in light mode for some colors
- Labels too small (10px)
- No visual accent except text color → flat, lifeless

**New design per card:**
- **Left accent bar:** 3px tall colored bar at top of card (not left side — Apple-style top accent)
- **Label:** 11px, `--void-muted`, uppercase, 500 weight (up from 10px)
- **Value:** 28px, `--void-white` (NOT accent colored — always readable), font-mono, 700 weight
- **Sub text:** 12px, `--void-dim` (up from 10px)
- **Clickable:** entire card is a Link to the relevant page
- **Hover:** subtle lift (`translateY(-1px)`) + shadow increase
- Card uses `void-card` class + `overflow: hidden` for the top accent bar

**Props change:** `accent` becomes the top bar color only, not the value text color

### D. 3-COLUMN WIDGET GRID (replaces 2-column)

**Why 3 columns:**
- Eliminates dead "Inbox" empty state card and redundant "Void-Haki" search card
- Third column becomes "Tab Shortcuts" — a mini overview card for every tab not shown in column 1-2
- More information density, proper command center feel
- On smaller screens, drops to 2 then 1 column via `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`

#### Column 1: Today's Tasks (from /planner)
- Title: "Today's Tasks" with "View all →" link to /planner
- Shows 6 tasks (up from 5)
- Existing TaskList component — already good
- **New:** progress bar at bottom of card showing % complete (thin 3px bar, green fill)

#### Column 2: Recent Notes (from /vault)
- Title: "Recent Notes" with "Browse vault →" link to /vault
- Shows 5 files (up from 4)
- Existing VaultRecent component — already good
- **New:** folder count summary at bottom: "7 folders · 13 total"

#### Column 3: Tab Shortcuts (NEW — overview of all other tabs)
- Title: "Quick Access"
- A list of every tab not already represented, each as a clickable row:
  - ✉ **Mail** · "— not connected" or "3 unread" → /mail
  - ◎ **Research** · "3 recent searches" → /research
  - ◆ **Saved** · "5 bookmarks" → /saved
  - ⚡ **Bots** · "8 active · 1 warning" → /bots
  - 🎤 **Practice** · "English conversation" → /practice
  - ▦ **Planner** · "6 tasks today" → /planner
- Each row: icon + label + small status text on right, 44px height, void-hover-row on hover
- This gives you a full bird's-eye view of every area from Home, and one click takes you there

### E. AI INSIGHT CARD (new — full-width, below grid)

**Purpose:** A space for AI to show something important. The agent analyzes your data and surfaces one insight.

**Design:**
- Full width, frosted glass (`void-glass` class)
- ◉ icon in accent color + "Agent Insight" label
- Body: 14px `--void-text`, 2-3 sentences max
- Bottom-right: "Ask Agent →" link to /agent
- Content is generated from available data:
  - Counts incomplete tasks, compares with yesterday
  - Counts vault notes added recently
  - Shows next scheduled bot run
  - If nothing interesting: shows a productivity tip
- **Static for now** (computed from fetched data, not from AI API) — can be upgraded to real AI summary later

### F. RIGHT SIDEBAR (redesigned)

**Width:** 280px (down from 300 — tighter)

#### F1. Weekly Activity Chart (keep, improved)
- Taller bars (80px → 100px chart area)
- Bar width: 28px (up from 24px)
- Today's bar: accent color, others: `--void-border`
- Day labels: 10px (up from 9px)
- Add total at top-right: "42 actions" in muted text

#### F2. System Status (keep, improved)
- Bigger text: labels 13px (up from 12px), status 12px (up from 11px)
- Status dot: 8px (up from 6px)
- Add subtle green/gray background tint to each row based on status

#### F3. Quick Stats (keep, improved)
- Bigger text: 13px labels, 13px values
- Values: `--void-white` + font-weight 600

#### F4. Motivation Ticker (NEW — bottom of sidebar)
- A continuously scrolling strip at the very bottom of the sidebar
- CSS `@keyframes tickerScroll` — horizontal scroll, slow (30s loop)
- Contains rotating text:
  - "Small steps compound. Keep building."
  - "Review your goals weekly."
  - "Consistency beats intensity."
  - "Ship something today."
  - "Your vault is your second brain."
- Styled: 11px, `--void-dim`, italic, with left/right fade-out gradient mask
- Adds constant subtle motion → subconscious push

---

## CSS Changes (globals.css)

### Light mode contrast fix
```css
:root[data-theme="light"] {
  --void-surface: #f3f4f6;    /* was #f8f9fa — more contrast vs white bg */
  --void-border: #d1d5db;     /* was #e5e7eb — more visible borders */
  --void-surface-hover: #e8e9ec; /* was #f0f1f3 — more visible hover */
}
```

### New animations
```css
@keyframes accentPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.void-focus-banner {
  border-left: 3px solid var(--void-accent);
  animation: accentPulse 3s ease-in-out infinite;
}

.void-ticker {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.void-ticker-inner {
  display: flex;
  gap: 48px;
  white-space: nowrap;
  animation: tickerScroll 30s linear infinite;
}
```

### Font size utility additions
```css
.void-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--void-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## Component Changes

### StatCard.tsx — Rewrite
- Add `href` prop (string) — wraps in Next Link
- Add top accent bar (3px height, accent color, full width)
- Value uses `--void-white` not accent color
- Label: 11px, Value: 28px, Sub: 12px
- Hover: translateY(-1px), slight shadow bump
- overflow: hidden on card for accent bar clipping

### QuickActions.tsx — Remove usage
- Keep file but remove from Home page
- (Still available if other pages want it)

### HomeRightPanel.tsx — Rewrite
- Add motivation ticker section at bottom
- Compact system status: remove card wrapper, just rows
- Bigger fonts throughout (see F1-F4 above)
- Width accommodates 280px sidebar

### NEW: FocusBanner.tsx
- Cycles through messages every 8 seconds
- Uses `useState` + `useEffect` with `setInterval`
- Each message has: text, link href, link label
- Messages computed from props (task count, vault count, etc.)
- Fade transition between messages (opacity 0→1 over 0.3s)

### NEW: TabShortcuts.tsx
- Receives counts as props (mail unread, saved count, bot active count, etc.)
- Renders a list of tab rows with icon, label, status, and Link
- void-hover-row on each item

### NEW: AiInsightCard.tsx
- Receives tasks, vault files, health data as props
- Computes a text insight from the data
- Frosted glass card, full width

### app/page.tsx — Major rewrite
- Remove QuickActions import/usage
- Add FocusBanner between greeting and stats
- Change grid from 2-col to 3-col (auto-fit minmax 280px)
- Replace Inbox widget with TabShortcuts
- Replace Void-Haki widget with nothing (grid is now 3-col: Tasks, Notes, Shortcuts)
- Add AiInsightCard below the grid
- Fetch additional data: /api/health for system status

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/dashboard/FocusBanner.tsx` | Rotating motivational/actionable banner |
| `components/dashboard/TabShortcuts.tsx` | Quick-access links to all tabs with live status |
| `components/dashboard/AiInsightCard.tsx` | AI-generated insight card |

## Files to Edit

| File | Changes |
|------|---------|
| `app/globals.css` | Light mode contrast, accentPulse animation, ticker animation, void-section-label |
| `app/page.tsx` | Complete rewrite — new layout with 3-col grid, focus banner, AI card |
| `components/dashboard/StatCard.tsx` | Top accent bar, bigger fonts, clickable Link wrapper |
| `components/dashboard/HomeRightPanel.tsx` | Bigger fonts, motivation ticker, compacted layout |
| `components/dashboard/index.ts` | Export new components |
| `components/layout/MainLayout.tsx` | Right sidebar width 300→280 |

## Files Unchanged
- `components/dashboard/TaskList.tsx` — already good
- `components/dashboard/VaultRecent.tsx` — already good (maybe bump limit to 5)

---

## Dark / Light Mode Verification

| Element | Dark | Light |
|---------|------|-------|
| Greeting text | `--void-white` = #fafafa | `--void-white` = #0c0d10 |
| Stat value | `--void-white` (always readable) | `--void-white` (always readable) |
| Stat accent bar | Direct color (#f59e0b etc) | Same — colored bars work on both |
| Card background | `--void-surface` = #111218 | `--void-surface` = #f3f4f6 (fixed) |
| Card border | `--void-border` = #1a1b20 | `--void-border` = #d1d5db (fixed) |
| Body text | `--void-text` = #e4e4e7 | `--void-text` = #1a1a1a |
| Muted text | `--void-muted` = #a1a1aa | `--void-muted` = #4b5563 |
| Dim text | `--void-dim` = #71717a | `--void-dim` = #6b7280 |
| Focus banner bg | void-glass (semi-transparent dark) | void-glass (semi-transparent light) |
| AI card bg | void-glass | void-glass |
| Hover state | `--void-surface-hover` = #1a1b20 | `--void-surface-hover` = #e8e9ec |

All elements use CSS variables → automatic theme support.

---

## Implementation Order

1. **CSS first** — globals.css light mode fix + new animations + utility class
2. **StatCard.tsx** — redesign with accent bar + Link wrapper + bigger fonts
3. **FocusBanner.tsx** — new component
4. **TabShortcuts.tsx** — new component
5. **AiInsightCard.tsx** — new component
6. **HomeRightPanel.tsx** — rewrite with ticker + bigger fonts
7. **app/page.tsx** — full rewrite assembling everything
8. **MainLayout.tsx** — sidebar width tweak
9. **index.ts** — export new components
10. **Test** — toggle dark/light, verify all text readable, check all links work

---

## Suggestions / Additions to Consider

1. **Greeting emoji by time of day:** "Good morning ☀️" / "Good afternoon 🌤" / "Good evening 🌙" — small warmth
2. **Task progress ring** in the Tasks stat card — a tiny circular SVG showing % done visually
3. **"Last active" timestamp** on Tab Shortcuts — e.g. "Research · last used 2h ago"
4. **Drag-to-reorder widgets** (future) — let user customize widget order
5. **Collapsible right sidebar** — on smaller screens or user preference, hide sidebar with a toggle
6. **Notification dot on sidebar nav items** — if there's something new (unread mail, pending tasks), show a small colored dot next to the nav icon. This extends the "push" concept to the sidebar
7. **"Daily streak" counter** — how many consecutive days you've used the dashboard. Shown in Quick Stats. Gamification push
8. **Sound on focus banner rotation** (optional, off by default) — tiny click sound when message changes, keeps attention subconsciously

---

## ADDENDUM: Per-Tab Content Audit

The Home page must show something meaningful from EVERY tab — not just a link. Here's the audit and what to add.

### Coverage Matrix

| Tab | Stat Card | Widget (deep) | Tab Shortcuts row | AI Insight | Focus Banner | Total presence |
|-----|-----------|---------------|-------------------|------------|--------------|----------------|
| **Planner** | "Tasks Today 2/6" | Full task list (col 1) | Row with task count | "2 tasks pending" | "You have 2 high-priority tasks" | STRONG |
| **Vault** | "Vault Notes 13" | Recent notes list (col 2) | — | "vault grew +3 notes" | "You haven't journaled today" | STRONG |
| **Agent** | "Agent Ready" | AI Insight Card (full) | — | Full card is agent | "Ask agent for help" | STRONG |
| **Mail** | "Mail —" | — | Row: unread count | "3 emails pending" | "Check your email" | MEDIUM |
| **Research** | — | — | Row: "3 searches" | — | — | WEAK |
| **Saved** | — | — | Row: "5 bookmarks" | — | — | WEAK |
| **Bots** | — | — | Row: "8 active" | "Next bot: 8AM" | — | WEAK-MEDIUM |
| **Practice** | — | — | Row: just a link | — | — | VERY WEAK |

### What to add for weak tabs:

#### Research (currently: just a count in Tab Shortcuts)
**Add to Tab Shortcuts row:** Show the LAST search query text, not just "3 recent searches"
```
◎  Research
   "How do transformer attention heads..."     2h ago →
```
- Shows the actual last query (truncated to ~40 chars)
- Timestamp of last search
- Clicking goes to /research
- Data source: can store last search in localStorage or fetch from mock

#### Saved (currently: just a count in Tab Shortcuts)
**Add to Tab Shortcuts row:** Show the LATEST saved item title
```
◆  Saved · 5 items
   "How vector databases actually work"        Feb 1 →
```
- Shows latest bookmark title (truncated)
- Date saved
- Data source: MOCK_SAVED_ITEMS[0]

#### Bots (currently: just a count in Tab Shortcuts)
**Add to Tab Shortcuts row:** Show active/warning count + LAST bot run
```
⚡  Bots · 8 active · 1 warning
   Last: "Health Monitor" ran 2 min ago        →
```
- Shows bot health summary
- Last run info
- Data source: MOCK_BOTS

#### Practice (currently: just a link)
**Add to Tab Shortcuts row:** Show streak or session info
```
🎤  Practice
   "Start an English conversation"             →
```
- If no sessions yet: shows invitation text
- If sessions exist: "Last session: 3 days ago · 12 exchanges"
- Data source: could use localStorage for session history, or static for now

### Enriched Tab Shortcuts Layout

The Tab Shortcuts widget (column 3) becomes a **RICHER** component. Each row is now TWO lines:
- Line 1: Icon + Tab name + count badge (right-aligned)
- Line 2: Preview text in `--void-dim`, smaller (12px)

```
┌─ Quick Access ──────────────────────────┐
│                                          │
│  ✉  Mail                           —    │
│     Not connected                    →   │
│  ─────────────────────────────────────   │
│  ◎  Research                        3    │
│     "How do transformer attention..."→   │
│  ─────────────────────────────────────   │
│  ◆  Saved                           5    │
│     "How vector databases work"      →   │
│  ─────────────────────────────────────   │
│  ⚡  Bots                        8 / 1w  │
│     Last: Health Monitor · 2m ago    →   │
│  ─────────────────────────────────────   │
│  🎤  Practice                            │
│     Start a conversation             →   │
│  ─────────────────────────────────────   │
│  ▦  Planner                          6   │
│     2 high priority remaining        →   │
│                                          │
└──────────────────────────────────────────┘
```

Each row: ~56px height, void-hover-row, entire row is clickable Link.

### Updated Data Fetching for page.tsx

The Home page needs to fetch/access:
- `/api/planner` — tasks (already fetched)
- `/api/vault/list` — vault files (already fetched)
- `/api/health` — system health (add this fetch)
- `MOCK_SAVED_ITEMS` — saved items count + latest title (import from mock-data)
- `MOCK_BOTS` — bot count + last run (import from mock-data)
- `MOCK_RESEARCH_HISTORY` — last search query (import from mock-data)
- Practice data — static text for now, no API yet

### Updated Visual Layout with Full Tab Coverage

```
┌──────────────────────────────────────────────────────────────────────────────┬──────────────┐
│                                                                              │              │
│  SUNDAY, FEB 2 2026                                                          │  WEEKLY      │
│  Good evening 🌙, boss.                                                     │  ACTIVITY    │
│  2 urgent · 13 notes · 3 mail · 8 bots · 5 saved                           │  ┌──┐        │
│                                                                              │  │▓▓│ ┌──┐   │
│  ┌─ FOCUS BANNER ──────────────────────────────────────────────────────┐    │  │▓▓│ │▓▓│   │
│  │ 💡 "You have 2 high-priority tasks pending."     [Go to Planner →] │    │  │▓▓│ │▓▓│   │
│  └─────────────────────────────────────────────────────────────────────┘    │  Mo Tu We... │
│                                                                              │              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │  SYSTEM      │
│  │▔▔▔▔▔▔▔▔▔▔│  │▔▔▔▔▔▔▔▔▔▔│  │▔▔▔▔▔▔▔▔▔▔│  │▔▔▔▔▔▔▔▔▔▔│                    │  STATUS      │
│  │ TASKS    │  │ VAULT    │  │ MAIL     │  │ AGENT    │                    │              │
│  │ 2/6     │  │ 13       │  │ —        │  │ Ready    │  ← clickable      │  Dashboard ● │
│  │ 2 high  │  │ search ✓ │  │ connect  │  │ online   │     cards         │  n8n       ○ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │  Khoj      ○ │
│                                                                              │  Vault     ● │
│  ┌─ Today's Tasks ──────┐  ┌─ Recent Notes ─────┐  ┌─ Quick Access ─────┐  │              │
│  │ View all →  /planner  │  │ Browse →  /vault    │  │                    │  │  QUICK      │
│  │                       │  │                     │  │ ✉ Mail          — │  │  STATS      │
│  │ ○ Review Q1 strategy │  │ ◇ 2026-02-04.md    │  │   Not connected  → │  │              │
│  │ ○ Push Void to GH    │  │   01-Daily · today  │  │ ──────────────────│  │  Notes: 13  │
│  │ ● Read Ch.4 (done)   │  │ ◇ agent-context.md │  │ ◎ Research       3 │  │  Bots: 8    │
│  │ ○ Reply Farhan email │  │   07-Agent · 2d ago │  │   "How do trans.." │  │  Uptime: 99%│
│  │ ○ Schedule dentist   │  │ ◇ goals.md         │  │ ──────────────────│  │              │
│  │ ○ Update CRM         │  │   07-Agent · 3d ago │  │ ◆ Saved          5 │  │  MOTIVATION │
│  │                       │  │ ◇ preferences.md   │  │   "Vector DBs..."  │  │  ──────────│
│  │ ▓▓▓▓▓▓▓░░░░ 1/6     │  │   07-Agent · 2d ago │  │ ──────────────────│  │  ← ticker → │
│  │ (progress bar)        │  │ ◇ void-arch.md     │  │ ⚡ Bots      8/1w │  │  "Small     │
│  │                       │  │   04-Proj · today   │  │   Health Mon 2m   │  │   steps     │
│  └───────────────────────┘  │                     │  │ ──────────────────│  │   compound" │
│                              │ 7 folders · 13 total│  │ 🎤 Practice       │  │              │
│                              └─────────────────────┘  │   Start a convo  → │  │              │
│                                                       │ ──────────────────│  │              │
│                                                       │ ▦ Planner        6 │  │              │
│                                                       │   2 high priority  │  │              │
│                                                       └────────────────────┘  │              │
│                                                                              │              │
│  ┌─ AI INSIGHT (frosted glass, full width) ────────────────────────────────┐ │              │
│  │ ◉ Agent Insight                                                          │ │              │
│  │ "2 tasks from yesterday still pending. Vault grew +3 notes this week.   │ │              │
│  │  Next bot run: Morning Briefing at 8:00 AM. You have 5 saved items     │ │              │
│  │  to review."                                              [Ask Agent →] │ │              │
│  └──────────────────────────────────────────────────────────────────────────┘ │              │
│                                                                              │              │
└──────────────────────────────────────────────────────────────────────────────┴──────────────┘
```

### Final Tab Coverage After Addendum

| Tab | Where it shows on Home | Content depth |
|-----|----------------------|---------------|
| **Planner** | Stat card + full task list + progress bar + Focus Banner mention + Tab Shortcut row | DEEP |
| **Vault** | Stat card + full recent notes list + folder summary | DEEP |
| **Agent** | Stat card + AI Insight Card (full width) + Focus Banner rotation | DEEP |
| **Mail** | Stat card + Tab Shortcuts row (status/unread count) | MEDIUM |
| **Research** | Tab Shortcuts row (last query preview + count) + AI Insight mention | MEDIUM |
| **Saved** | Tab Shortcuts row (latest item title + count) + AI Insight mention | MEDIUM |
| **Bots** | Tab Shortcuts row (active/warn count + last run) + AI Insight mention | MEDIUM |
| **Practice** | Tab Shortcuts row (session invite or last session info) | LIGHT-MEDIUM |

Every single tab now has meaningful content visible on Home — not just a link.

---

## IMPORTANT NOTE: Natural, Not Forced

The Home page does NOT need to force-show something from every tab. The goal is:

- Show what's **naturally important and useful** at a glance
- If a tab has nothing relevant right now, it just sits quietly in sidebar nav — no need to manufacture content for it
- **Planner, Vault, Agent** — always important, always show deep content
- **Mail** — shows status (connected/unread count), but if not connected, just a small indicator is fine, no big empty card
- **Bots** — only worth showing if there's a warning or something needs attention. Otherwise just a number in Quick Stats sidebar
- **Research, Saved, Practice** — these are user-initiated tools. They don't generate "important" info by themselves. A row in Quick Access is enough — no need to fake preview content if there's nothing meaningful to show
- The Quick Access / Tab Shortcuts column is there as a **navigation convenience**, not a content showcase. Keep rows simple: icon + name + quick status → click to go

**Principle:** If you have to invent content to fill a section, that section shouldn't exist. Only show what helps the user make a decision or take action RIGHT NOW.
