"use client";

import { Message } from "@/lib/types";
import ToolActions from "./ToolActions";
import SpeakButton from "./SpeakButton";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className="flex flex-col mb-3"
      style={{ alignItems: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: 10,
          background: isUser ? "rgba(245, 158, 11, 0.08)" : "var(--void-surface)",
          border: `1px solid ${isUser ? "rgba(245, 158, 11, 0.15)" : "var(--void-border)"}`,
        }}
      >
        {/* Label */}
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: isUser ? "var(--void-accent)" : "var(--void-faint)",
            fontWeight: 600,
            marginBottom: 4,
            letterSpacing: 0.5,
          }}
        >
          {isUser ? "YOU" : "AGENT"}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: 6 }}>
            {message.attachments.map((att) => (
              <div key={att.id}>
                {att.type === "image" ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    style={{
                      maxWidth: 200,
                      maxHeight: 150,
                      borderRadius: 6,
                      border: "1px solid var(--void-border)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--void-border)",
                      fontSize: 11,
                      color: "var(--void-dim)",
                    }}
                  >
                    <span>📄</span>
                    <span>{att.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            fontSize: 12.5,
            color: "var(--void-text)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </div>

        {/* Unsaved indicator */}
        {message.unsaved && (
          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              color: "rgba(245, 158, 11, 0.7)",
            }}
          >
            Not saved — will be lost on reload
          </div>
        )}

        {/* Speak button for assistant messages */}
        {!isUser && (
          <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
            <SpeakButton text={message.content} />
          </div>
        )}
      </div>

      {/* Tool actions (assistant only) */}
      {!isUser && message.actions && message.actions.length > 0 && (
        <div style={{ maxWidth: "70%" }}>
          <ToolActions actions={message.actions} />
        </div>
      )}
    </div>
  );
}
