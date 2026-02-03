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
        background: "#111218",
        borderColor: "#1a1b20",
      }}
    >
      {/* Header Row */}
      <div
        className="grid border-b"
        style={{
          gridTemplateColumns: "1fr 140px 100px 80px",
          padding: "10px 16px",
          borderColor: "#1a1b20",
          background: "#0c0d10",
        }}
      >
        <div style={{ fontSize: 10, color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Name
        </div>
        <div style={{ fontSize: 10, color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Folder
        </div>
        <div style={{ fontSize: 10, color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Modified
        </div>
        <div style={{ fontSize: 10, color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right" }}>
          Size
        </div>
      </div>

      {/* File Rows */}
      {files.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            color: "#52525b",
            fontSize: 12,
          }}
        >
          No files in this folder
        </div>
      ) : (
        files.map((file, index) => (
          <div
            key={index}
            className="grid border-b cursor-pointer transition-colors"
            style={{
              gridTemplateColumns: "1fr 140px 100px 80px",
              padding: "12px 16px",
              borderColor: "#1a1b20",
            }}
            onClick={() => onFileClick?.(file)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1a1b20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ fontSize: 12.5, color: "#d4d4d8" }}>
              {file.name}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "#71717a" }}
            >
              {file.folder}
            </div>
            <div style={{ fontSize: 11, color: "#52525b" }}>
              {file.modified}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "#52525b", textAlign: "right" }}
            >
              {file.size}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
