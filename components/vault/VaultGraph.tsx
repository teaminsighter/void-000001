"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { GraphNode, GraphEdge } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface VaultGraphProps {
  graphData: { nodes: GraphNode[]; edges: GraphEdge[] };
  onNodeClick: (filePath: string) => void;
  height?: number;
  showLabels?: boolean; // false = sidebar preview, true = fullscreen
}

const FOLDER_COLORS: Record<string, string> = {
  "00-Inbox": "#a1a1aa",
  "01-Daily": "#f59e0b",
  "02-Learning": "#34d399",
  "03-Office": "#60a5fa",
  "04-Projects": "#a78bfa",
  "05-References": "#fbbf24",
  "06-Reviews": "#ef4444",
  "07-Agent-Memory": "#3b82f6",
  "99-System": "#71717a",
};

function getFolderColor(folder: string): string {
  return FOLDER_COLORS[folder] || "#a1a1aa";
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function getThemeColors() {
  if (typeof document === "undefined") return { isDark: true, labelColor: "#a1a1aa" };
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  return {
    isDark,
    labelColor: isDark ? "#a1a1aa" : "#6b7280",
  };
}

export default function VaultGraph({
  graphData,
  onNodeClick,
  height = 280,
  showLabels = false,
}: VaultGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 300, height });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [theme, setTheme] = useState<{ isDark: boolean; labelColor: string }>({
    isDark: true,
    labelColor: "#a1a1aa",
  });

  // Watch theme changes
  useEffect(() => {
    setTheme(getThemeColors());
    const observer = new MutationObserver(() => setTheme(getThemeColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Adjacency map for hover highlighting
  const connectedNodes = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of graphData.edges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    }
    return map;
  }, [graphData.edges]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDimensions({ width: el.clientWidth, height });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  const data = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.edges.map((e) => ({ ...e })),
    }),
    [graphData]
  );

  // Setup forces and zoom to fit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.d3Force?.("charge")?.strength?.(-100);
        fgRef.current.d3Force?.("link")?.distance?.(40);
        fgRef.current.d3ReheatSimulation?.();
        setTimeout(() => fgRef.current?.zoomToFit?.(400, 50), 1000);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [data]);

  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      if (node.type === "file" && node.id) onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const nodeCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const color = getFolderColor(node.folder);
      const [r, g, b] = hexToRgb(color);
      const isFolder = node.type === "folder";
      const isHovered = node.id === hoveredNode;
      const isConnected = hoveredNode
        ? connectedNodes.get(hoveredNode)?.has(node.id) || false
        : false;
      const isDimmed = hoveredNode !== null && !isHovered && !isConnected;

      const baseR = isFolder ? 6 : 3.5;
      const radius = isHovered ? baseR * 1.4 : isConnected ? baseR * 1.15 : baseR;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const a = isDimmed ? 0.12 : 1;

      // Radial glow
      const glowR = radius * (isHovered ? 4.5 : 2.2);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      grad.addColorStop(0, `rgba(${r},${g},${b},${(isHovered ? 0.3 : 0.1) * a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      if (isFolder) {
        ctx.fillStyle = `rgba(${r},${g},${b},${0.15 * a})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.6 * a})`;
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${(isHovered ? 1 : 0.8) * a})`;
        ctx.fill();
      }

      // Label: always show folders; in sidebar show files on hover; in fullscreen show more
      const shouldShow = isHovered || isFolder || (showLabels && (isConnected || globalScale > 1.5));
      if (shouldShow && !isDimmed) {
        const label = node.name || "";
        const fs = Math.min(11, Math.max(5, (isFolder ? 8 : 7) / globalScale));
        ctx.font = `${isFolder ? 600 : 400} ${fs}px -apple-system, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isHovered
          ? theme.isDark ? "#fff" : "#111"
          : `rgba(${r},${g},${b},0.8)`;
        ctx.fillText(label, x, y + radius + 2 / globalScale);
      }
    },
    [hoveredNode, connectedNodes, showLabels, theme.isDark]
  );

  const linkCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any, ctx: CanvasRenderingContext2D) => {
      const isWiki = link.type === "wiki-link";
      const sId = typeof link.source === "object" ? link.source.id : link.source;
      const tId = typeof link.target === "object" ? link.target.id : link.target;
      const isHl = hoveredNode !== null && (sId === hoveredNode || tId === hoveredNode);
      const isDim = hoveredNode !== null && !isHl;

      const sx = typeof link.source === "object" ? link.source.x : 0;
      const sy = typeof link.source === "object" ? link.source.y : 0;
      const tx = typeof link.target === "object" ? link.target.x : 0;
      const ty = typeof link.target === "object" ? link.target.y : 0;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);

      const dim = theme.isDark ? "63,63,70" : "156,163,175";
      const amber = "245,158,11";

      if (isWiki) {
        ctx.strokeStyle = isHl ? `rgba(${amber},0.9)` : isDim ? `rgba(${amber},0.15)` : `rgba(${amber},0.55)`;
        ctx.lineWidth = isHl ? 1.5 : 0.8;
      } else {
        ctx.strokeStyle = isHl ? `rgba(${dim},0.6)` : isDim ? `rgba(${dim},0.08)` : `rgba(${dim},0.3)`;
        ctx.lineWidth = isHl ? 0.8 : 0.4;
      }
      ctx.stroke();
    },
    [hoveredNode, theme.isDark]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        background: theme.isDark ? "#0c0d10" : "#f8f8fa",
        borderRadius: 8,
        cursor: "grab",
        overflow: "hidden",
      }}
    >
      {typeof window !== "undefined" && (
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            const r = node.type === "folder" ? 9 : 6;
            ctx.beginPath();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.arc((node as any).x ?? 0, (node as any).y ?? 0, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkCanvasObject={linkCanvasObject}
          linkPointerAreaPaint={() => {}}
          onNodeHover={(node) => setHoveredNode(node?.id?.toString() || null)}
          onNodeClick={handleNodeClick}
          onNodeDragEnd={(node) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const n = node as any;
            n.fx = n.x;
            n.fy = n.y;
          }}
          backgroundColor="transparent"
          cooldownTicks={100}
          d3AlphaDecay={0.018}
          d3VelocityDecay={0.22}
          warmupTicks={40}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      )}
    </div>
  );
}
