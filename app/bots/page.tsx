"use client";

import { useState } from "react";
import { MOCK_BOTS } from "@/lib/mock-data";
import { BotGrid } from "@/components/bots";
import { Pill } from "@/components/ui";

const FILTERS = ["All", "Cron", "Webhook", "Hybrid"];

export default function BotsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredBots = MOCK_BOTS.filter((bot) => {
    if (activeFilter === "Cron") return bot.type === "cron";
    if (activeFilter === "Webhook") return bot.type === "webhook";
    if (activeFilter === "Hybrid") return bot.type === "both";
    return true;
  });

  const activeCount = MOCK_BOTS.filter((b) => b.status === "ok").length;
  const warningCount = MOCK_BOTS.filter((b) => b.status === "warn").length;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="void-heading">
          Automation Bots
        </h1>
        <div className="void-subheading">
          {MOCK_BOTS.length} workflows · {activeCount} active · {warningCount} warnings
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 20 }}>
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

      {/* Bot Grid */}
      <BotGrid bots={filteredBots} />

      {/* n8n Link */}
      <div
        className="void-card"
        style={{
          marginTop: 20,
          padding: 16,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              n8n Workflow Editor
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
              Open n8n to create or edit workflows
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#22c55e",
              color: "var(--void-bg)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Open n8n →
          </button>
        </div>
      </div>
    </div>
  );
}
