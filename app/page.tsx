"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  StatCard,
  TaskList,
  VaultRecent,
  QuickActions,
} from "@/components/dashboard";
import { VoiceButton, speakText } from "@/components/voice";
import { TODAY, getGreeting } from "@/lib/mock-data";
import { Task, VaultFile } from "@/lib/types";
import { onDataChanged } from "@/lib/events";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [voiceResponse, setVoiceResponse] = useState<string>("");

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      ...prev.slice(-49),
      { id: crypto.randomUUID(), timestamp: new Date(), type, message },
    ]);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      addLog("info", "Loading dashboard data...");
      const plannerRes = await fetch("/api/planner");
      const plannerData = await plannerRes.json();
      setTasks(plannerData.tasks || []);
      addLog("success", `Loaded ${plannerData.tasks?.length || 0} tasks`);

      const vaultRes = await fetch("/api/vault/list");
      const vaultData = await vaultRes.json();
      setVaultFiles(vaultData.files || []);
      addLog("success", `Loaded ${vaultData.files?.length || 0} vault files`);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      addLog("error", "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  // Handle voice commands
  const handleVoiceCommand = useCallback(async (transcript: string) => {
    addLog("info", `Voice: "${transcript}"`);

    try {
      // Send to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript, history: [] }),
      });

      if (!response.ok) throw new Error("Chat API failed");

      const data = await response.json();
      const responseText = data.response || data.message || "Command processed";

      setVoiceResponse(responseText);
      addLog("success", `Agent: ${responseText.slice(0, 50)}...`);

      // Speak the response
      await speakText(responseText);

      // Refresh dashboard data if agent made changes
      loadDashboardData();
    } catch (error) {
      console.error("Voice command error:", error);
      addLog("error", "Failed to process voice command");
      await speakText("Sorry, I couldn't process that command.");
    }
  }, [addLog, loadDashboardData]);

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
      {/* Greeting with Voice Button */}
      <div className="mb-6 flex justify-between items-start">
        <div>
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

        {/* Voice Command Button */}
        <div className="flex flex-col items-center">
          <VoiceButton
            onTranscript={handleVoiceCommand}
            size="md"
            showTranscript={false}
            speakResponse={false}
          />
          <div
            className="mt-1 text-[9px] text-center"
            style={{ color: "var(--void-faint)" }}
          >
            Voice
          </div>
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

      {/* Log Box */}
      <LogBox logs={logs} onClear={() => setLogs([])} />
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

function LogBox({
  logs,
  onClear,
}: {
  logs: LogEntry[];
  onClear: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success": return "#34d399";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "var(--void-dim)";
    }
  };

  const getTypeLabel = (type: LogEntry["type"]) => {
    switch (type) {
      case "success": return "OK";
      case "warning": return "WARN";
      case "error": return "ERR";
      default: return "INFO";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="mt-5 rounded-lg overflow-hidden"
      style={{
        background: "var(--void-surface)",
        border: "1px solid var(--void-border)",
      }}
    >
      <div
        className="flex justify-between items-center border-b"
        style={{
          padding: "10px 16px",
          borderColor: "var(--void-border)",
        }}
      >
        <span
          className="text-xs font-semibold font-mono"
          style={{ color: "var(--void-white)" }}
        >
          System Log
        </span>
        <button
          onClick={onClear}
          className="text-[10px] transition-colors"
          style={{
            color: "var(--void-dim)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="font-mono text-[11px] overflow-y-auto"
        style={{
          height: 140,
          padding: "8px 12px",
          background: "var(--void-bg)",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: "var(--void-dim)", padding: "8px 0" }}>
            No logs yet...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-2"
              style={{ padding: "2px 0" }}
            >
              <span style={{ color: "var(--void-dim)" }}>
                {formatTime(log.timestamp)}
              </span>
              <span
                style={{
                  color: getTypeColor(log.type),
                  minWidth: 36,
                }}
              >
                [{getTypeLabel(log.type)}]
              </span>
              <span style={{ color: "var(--void-text)" }}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
