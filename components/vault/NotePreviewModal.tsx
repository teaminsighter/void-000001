"use client";

import { useState, useEffect, useCallback } from "react";

interface NotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | null;
}

export default function NotePreviewModal({
  isOpen,
  onClose,
  filePath,
}: NotePreviewModalProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !filePath) return;

    setIsLoading(true);
    fetch("/api/vault/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath }),
    })
      .then((r) => r.json())
      .then((data) => setContent(data.raw || data.content || ""))
      .catch(() => setContent("Failed to load note."))
      .finally(() => setIsLoading(false));
  }, [isOpen, filePath]);

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

  if (!isOpen || !filePath) return null;

  const fileName = filePath.split("/").pop()?.replace(".md", "") || filePath;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: 560,
          maxHeight: "70vh",
          background: "var(--void-panel)",
          border: "1px solid var(--void-border)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--void-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--void-white)",
            }}
          >
            {fileName}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--void-faint)",
              cursor: "pointer",
              fontSize: 16,
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "16px 18px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {isLoading ? (
            <div style={{ color: "var(--void-faint)", fontSize: 12 }}>
              Loading...
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--void-muted)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "inherit",
              }}
            >
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
