"use client";

import { SavedItem } from "@/lib/types";

interface SavedListProps {
  items: SavedItem[];
  onItemClick?: (item: SavedItem) => void;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Article: { bg: "rgba(96, 165, 250, 0.08)", color: "#60a5fa" },
  Tutorial: { bg: "rgba(52, 211, 153, 0.08)", color: "#34d399" },
  Video: { bg: "rgba(239, 68, 68, 0.08)", color: "#ef4444" },
  Guide: { bg: "rgba(167, 139, 250, 0.08)", color: "#a78bfa" },
};

export default function SavedList({ items, onItemClick }: SavedListProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            color: "var(--void-faint)",
            fontSize: 12,
          }}
        >
          No saved items
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="border-b cursor-pointer void-hover-row"
            style={{
              padding: "14px 16px",
              borderColor: "var(--void-border)",
            }}
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex items-start justify-between gap-3">
              <div style={{ flex: 1 }}>
                {/* Title */}
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--void-text)",
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: TYPE_COLORS[item.type]?.bg || "#1a1b20",
                      color: TYPE_COLORS[item.type]?.color || "#71717a",
                    }}
                  >
                    {item.type}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--void-faint)" }}>
                    {item.source}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--void-faint)",
                  flexShrink: 0,
                }}
              >
                {item.date}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
