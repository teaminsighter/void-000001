"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceAssistantProps {
  onCommand: (text: string) => Promise<string>;
  wakeWord?: string;
  autoListen?: boolean;
}

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

export default function VoiceAssistant({
  onCommand,
  wakeWord = "void",
  autoListen = false,
}: VoiceAssistantProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check for browser support
  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    return recognition;
  }, [isSupported]);

  // Start listening for wake word
  const startWakeWordDetection = useCallback(async () => {
    if (!isSupported || recognitionRef.current) return;

    try {
      // Get microphone access for volume visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for volume meter
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Volume visualization loop
      const updateVolume = () => {
        if (!analyserRef.current || state === "idle") return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 255);
        requestAnimationFrame(updateVolume);
      };

      const recognition = initRecognition();
      if (!recognition) return;

      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        const text = latestResult[0].transcript.toLowerCase().trim();

        // Check for wake word
        if (state === "idle" || state === "listening") {
          if (text.includes(wakeWord.toLowerCase()) || text.includes(`hey ${wakeWord.toLowerCase()}`)) {
            // Wake word detected - start command listening
            setState("listening");
            setTranscript("");
            updateVolume();

            // Extract command after wake word
            const wakeWordIndex = text.indexOf(wakeWord.toLowerCase());
            const afterWakeWord = text.substring(wakeWordIndex + wakeWord.length).trim();

            if (afterWakeWord && latestResult.isFinal) {
              handleCommand(afterWakeWord);
            }
          } else if (state === "listening" && latestResult.isFinal && text.length > 0) {
            // Already listening, process the command
            handleCommand(text);
          } else if (state === "listening") {
            // Show interim results
            setTranscript(text);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setError(`Voice error: ${event.error}`);
          setState("error");
        }
      };

      recognition.onend = () => {
        // Restart recognition if still enabled
        if (isEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        }
      };

      recognition.start();
      setState("idle");
    } catch (err) {
      console.error("Failed to start voice assistant:", err);
      setError("Microphone access denied");
      setState("error");
    }
  }, [isSupported, initRecognition, wakeWord, state, isEnabled]);

  // Handle voice command
  const handleCommand = async (command: string) => {
    setState("processing");
    setTranscript(command);

    try {
      // Send command to AI
      const responseText = await onCommand(command);
      setResponse(responseText);

      // Speak the response
      await speakResponse(responseText);
    } catch (err) {
      console.error("Command error:", err);
      setError("Failed to process command");
      setState("error");
    }
  };

  // Text-to-speech using ElevenLabs
  const speakResponse = async (text: string) => {
    setState("speaking");

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setState("idle");
        speechSynthesis.speak(utterance);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setState("idle");
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("TTS error:", err);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setState("idle");
      speechSynthesis.speak(utterance);
    }
  };

  // Stop listening
  const stopListening = useCallback(() => {
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
    setIsEnabled(false);
  }, []);

  // Toggle voice assistant
  const toggleVoice = useCallback(() => {
    if (isEnabled) {
      stopListening();
    } else {
      setIsEnabled(true);
      startWakeWordDetection();
    }
  }, [isEnabled, stopListening, startWakeWordDetection]);

  // Manual push-to-talk
  const startManualListen = useCallback(() => {
    if (!isEnabled) {
      setIsEnabled(true);
    }
    setState("listening");
    setTranscript("");
    startWakeWordDetection();
  }, [isEnabled, startWakeWordDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoListen && !isEnabled) {
      setIsEnabled(true);
      startWakeWordDetection();
    }
  }, [autoListen, isEnabled, startWakeWordDetection]);

  if (!isSupported) {
    return (
      <div className="voice-unsupported" style={{ padding: 16, color: "var(--void-muted)", fontSize: 12 }}>
        Voice commands not supported in this browser
      </div>
    );
  }

  return (
    <div className="voice-assistant">
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Main Voice Button */}
      <motion.button
        onClick={toggleVoice}
        className="voice-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background: isEnabled
            ? state === "listening"
              ? "var(--void-accent)"
              : state === "processing"
              ? "var(--void-warning)"
              : state === "speaking"
              ? "var(--void-success)"
              : "var(--void-surface)"
            : "var(--void-surface)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: isEnabled ? "0 0 20px var(--void-accent)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* Pulse ring when listening */}
        <AnimatePresence>
          {state === "listening" && (
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px solid var(--void-accent)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Volume indicator */}
        {state === "listening" && (
          <motion.div
            style={{
              position: "absolute",
              width: `${100 + volume * 40}%`,
              height: `${100 + volume * 40}%`,
              borderRadius: "50%",
              background: "var(--void-accent)",
              opacity: 0.2,
            }}
          />
        )}

        {/* Icon */}
        <VoiceIcon state={state} isEnabled={isEnabled} />
      </motion.button>

      {/* Status indicator */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 10,
              color: "var(--void-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {state === "idle" && `Say "${wakeWord}" to start`}
            {state === "listening" && "Listening..."}
            {state === "processing" && "Processing..."}
            {state === "speaking" && "Speaking..."}
            {state === "error" && error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript display */}
      <AnimatePresence>
        {transcript && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 12,
              padding: 12,
              background: "var(--void-surface)",
              borderRadius: 8,
              border: "1px solid var(--void-border)",
              fontSize: 13,
              color: "var(--void-text)",
              maxWidth: 280,
            }}
          >
            <div style={{ fontSize: 9, color: "var(--void-muted)", marginBottom: 4, textTransform: "uppercase" }}>
              {state === "processing" ? "Command" : "You said"}
            </div>
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response display */}
      <AnimatePresence>
        {response && (state === "speaking" || state === "idle") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 8,
              padding: 12,
              background: "var(--void-accent-bg)",
              borderRadius: 8,
              border: "1px solid var(--void-accent)",
              fontSize: 13,
              color: "var(--void-text)",
              maxWidth: 280,
            }}
          >
            <div style={{ fontSize: 9, color: "var(--void-accent)", marginBottom: 4, textTransform: "uppercase" }}>
              VOID Response
            </div>
            {response.length > 150 ? response.slice(0, 150) + "..." : response}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Voice icon component
function VoiceIcon({ state, isEnabled }: { state: VoiceState; isEnabled: boolean }) {
  const color = isEnabled
    ? state === "error"
      ? "var(--void-error)"
      : "var(--void-white)"
    : "var(--void-muted)";

  if (state === "speaking") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <motion.path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
        />
      </svg>
    );
  }

  if (state === "processing") {
    return (
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="40 60" />
      </motion.svg>
    );
  }

  // Default microphone icon
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// Type declarations in types/speech.d.ts
