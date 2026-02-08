"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent = "var(--void-accent)" }: StatCardProps) {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--void-dim)",
          fontWeight: 500,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: accent,
          marginTop: 2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "var(--void-dim)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
