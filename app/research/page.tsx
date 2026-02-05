"use client";

import { useState } from "react";
import { SearchPanel, SearchHistory } from "@/components/research";

interface SearchResult {
  entry: string;
  file: string;
  score: number;
}

interface HistoryItem {
  query: string;
  timestamp: string;
  results: number;
}

export default function ResearchPage() {
  const [vaultResults, setVaultResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setLastQuery(query);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5 }),
      });
      const data = await res.json();
      setVaultResults(data.results || []);

      // Add to history
      setHistory((prev) => [
        {
          query,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          results: data.results?.length || 0,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Research
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          Search your vault with semantic search
        </div>
      </div>

      {/* Search Panel */}
      <div style={{ marginBottom: 20 }}>
        <SearchPanel onSearch={handleSearch} isLoading={isSearching} />
      </div>

      {/* Two Column Results Area */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Vault Results */}
        <div
          className="rounded-lg border"
          style={{
            background: "#111218",
            borderColor: "#1a1b20",
          }}
        >
          <div
            className="border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#34d399" }}>◈</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
                Vault (Void-Haki)
              </span>
              {vaultResults.length > 0 && (
                <span style={{ fontSize: 11, color: "#52525b" }}>
                  {vaultResults.length} results
                </span>
              )}
            </div>
          </div>
          <div style={{ maxHeight: 400, overflow: "auto" }}>
            {vaultResults.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "#52525b",
                  fontSize: 12,
                }}
              >
                {lastQuery ? "No results found" : "Enter a query to search your vault"}
              </div>
            ) : (
              vaultResults.map((result, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #1a1b20",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#34d399", marginBottom: 4 }}>
                    {result.file}
                  </div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>
                    {result.entry.substring(0, 200)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Web Results */}
        <div
          className="rounded-lg border"
          style={{
            background: "#111218",
            borderColor: "#1a1b20",
            opacity: 0.6,
          }}
        >
          <div
            className="border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#60a5fa" }}>◎</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
                Web Search
              </span>
              <span style={{ fontSize: 10, color: "#52525b", marginLeft: "auto" }}>
                Coming soon
              </span>
            </div>
          </div>
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "#52525b",
              fontSize: 12,
            }}
          >
            Web search integration coming soon
          </div>
        </div>
      </div>

      {/* Search History */}
      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SearchHistory history={history} />
        </div>
      )}
    </div>
  );
}
