"use client";

import { ChatPanel } from "@/components/chat";
import { MOCK_CHAT_MESSAGES } from "@/lib/mock-data";

export default function AgentPage() {
  return (
    <div className="h-full">
      <ChatPanel initialMessages={MOCK_CHAT_MESSAGES} />
    </div>
  );
}
