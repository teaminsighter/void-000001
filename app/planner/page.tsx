"use client";

import { useState, useEffect } from "react";
import { Task, ScheduleItem } from "@/lib/types";
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

  // Load data on mount
  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
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
  };

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
      <div style={{ padding: 24, color: "#52525b" }}>Loading planner...</div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Daily Planner
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
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
        className="rounded-lg border"
        style={{
          marginTop: 16,
          padding: 16,
          background: "#111218",
          borderColor: "#1a1b20",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
              Generate AI Plan
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              Let the agent create a time-blocked schedule based on your vault
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label style={{ fontSize: 11, color: "#71717a" }}>Hours:</label>
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
                  border: "1px solid #27272a",
                  background: "#18181b",
                  color: "#fafafa",
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
                color: "#0c0d10",
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
