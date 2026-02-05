"use client";

import { useState } from "react";
import { Email } from "@/lib/types";
import { EmailList } from "@/components/mail";
import { Pill } from "@/components/ui";

const FILTERS = ["All", "Unread", "Urgent"];

export default function MailPage() {
  const [emails] = useState<Email[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isConnected] = useState(false);

  const filteredEmails = emails.filter((email) => {
    if (activeFilter === "Unread") return !email.read;
    if (activeFilter === "Urgent") return email.urgent;
    return true;
  });

  const unreadCount = emails.filter((e) => !e.read).length;
  const urgentCount = emails.filter((e) => e.urgent).length;

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

      {/* Email List or Empty State */}
      {!isConnected ? (
        <div
          className="rounded-lg border"
          style={{
            padding: 32,
            background: "#111218",
            borderColor: "#1a1b20",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fafafa", marginBottom: 8 }}>
            Email not connected
          </div>
          <div style={{ fontSize: 12, color: "#52525b", marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
            Connect your email account to view and manage emails from the dashboard.
          </div>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "#f59e0b",
              color: "#0c0d10",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Connect Gmail
          </button>
        </div>
      ) : (
        <EmailList emails={filteredEmails} />
      )}

      {/* Quick Actions */}
      <div
        className="rounded-lg border"
        style={{
          marginTop: 16,
          padding: 16,
          background: "#111218",
          borderColor: "#1a1b20",
          opacity: isConnected ? 1 : 0.5,
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
              disabled={!isConnected}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #1a1b20",
                background: "transparent",
                color: "#71717a",
                fontSize: 12,
                cursor: isConnected ? "pointer" : "not-allowed",
              }}
            >
              Summarize Inbox
            </button>
            <button
              disabled={!isConnected}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: isConnected ? "#f59e0b" : "#52525b",
                color: "#0c0d10",
                fontSize: 12,
                fontWeight: 600,
                cursor: isConnected ? "pointer" : "not-allowed",
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
