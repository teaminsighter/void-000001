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
          className="flex items-center gap-2 rounded-md transition-all duration-150 cursor-pointer hover:bg-[rgba(128,128,128,0.05)]"
          style={{ padding: "6px 8px" }}
        >
          {/* Icon */}
          <span style={{ fontSize: 13, color: "var(--void-dim)" }}>◇</span>

          {/* File info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--void-text)" }}>{file.name}</div>
            <div style={{ fontSize: 9.5, color: "var(--void-faint)" }}>{file.folder}</div>
          </div>

          {/* Modified */}
          <span
            className="font-mono"
            style={{ fontSize: 9.5, color: "var(--void-faint)" }}
          >
            {file.modified}
          </span>
        </div>
      ))}
    </div>
  );
}
