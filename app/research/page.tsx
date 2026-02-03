export default function ResearchPage() {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Placeholder content */}
      <div
        className="rounded-lg border"
        style={{
          padding: 40,
          background: "#111218",
          borderColor: "var(--void-border)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, color: "#a78bfa" }}>◎</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 8,
          }}
        >
          Research
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", maxWidth: 400, margin: "0 auto" }}>
          Dual search interface will be built in Layer 3.
          <br />
          Vault search (Khoj) + Web search (SearXNG).
        </p>
        <div
          className="font-mono"
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#3f3f46",
          }}
        >
          /research
        </div>
      </div>
    </div>
  );
}
