"use client";

import { Task } from "@/lib/types";

interface TaskManagerProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export default function TaskManager({ tasks, onToggle }: TaskManagerProps) {
  const pendingCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div
      className="rounded-lg border"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: "12px 16px",
          borderColor: "var(--void-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              Tasks
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
              {pendingCount} pending · {completedCount} done
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div style={{ padding: "8px 0" }}>
        {tasks.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "var(--void-faint)",
              fontSize: 12,
            }}
          >
            No tasks yet. Generate a plan to add tasks.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3"
              style={{
                padding: "10px 16px",
                opacity: task.done ? 0.5 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(task.id)}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1px solid ${task.done ? "#34d399" : "#3f3f46"}`,
                  background: task.done ? "#34d399" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  flexShrink: 0,
                }}
              >
                {task.done && (
                  <span style={{ color: "var(--void-bg)", fontSize: 10 }}>✓</span>
                )}
              </button>

              {/* Task Content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    color: task.done ? "#71717a" : "#d4d4d8",
                    textDecoration: task.done ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}
                >
                  {task.time && (
                    <span style={{ color: "var(--void-faint)", marginRight: 8 }}>
                      {task.time}
                    </span>
                  )}
                  {task.text}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
