"use client";

import { useState, useEffect, useCallback } from "react";
import { onDataChanged } from "@/lib/events";

interface DisplayStyle {
  fontFamily?: "default" | "serif" | "mono" | "cursive" | "arabic" | "devanagari" | "japanese";
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  textColor?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  direction?: "ltr" | "rtl";
  animation?: "none" | "fade" | "slide" | "pulse" | "glow" | "typewriter";
  gradient?: string;
  borderStyle?: "none" | "solid" | "dashed" | "glow" | "neon";
  borderColor?: string;
}

interface AgentDisplayContent {
  type: "quote" | "image" | "note" | "graph" | "motivation" | "empty";
  title?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  style?: DisplayStyle;
  updatedAt: string;
}

// Font family mappings
const FONT_FAMILIES: Record<string, string> = {
  default: "var(--font-sans), system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  cursive: "'Dancing Script', 'Pacifico', cursive",
  arabic: "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif",
  devanagari: "'Noto Sans Devanagari', 'Poppins', sans-serif",
  japanese: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
};

// Font size mappings
const FONT_SIZES: Record<string, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 30,
  "3xl": 36,
};

// Animation CSS keyframes
const ANIMATION_STYLES = `
@keyframes displayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes displaySlide {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes displayPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes displayGlow {
  0%, 100% { filter: drop-shadow(0 0 5px var(--void-accent)); }
  50% { filter: drop-shadow(0 0 20px var(--void-accent)); }
}
@keyframes displayTypewriter {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes neonFlicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    box-shadow: 0 0 10px var(--neon-color), 0 0 20px var(--neon-color), 0 0 30px var(--neon-color);
  }
  20%, 24%, 55% {
    box-shadow: none;
  }
}
`;

// Get animation style
function getAnimationStyle(animation?: string): React.CSSProperties {
  if (!animation || animation === "none") return {};

  const animations: Record<string, string> = {
    fade: "displayFade 0.6s ease-out",
    slide: "displaySlide 0.5s ease-out",
    pulse: "displayPulse 2s ease-in-out infinite",
    glow: "displayGlow 2s ease-in-out infinite",
    typewriter: "displayTypewriter 2s steps(40, end)",
  };

  return { animation: animations[animation] || "" };
}

// Get border style
function getBorderStyle(style?: DisplayStyle): React.CSSProperties {
  if (!style?.borderStyle || style.borderStyle === "none") return {};

  const color = style.borderColor || "var(--void-accent)";

  switch (style.borderStyle) {
    case "solid":
      return { border: `2px solid ${color}` };
    case "dashed":
      return { border: `2px dashed ${color}` };
    case "glow":
      return {
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`
      };
    case "neon":
      return {
        border: `2px solid ${color}`,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
        animation: "neonFlicker 1.5s infinite alternate",
        ["--neon-color" as string]: color,
      };
    default:
      return {};
  }
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

  // Build container style from display style
  const containerStyle: React.CSSProperties = {
    background: display?.style?.gradient || display?.style?.backgroundColor || "var(--void-surface)",
    border: "1px solid var(--void-border)",
    borderRadius: 12,
    overflow: "hidden",
    ...getBorderStyle(display?.style),
    ...getAnimationStyle(display?.style?.animation),
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ padding: 20 }}
    >
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

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
      <div className="flex-1 flex flex-col" style={containerStyle}>
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
  const style = display.style || {};
  const fontFamily = FONT_FAMILIES[style.fontFamily || "default"];
  const fontSize = FONT_SIZES[style.fontSize || "lg"];
  const textColor = style.textColor || "var(--void-white)";
  const textAlign = style.textAlign || "center";
  const direction = style.direction || "ltr";

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{
        padding: 28,
        textAlign,
        direction,
      }}
    >
      {display.title && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: style.textColor ? `${textColor}99` : "var(--void-accent)",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
            fontFamily,
          }}
        >
          {display.title}
        </div>
      )}
      <div
        style={{
          fontSize: 32,
          color: style.textColor || "var(--void-accent)",
          marginBottom: 12,
          opacity: 0.5,
        }}
      >
        {direction === "rtl" ? "«" : "\u201C"}
      </div>
      <div
        style={{
          fontSize,
          fontWeight: 500,
          color: textColor,
          lineHeight: 1.7,
          maxWidth: 320,
          marginBottom: 16,
          fontFamily,
        }}
      >
        {display.content}
      </div>
      {display.author && (
        <div
          style={{
            fontSize: 12,
            color: style.textColor ? `${textColor}AA` : "var(--void-muted)",
            fontStyle: "italic",
            fontFamily,
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
  const style = display.style || {};
  const fontFamily = FONT_FAMILIES[style.fontFamily || "default"];
  const fontSize = FONT_SIZES[style.fontSize || "md"];
  const textColor = style.textColor || "var(--void-text)";
  const textAlign = style.textAlign || "left";
  const direction = style.direction || "ltr";

  return (
    <div className="flex-1 flex flex-col" style={{ direction }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--void-border)",
          fontSize: 12,
          fontWeight: 500,
          color: textColor,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily,
        }}
      >
        <span style={{ fontSize: 14 }}>📝</span>
        {display.title || "Note"}
      </div>
      <div
        className="flex-1 overflow-auto"
        style={{
          padding: 16,
          fontSize,
          color: textColor,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          fontFamily,
          textAlign,
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
