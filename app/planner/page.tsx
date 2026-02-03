"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { MOCK_TASKS, MOCK_SCHEDULE, TODAY } from "@/lib/mock-data";
import { TimeBlocks, TaskManager } from "@/components/planner";

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Daily Planner
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          {TODAY}
        </div>
      </div>

      {/* Two Column Layout */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1.2fr" }}
      >
        {/* Left: Schedule */}
        <TimeBlocks schedule={MOCK_SCHEDULE} />

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
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
              Generate AI Plan
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              Let the agent optimize your day based on priorities and calendar
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#f59e0b",
              color: "#0c0d10",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Plan My Day
          </button>
        </div>
      </div>
    </div>
  );
}
