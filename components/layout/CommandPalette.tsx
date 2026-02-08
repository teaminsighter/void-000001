"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/lib/types";

// Mock vault files for search (will be replaced with real API in Layer 4)
const MOCK_VAULT_FILES = [
  { name: "2026-02-02.md", folder: "01-Daily", path: "/vault" },
  { name: "2026-02-01.md", folder: "01-Daily", path: "/vault" },
  { name: "embeddings-vectors.md", folder: "02-Learning", path: "/vault" },
  { name: "q1-marketing-plan.md", folder: "03-Office", path: "/vault" },
  { name: "void-os-architecture.md", folder: "04-Projects", path: "/vault" },
  { name: "preferences.md", folder: "07-Agent-Memory", path: "/vault" },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter pages based on query
  const filteredPages = PAGES.filter(
    (page) =>
      page.label.toLowerCase().includes(query.toLowerCase()) || query === ""
  );

  // Filter vault files based on query
  const filteredFiles = query
    ? MOCK_VAULT_FILES.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Combined results
  const allResults = [
    ...filteredPages.map((p) => ({ type: "page" as const, ...p })),
    ...filteredFiles.map((f) => ({ type: "file" as const, ...f })),
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (allResults[selectedIndex]) {
            const result = allResults[selectedIndex];
            router.push(result.path);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allResults, selectedIndex, router, onClose]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-50"
      style={{
        paddingTop: 120,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-xl border overflow-hidden animate-fadeIn"
        style={{
          width: 500,
          background: "var(--void-surface)",
          borderColor: "var(--void-border)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything... (pages, notes, commands)"
          className="w-full border-b outline-none"
          style={{
            padding: "14px 18px",
            fontSize: 14,
            background: "transparent",
            borderColor: "var(--void-border)",
            color: "var(--void-white)",
          }}
        />

        {/* Results */}
        <div
          className="overflow-auto"
          style={{ padding: 8, maxHeight: 320 }}
        >
          {allResults.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: "var(--void-faint)", fontSize: 13 }}
            >
              No results found
            </div>
          ) : (
            allResults.map((result, index) => (
              <button
                key={`${result.type}-${result.type === "page" ? result.id : result.name}`}
                onClick={() => {
                  router.push(result.path);
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 rounded-md transition-colors text-left"
                style={{
                  padding: "8px 10px",
                  background:
                    index === selectedIndex
                      ? "rgba(255, 255, 255, 0.04)"
                      : "transparent",
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--void-faint)",
                    width: 24,
                    textAlign: "center",
                  }}
                >
                  {result.type === "page" ? result.icon : "◇"}
                </span>
                <span style={{ fontSize: 13, color: "var(--void-text)", flex: 1 }}>
                  {result.type === "page" ? result.label : result.name}
                </span>
                {result.type === "file" && (
                  <span style={{ fontSize: 10, color: "#3f3f46" }}>
                    {result.folder}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="border-t flex items-center justify-between"
          style={{
            padding: "8px 12px",
            borderColor: "var(--void-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: "#3f3f46" }}>
              <kbd className="px-1 rounded" style={{ background: "var(--void-border)" }}>↑</kbd>
              <kbd className="px-1 rounded" style={{ background: "var(--void-border)" }}>↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: "#3f3f46" }}>
              <kbd className="px-1 rounded" style={{ background: "var(--void-border)" }}>↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1" style={{ fontSize: 10, color: "#3f3f46" }}>
            <kbd className="px-1 rounded" style={{ background: "var(--void-border)" }}>esc</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
