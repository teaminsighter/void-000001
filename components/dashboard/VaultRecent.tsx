"use client";

import { VaultFile } from "@/lib/types";

interface VaultRecentProps {
  files: VaultFile[];
  limit?: number;
}

export default function VaultRecent({ files, limit = 4 }: VaultRecentProps) {
  const displayFiles = files.slice(0, limit);

  return (
    <div style={{ padding: 8 }}>
      {displayFiles.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-md transition-colors cursor-pointer"
          style={{ padding: "6px 8px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Icon */}
          <span style={{ fontSize: 13, color: "#52525b" }}>◇</span>

          {/* File info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#d4d4d8" }}>{file.name}</div>
            <div style={{ fontSize: 9.5, color: "#3f3f46" }}>{file.folder}</div>
          </div>

          {/* Modified */}
          <span
            className="font-mono"
            style={{ fontSize: 9.5, color: "#3f3f46" }}
          >
            {file.modified}
          </span>
        </div>
      ))}
    </div>
  );
}
