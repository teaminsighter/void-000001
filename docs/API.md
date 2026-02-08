# Void API Documentation

## Base URL

- **Local**: `http://localhost:3000/api`
- **Production**: `https://void.insighter.digital/api`

---

## Health Check

### `GET /api/health`

Check system health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1706918400000,
  "version": "0.1.0",
  "services": {
    "dashboard": true,
    "n8n": true,
    "khoj": true,
    "vault": true
  }
}
```

---

## Chat

### `POST /api/chat`

Send a message to the AI agent. The chat route automatically:
1. Searches Khoj for relevant vault context
2. Builds a system prompt with context
3. Calls Claude API
4. Parses action blocks from the response
5. Executes actions (direct for log/memory/save, n8n for plan/email/remind/crm)

**Request:**
```json
{
  "message": "Plan my day, 4 hours office",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "reply": "Here's your plan for today...",
  "actions": [
    { "action": "plan", "success": true, "data": { "message": "Plan created" } }
  ],
  "context": {
    "searchResults": 3,
    "files": ["07-Agent-Memory/preferences.md"]
  }
}
```

### Action Routing

| Action Type | Execution | Description |
|-------------|-----------|-------------|
| `log` | **Direct** (vault filesystem) | Append to daily note |
| `memory` | **Direct** (vault filesystem) | Save to agent memory files |
| `save` | **Direct** (vault filesystem) | Create new vault file |
| `plan` | n8n webhook | Create daily plan |
| `email` | n8n webhook | Read/send email |
| `remind` | n8n webhook | Schedule reminder |
| `crm` | n8n webhook | Query/update CRM |

---

## Search

### `POST /api/search`

Search the vault using Khoj semantic search.

**Request:**
```json
{
  "query": "marketing strategy",
  "type": "markdown",
  "limit": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "entry": "Q1 marketing strategy focuses on...",
      "file": "03-Office/q1-marketing-plan.md",
      "score": 0.95
    }
  ],
  "count": 1
}
```

---

## Planner

### `GET /api/planner`

Get today's tasks parsed from the daily note.

**Response:**
```json
{
  "tasks": [
    {
      "id": "1",
      "text": "Review marketing plan",
      "tag": "Office",
      "priority": "high",
      "done": false
    }
  ],
  "date": "2026-02-07"
}
```

---

## Speech

### `POST /api/speech`

Convert text to speech via ElevenLabs.

**Request:**
```json
{
  "text": "Good morning, here's your plan for today..."
}
```

**Response:** Audio stream (mp3)

---

## Practice

### `POST /api/practice`

Practice/conversation mode with Claude.

**Request:**
```json
{
  "message": "Let's practice presenting my quarterly review",
  "history": []
}
```

**Response:**
```json
{
  "reply": "Great! Let's start..."
}
```

---

## Vault Operations

### `GET /api/vault/list`

List files in the vault.

**Query Parameters:**
- `folder` (optional): Filter by folder path

**Response:**
```json
{
  "files": [
    {
      "name": "2026-02-03.md",
      "folder": "01-Daily",
      "modified": "Today 6:30 PM",
      "size": "2.1 KB",
      "path": "01-Daily/2026-02-03.md"
    }
  ]
}
```

### `POST /api/vault/read`

Read a file from the vault.

**Request:**
```json
{
  "path": "01-Daily/2026-02-03.md"
}
```

**Response:**
```json
{
  "content": "# 2026-02-03 — Monday\n\n## Plan\n...",
  "metadata": {
    "modified": "2026-02-03T18:30:00Z",
    "size": 2150
  }
}
```

### `POST /api/vault/write`

Write a file to the vault.

**Request:**
```json
{
  "path": "01-Daily/2026-02-03.md",
  "content": "# Updated content...",
  "mode": "overwrite"
}
```

**Response:**
```json
{
  "success": true,
  "path": "01-Daily/2026-02-03.md"
}
```

---

## Actions

### `POST /api/action/log`

Add a quick log entry. **Writes directly to vault** (no n8n).

**Request:**
```json
{
  "text": "Finished the marketing review"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged to daily note"
}
```

### `POST /api/action/memory`

Save to agent memory. **Writes directly to vault** (no n8n).

**Request:**
```json
{
  "type": "preference",
  "content": "User prefers morning meetings"
}
```

### `POST /api/action/plan`

Trigger daily plan creation via n8n.

**Request:**
```json
{
  "date": "2026-02-03",
  "input": "4 hours office, meeting at 2pm"
}
```

### `POST /api/action/email`

Email operations via n8n.

**Request:**
```json
{
  "action": "read",
  "limit": 10
}
```

### `POST /api/action/remind`

Schedule a reminder via n8n.

**Request:**
```json
{
  "message": "Prep for meeting",
  "time": "2026-02-03T13:30:00"
}
```

### `POST /api/action/crm`

CRM operations via n8n.

**Request:**
```json
{
  "action": "list",
  "filter": "active"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_REQUEST` — Missing or invalid parameters
- `NOT_FOUND` — Resource not found
- `UNAUTHORIZED` — Authentication required
- `SERVICE_UNAVAILABLE` — External service down
