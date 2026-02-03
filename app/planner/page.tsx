export default function PlannerPage() {
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
        <div style={{ fontSize: 48, marginBottom: 16, color: "#60a5fa" }}>▦</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#fafafa",
            marginBottom: 8,
          }}
        >
          Daily Planner
        </h2>
        <p style={{ fontSize: 13, color: "#71717a", maxWidth: 400, margin: "0 auto" }}>
          Time blocks and task management will be built in Layer 3.
          <br />
          Schedule view, task list with filters, AI plan generation.
        </p>
        <div
          className="font-mono"
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#3f3f46",
          }}
        >
          /planner
        </div>
      </div>
    </div>
  );
}
