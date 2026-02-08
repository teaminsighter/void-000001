"use client";

import { Deal } from "@/lib/types";

interface PipelineMiniProps {
  deals: Deal[];
}

export default function PipelineMini({ deals }: PipelineMiniProps) {
  const getProbabilityColor = (prob: string) => {
    if (prob === "100%") return "#22c55e";
    if (parseInt(prob) >= 70) return "#eab308";
    return "#3b82f6";
  };

  return (
    <div style={{ padding: 8 }}>
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex items-center gap-2 rounded-md"
          style={{ padding: "7px 8px" }}
        >
          {/* Status dot */}
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: getProbabilityColor(deal.probability),
              flexShrink: 0,
            }}
          />

          {/* Deal info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--void-text)" }}>{deal.name}</div>
            <div style={{ fontSize: 9.5, color: "var(--void-faint)" }}>
              {deal.stage} · {deal.probability}
            </div>
          </div>

          {/* Value */}
          <span
            className="font-mono"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--void-white)" }}
          >
            {deal.value}
          </span>
        </div>
      ))}
    </div>
  );
}
