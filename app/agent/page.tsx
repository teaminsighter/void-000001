"use client";

import { ChatPanel } from "@/components/chat";

export default function AgentPage() {
  return (
    <div className="h-full">
      <ChatPanel initialMessages={[]} />
    </div>
  );
}
