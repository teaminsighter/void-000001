export default function HomePage() {
  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            color: "#52525b",
            fontWeight: 500,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Sunday, Feb 2 2026
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#fafafa",
            marginTop: 4,
          }}
        >
          Good evening, boss.
        </div>
        <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
          3 urgent tasks · 2 unread emails · Weekly review tonight at 10 PM
        </div>
      </div>

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
        <div style={{ fontSize: 48, marginBottom: 16 }}>⌂</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 8,
          }}
        >
          Home Dashboard
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", maxWidth: 400, margin: "0 auto" }}>
          Quick actions, stats, and widgets will be added in Layer 3.
          <br />
          For now, test the navigation using the sidebar or ⌘K.
        </p>
        <div
          className="font-mono"
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#3f3f46",
          }}
        >
          Layer 2: Layout Shell ✓
        </div>
      </div>
    </div>
  );
}
