"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect, Suspense } from "react";
import { ChatPanel } from "@/components/chat";
import { ContinuousVoice } from "@/components/voice";

const LAST_CONV_KEY = "void-last-conversation";

function AgentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("c");
  const [lastVoiceResponse, setLastVoiceResponse] = useState<string>("");

  // Restore last conversation when landing on /agent without ?c=
  useEffect(() => {
    if (!conversationId) {
      const saved = localStorage.getItem(LAST_CONV_KEY);
      if (saved) {
        router.replace(`/agent?c=${saved}`);
      }
    }
  }, [conversationId, router]);

  // Persist active conversation to localStorage
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(LAST_CONV_KEY, conversationId);
    }
  }, [conversationId]);

  const handleConversationChange = useCallback(
    (id: string) => {
      router.replace(`/agent?c=${id}`);
    },
    [router]
  );

  const handleNewChat = useCallback(() => {
    localStorage.removeItem(LAST_CONV_KEY);
    router.replace("/agent");
  }, [router]);

  // Handle voice commands
  const handleVoiceCommand = useCallback(async (transcript: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript, history: [] }),
      });

      if (!response.ok) throw new Error("Chat API failed");

      const data = await response.json();
      const responseText = data.response || data.reply || data.message || "Command processed";
      setLastVoiceResponse(responseText);

      // Refresh the page to show the new message in chat
      window.location.reload();

      return responseText;
    } catch (error) {
      console.error("Voice command error:", error);
      return "Sorry, I couldn't process that command.";
    }
  }, []);

  return (
    <div className="h-full relative">
      <ChatPanel
        conversationId={conversationId}
        onConversationChange={handleConversationChange}
        onNewChat={handleNewChat}
      />

      {/* Floating Voice Assistant - Say "void" to activate */}
      <div
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          zIndex: 1000,
        }}
      >
        <ContinuousVoice
          onCommand={handleVoiceCommand}
          wakeWord="void"
          wakeResponse="Yes captain, what do you need?"
        />
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <Suspense>
      <AgentContent />
    </Suspense>
  );
}
