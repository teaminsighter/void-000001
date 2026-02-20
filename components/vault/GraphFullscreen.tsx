"use client";

import { useEffect, useCallback } from "react";
import type { GraphData } from "@/lib/types";
import VaultGraph from "./VaultGraph";

interface GraphFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  graphData: GraphData;
  onNodeClick: (filePath: string) => void;
}

export default function GraphFullscreen({
  isOpen,
  onClose,
  graphData,
  onNodeClick,
}: GraphFullscreenProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        background: "var(--void-bg)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--void-border)",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--void-text)",
            letterSpacing: 0.3,
          }}
        >
          Knowledge Graph
        </span>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11, color: "var(--void-faint)" }}>
            {graphData.nodes.filter((n) => n.type === "file").length} notes
            {" / "}
            {graphData.edges.filter((e) => e.type === "wiki-link").length} links
          </span>
          <button
            onClick={onClose}
            style={{
              background: "var(--void-surface)",
              border: "1px solid var(--void-border)",
              borderRadius: 6,
              color: "var(--void-muted)",
              cursor: "pointer",
              fontSize: 12,
              padding: "4px 12px",
            }}
          >
            ESC
          </button>
        </div>
      </div>

      {/* Full graph */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <VaultGraph
          graphData={graphData}
          onNodeClick={onNodeClick}
          height={typeof window !== "undefined" ? window.innerHeight - 50 : 600}
          showLabels={true}
        />
      </div>
    </div>
  );
}
