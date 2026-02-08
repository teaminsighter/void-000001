"use client";

import { Task } from "@/lib/types";
import { TAG_COLORS, PRIORITY_COLORS } from "@/lib/mock-data";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  limit?: number;
}

export default function TaskList({ tasks, onToggle, limit }: TaskListProps) {
  const displayTasks = limit ? tasks.slice(0, limit) : tasks;

  return (
    <div style={{ padding: 8 }}>
      {displayTasks.map((task) => {
        const tagStyle = task.tag ? TAG_COLORS[task.tag] : { bg: "rgba(128,128,128,0.08)", color: "var(--void-muted)" };
        const priColor = task.priority ? PRIORITY_COLORS[task.priority] : "var(--void-muted)";

        return (
          <div
            key={task.id}
            onClick={() => onToggle(task.id)}
            className="flex items-center gap-2 rounded-md cursor-pointer transition-all duration-150 hover:bg-[rgba(128,128,128,0.05)]"
            style={{ padding: "7px 8px" }}
          >
            {/* Checkbox */}
            <span
              style={{
                width: 15,
                height: 15,
                borderRadius: 4,
                border: task.done ? "none" : `1.5px solid ${priColor}`,
                background: task.done ? "var(--status-ok)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#fff",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {task.done ? "✓" : ""}
            </span>

            {/* Task text */}
            <span
              className="transition-colors duration-150"
              style={{
                flex: 1,
                fontSize: 12,
                color: task.done ? "var(--void-dim)" : "var(--void-text)",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.text}
            </span>

            {/* Tag */}
            {task.tag && (
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 3,
                  fontWeight: 500,
                  background: tagStyle.bg,
                  color: tagStyle.color,
                }}
              >
                {task.tag}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
