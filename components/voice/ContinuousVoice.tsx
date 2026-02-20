"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContinuousVoiceProps {
  onCommand: (text: string) => Promise<string>;
  wakeWord?: string;
  wakeResponse?: string;
}

type VoiceState = "off" | "waiting" | "wake_detected" | "listening" | "processing" | "speaking";

// Greetings the agent can say when wake word is detected
const WAKE_RESPONSES = [
  "Yes captain, what do you need?",
  "I'm here, what can I do?",
  "Yes, I'm listening.",
  "At your service.",
  "What's on your mind?",
  "Ready for your command.",
];

export default function ContinuousVoice({
  onCommand,
  wakeWord = "void",
  wakeResponse,
}: ContinuousVoiceProps) {
  const [state, setState] = useState<VoiceState>("off");
  const [transcript, setTranscript] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Get random wake response
  const getWakeResponse = useCallback(() => {
    return wakeResponse || WAKE_RESPONSES[Math.floor(Math.random() * WAKE_RESPONSES.length)];
  }, [wakeResponse]);

  // Speak text using ElevenLabs or browser TTS
  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
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
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.error("ElevenLabs TTS error:", err);
      }

      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }, []);

  // Update volume visualization
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setVolume(avg / 255);

    if (state === "waiting" || state === "listening") {
      animationRef.current = requestAnimationFrame(updateVolume);
    }
  }, [state]);

  // Start continuous listening
  const startListening = useCallback(async () => {
    if (!isSupported || recognitionRef.current) return;

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

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let commandBuffer = "";
      let isWaitingForCommand = false;

      recognition.onresult = async (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        const text = latestResult[0].transcript.toLowerCase().trim();

        // Waiting for wake word
        if (state === "waiting" && !isWaitingForCommand) {
          if (text.includes(wakeWord.toLowerCase()) || text.includes(`hey ${wakeWord.toLowerCase()}`)) {
            // Wake word detected!
            setState("wake_detected");
            isWaitingForCommand = true;

            // Speak acknowledgment
            setState("speaking");
            await speak(getWakeResponse());

            // Now listen for command
            setState("listening");
            setTranscript("");
            commandBuffer = "";
          }
        }
        // Listening for command after wake word
        else if ((state === "listening" || isWaitingForCommand) && latestResult.isFinal) {
          // Remove wake word from command if present
          let command = text;
          const wakeIndex = command.indexOf(wakeWord.toLowerCase());
          if (wakeIndex !== -1) {
            command = command.substring(wakeIndex + wakeWord.length).trim();
          }

          if (command.length > 0) {
            commandBuffer = command;
            setTranscript(command);
            setState("processing");
            isWaitingForCommand = false;

            // Process command
            try {
              const response = await onCommand(command);

              // Speak response
              setState("speaking");
              await speak(response);
            } catch (err) {
              console.error("Command error:", err);
              setState("speaking");
              await speak("Sorry, I couldn't process that command.");
            }

            // Back to waiting for wake word
            setState("waiting");
            setTranscript("");
            commandBuffer = "";
          }
        }
        // Show interim results while listening
        else if (state === "listening" || isWaitingForCommand) {
          let display = text;
          const wakeIndex = display.indexOf(wakeWord.toLowerCase());
          if (wakeIndex !== -1) {
            display = display.substring(wakeIndex + wakeWord.length).trim();
          }
          setTranscript(display);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech" && event.error !== "aborted") {
          // Restart on non-fatal errors
          setTimeout(() => {
            if (isEnabled && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Already running
              }
            }
          }, 100);
        }
      };

      recognition.onend = () => {
        // Restart if still enabled
        if (isEnabled) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Already running
              }
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setState("waiting");
      updateVolume();

    } catch (err) {
      console.error("Failed to start voice:", err);
    }
  }, [isSupported, isEnabled, wakeWord, state, speak, getWakeResponse, onCommand, updateVolume]);

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

    setState("off");
    setVolume(0);
    setIsEnabled(false);
  }, []);

  // Toggle voice assistant
  const toggle = useCallback(() => {
    if (isEnabled) {
      stopListening();
    } else {
      setIsEnabled(true);
    }
  }, [isEnabled, stopListening]);

  // Start when enabled
  useEffect(() => {
    if (isEnabled && !recognitionRef.current) {
      startListening();
    }
  }, [isEnabled, startListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="continuous-voice" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {/* Main Button */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: getButtonColor(state),
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: isEnabled ? `0 0 20px ${getButtonColor(state)}` : "0 2px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Pulse animation when active */}
        <AnimatePresence>
          {(state === "waiting" || state === "listening") && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: getButtonColor(state),
              }}
            />
          )}
        </AnimatePresence>

        {/* Volume ring */}
        {(state === "waiting" || state === "listening") && (
          <motion.div
            style={{
              position: "absolute",
              width: `${100 + volume * 40}%`,
              height: `${100 + volume * 40}%`,
              borderRadius: "50%",
              background: getButtonColor(state),
              opacity: 0.25,
            }}
          />
        )}

        {/* Icon */}
        <VoiceIcon state={state} />
      </motion.button>

      {/* Status */}
      <div
        style={{
          fontSize: 9,
          color: "var(--void-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          textAlign: "center",
          minHeight: 12,
        }}
      >
        {state === "off" && "Voice Off"}
        {state === "waiting" && `Say "${wakeWord}"`}
        {state === "wake_detected" && "Heard you!"}
        {state === "listening" && "Listening..."}
        {state === "processing" && "Processing..."}
        {state === "speaking" && "Speaking..."}
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (state === "listening" || state === "processing") && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              position: "absolute",
              bottom: "100%",
              marginBottom: 8,
              padding: "6px 10px",
              background: "var(--void-surface)",
              border: "1px solid var(--void-border)",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--void-text)",
              maxWidth: 180,
              textAlign: "center",
            }}
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getButtonColor(state: VoiceState): string {
  switch (state) {
    case "waiting":
      return "#3b82f6"; // blue - ready
    case "wake_detected":
    case "listening":
      return "#8b5cf6"; // purple - active
    case "processing":
      return "#f59e0b"; // amber - thinking
    case "speaking":
      return "#10b981"; // green - speaking
    default:
      return "var(--void-surface)";
  }
}

function VoiceIcon({ state }: { state: VoiceState }) {
  const color = state === "off" ? "var(--void-muted)" : "#fff";

  if (state === "speaking") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <motion.path
          d="M15.54 8.46a5 5 0 0 1 0 7.07"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", delay: 0.15 }}
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="40 60" />
        </svg>
      </motion.div>
    );
  }

  // Mic icon for all other states
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
