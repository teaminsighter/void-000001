"use client";

import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@/lib/types";

interface AgentRightPanelProps {
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
}

export default function AgentRightPanel({
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: AgentRightPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, []);

  // Fetch on mount and when active conversation changes (new one may have been created)
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, activeConversationId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConversationId) {
        onNewChat?.();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--void-faint)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Chat History
        </div>
        <button
          onClick={onNewChat}
          className="void-hover-row"
          style={{
            padding: "3px 8px",
            borderRadius: 5,
            border: "1px solid var(--void-border)",
            background: "transparent",
            color: "var(--void-dim)",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + New
        </button>
      </div>

      {/* History list */}
      <div className="flex flex-col gap-1" style={{ flex: 1, overflowY: "auto" }}>
        {conversations.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{
              flex: 1,
              padding: "40px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: "var(--void-faint)",
                marginBottom: 12,
              }}
            >
              &#9673;
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--void-muted)",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              No conversations yet
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--void-faint)",
                lineHeight: 1.5,
              }}
            >
              Your chat history will appear here as you talk to the agent.
            </div>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation?.(conv.id)}
              className="void-hover-row"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  conv.id === activeConversationId
                    ? "var(--void-surface)"
                    : "transparent",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 2 }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color:
                      conv.id === activeConversationId
                        ? "var(--void-accent)"
                        : "var(--void-text)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {conv.title}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--void-faint)",
                    marginLeft: 8,
                    flexShrink: 0,
                  }}
                >
                  {formatTime(conv.updated_at)}
                </span>
              </div>
              <div
                className="flex items-center justify-between"
                style={{ marginTop: 2 }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--void-dim)",
                  }}
                >
                  {formatTime(conv.created_at)} ago
                </span>
                <span
                  onClick={(e) => handleDelete(e, conv.id)}
                  style={{
                    fontSize: 10,
                    color: "var(--void-faint)",
                    cursor: "pointer",
                    padding: "2px 4px",
                    borderRadius: 3,
                  }}
                  className="void-hover-row"
                >
                  ✕
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
