"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent = "#f5f5f5" }: StatCardProps) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 8,
        background: "#111218",
        border: "1px solid #1a1b20",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#52525b",
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
        <div style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
