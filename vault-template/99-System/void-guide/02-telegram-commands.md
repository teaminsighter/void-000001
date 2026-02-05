---
updated: 2026-02-05
type: system-guide
---

# Telegram Commands Guide

Use Telegram for quick actions when you're away from the dashboard.

## Available Commands

### /log - Quick Logging

Add entries to today's daily note.

```
/log finished the client proposal
/log idea: use AI for onboarding flow
/log meeting with Ahmed went well
/log feeling tired, taking a break
```

**What happens:**
1. Text is added to `01-Daily/[today].md`
2. Added under `## Log` section
3. Timestamp is included
4. Telegram confirms: "✓ Logged: [your text]"

---

### /memory - Save to Agent Memory

Save important info so the Agent remembers it.

**Format:** `/memory <type>: <content>`

```
/memory goal: Launch product by March
/memory preference: I work best from 9am-1pm
/memory context: Ahmed is my business partner
```

**Types:**
| Type | File Updated | Example |
|------|--------------|---------|
| `goal` | goals.md | `/memory goal: Get 100 users` |
| `preference` | preferences.md | `/memory preference: No meetings after 5pm` |
| `context` | agent-context.md | `/memory context: Project deadline is Feb 28` |

**What happens:**
1. Content added to appropriate file in `07-Agent-Memory/`
2. Agent can now reference this info
3. Telegram confirms: "✓ Saved to [type]: [content]"

---

### /plan - Plan Your Day (Coming Soon)

Generate a daily plan with AI.

```
/plan 4h work, meeting at 3pm
/plan focus on marketing today
/plan light day, 2h office only
```

**What happens:**
1. AI reads your preferences and goals
2. Creates time-blocked schedule
3. Saves to today's daily note
4. Sends plan summary to Telegram

---

## Examples

**Morning routine:**
```
/plan 4h office, need to finish proposal
```

**During the day:**
```
/log started working on proposal
/log call with client - they want changes
/log finished first draft
/log break - going for coffee
```

**Save important info:**
```
/memory context: Client wants blue theme not green
/memory goal: Submit proposal by Friday
/memory preference: Deep work in morning only
```

---

## Quick Reference Card

| Command | Purpose | Example |
|---------|---------|---------|
| `/log` | Quick note | `/log finished task X` |
| `/memory goal:` | Save goal | `/memory goal: Launch by March` |
| `/memory preference:` | Save preference | `/memory preference: Morning meetings` |
| `/memory context:` | Save context | `/memory context: Budget is $5000` |
| `/plan` | Plan day | `/plan 4h work today` |

---

## Tips

1. **Be concise** - Telegram is for quick captures
2. **Use /log often** - Small logs add up to great daily records
3. **Save to memory** - When you learn something the Agent should know
4. **Review in Obsidian** - See your logs formatted nicely

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No response | Check if ngrok tunnel is running |
| "Unknown command" | Check spelling, use exact format |
| Log not appearing | Refresh Obsidian, check daily note |
