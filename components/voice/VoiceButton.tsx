"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onResponse?: (text: string) => void;
  size?: "sm" | "md" | "lg";
  showTranscript?: boolean;
  speakResponse?: boolean;
}

type VoiceState = "idle" | "listening" | "processing" | "speaking";

export default function VoiceButton({
  onTranscript,
  onResponse,
  size = "md",
  showTranscript = true,
  speakResponse = true,
}: VoiceButtonProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Check browser support
  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  // Update volume visualization
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setVolume(avg / 255);

    if (state === "listening") {
      animationRef.current = requestAnimationFrame(updateVolume);
    }
  }, [state]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) return;

    try {
      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setState("listening");
        setTranscript("");
        updateVolume();
      };

      recognition.onresult = (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        const text = latestResult[0].transcript;

        setTranscript(text);

        if (latestResult.isFinal) {
          setState("processing");
          onTranscript(text);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
      };

      recognition.onend = () => {
        if (state === "listening") {
          stopListening();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start listening:", err);
    }
  }, [isSupported, onTranscript, state, updateVolume]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setState("idle");
    setVolume(0);
  }, []);

  // Speak text using ElevenLabs
  const speak = useCallback(async (text: string) => {
    if (!speakResponse) return;

    setState("speaking");

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setState("idle");
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.error("TTS error:", err);
    }

    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setState("idle");
    speechSynthesis.speak(utterance);
  }, [speakResponse]);

  // Handle response from parent
  useEffect(() => {
    if (onResponse) {
      // Parent component can call speak through this ref
    }
  }, [onResponse]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Size configurations
  const sizes = {
    sm: { button: 40, icon: 18 },
    md: { button: 52, icon: 22 },
    lg: { button: 64, icon: 28 },
  };

  const { button: buttonSize, icon: iconSize } = sizes[size];

  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-button-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {/* Main Button */}
      <motion.button
        onClick={state === "idle" ? startListening : stopListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: "50%",
          border: "none",
          background:
            state === "listening"
              ? "var(--void-accent)"
              : state === "processing"
              ? "var(--void-warning)"
              : state === "speaking"
              ? "var(--void-success)"
              : "var(--void-surface)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow:
            state === "listening"
              ? "0 0 20px var(--void-accent)"
              : state === "speaking"
              ? "0 0 20px var(--void-success)"
              : "0 2px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Pulse animation when listening */}
        <AnimatePresence>
          {state === "listening" && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "var(--void-accent)",
                }}
              />
              {/* Volume-reactive ring */}
              <motion.div
                style={{
                  position: "absolute",
                  width: `${100 + volume * 50}%`,
                  height: `${100 + volume * 50}%`,
                  borderRadius: "50%",
                  background: "var(--void-accent)",
                  opacity: 0.3,
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <MicIcon state={state} size={iconSize} />
      </motion.button>

      {/* Status text */}
      <AnimatePresence>
        {state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              fontSize: 10,
              color: "var(--void-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {state === "listening" && "Listening..."}
            {state === "processing" && "Processing..."}
            {state === "speaking" && "Speaking..."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript bubble */}
      <AnimatePresence>
        {showTranscript && transcript && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{
              position: "absolute",
              bottom: "100%",
              marginBottom: 12,
              padding: "8px 12px",
              background: "var(--void-surface)",
              border: "1px solid var(--void-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--void-text)",
              maxWidth: 200,
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mic icon component
function MicIcon({ state, size }: { state: VoiceState; size: number }) {
  const color = state === "idle" ? "var(--void-muted)" : "var(--void-white)";

  if (state === "speaking") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <motion.path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
        />
      </svg>
    );
  }

  if (state === "processing") {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="40 60" />
        </svg>
      </motion.div>
    );
  }

  // Default mic icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// Export speak function for external use
export async function speakText(text: string): Promise<void> {
  try {
    const response = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.play();
      });
    }
  } catch (err) {
    console.error("TTS error:", err);
  }

  // Fallback
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

// Type declarations in types/speech.d.ts
