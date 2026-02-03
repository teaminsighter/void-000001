"use client";

type BadgeVariant = "urgent" | "warn" | "ok" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  urgent: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
  warn: { bg: "rgba(234, 179, 8, 0.12)", color: "#eab308" },
  ok: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e" },
  info: { bg: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" },
};

export default function Badge({ children, variant = "info" }: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      style={{
        fontSize: 8.5,
        padding: "1px 6px",
        borderRadius: 3,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        background: style.bg,
        color: style.color,
      }}
    >
      {children}
    </span>
  );
}
