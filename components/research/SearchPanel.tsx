"use client";

import { useState } from "react";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="rounded-lg border"
        style={{
          padding: 16,
          background: "#111218",
          borderColor: "#1a1b20",
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or search for information..."
            className="flex-1 outline-none"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #1a1b20",
              background: "#0c0d10",
              color: "#fafafa",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              background: isLoading ? "#52525b" : "#a78bfa",
              color: "#0c0d10",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        <div
          className="flex gap-4"
          style={{ marginTop: 12, fontSize: 11, color: "#52525b" }}
        >
          <span>🔍 Searches both your vault (Khoj) and the web (SearXNG)</span>
        </div>
      </div>
    </form>
  );
}
