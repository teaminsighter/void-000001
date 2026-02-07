"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import QuickPrompts from "./QuickPrompts";

// Web Speech API types (browser-only)
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ChatPanelProps {
  initialMessages?: Message[];
}

export default function ChatPanel({ initialMessages = [] }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSendRef = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to /api/chat
  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!text) setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await response.json();
        const replyText =
          data.reply || data.error || "Sorry, something went wrong.";

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // If voice (TTS) is enabled, speak the response
        if (voiceEnabled) {
          speakText(replyText);
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Failed to connect"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, voiceEnabled],
  );

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      setTranscript(transcriptText);

      if (result.isFinal) {
        pendingSendRef.current = true;
        setTranscript(transcriptText);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Handle sending transcript after recognition ends
  useEffect(() => {
    if (!isListening && pendingSendRef.current && transcript) {
      pendingSendRef.current = false;
      const text = transcript;
      setTranscript("");
      sendMessage(text);
    }
  }, [isListening, transcript, sendMessage]);

  // Speak text via ElevenLabs
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        // Disable TTS automatically if the service is unavailable
        console.warn("TTS unavailable (status " + response.status + "), disabling voice responses");
        setVoiceEnabled(false);
        setIsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.warn("TTS error, disabling voice responses:", err);
      setVoiceEnabled(false);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isLoading) {
      setTranscript("");
      pendingSendRef.current = false;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleStartVoice = () => {
    setVoiceEnabled(true);
    startListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} />

      {/* Messages area */}
      <div className="flex-1 overflow-auto" style={{ padding: "16px 20px" }}>
        {messages.length === 0 ? (
          /* ── Jarvis-style empty state ── */
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: "var(--void-faint)" }}
          >
            {/* Pulsing icon */}
            <div
              className={isListening ? "void-icon-listening" : "void-icon-idle"}
              style={{
                fontSize: 56,
                marginBottom: 20,
                color: isListening ? "var(--status-urgent)" : "var(--void-accent)",
                transition: "color 0.3s",
              }}
            >
              ◉
            </div>

            {/* Greeting */}
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
              Type or speak to begin.
            </div>

            {/* Start Voice button */}
            {speechSupported && (
              <button
                onClick={handleStartVoice}
                className="void-mic-btn"
                style={{
                  width: "auto",
                  height: "auto",
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  gap: 8,
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 28,
                  background: "var(--void-accent)",
                  color: "var(--void-bg)",
                }}
              >
                <span style={{ fontSize: 16 }}>🎤</span>
                Start Voice
              </button>
            )}

            {/* Quick prompt pills */}
            <div className="flex gap-2 flex-wrap justify-center" style={{ maxWidth: 360 }}>
              {["Plan my day", "Search vault", "Check email", "Quick log"].map(
                (prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      sendMessage(prompt);
                    }}
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

      {/* Voice status indicator */}
      {(isListening || isSpeaking) && (
        <div
          className="animate-fadeIn"
          style={{
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: isListening ? "var(--status-urgent)" : "var(--status-info)",
            borderTop: "1px solid var(--void-border)",
            background: "var(--void-sidebar-bg)",
          }}
        >
          <span style={{ fontSize: 10 }}>
            {isListening ? "🔴" : "🔊"}
          </span>
          <span style={{ fontWeight: 600 }}>
            {isListening ? "Listening..." : "Speaking..."}
          </span>
          {isListening && transcript && (
            <span style={{ color: "var(--void-muted)", fontStyle: "italic" }}>
              &quot;{transcript}&quot;
            </span>
          )}
        </div>
      )}

      {/* Input area */}
      <div
        className="border-t"
        style={{
          padding: "12px 20px",
          background: "var(--void-sidebar-bg)",
          borderColor: "var(--void-border)",
        }}
      >
        {/* Quick prompts (only when there are messages) */}
        {messages.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <QuickPrompts onSelect={(prompt) => setInput(prompt)} />
          </div>
        )}

        {/* Input row */}
        <div className="flex gap-2 items-center">
          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`void-mic-btn ${isListening ? "void-mic-active" : ""}`}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              🎤
            </button>
          )}

          <input
            value={isListening ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? "Listening..." : "Tell your agent what to do..."
            }
            disabled={isLoading || isListening}
            readOnly={isListening}
            className="flex-1 outline-none"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${isListening ? "var(--status-urgent)" : "var(--void-border)"}`,
              background: "var(--void-surface)",
              color: "var(--void-white)",
              fontSize: 13,
              fontFamily: "inherit",
              opacity: isLoading ? 0.5 : 1,
              transition: "border-color 0.2s",
            }}
          />

          {/* TTS toggle */}
          {speechSupported && (
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className="void-mic-btn"
              title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
              style={{
                color: voiceEnabled ? "var(--void-accent)" : undefined,
                background: voiceEnabled
                  ? "rgba(245, 158, 11, 0.1)"
                  : undefined,
              }}
            >
              🔊
            </button>
          )}

          <button
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && !isListening)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--void-accent)",
              color: "var(--void-bg)",
              fontSize: 12,
              fontWeight: 700,
              cursor:
                isLoading || (!input.trim() && !isListening)
                  ? "not-allowed"
                  : "pointer",
              fontFamily: "inherit",
              opacity: isLoading || (!input.trim() && !isListening) ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
