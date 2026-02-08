"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, ScheduleItem } from "@/lib/types";
import { onDataChanged } from "@/lib/events";
import { TimeBlocks, TaskManager } from "@/components/planner";

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hours, setHours] = useState("4");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loadPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/planner");
      const data = await res.json();
      setTasks(data.tasks || []);
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error("Failed to load plan:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // Auto-refresh when agent modifies tasks via chat
  useEffect(() => {
    return onDataChanged(() => {
      loadPlan();
    }, 'tasks');
  }, [loadPlan]);

  const toggleTask = async (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updated);

    // Save to vault
    await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", tasks: updated }),
    });
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", hours: parseInt(hours) }),
      });
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule || []);
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--void-faint)" }}>Loading planner...</div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="void-heading">
          Daily Planner
        </h1>
        <div className="void-subheading">
          {today}
        </div>
      </div>

      {/* Two Column Layout */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1.2fr" }}
      >
        {/* Left: Schedule */}
        <TimeBlocks schedule={schedule} />

        {/* Right: Tasks */}
        <TaskManager tasks={tasks} onToggle={toggleTask} />
      </div>

      {/* AI Plan Generation */}
      <div
        className="void-card"
        style={{
          marginTop: 16,
          padding: 16,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              Generate AI Plan
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
              Let the agent create a time-blocked schedule based on your vault
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label style={{ fontSize: 11, color: "var(--void-dim)" }}>Hours:</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
                max="12"
                style={{
                  width: 50,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid var(--void-border)",
                  background: "var(--void-surface)",
                  color: "var(--void-white)",
                  fontSize: 12,
                }}
              />
            </div>
            <button
              onClick={generatePlan}
              disabled={isGenerating}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: isGenerating ? "#52525b" : "#f59e0b",
                color: "var(--void-bg)",
                fontSize: 12,
                fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? "Generating..." : "Plan My Day"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
