"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/types";

interface TopbarProps {
  onSearchClick: () => void;
}

export default function Topbar({ onSearchClick }: TopbarProps) {
  const pathname = usePathname();

  // Get current page info
  const currentPage = PAGES.find((p) => p.path === pathname) || PAGES[0];

  return (
    <header
      className="flex items-center justify-between border-b"
      style={{
        height: 48,
        minHeight: 48,
        padding: "0 20px",
        borderColor: "var(--void-border)",
      }}
    >
      {/* Left: Page info */}
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 14, color: "#52525b" }}>{currentPage.icon}</span>
        <span
          className="font-semibold"
          style={{ fontSize: 13, color: "#fafafa" }}
        >
          {currentPage.label}
        </span>
      </div>

      {/* Right: Search + Agent button */}
      <div className="flex items-center gap-2">
        {/* Search bar (clickable) */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-md border transition-colors search-btn"
          style={{
            padding: "5px 12px",
            minWidth: 200,
            background: "#111218",
          }}
        >
          <span style={{ fontSize: 11, color: "#3f3f46" }}>
            Search everything...
          </span>
          <span
            className="ml-auto font-mono"
            style={{
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 3,
              border: "1px solid #27272a",
              color: "#3f3f46",
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
