"use client";

import { MOCK_RESEARCH_HISTORY } from "@/lib/mock-data";
import { SearchPanel, SearchHistory } from "@/components/research";

export default function ResearchPage() {
  const handleSearch = (query: string) => {
    console.log("Search:", query);
    // Will be replaced with real API in Layer 4
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Research
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          Search your vault and the web simultaneously
        </div>
      </div>

      {/* Search Panel */}
      <div style={{ marginBottom: 20 }}>
        <SearchPanel onSearch={handleSearch} />
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
                Vault (Khoj)
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
            Enter a query to search your vault
          </div>
        </div>

        {/* Web Results */}
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
              <span style={{ color: "#60a5fa" }}>◎</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
                Web (SearXNG)
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
            Enter a query to search the web
          </div>
        </div>
      </div>

      {/* Search History */}
      <div style={{ marginTop: 20 }}>
        <SearchHistory history={MOCK_RESEARCH_HISTORY} />
      </div>
    </div>
  );
}
