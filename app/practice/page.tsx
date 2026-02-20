"use client";

import { useState, useRef, useEffect } from "react";

// Uses global SpeechRecognition types from types/speech.d.ts

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PracticePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
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
            handleSendMessage(transcriptText);
            setTranscript("");
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setError(`Speech error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError("Speech recognition not supported in this browser");
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing && !isSpeaking) {
      setError("");
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Get AI response
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Speak the response
        await speakText(data.reply);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get response");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Speech generation failed");
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
      }
    } catch (err) {
      console.error("Speech error:", err);
      setIsSpeaking(false);
    }
  };

  const startConversation = () => {
    const greeting = "Hi! I'm Void, your English practice partner. Let's have a conversation! Tell me about your day or anything you'd like to talk about.";
    const assistantMessage: Message = { role: "assistant", content: greeting };
    setMessages([assistantMessage]);
    speakText(greeting);
  };

  const resetConversation = () => {
    setMessages([]);
    setTranscript("");
    setError("");
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="void-heading">
          English Practice
        </h1>
        <p className="void-subheading">
          Speak naturally. I'll help you improve your English.
        </p>
      </div>

      {/* Conversation Area */}
      <div
        style={{
          background: "var(--void-surface)",
          borderRadius: 12,
          border: "1px solid var(--void-border)",
          minHeight: 400,
          maxHeight: 500,
          overflow: "auto",
          marginBottom: 20,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 400,
              color: "var(--void-faint)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              Ready to practice English?
            </div>
            <button
              onClick={startConversation}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: "#34d399",
                color: "var(--void-bg)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Conversation
            </button>
          </div>
        ) : (
          <div style={{ padding: 16 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background:
                      msg.role === "user" ? "#f59e0b" : "#1a1b20",
                    color: msg.role === "user" ? "#0c0d10" : "#d4d4d8",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 4,
                      opacity: 0.7,
                    }}
                  >
                    {msg.role === "user" ? "YOU" : "VOID"}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Current transcript */}
      {transcript && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--void-surface)",
            borderRadius: 8,
            marginBottom: 16,
            color: "var(--void-muted)",
            fontSize: 14,
          }}
        >
          <span style={{ opacity: 0.5 }}>Hearing: </span>
          {transcript}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#ef44441a",
            borderRadius: 8,
            marginBottom: 16,
            color: "#ef4444",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Main speak button */}
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onMouseLeave={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={isProcessing || isSpeaking || messages.length === 0}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "none",
            background: isListening
              ? "#ef4444"
              : isProcessing
              ? "#52525b"
              : isSpeaking
              ? "#3b82f6"
              : "#34d399",
            color: "#fff",
            fontSize: 32,
            cursor:
              isProcessing || isSpeaking || messages.length === 0
                ? "not-allowed"
                : "pointer",
            transition: "all 0.2s",
            transform: isListening ? "scale(1.1)" : "scale(1)",
            boxShadow: isListening
              ? "0 0 20px rgba(239, 68, 68, 0.5)"
              : "none",
          }}
        >
          {isListening ? "🎤" : isProcessing ? "..." : isSpeaking ? "🔊" : "🎤"}
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 13,
          color: "var(--void-dim)",
        }}
      >
        {isListening
          ? "Listening... Release to send"
          : isProcessing
          ? "Thinking..."
          : isSpeaking
          ? "Speaking..."
          : messages.length === 0
          ? "Click 'Start Conversation' to begin"
          : "Hold the button to speak"}
      </div>

      {/* Actions */}
      {messages.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <button
            onClick={resetConversation}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid var(--void-border)",
              background: "transparent",
              color: "var(--void-dim)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            New Conversation
          </button>
          <button
            onClick={() => {
              const last = messages.filter((m) => m.role === "assistant").pop();
              if (last) speakText(last.content);
            }}
            disabled={isSpeaking}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid var(--void-border)",
              background: "transparent",
              color: "var(--void-dim)",
              fontSize: 12,
              cursor: isSpeaking ? "not-allowed" : "pointer",
            }}
          >
            Repeat Last
          </button>
        </div>
      )}

      {/* Tips */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "var(--void-surface)",
          borderRadius: 8,
          border: "1px solid var(--void-border)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--void-white)",
            marginBottom: 8,
          }}
        >
          Tips for Practice
        </div>
        <ul
          style={{
            fontSize: 12,
            color: "var(--void-dim)",
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.8,
          }}
        >
          <li>Speak naturally - don't worry about mistakes</li>
          <li>I'll gently correct errors in my responses</li>
          <li>Ask me to repeat if you didn't understand</li>
          <li>Talk about anything - your day, hobbies, opinions</li>
        </ul>
      </div>
    </div>
  );
}
