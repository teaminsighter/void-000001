"use client";

import { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className="flex mb-3"
      style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: 10,
          background: isUser ? "rgba(245, 158, 11, 0.08)" : "#111218",
          border: `1px solid ${isUser ? "rgba(245, 158, 11, 0.15)" : "#1a1b20"}`,
        }}
      >
        {/* Label */}
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            color: isUser ? "#f59e0b" : "#52525b",
            fontWeight: 600,
            marginBottom: 4,
            letterSpacing: 0.5,
          }}
        >
          {isUser ? "YOU" : "AGENT"}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: 12.5,
            color: "#d4d4d8",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
