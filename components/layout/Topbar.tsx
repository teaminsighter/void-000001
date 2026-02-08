"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/types";

interface TopbarProps {
  onSearchClick: () => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
}

export default function Topbar({ onSearchClick, theme, onThemeToggle }: TopbarProps) {
  const pathname = usePathname();

  // Get current page info
  const currentPage = PAGES.find((p) => p.path === pathname) || PAGES[0];

  return (
    <header
      className="flex items-center justify-between border-b"
      style={{
        height: 52,
        minHeight: 52,
        padding: "0 20px",
        borderColor: "var(--void-border)",
        background: "color-mix(in srgb, var(--void-bg) 80%, transparent)",
        backdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Left: Page info */}
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 14, color: "var(--void-dim)" }}>{currentPage.icon}</span>
        <span
          className="font-semibold"
          style={{ fontSize: 13, color: "var(--void-white)" }}
        >
          {currentPage.label}
        </span>
      </div>

      {/* Right: Theme toggle + Search + Agent button */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            className="flex items-center justify-center rounded-md border transition-colors"
            style={{
              width: 32,
              height: 32,
              background: "var(--void-surface)",
              borderColor: "var(--void-border)",
              color: "var(--void-muted)",
              fontSize: 14,
              cursor: "pointer",
            }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        )}

        {/* Search bar (clickable) */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-lg border transition-colors search-btn"
          style={{
            padding: "5px 12px",
            minWidth: 200,
            background: "var(--void-surface)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--void-faint)" }}>
            Search everything...
          </span>
          <span
            className="ml-auto font-mono"
            style={{
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 3,
              border: "1px solid var(--void-border)",
              color: "var(--void-faint)",
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Agent button */}
        <Link
          href="/agent"
          prefetch={true}
          className="flex items-center gap-1 rounded-md border font-semibold transition-colors agent-btn"
          style={{
            padding: "5px 12px",
            fontSize: 11,
          }}
        >
          <span>◉</span>
          <span>Agent</span>
        </Link>
      </div>
    </header>
  );
}
