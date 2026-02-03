export default function VaultPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
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
        <div style={{ fontSize: 48, marginBottom: 16, color: "#34d399" }}>◈</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 8,
          }}
        >
          Vault
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", maxWidth: 400, margin: "0 auto" }}>
          File browser and semantic search will be built in Layer 3.
          <br />
          Folder filtering, note viewer, Khoj integration.
        </p>
        <div
          className="font-mono"
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#3f3f46",
          }}
        >
          /vault
        </div>
      </div>
    </div>
  );
}
