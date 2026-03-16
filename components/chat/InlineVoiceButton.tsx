"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InlineVoiceButtonProps {
  onTranscript: (text: string) => void;
  onLiveTranscript?: (text: string) => void;
  disabled?: boolean;
}

export default function InlineVoiceButton({
  onTranscript,
  onLiveTranscript,
  disabled,
}: InlineVoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  // Check support on client side only
  useEffect(() => {
    setIsMounted(true);
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);

    // Send final transcript
    if (finalTranscriptRef.current.trim()) {
      onTranscript(finalTranscriptRef.current.trim());
    }

    setTranscript("");
    finalTranscriptRef.current = "";
    onLiveTranscript?.("");
  }, [onTranscript, onLiveTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported || disabled) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText.trim();
      const displayText = (finalText + interimTranscript).trim();
      setTranscript(displayText);
      onLiveTranscript?.(displayText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        stopListening();
      }
    };

    recognition.onend = () => {
      // Don't auto-restart, let user control
      if (isListening) {
        stopListening();
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      setTranscript("");
      finalTranscriptRef.current = "";
    } catch (err) {
      console.error("Failed to start recognition:", err);
    }
  }, [isSupported, disabled, isListening, stopListening, onLiveTranscript]);

  const toggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!isMounted) {
    return (
      <button
        disabled
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: "1px solid var(--void-border)",
          background: "var(--void-surface)",
          color: "var(--void-dim)",
          fontSize: 16,
          cursor: "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          opacity: 0.5,
        }}
      >
        <MicIcon color="var(--void-dim)" />
      </button>
    );
  }

  if (!isSupported) {
    return null;
  }

  const buttonColor = isListening ? "#3b82f6" : "var(--void-surface)";
  const borderColor = isListening ? "#3b82f6" : "var(--void-border)";
  const iconColor = isListening ? "#fff" : "var(--void-dim)";

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={toggle}
        disabled={disabled}
        title={isListening ? "Click to stop & send" : "Click to speak"}
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          background: buttonColor,
          color: iconColor,
          fontSize: 16,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          opacity: disabled ? 0.4 : 1,
          boxShadow: isListening ? "0 0 12px rgba(59, 130, 246, 0.5)" : "none",
        }}
      >
        {isListening ? <PulsingMic /> : <MicIcon color={iconColor} />}
      </button>

      {/* Live transcript popup */}
      {isListening && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
            padding: "8px 12px",
            background: "var(--void-bg)",
            border: "2px solid #3b82f6",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--void-white)",
            minWidth: 180,
            maxWidth: 280,
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Listening...
          </div>
          <div
            style={{
              minHeight: 18,
              color: transcript ? "var(--void-white)" : "var(--void-dim)",
              fontStyle: transcript ? "normal" : "italic",
              wordBreak: "break-word",
            }}
          >
            {transcript || "Start speaking..."}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "var(--void-dim)",
              marginTop: 4,
            }}
          >
            Click button to send
          </div>
        </div>
      )}
    </div>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function PulsingMic() {
  return (
    <div style={{ position: "relative" }}>
      <div
        className="voice-pulse"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.3)",
        }}
      />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ position: "relative", zIndex: 1 }}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </div>
  );
}
