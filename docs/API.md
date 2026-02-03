# Void API Documentation

## Base URL

- **Local**: `http://localhost:3000/api`
- **Production**: `https://app.yourdomain.com/api`

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

Send a message to the AI agent.

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
    { "type": "plan", "payload": { "date": "2026-02-03" } }
  ]
}
```

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

### `POST /api/action/plan`

Trigger daily plan creation.

**Request:**
```json
{
  "date": "2026-02-03",
  "input": "4 hours office, meeting at 2pm"
}
```

### `POST /api/action/log`

Add a quick log entry.

**Request:**
```json
{
  "text": "Finished the marketing review"
}
```

### `POST /api/action/email`

Email operations.

**Request:**
```json
{
  "action": "read",
  "limit": 10
}
```

Or for sending:
```json
{
  "action": "send",
  "to": "email@example.com",
  "subject": "Subject",
  "body": "Email body..."
}
```

### `POST /api/action/remind`

Schedule a reminder.

**Request:**
```json
{
  "message": "Prep for meeting",
  "time": "2026-02-03T13:30:00"
}
```

### `POST /api/action/crm`

CRM operations.

**Request:**
```json
{
  "action": "list",
  "filter": "active"
}
```

### `POST /api/action/memory`

Save to agent memory.

**Request:**
```json
{
  "type": "preference",
  "content": "User prefers morning meetings"
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
