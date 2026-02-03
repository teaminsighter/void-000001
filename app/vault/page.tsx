"use client";

import { useState, useMemo } from "react";
import { MOCK_VAULT_FILES, VAULT_FOLDERS } from "@/lib/mock-data";
import { FolderFilter, FileTable, VaultSearch } from "@/components/vault";

export default function VaultPage() {
  const [activeFolder, setActiveFolder] = useState("All");
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    let files = MOCK_VAULT_FILES;

    // Filter by folder
    if (activeFolder !== "All") {
      files = files.filter((file) => file.folder === activeFolder);
    }

    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase();
      files = files.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.folder.toLowerCase().includes(query)
      );
    }

    return files;
  }, [activeFolder, search]);

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Vault
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          {MOCK_VAULT_FILES.length} notes across {VAULT_FOLDERS.length - 1} folders
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 16 }}>
        <VaultSearch
          value={search}
          onChange={setSearch}
          placeholder="Search files by name..."
        />
      </div>

      {/* Folder Filter */}
      <div style={{ marginBottom: 16 }}>
        <FolderFilter
          folders={VAULT_FOLDERS}
          active={activeFolder}
          onSelect={setActiveFolder}
        />
      </div>

      {/* File Table */}
      <FileTable files={filteredFiles} />

      {/* Semantic Search CTA */}
      <div
        className="rounded-lg border"
        style={{
          marginTop: 16,
          padding: 16,
          background: "#111218",
          borderColor: "#1a1b20",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>
              Semantic Search
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              Search your vault with natural language via Khoj
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#34d399",
              color: "#0c0d10",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ask Khoj
          </button>
        </div>
      </div>
    </div>
  );
}
