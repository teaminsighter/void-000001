"use client";

type BadgeVariant = "urgent" | "warn" | "ok" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  urgent: "bg-status-urgent/12 text-status-urgent",
  warn: "bg-status-warn/12 text-status-warn",
  ok: "bg-status-ok/12 text-status-ok",
  info: "bg-status-info/12 text-status-info",
};

export default function Badge({ children, variant = "info" }: BadgeProps) {
  return (
    <span
      className={`
        inline-block text-[8.5px] px-1.5 py-px rounded font-semibold
        uppercase tracking-wide ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
}
