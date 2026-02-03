"use client";

import { SCHEDULE_COLORS } from "@/lib/mock-data";

interface TimeBlock {
  time: string;
  block: string;
  type: "work" | "project" | "meeting" | "learn" | "break" | "bot";
}

interface TimeBlocksProps {
  schedule: TimeBlock[];
}

export default function TimeBlocks({ schedule }: TimeBlocksProps) {
  return (
    <div
      className="rounded-lg border"
      style={{
        background: "#111218",
        borderColor: "#1a1b20",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: "12px 16px",
          borderColor: "#1a1b20",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
          Today's Schedule
        </div>
        <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
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
              borderLeft: `3px solid ${SCHEDULE_COLORS[item.type]}`,
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
                color: "#52525b",
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
              {item.block}
            </div>
            {item.type === "bot" && (
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                  marginLeft: "auto",
                }}
              >
                BOT
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
