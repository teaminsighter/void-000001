"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  StatCard,
  TaskList,
  VaultRecent,
  QuickActions,
} from "@/components/dashboard";
import { TODAY, getGreeting } from "@/lib/mock-data";
import { Task, VaultFile } from "@/lib/types";
import { onDataChanged } from "@/lib/events";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const plannerRes = await fetch("/api/planner");
      const plannerData = await plannerRes.json();
      setTasks(plannerData.tasks || []);

      const vaultRes = await fetch("/api/vault/list");
      const vaultData = await vaultRes.json();
      setVaultFiles(vaultData.files || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh when agent modifies data via chat
  useEffect(() => {
    return onDataChanged(() => {
      loadDashboardData();
    });
  }, [loadDashboardData]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedTasks = tasks.filter((t) => t.done).length;
  const highPriorityTasks = tasks.filter((t) => !t.done && t.priority === "high").length;

  return (
    <div className="p-6 animate-fadeIn">
      {/* Greeting */}
      <div className="mb-6">
        <div
          className="font-mono text-[10px] font-medium tracking-wider uppercase"
          style={{ color: "var(--void-dim)" }}
        >
          {TODAY}
        </div>
        <div
          className="text-2xl font-bold mt-1"
          style={{ color: "var(--void-white)" }}
        >
          {getGreeting()}, boss.
        </div>
        <div
          className="text-[13px] mt-0.5"
          style={{ color: "var(--void-muted)" }}
        >
          {isLoading
            ? "Loading..."
            : `${highPriorityTasks} urgent tasks · ${vaultFiles.length} vault notes`}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-4 mb-6 overflow-hidden"
        style={{
          background: "var(--void-surface)",
          border: "1px solid var(--void-border)",
          borderRadius: 12,
        }}
      >
        <div style={{ borderRight: "1px solid var(--void-border)" }}>
          <StatCard
            label="Tasks Today"
            value={`${completedTasks}/${tasks.length}`}
            sub={highPriorityTasks > 0 ? `${highPriorityTasks} high priority` : "All caught up"}
            accent="#f59e0b"
          />
        </div>
        <div style={{ borderRight: "1px solid var(--void-border)" }}>
          <StatCard
            label="Vault Notes"
            value={vaultFiles.length}
            sub="Semantic search ready"
            accent="#34d399"
          />
        </div>
        <div style={{ borderRight: "1px solid var(--void-border)" }}>
          <StatCard
            label="Mail"
            value="—"
            sub="Not connected"
            accent="#ef4444"
          />
        </div>
        <div>
          <StatCard
            label="Agent"
            value="Ready"
            sub="Void-Haki online"
            accent="#a78bfa"
          />
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Today's Tasks */}
        <WidgetCard title="Today's Tasks" href="/planner" linkText="View all →">
          <TaskList tasks={tasks} onToggle={toggleTask} limit={5} />
        </WidgetCard>

        {/* Inbox Preview */}
        <WidgetCard title="Inbox" href="/mail" linkText="Open mail →">
          <div className="flex items-center justify-center text-center" style={{ flex: 1, padding: 24 }}>
            <div>
              <div className="text-2xl mb-2">✉</div>
              <div className="text-xs" style={{ color: "var(--void-dim)" }}>
                Email not connected
              </div>
              <Link
                href="/mail"
                className="inline-block mt-3 px-3 py-1.5 rounded-md text-[11px] font-semibold no-underline transition-colors"
                style={{
                  background: "var(--void-accent)",
                  color: "var(--void-bg)",
                }}
              >
                Connect Gmail
              </Link>
            </div>
          </div>
        </WidgetCard>

        {/* Recent Notes */}
        <WidgetCard title="Recent Notes" href="/vault" linkText="Browse vault →">
          <VaultRecent files={vaultFiles} limit={4} />
        </WidgetCard>

        {/* Quick Search */}
        <WidgetCard title="Void-Haki" href="/research" linkText="Research →">
          <div className="flex items-center justify-center" style={{ flex: 1, padding: 24 }}>
            <div style={{ width: "100%" }}>
              <div className="text-xs mb-3" style={{ color: "var(--void-muted)" }}>
                Semantic search across your vault
              </div>
              <Link
                href="/research"
                className="block rounded-md no-underline text-xs transition-colors"
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--void-border)",
                  background: "var(--void-bg)",
                  color: "var(--void-dim)",
                }}
              >
                Search your vault...
              </Link>
            </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

function WidgetCard({
  title,
  href,
  linkText,
  children,
}: {
  title: string;
  href: string;
  linkText: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-colors flex flex-col"
      style={{
        background: "var(--void-surface)",
        border: "1px solid var(--void-border)",
        height: "100%",
      }}
    >
      <div
        className="flex justify-between items-center border-b"
        style={{
          padding: "12px 16px",
          borderColor: "var(--void-border)",
          flexShrink: 0,
        }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--void-white)" }}
        >
          {title}
        </span>
        <Link
          href={href}
          className="text-[10px] transition-colors no-underline"
          style={{ color: "var(--void-dim)" }}
        >
          {linkText}
        </Link>
      </div>
      <div className="flex flex-col" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
