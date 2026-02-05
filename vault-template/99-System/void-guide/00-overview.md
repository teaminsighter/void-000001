---
updated: 2026-02-05
type: system-guide
---

# VOID System Overview

VOID is your personal AI operating system - a dashboard that connects your notes, AI assistant, and automations in one place.

## What is VOID?

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOU (Boss)                               │
│                                                                  │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│     │ Dashboard│    │ Telegram │    │ Obsidian │                │
│     │ (Brain)  │    │ (Quick)  │    │ (Deep)   │                │
│     └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│          │               │               │                       │
│          └───────────────┼───────────────┘                       │
│                          ▼                                       │
│                   ┌─────────────┐                                │
│                   │    VAULT    │  ← Your knowledge (md files)   │
│                   └─────────────┘                                │
│                          │                                       │
│          ┌───────────────┼───────────────┐                       │
│          ▼               ▼               ▼                       │
│     ┌─────────┐    ┌──────────┐    ┌──────────┐                 │
│     │  Khoj   │    │   n8n    │    │  Claude  │                 │
│     │ (Search)│    │ (Automate)│   │   (AI)   │                 │
│     └─────────┘    └──────────┘    └──────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

| Component | What it does |
|-----------|--------------|
| **Dashboard** | Web interface to control everything |
| **Vault** | Your notes (markdown files in folders) |
| **Agent** | AI assistant (Claude) that reads your vault |
| **n8n** | Automation workflows (Telegram, scheduled tasks) |
| **Khoj** | Semantic search across your vault |
| **Obsidian** | Visual editor for your notes |

## Entry Points

| How to access | Best for |
|---------------|----------|
| **localhost:3000** | Full dashboard control |
| **Telegram Bot** | Quick commands on the go |
| **Obsidian app** | Deep note editing |

## Quick Start

1. **Morning**: `/plan 4h work` in Telegram
2. **During day**: `/log finished task X` in Telegram
3. **Anytime**: Search and chat in Dashboard
4. **Evening**: Review notes in Obsidian

---

*See other guides in this folder for detailed instructions.*
