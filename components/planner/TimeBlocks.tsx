"use client";

import { ScheduleItem } from "@/lib/types";

const SCHEDULE_COLORS: Record<string, string> = {
  focus: "#22c55e",
  meeting: "#ef4444",
  break: "#6b7280",
  admin: "#3b82f6",
};

interface TimeBlocksProps {
  schedule: ScheduleItem[];
}

export default function TimeBlocks({ schedule }: TimeBlocksProps) {
  if (schedule.length === 0) {
    return (
      <div
        className="rounded-lg border"
        style={{
          background: "var(--void-surface)",
          borderColor: "var(--void-border)",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)", marginBottom: 8 }}>
          Today's Schedule
        </div>
        <div style={{ fontSize: 12, color: "var(--void-faint)" }}>
          No schedule yet. Click "Plan My Day" to generate one.
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: "12px 16px",
          borderColor: "var(--void-border)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
          Today's Schedule
        </div>
        <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
          Time-blocked day plan
        </div>
      </div>

      {/* Schedule List */}
      <div style={{ padding: "8px 0" }}>
        {schedule.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
            style={{
              padding: "10px 16px",
              borderLeft: `3px solid ${SCHEDULE_COLORS[item.type] || "#6b7280"}`,
              marginLeft: 16,
              background:
                item.type === "meeting"
                  ? "rgba(239, 68, 68, 0.05)"
                  : "transparent",
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--void-faint)",
                width: 45,
                flexShrink: 0,
              }}
            >
              {item.time}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: item.type === "break" ? "#71717a" : "#d4d4d8",
                fontWeight: item.type === "meeting" ? 500 : 400,
              }}
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
