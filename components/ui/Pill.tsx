"use client";

interface PillProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}

export default function Pill({ children, active = false, color = "var(--void-accent)", onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-150 rounded"
      style={{
        fontSize: 10,
        padding: "3px 8px",
        fontWeight: 500,
        letterSpacing: 0.2,
        background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : "rgba(128, 128, 128, 0.05)",
        color: active ? color : "var(--void-muted)",
        border: "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </button>
  );
}
