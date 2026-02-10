"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, ToolAction, Attachment } from "@/lib/types";
import { emitDataChanged, toolToEventType } from "@/lib/events";
import ChatMessage from "./ChatMessage";
import QuickPrompts from "./QuickPrompts";
import VoiceButton from "./VoiceButton";
import FileUpload from "./FileUpload";

interface ChatPanelProps {
  conversationId?: string | null;
  onConversationChange?: (id: string) => void;
  onNewChat?: () => void;
}

export default function ChatPanel({
  conversationId,
  onConversationChange,
  onNewChat,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeConvRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (conversationId && conversationId !== activeConvRef.current) {
      activeConvRef.current = conversationId;
      loadConversation(conversationId);
    } else if (!conversationId) {
      activeConvRef.current = null;
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const loaded: Message[] = (data.messages || []).map(
        (m: { id: string; role: "user" | "assistant"; content: string; created_at: string }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })
      );
      setMessages(loaded);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const persistMessage = async (
    convId: string,
    msg: { id: string; role: "user" | "assistant"; content: string }
  ) => {
    try {
      await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error("Failed to persist message:", err);
    }
  };

  const ensureConversation = useCallback(
    async (firstMessage: string): Promise<string> => {
      if (activeConvRef.current) return activeConvRef.current;

      const id = crypto.randomUUID();
      const title = firstMessage.slice(0, 80) || "New conversation";

      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      });

      activeConvRef.current = id;
      onConversationChange?.(id);
      return id;
    },
    [onConversationChange]
  );

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const currentAttachments = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
      attachments: currentAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!text) setInput("");
    setPendingAttachments([]);
    setIsLoading(true);

    const aiMessageId = crypto.randomUUID();

    try {
      const convId = await ensureConversation(messageText);

      await persistMessage(convId, {
        id: userMessage.id,
        role: "user",
        content: userMessage.content,
      });

      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const chatPayload = {
        message: messageText,
        history: historyPayload,
        attachments: currentAttachments,
      };

      // Try streaming first
      let streamed = false;
      try {
        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatPayload),
        });

        if (response.ok && response.body) {
          streamed = true;
          let streamedText = "";
          const streamActions: ToolAction[] = [];

          // Add placeholder assistant message
          setMessages((prev) => [
            ...prev,
            { id: aiMessageId, role: "assistant", content: "", timestamp: new Date() },
          ]);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            let eventType = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7);
              } else if (line.startsWith("data: ") && eventType) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (eventType === "token") {
                    streamedText += data.text;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMessageId ? { ...m, content: streamedText } : m
                      )
                    );
                  } else if (eventType === "tool_done") {
                    streamActions.push({
                      tool: data.tool,
                      input: {},
                      result: data.result,
                      success: data.success,
                    });
                  } else if (eventType === "done") {
                    // Merge final actions
                    const finalActions = data.actions?.length > 0
                      ? data.actions.map((a: ToolAction) => ({
                          tool: a.tool,
                          input: a.input,
                          result: a.result,
                          success: a.success,
                        }))
                      : streamActions.length > 0
                      ? streamActions
                      : undefined;

                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMessageId
                          ? { ...m, content: streamedText, actions: finalActions }
                          : m
                      )
                    );

                    // Emit data-changed events
                    if (finalActions) {
                      const emitted = new Set<string>();
                      for (const action of finalActions) {
                        const eventT = toolToEventType(action.tool);
                        if (eventT && !emitted.has(eventT)) {
                          emitted.add(eventT);
                          emitDataChanged(eventT, action.tool);
                        }
                      }
                    }
                  }
                } catch {
                  // Skip malformed JSON
                }
                eventType = "";
              }
            }
          }

          // Persist
          await persistMessage(convId, {
            id: aiMessageId,
            role: "assistant",
            content: streamedText || "...",
          });
        }
      } catch {
        // Stream failed, fall through to non-streaming
      }

      // Fallback to non-streaming
      if (!streamed) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatPayload),
        });

        const data = await response.json();

        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: data.reply || data.error || "Sorry, something went wrong.",
          timestamp: new Date(),
          actions: data.actions || undefined,
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (data.actions) {
          const emitted = new Set<string>();
          for (const action of data.actions as ToolAction[]) {
            const eventType = toolToEventType(action.tool);
            if (eventType && !emitted.has(eventType)) {
              emitted.add(eventType);
              emitDataChanged(eventType, action.tool);
            }
          }
        }

        await persistMessage(convId, {
          id: aiMessage.id,
          role: "assistant",
          content: aiMessage.content,
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to connect"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    activeConvRef.current = null;
    setMessages([]);
    setInput("");
    onNewChat?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-auto" style={{ padding: "16px 20px" }}>
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: "var(--void-faint)" }}
          >
            <div
              className="void-icon-idle"
              style={{
                fontSize: 56,
                marginBottom: 20,
                color: "var(--void-accent)",
              }}
            >
              ◉
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--void-white)",
                marginBottom: 4,
              }}
            >
              Hi, I&apos;m Void.
            </div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>
              Type to begin.
            </div>

            {/* Quick prompt pills */}
            <div
              className="flex gap-2 flex-wrap justify-center"
              style={{ maxWidth: 360 }}
            >
              {["Plan my day", "Search vault", "Check email", "Quick log"].map(
                (prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="void-hover-row"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: "1px solid var(--void-border)",
                      background: "var(--void-surface)",
                      color: "var(--void-dim)",
                      fontSize: 11.5,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {prompt}
                  </button>
                ),
              )}
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
                    background: "var(--void-surface)",
                    border: "1px solid var(--void-border)",
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      color: "var(--void-faint)",
                      fontWeight: 600,
                      marginBottom: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    AGENT
                  </div>
                  <div
                    className="flex items-center gap-1"
                    style={{ fontSize: 12.5, color: "var(--void-faint)" }}
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
          background: "var(--void-sidebar-bg)",
          borderColor: "var(--void-border)",
        }}
      >
        {/* Quick prompts + New Chat */}
        {messages.length > 0 && (
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <QuickPrompts onSelect={(prompt) => setInput(prompt)} />
            <button
              onClick={handleNewChat}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid var(--void-border)",
                background: "transparent",
                color: "var(--void-dim)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                marginLeft: 8,
              }}
              className="void-hover-row"
            >
              + New Chat
            </button>
          </div>
        )}

        {/* Pending attachments preview */}
        {pendingAttachments.length > 0 && (
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: 8 }}>
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--void-surface)",
                  border: "1px solid var(--void-border)",
                  fontSize: 11,
                  color: "var(--void-dim)",
                }}
              >
                <span>{att.type === "image" ? "🖼" : "📄"}</span>
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {att.name}
                </span>
                <button
                  onClick={() => setPendingAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--void-faint)",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex gap-2">
          <FileUpload
            onUpload={(att) => setPendingAttachments((prev) => [...prev, att])}
            disabled={isLoading}
          />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell your agent what to do..."
            disabled={isLoading}
            autoFocus
            className="flex-1 outline-none"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--void-border)",
              background: "var(--void-surface)",
              color: "var(--void-white)",
              fontSize: 13,
              fontFamily: "inherit",
              opacity: isLoading ? 0.5 : 1,
            }}
          />
          <VoiceButton
            onTranscript={(text) => sendMessage(text)}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--void-accent)",
              color: "var(--void-bg)",
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
