---
updated: 2026-02-05
type: system-guide
---

# Vault Folder Structure

Your vault is organized with numbered folders for easy sorting and navigation.

## Current Structure

```
vault/
├── 00-Inbox/          ← Quick captures, unsorted
├── 01-Daily/          ← Daily notes (auto-created)
├── 02-Learning/       ← Study notes, tutorials
├── 03-Office/         ← Work-related notes
├── 04-Projects/       ← Project documentation
├── 05-References/     ← Saved articles, guides
├── 06-Reviews/        ← Weekly/monthly reviews
├── 07-Agent-Memory/   ← AI context files (important!)
│   ├── preferences.md
│   ├── goals.md
│   └── agent-context.md
└── 99-System/         ← Templates, config, guides
    ├── templates/
    └── void-guide/    ← This documentation
```

## Why Numbers?

| Reason | Explanation |
|--------|-------------|
| **Sorting** | Folders stay in consistent order |
| **Priority** | Lower numbers = more frequently used |
| **Expandable** | Add new folders between existing ones |
| **99 = System** | Always stays at bottom |

## Number Ranges

```
00-09  → Quick access (Inbox, Daily)
10-29  → Personal (Learning, Health, Finance)
30-49  → Work (Office, Projects, Clients)
50-69  → Reference (Articles, Books, Resources)
70-89  → AI/Automation (Agent Memory)
90-99  → System (Templates, Config)
```

## Each Folder Explained

### 00-Inbox
**Purpose:** Capture first, organize later
- Dump quick thoughts here
- Process weekly - move to proper folders
- Keep it clean (under 20 files)

### 01-Daily
**Purpose:** Daily notes
- One file per day: `2026-02-05.md`
- Auto-created by /plan or /log commands
- Contains: Plan, Tasks, Log, Notes sections

### 02-Learning
**Purpose:** Study and learning notes
- Tutorial notes
- Course materials
- Things you're learning

### 03-Office
**Purpose:** Work-related notes
- Meeting notes
- Work documentation
- Professional stuff

### 04-Projects
**Purpose:** Project documentation
- One subfolder per project
- Project plans, notes, resources
- Active and archived projects

### 05-References
**Purpose:** External content
- Saved articles
- How-to guides
- Reference materials

### 06-Reviews
**Purpose:** Reflection and review
- Weekly reviews: `2026-W05-review.md`
- Monthly reviews: `2026-02-review.md`
- Yearly reviews

### 07-Agent-Memory
**Purpose:** AI context (IMPORTANT!)
- `preferences.md` - Your work style, schedule
- `goals.md` - Current goals and priorities
- `agent-context.md` - Important decisions, patterns

**The Agent reads these files to understand you better!**

### 99-System
**Purpose:** System files
- Templates for new notes
- Configuration
- This guide

---

## Adding New Folders

You can add any folders you need:

| Need | Create |
|------|--------|
| Health tracking | `08-Health/` |
| Finance notes | `09-Finance/` |
| Client folders | `10-Clients/` |
| Book notes | `11-Books/` |
| Meeting notes | `12-Meetings/` |

**How to add in Obsidian:**
1. Right-click in file explorer
2. New folder
3. Name it with number prefix: `08-Health`

---

## Best Practices

1. **Use Inbox** - Capture fast, organize later
2. **Daily notes** - Log throughout the day
3. **Update Agent Memory** - Keep preferences/goals current
4. **Review weekly** - Process Inbox, update goals
5. **Keep flat** - Avoid deep nesting (max 2 levels)

---

## File Naming

| Type | Format | Example |
|------|--------|---------|
| Daily note | `YYYY-MM-DD.md` | `2026-02-05.md` |
| Weekly review | `YYYY-W##-review.md` | `2026-W05-review.md` |
| Project | `project-name.md` | `void-project.md` |
| General | `descriptive-name.md` | `meeting-notes-client.md` |
