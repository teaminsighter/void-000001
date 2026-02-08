"use client";

import { useState, useRef } from "react";
import { Attachment } from "@/lib/types";

interface FileUploadProps {
  onUpload: (attachment: Attachment) => void;
  disabled?: boolean;
}

export default function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Upload failed:", err.error);
        return;
      }

      const data = await response.json();

      const attachment: Attachment = {
        id: data.id,
        name: data.name,
        type: data.type,
        mimeType: data.mimeType,
        path: data.path,
        url: data.url,
        size: data.size,
        extractedText: data.extractedText,
      };

      onUpload(attachment);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        title="Attach file"
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: isDragOver ? "1px solid var(--void-accent)" : "1px solid var(--void-border)",
          background: isDragOver ? "rgba(245, 158, 11, 0.1)" : "var(--void-surface)",
          color: isUploading ? "var(--void-accent)" : "var(--void-dim)",
          fontSize: 16,
          cursor: disabled || isUploading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          opacity: disabled ? 0.4 : 1,
          flexShrink: 0,
        }}
      >
        {isUploading ? "..." : "📎"}
      </button>
    </div>
  );
}
