"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { TAG_COLORS, PRIORITY_COLORS } from "@/lib/mock-data";
import { Pill } from "@/components/ui";

interface TaskManagerProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

const FILTERS = ["All", "Office", "Project", "Learning", "Personal"];

export default function TaskManager({ tasks, onToggle }: TaskManagerProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredTasks =
    activeFilter === "All"
      ? tasks
      : tasks.filter((task) => task.tag === activeFilter);

  const pendingCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div
      className="rounded-lg border"
      style={{
        background: "#111218",
        borderColor: "#1a1b20",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: "12px 16px",
          borderColor: "#1a1b20",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
              Tasks
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              {pendingCount} pending · {completedCount} done
            </div>
          </div>
          <button
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #1a1b20",
              background: "transparent",
              color: "#71717a",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + Add task
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap" style={{ marginTop: 12 }}>
          {FILTERS.map((filter) => (
            <Pill
              key={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              color={
                filter !== "All" ? TAG_COLORS[filter]?.color : undefined
              }
            >
              {filter}
            </Pill>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{ padding: "8px 0" }}>
        {filteredTasks.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "#52525b",
              fontSize: 12,
            }}
          >
            No tasks in this category
          </div>
        ) : (
          filteredTasks.map((task) => (
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
                  <span style={{ color: "#0c0d10", fontSize: 10 }}>✓</span>
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
                  {task.text}
                </div>
                <div
                  className="flex items-center gap-2"
                  style={{ marginTop: 4 }}
                >
                  {/* Tag */}
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: TAG_COLORS[task.tag]?.bg || "#1a1b20",
                      color: TAG_COLORS[task.tag]?.color || "#71717a",
                    }}
                  >
                    {task.tag}
                  </span>
                  {/* Priority */}
                  <span
                    style={{
                      fontSize: 10,
                      color: PRIORITY_COLORS[task.priority],
                      textTransform: "uppercase",
                    }}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
