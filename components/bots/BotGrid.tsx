"use client";

import { Bot } from "@/lib/types";
import { Badge } from "@/components/ui";

interface BotGridProps {
  bots: Bot[];
  onBotClick?: (bot: Bot) => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  cron: { label: "CRON", color: "#60a5fa" },
  webhook: { label: "WEBHOOK", color: "#34d399" },
  both: { label: "HYBRID", color: "#a78bfa" },
};

export default function BotGrid({ bots, onBotClick }: BotGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {bots.map((bot) => (
        <div
          key={bot.id}
          className="rounded-lg border cursor-pointer void-hover-row"
          style={{
            padding: 16,
            background: "var(--void-surface)",
            borderColor: "var(--void-border)",
          }}
          onClick={() => onBotClick?.(bot)}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              {bot.name}
            </div>
            <Badge variant={bot.status === "ok" ? "ok" : "warn"}>
              {bot.status === "ok" ? "Active" : "Warning"}
            </Badge>
          </div>

          {/* Type Tag */}
          <div style={{ marginBottom: 10 }}>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                padding: "2px 6px",
                borderRadius: 4,
                background: `${TYPE_LABELS[bot.type].color}15`,
                color: TYPE_LABELS[bot.type].color,
                letterSpacing: 0.5,
              }}
            >
              {TYPE_LABELS[bot.type].label}
            </span>
          </div>

          {/* Details */}
          <div style={{ fontSize: 11, color: "var(--void-dim)", lineHeight: 1.6 }}>
            <div>Schedule: {bot.schedule}</div>
            <div>Last run: {bot.lastRun}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
