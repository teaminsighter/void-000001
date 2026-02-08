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
        <h1 className="void-heading">
          Mail
        </h1>
        <div className="void-subheading">
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
          className="void-card"
          style={{
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--void-white)", marginBottom: 8 }}>
            Email not connected
          </div>
          <div style={{ fontSize: 12, color: "var(--void-faint)", marginBottom: 16, maxWidth: 300, margin: "0 auto 16px" }}>
            Connect your email account to view and manage emails from the dashboard.
          </div>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "#f59e0b",
              color: "var(--void-bg)",
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
        className="void-card"
        style={{
          marginTop: 16,
          padding: 16,
          opacity: isConnected ? 1 : 0.5,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              Email Actions
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
              Let the agent handle email tasks
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!isConnected}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid var(--void-border)",
                background: "transparent",
                color: "var(--void-dim)",
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
                color: "var(--void-bg)",
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
