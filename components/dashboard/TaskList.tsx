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
        const tagStyle = task.tag ? TAG_COLORS[task.tag] : { bg: "#ffffff08", color: "#71717a" };
        const priColor = task.priority ? PRIORITY_COLORS[task.priority] : "#71717a";

        return (
          <div
            key={task.id}
            onClick={() => onToggle(task.id)}
            className="flex items-center gap-2 rounded-md cursor-pointer transition-colors"
            style={{ padding: "7px 8px" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Checkbox */}
            <span
              style={{
                width: 15,
                height: 15,
                borderRadius: 4,
                border: task.done ? "none" : `1.5px solid ${priColor}`,
                background: task.done ? "#22c55e" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {task.done ? "✓" : ""}
            </span>

            {/* Task text */}
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: task.done ? "#52525b" : "#d4d4d8",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.text}
            </span>

            {/* Tag */}
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
          </div>
        );
      })}
    </div>
  );
}
