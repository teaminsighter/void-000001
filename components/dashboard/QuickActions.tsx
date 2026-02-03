"use client";

import Link from "next/link";

interface QuickAction {
  icon: string;
  label: string;
  color: string;
  href: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "▦", label: "Plan my day", color: "#f59e0b", href: "/planner" },
  { icon: "✎", label: "Quick log", color: "#60a5fa", href: "/agent" },
  { icon: "◎", label: "Search vault", color: "#34d399", href: "/vault" },
  { icon: "✉", label: "Check email", color: "#f472b6", href: "/mail" },
  { icon: "⏰", label: "Set reminder", color: "#a78bfa", href: "/agent" },
  { icon: "◉", label: "Ask agent", color: "#fb923c", href: "/agent" },
];

export default function QuickActions() {
  return (
    <div className="flex gap-2 flex-wrap">
      {QUICK_ACTIONS.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className="flex items-center gap-1.5 rounded-lg transition-all"
          style={{
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            background: `${action.color}08`,
            border: `1px solid ${action.color}18`,
            color: action.color,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${action.color}15`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${action.color}08`;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 14 }}>{action.icon}</span>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
