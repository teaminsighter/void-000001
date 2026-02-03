"use client";

import { useState } from "react";
import { MOCK_EMAILS } from "@/lib/mock-data";
import { EmailList } from "@/components/mail";
import { Pill } from "@/components/ui";

const FILTERS = ["All", "Unread", "Urgent"];

export default function MailPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredEmails = MOCK_EMAILS.filter((email) => {
    if (activeFilter === "Unread") return !email.read;
    if (activeFilter === "Urgent") return email.urgent;
    return true;
  });

  const unreadCount = MOCK_EMAILS.filter((e) => !e.read).length;
  const urgentCount = MOCK_EMAILS.filter((e) => e.urgent).length;

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Mail
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          {unreadCount} unread · {urgentCount} urgent
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1.5" style={{ marginBottom: 16 }}>
        {FILTERS.map((filter) => (
          <Pill
            key={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Pill>
        ))}
      </div>

      {/* Email List */}
      <EmailList emails={filteredEmails} />

      {/* Quick Actions */}
      <div
        className="rounded-lg border"
        style={{
          marginTop: 16,
          padding: 16,
          background: "#111218",
          borderColor: "#1a1b20",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
              Email Actions
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              Let the agent handle email tasks
            </div>
          </div>
          <div className="flex gap-2">
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #1a1b20",
                background: "transparent",
                color: "#71717a",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Summarize Inbox
            </button>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#f59e0b",
                color: "#0c0d10",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Draft Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
