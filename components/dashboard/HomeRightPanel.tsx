"use client";

import { useState, useEffect, useCallback } from "react";
import { onDataChanged } from "@/lib/events";

interface AgentDisplayContent {
  type: "quote" | "image" | "note" | "graph" | "motivation" | "empty";
  title?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  updatedAt: string;
}

export default function HomeRightPanel() {
  const [display, setDisplay] = useState<AgentDisplayContent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDisplay = useCallback(() => {
    fetch("/api/agent-display")
      .then((r) => r.json())
      .then((data) => {
        setDisplay(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadDisplay();
  }, [loadDisplay]);

  // Auto-refresh when agent updates the display
  useEffect(() => {
    return onDataChanged(() => {
      loadDisplay();
    });
  }, [loadDisplay]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div style={{ color: "var(--void-dim)", fontSize: 12 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ padding: 20 }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--void-faint)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--void-accent)",
            animation: "pulse 2s infinite",
          }}
        />
        Agent Display
      </div>

      {/* Content Area */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: "var(--void-surface)",
          border: "1px solid var(--void-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {!display || display.type === "empty" ? (
          <EmptyState />
        ) : display.type === "quote" || display.type === "motivation" ? (
          <QuoteDisplay display={display} />
        ) : display.type === "image" ? (
          <ImageDisplay display={display} />
        ) : display.type === "note" ? (
          <NoteDisplay display={display} />
        ) : display.type === "graph" ? (
          <GraphDisplay />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Footer hint */}
      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: "var(--void-faint)",
          textAlign: "center",
        }}
      >
        Ask the agent to display quotes, images, or notes
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center"
      style={{ padding: 32 }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "var(--void-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          fontSize: 20,
        }}
      >
        V
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--void-text)",
          marginBottom: 6,
        }}
      >
        Agent Display
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--void-dim)",
          lineHeight: 1.5,
          maxWidth: 200,
        }}
      >
        Ask me to show a quote, motivation, image, or note graph here
      </div>
    </div>
  );
}

function QuoteDisplay({ display }: { display: AgentDisplayContent }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center"
      style={{ padding: 28 }}
    >
      {display.title && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--void-accent)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          {display.title}
        </div>
      )}
      <div
        style={{
          fontSize: 32,
          color: "var(--void-accent)",
          marginBottom: 12,
          opacity: 0.5,
        }}
      >
        "
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "var(--void-white)",
          lineHeight: 1.6,
          maxWidth: 280,
          marginBottom: 16,
        }}
      >
        {display.content}
      </div>
      {display.author && (
        <div
          style={{
            fontSize: 12,
            color: "var(--void-muted)",
            fontStyle: "italic",
          }}
        >
          — {display.author}
        </div>
      )}
    </div>
  );
}

function ImageDisplay({ display }: { display: AgentDisplayContent }) {
  return (
    <div className="flex-1 flex flex-col">
      {display.title && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--void-border)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--void-text)",
          }}
        >
          {display.title}
        </div>
      )}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: 16 }}
      >
        {display.imageUrl ? (
          <img
            src={display.imageUrl}
            alt={display.title || "Agent display"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: 8,
              objectFit: "contain",
            }}
          />
        ) : (
          <div style={{ color: "var(--void-dim)", fontSize: 12 }}>
            No image set
          </div>
        )}
      </div>
      {display.content && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--void-border)",
            fontSize: 11,
            color: "var(--void-muted)",
          }}
        >
          {display.content}
        </div>
      )}
    </div>
  );
}

function NoteDisplay({ display }: { display: AgentDisplayContent }) {
  return (
    <div className="flex-1 flex flex-col">
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--void-border)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--void-text)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>📝</span>
        {display.title || "Note"}
      </div>
      <div
        className="flex-1 overflow-auto"
        style={{
          padding: 16,
          fontSize: 13,
          color: "var(--void-text)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {display.content || "No content"}
      </div>
    </div>
  );
}

function GraphDisplay() {
  // Simple placeholder for note graph visualization
  const nodes = [
    { x: 50, y: 50, label: "Ideas" },
    { x: 80, y: 30, label: "Projects" },
    { x: 30, y: 70, label: "Notes" },
    { x: 70, y: 75, label: "Tasks" },
    { x: 50, y: 90, label: "Archive" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--void-border)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--void-text)",
        }}
      >
        Note Graph
      </div>
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: 16 }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: 300,
          }}
        >
          {/* Connections */}
          <line x1="50" y1="50" x2="80" y2="30" stroke="var(--void-border)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="30" y2="70" stroke="var(--void-border)" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="70" y2="75" stroke="var(--void-border)" strokeWidth="0.5" />
          <line x1="30" y1="70" x2="50" y2="90" stroke="var(--void-border)" strokeWidth="0.5" />
          <line x1="70" y1="75" x2="50" y2="90" stroke="var(--void-border)" strokeWidth="0.5" />
          <line x1="80" y1="30" x2="70" y2="75" stroke="var(--void-border)" strokeWidth="0.5" />

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill={i === 0 ? "var(--void-accent)" : "var(--void-muted)"}
              />
              <text
                x={node.x}
                y={node.y - 7}
                textAnchor="middle"
                fill="var(--void-dim)"
                fontSize="4"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
