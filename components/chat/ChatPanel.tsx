"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import QuickPrompts from "./QuickPrompts";

interface ChatPanelProps {
  initialMessages?: Message[];
}

export default function ChatPanel({ initialMessages = [] }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (will be replaced with real API in Layer 4)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Processing: "${userMessage.content.slice(0, 50)}${userMessage.content.length > 50 ? "..." : ""}"

I've analyzed your request against your vault context and current priorities. Here's what I'll do:

1. Search vault for related context via Khoj
2. Execute the appropriate n8n workflow
3. Save results to your vault
4. Confirm completion

✓ Action queued. You'll see updates in real-time.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-auto" style={{ padding: "16px 20px" }}>
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: "#52525b" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>◉</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              Start a conversation
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Ask me to plan your day, search your vault, or automate tasks.
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex mb-3" style={{ justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#111218",
                    border: "1px solid #1a1b20",
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      color: "#52525b",
                      fontWeight: 600,
                      marginBottom: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    AGENT
                  </div>
                  <div
                    className="flex items-center gap-1"
                    style={{ fontSize: 12.5, color: "#52525b" }}
                  >
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div
        className="border-t"
        style={{
          padding: "12px 20px",
          background: "#0a0b0e",
          borderColor: "#1a1b20",
        }}
      >
        {/* Quick prompts */}
        <div style={{ marginBottom: 8 }}>
          <QuickPrompts onSelect={(prompt) => setInput(prompt)} />
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell your agent what to do..."
            disabled={isLoading}
            className="flex-1 outline-none"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #1a1b20",
              background: "#111218",
              color: "#fafafa",
              fontSize: 13,
              fontFamily: "inherit",
              opacity: isLoading ? 0.5 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#f59e0b",
              color: "#0c0d10",
              fontSize: 12,
              fontWeight: 700,
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isLoading || !input.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
