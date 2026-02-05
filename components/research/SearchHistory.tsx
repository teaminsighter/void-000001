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
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
          Recent Searches
        </div>
      </div>

      <div style={{ padding: "8px 0" }}>
        {history.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer transition-colors"
            style={{
              padding: "12px 16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1a1b20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                color: "#d4d4d8",
                marginBottom: 6,
              }}
            >
              {item.query}
            </div>
            <div className="flex gap-3" style={{ fontSize: 10.5 }}>
              <span style={{ color: "#34d399" }}>
                {item.results} results
              </span>
              <span style={{ color: "#52525b", marginLeft: "auto" }}>
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
