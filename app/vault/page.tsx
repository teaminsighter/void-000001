"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { VaultFile } from "@/lib/types";
import { onDataChanged } from "@/lib/events";
import { FolderFilter, FileTable, VaultSearch } from "@/components/vault";

export default function VaultPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [folders, setFolders] = useState<string[]>(["All"]);
  const [activeFolder, setActiveFolder] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/list");
      const data = await res.json();
      setFiles(data.files || []);

      // Extract unique folders
      const uniqueFolders = ["All", ...new Set(data.files?.map((f: VaultFile) => f.folder) || [])];
      setFolders(uniqueFolders as string[]);
    } catch (error) {
      console.error("Failed to load vault:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Auto-refresh when agent modifies vault via chat
  useEffect(() => {
    return onDataChanged(() => {
      loadFiles();
    }, 'vault');
  }, [loadFiles]);

  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by folder
    if (activeFolder !== "All") {
      result = result.filter((file) => file.folder === activeFolder);
    }

    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.folder.toLowerCase().includes(query)
      );
    }

    return result;
  }, [files, activeFolder, search]);

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: semanticQuery, limit: 5 }),
      });
      const data = await res.json();
      setSemanticResults(data.results?.map((r: { entry: string }) => r.entry.substring(0, 200)) || []);
    } catch (error) {
      console.error("Semantic search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--void-faint)" }}>Loading vault...</div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="void-heading">
          Vault
        </h1>
        <div className="void-subheading">
          {files.length} notes across {folders.length - 1} folders
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
          folders={folders}
          active={activeFolder}
          onSelect={setActiveFolder}
        />
      </div>

      {/* File Table */}
      <FileTable files={filteredFiles} />

      {/* Semantic Search */}
      <div
        className="void-card"
        style={{
          marginTop: 16,
          padding: 16,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
            Semantic Search
          </div>
          <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
            Search your vault with natural language
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
            placeholder="What are my goals for Q1?"
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--void-border)",
              background: "var(--void-surface)",
              color: "var(--void-white)",
              fontSize: 12,
            }}
          />
          <button
            onClick={handleSemanticSearch}
            disabled={isSearching}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: isSearching ? "#52525b" : "#34d399",
              color: "var(--void-bg)",
              fontSize: 12,
              fontWeight: 600,
              cursor: isSearching ? "not-allowed" : "pointer",
            }}
          >
            {isSearching ? "..." : "Ask Void-Haki"}
          </button>
        </div>

        {/* Results */}
        {semanticResults.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {semanticResults.map((result, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 12px",
                  marginTop: 8,
                  borderRadius: 6,
                  background: "var(--void-surface)",
                  fontSize: 11,
                  color: "var(--void-muted)",
                  lineHeight: 1.5,
                }}
              >
                {result}...
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
