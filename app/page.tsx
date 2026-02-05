"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  StatCard,
  TaskList,
  VaultRecent,
  QuickActions,
} from "@/components/dashboard";
import { TODAY, getGreeting } from "@/lib/mock-data";
import { Task, VaultFile } from "@/lib/types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load tasks from planner
      const plannerRes = await fetch("/api/planner");
      const plannerData = await plannerRes.json();
      setTasks(plannerData.tasks || []);

      // Load recent vault files
      const vaultRes = await fetch("/api/vault/list");
      const vaultData = await vaultRes.json();
      setVaultFiles(vaultData.files || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedTasks = tasks.filter((t) => t.done).length;
  const highPriorityTasks = tasks.filter((t) => !t.done && t.priority === "high").length;

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Greeting */}
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
          {TODAY}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#fafafa",
            marginTop: 4,
          }}
        >
          {getGreeting()}, boss.
        </div>
        <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
          {highPriorityTasks} urgent tasks · {vaultFiles.length} vault notes
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <QuickActions />
      </div>

      {/* Stats Row */}
      <div className="flex gap-2.5 flex-wrap" style={{ marginBottom: 24 }}>
        <StatCard
          label="Tasks Today"
          value={`${completedTasks}/${tasks.length}`}
          sub={highPriorityTasks > 0 ? `${highPriorityTasks} high priority` : "All caught up"}
          accent="#f59e0b"
        />
        <StatCard
          label="Vault Notes"
          value={vaultFiles.length}
          sub="Semantic search ready"
          accent="#34d399"
        />
        <StatCard
          label="Mail"
          value="—"
          sub="Not connected"
          accent="#ef4444"
        />
        <StatCard
          label="Agent"
          value="Ready"
          sub="Void-Haki online"
          accent="#a78bfa"
        />
      </div>

      {/* Widgets Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Today's Tasks */}
        <div
          style={{
            background: "#111218",
            borderRadius: 10,
            border: "1px solid #1a1b20",
            overflow: "hidden",
          }}
        >
          <div
            className="flex justify-between items-center border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>
              Today&apos;s Tasks
            </span>
            <Link
              href="/planner"
              style={{ fontSize: 10, color: "#52525b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
            >
              View all →
            </Link>
          </div>
          <TaskList tasks={tasks} onToggle={toggleTask} limit={5} />
        </div>

        {/* Inbox Preview */}
        <div
          style={{
            background: "#111218",
            borderRadius: 10,
            border: "1px solid #1a1b20",
            overflow: "hidden",
          }}
        >
          <div
            className="flex justify-between items-center border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>
              Inbox
            </span>
            <Link
              href="/mail"
              style={{ fontSize: 10, color: "#52525b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
            >
              Open mail →
            </Link>
          </div>
          <div style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✉</div>
            <div style={{ fontSize: 12, color: "#52525b" }}>
              Email not connected
            </div>
            <Link
              href="/mail"
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "6px 12px",
                borderRadius: 6,
                background: "#f59e0b",
                color: "#0c0d10",
                fontSize: 11,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Connect Gmail
            </Link>
          </div>
        </div>

        {/* Recent Notes */}
        <div
          style={{
            background: "#111218",
            borderRadius: 10,
            border: "1px solid #1a1b20",
            overflow: "hidden",
          }}
        >
          <div
            className="flex justify-between items-center border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>
              Recent Notes
            </span>
            <Link
              href="/vault"
              style={{ fontSize: 10, color: "#52525b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
            >
              Browse vault →
            </Link>
          </div>
          <VaultRecent files={vaultFiles} limit={4} />
        </div>

        {/* Quick Search */}
        <div
          style={{
            background: "#111218",
            borderRadius: 10,
            border: "1px solid #1a1b20",
            overflow: "hidden",
          }}
        >
          <div
            className="flex justify-between items-center border-b"
            style={{
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fafafa" }}>
              Void-Haki
            </span>
            <Link
              href="/research"
              style={{ fontSize: 10, color: "#52525b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
            >
              Research →
            </Link>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12 }}>
              Semantic search across your vault
            </div>
            <Link
              href="/research"
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid #27272a",
                background: "#18181b",
                color: "#52525b",
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              Search your vault...
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
