"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, Suspense } from "react";
import { ChatPanel } from "@/components/chat";

const LAST_CONV_KEY = "void-last-conversation";

function AgentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("c");

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

  return (
    <div className="h-full">
      <ChatPanel
        conversationId={conversationId}
        onConversationChange={handleConversationChange}
        onNewChat={handleNewChat}
      />
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
