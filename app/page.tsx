"use client";

import { useState } from "react";
import Link from "next/link";
import {
  StatCard,
  TaskList,
  EmailPreview,
  VaultRecent,
  PipelineMini,
  QuickActions,
} from "@/components/dashboard";
import {
  TODAY,
  getGreeting,
  MOCK_TASKS,
  MOCK_EMAILS,
  MOCK_VAULT_FILES,
  MOCK_DEALS,
} from "@/lib/mock-data";
import { Task } from "@/lib/types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedTasks = tasks.filter((t) => t.done).length;
  const unreadEmails = MOCK_EMAILS.filter((e) => !e.read).length;
  const urgentEmails = MOCK_EMAILS.filter((e) => e.urgent).length;

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
          {tasks.filter((t) => !t.done && t.priority === "high").length} urgent tasks · {unreadEmails} unread emails · Weekly review tonight at 10 PM
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
          sub={`${tasks.filter((t) => !t.done && t.priority === "high").length} high priority remaining`}
          accent="#f59e0b"
        />
        <StatCard
          label="Unread Emails"
          value={unreadEmails}
          sub={urgentEmails > 0 ? `${urgentEmails} urgent from Farhan` : "All caught up"}
          accent="#ef4444"
        />
        <StatCard
          label="Vault Notes"
          value="247"
          sub="+3 today"
          accent="#34d399"
        />
        <StatCard
          label="Week Streak"
          value="12d"
          sub="Longest: 18 days"
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
          <EmailPreview emails={MOCK_EMAILS} limit={4} />
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
          <VaultRecent files={MOCK_VAULT_FILES} limit={4} />
        </div>

        {/* Pipeline Mini */}
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
              Pipeline
            </span>
            <span style={{ fontSize: 10, color: "#52525b" }}>
              {MOCK_DEALS.length} deals active
            </span>
          </div>
          <PipelineMini deals={MOCK_DEALS} />
        </div>
      </div>
    </div>
  );
}
