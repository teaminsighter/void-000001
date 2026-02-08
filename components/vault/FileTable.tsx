"use client";

import { VaultFile } from "@/lib/types";

interface FileTableProps {
  files: VaultFile[];
  onFileClick?: (file: VaultFile) => void;
}

export default function FileTable({ files, onFileClick }: FileTableProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      {/* Header Row */}
      <div
        className="grid border-b"
        style={{
          gridTemplateColumns: "1fr 140px 100px 80px",
          padding: "10px 16px",
          borderColor: "var(--void-border)",
          background: "var(--void-bg)",
        }}
      >
        <div style={{ fontSize: 10, color: "var(--void-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Name
        </div>
        <div style={{ fontSize: 10, color: "var(--void-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Folder
        </div>
        <div style={{ fontSize: 10, color: "var(--void-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Modified
        </div>
        <div style={{ fontSize: 10, color: "var(--void-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right" }}>
          Size
        </div>
      </div>

      {/* File Rows */}
      {files.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            color: "var(--void-faint)",
            fontSize: 12,
          }}
        >
          No files in this folder
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={index}
            className="grid border-b cursor-pointer void-hover-row"
            style={{
              gridTemplateColumns: "1fr 140px 100px 80px",
              padding: "12px 16px",
              borderColor: "var(--void-border)",
            }}
            onClick={() => onFileClick?.(file)}
          >
            <div style={{ fontSize: 12.5, color: "var(--void-text)" }}>
              {file.name}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "var(--void-dim)" }}
            >
              {file.folder}
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)" }}>
              {file.modified}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "var(--void-faint)", textAlign: "right" }}
            >
              {file.size}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
