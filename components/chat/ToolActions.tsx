"use client";

import { useState } from "react";
import { ToolAction } from "@/lib/types";

const MUTATING_TOOLS = [
  "task_add",
  "task_remove",
  "task_toggle",
  "plan_generate",
  "plan_set_schedule",
  "log_entry",
  "save_note",
  "save_memory",
  "vault_move",
  "vault_delete",
  "send_email",
  "set_reminder",
  "crm_update",
];

interface ToolActionsProps {
  actions?: ToolAction[];
}

export default function ToolActions({ actions }: ToolActionsProps) {
  const hasMutating = actions?.some((a) => MUTATING_TOOLS.includes(a.tool));
  const [expanded, setExpanded] = useState(!!hasMutating);

  if (!actions || actions.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 6,
        borderRadius: 8,
        border: "1px solid var(--void-border)",
        background: "var(--void-surface)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "6px 10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--void-dim)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.15s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: 8,
          }}
        >
          ▶
        </span>
        <span className="font-mono">
          {actions.length} action{actions.length !== 1 ? "s" : ""} performed
        </span>
        {actions.some((a) => !a.success) && (
          <span
            style={{
              color: "#ef4444",
              fontSize: 9,
              fontWeight: 700,
              marginLeft: 4,
            }}
          >
            FAIL
          </span>
        )}
      </button>

      {/* Action list */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--void-border)",
            padding: "4px 0",
          }}
        >
          {actions.map((action, i) => (
            <div
              key={i}
              style={{
                padding: "5px 10px",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              {/* Status badge */}
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 3,
                  flexShrink: 0,
                  marginTop: 1,
                  background: action.success
                    ? "rgba(52, 211, 153, 0.12)"
                    : "rgba(239, 68, 68, 0.12)",
                  color: action.success ? "#34d399" : "#ef4444",
                }}
              >
                {action.success ? "OK" : "ERR"}
              </span>

              {/* Tool name */}
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--void-accent)",
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {action.tool}
              </span>

              {/* Result text */}
              <span
                style={{
                  fontSize: 10,
                  color: "var(--void-muted)",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {action.result.length > 300
                  ? action.result.slice(0, 300) + "..."
                  : action.result}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
