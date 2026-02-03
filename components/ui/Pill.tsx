"use client";

interface PillProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}

export default function Pill({ children, active = false, color = "#f59e0b", onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className="transition-colors"
      style={{
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 4,
        fontWeight: 500,
        letterSpacing: 0.2,
        background: active ? `${color}18` : "rgba(255, 255, 255, 0.03)",
        color: active ? color : "#64748b",
        border: "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </button>
  );
}
