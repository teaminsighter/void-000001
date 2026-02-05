---
updated: 2026-02-05
type: system-guide
---

# Agent Guide (Void-Haki)

The Agent is your AI assistant powered by Claude. It reads your vault to understand you and help with tasks.

## How the Agent Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      YOU ASK SOMETHING                           │
│                "Plan my day, 4h office work"                     │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT GATHERS CONTEXT                         │
│  1. Reads your preferences.md                                    │
│  2. Reads your goals.md                                          │
│  3. Searches vault for relevant notes (Khoj)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT THINKS (Claude AI)                      │
│  - Understands your request                                      │
│  - Considers your preferences                                    │
│  - References your goals                                         │
│  - Plans appropriate response                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT RESPONDS + ACTS                         │
│  - Gives you an answer                                           │
│  - Triggers actions (log, plan, memory save)                     │
└─────────────────────────────────────────────────────────────────┘
```

## What Agent Can Do

| Capability | Example |
|------------|---------|
| **Plan** | "Plan my day with 4 hours of work" |
| **Log** | "Log: finished the proposal" |
| **Search** | "What did I write about marketing?" |
| **Remember** | "Remember I prefer morning meetings" |
| **Answer** | "What are my goals for this month?" |
| **Advise** | "What should I focus on today?" |

## Example Conversations

### Planning
```
You: Plan my day, I have 4 hours for office work and a meeting at 3pm
Agent: Here's your plan for today:

08:00 - 09:30  Deep work (proposal draft)
09:30 - 10:00  Break
10:00 - 11:30  Email and admin tasks
11:30 - 12:30  Lunch
12:30 - 14:30  Continue proposal work
15:00 - 16:00  Meeting

✓ Saved to your daily note
```

### Logging
```
You: Log that I finished the client proposal
Agent: ✓ Logged to today's note: finished the client proposal
```

### Searching
```
You: What did I write about the void project last week?
Agent: Based on your notes, last week you worked on:
- Setting up the dashboard
- Connecting Telegram integration
- Testing the agent chat feature

From: 01-Daily/2026-02-01.md, 01-Daily/2026-02-02.md
```

### Remembering
```
You: Remember that Ahmed prefers email over calls
Agent: ✓ Saved to your context: Ahmed prefers email over calls
```

### Asking About Goals
```
You: What are my priorities right now?
Agent: Based on your goals.md, your current priorities are:
1. Launch VOID system by end of February
2. Get 100 users by March
3. Improve automation workflows
```

## Tips for Better Results

### 1. Keep Agent Memory Updated

The Agent is only as good as the context you give it.

**Update regularly:**
- `/memory preference:` when your habits change
- `/memory goal:` when priorities shift
- `/memory context:` for important decisions

### 2. Be Specific

```
❌ "Help me"
✅ "Help me plan my day, I have a meeting at 2pm and need 3 hours for deep work"

❌ "Search for stuff"
✅ "Search for notes about client onboarding from last week"
```

### 3. Use Quick Prompts

The buttons below the chat are shortcuts:
- "Plan my day" → Triggers day planning
- "Quick log" → Log something
- "Search vault" → Search notes
- etc.

### 4. Ask About Yourself

The Agent knows you through your vault:
```
"What are my goals?"
"What have I been working on this week?"
"What's my preferred work schedule?"
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent doesn't know my preferences | Update `07-Agent-Memory/preferences.md` |
| Agent gives generic answers | Add more context to your vault |
| Agent doesn't find notes | Check if Khoj is indexing your vault |
| Slow responses | Normal - AI processing takes a few seconds |

## Quick Reference

| I want to... | Say this |
|--------------|----------|
| Plan my day | "Plan my day, [context]" |
| Log something | "Log: [your text]" |
| Search notes | "Search for [topic]" or "What did I write about [topic]" |
| Save to memory | "Remember that [info]" |
| Check goals | "What are my goals?" |
| Get advice | "What should I focus on?" |
