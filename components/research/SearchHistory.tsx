"use client";

interface HistoryItem {
  query: string;
  timestamp: string;
  results: number;
}

interface SearchHistoryProps {
  history: HistoryItem[];
}

export default function SearchHistory({ history }: SearchHistoryProps) {
  return (
    <div
      className="rounded-lg border"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      <div
        className="border-b"
        style={{
          padding: "12px 16px",
          borderColor: "var(--void-border)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
          Recent Searches
        </div>
      </div>

      <div style={{ padding: "8px 0" }}>
        {history.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer void-hover-row"
            style={{
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                color: "var(--void-text)",
                marginBottom: 6,
              }}
            >
              {item.query}
            </div>
            <div className="flex gap-3" style={{ fontSize: 10.5 }}>
              <span style={{ color: "#34d399" }}>
                {item.results} results
              </span>
              <span style={{ color: "var(--void-faint)", marginLeft: "auto" }}>
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
