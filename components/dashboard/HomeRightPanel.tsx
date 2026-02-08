"use client";

import { useState, useEffect } from "react";

interface HealthStatus {
  dashboard: boolean;
  n8n: boolean;
  khoj: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOCK_ACTIVITY = [4, 7, 3, 8, 5, 2, 6]; // simulated notes/actions per day

export default function HomeRightPanel() {
  const [health, setHealth] = useState<HealthStatus>({
    dashboard: true,
    n8n: false,
    khoj: false,
  });
  const [vaultCount, setVaultCount] = useState(0);

  useEffect(() => {
    // Check system health
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setHealth({
          dashboard: true,
          n8n: data.n8n || false,
          khoj: data.khoj || false,
        });
      })
      .catch(() => {
        setHealth({ dashboard: true, n8n: false, khoj: false });
      });

    // Get vault file count
    fetch("/api/vault/list")
      .then((r) => r.json())
      .then((data) => {
        setVaultCount(data.files?.length || 0);
      })
      .catch(() => {});
  }, []);

  const maxActivity = Math.max(...MOCK_ACTIVITY);

  return (
    <div style={{ padding: 20 }}>
      {/* Weekly Activity */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--void-faint)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Weekly Activity
        </div>
        <div
          className="void-card"
          style={{ padding: 16 }}
        >
          <div
            className="flex items-end justify-between gap-1"
            style={{ height: 80 }}
          >
            {MOCK_ACTIVITY.map((val, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
                style={{ flex: 1 }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 24,
                    height: `${(val / maxActivity) * 60}px`,
                    borderRadius: 4,
                    background:
                      i === MOCK_ACTIVITY.length - 1
                        ? "var(--void-accent)"
                        : "var(--void-border)",
                    transition: "height 0.3s",
                  }}
                />
              </div>
            ))}
          </div>
          <div
            className="flex justify-between"
            style={{
              marginTop: 8,
              fontSize: 9,
              color: "var(--void-faint)",
            }}
          >
            {DAYS.map((d) => (
              <span key={d} style={{ flex: 1, textAlign: "center" }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Notes */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--void-faint)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Agent Notes
        </div>
        <div className="flex flex-col gap-2">
          {[
            "No urgent items today",
            `Vault: ${vaultCount} notes`,
            "3 emails pending",
          ].map((note, i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{
                padding: "8px 12px",
                fontSize: 12,
                color: "var(--void-muted)",
              }}
            >
              <span style={{ color: "var(--void-dim)", marginTop: 1 }}>•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--void-faint)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          System Status
        </div>
        <div className="void-card" style={{ padding: 4 }}>
          {[
            { label: "Dashboard", status: health.dashboard, detail: "Online" },
            { label: "n8n", status: health.n8n, detail: "Online" },
            { label: "Khoj", status: health.khoj, detail: "Online" },
            { label: "Vault", status: true, detail: `${vaultCount} files` },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
              style={{
                padding: "10px 12px",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--void-text)" }}>{item.label}</span>
              <span className="flex items-center gap-1.5">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    display: "inline-block",
                    background: item.status
                      ? "var(--status-ok)"
                      : "var(--void-faint)",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: item.status
                      ? "var(--void-muted)"
                      : "var(--void-faint)",
                  }}
                >
                  {item.status ? item.detail : "Offline"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--void-faint)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Quick Stats
        </div>
        <div className="void-card" style={{ padding: 4 }}>
          {[
            { label: "Total notes", value: vaultCount.toString() },
            { label: "Workflows", value: "8 active" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between"
              style={{
                padding: "10px 12px",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--void-muted)" }}>{stat.label}</span>
              <span
                style={{
                  color: "var(--void-text)",
                  fontWeight: 500,
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
