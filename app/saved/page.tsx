"use client";

import { useState } from "react";
import { MOCK_SAVED_ITEMS } from "@/lib/mock-data";
import { SavedList } from "@/components/saved";
import { Pill } from "@/components/ui";

const FILTERS = ["All", "Article", "Tutorial", "Video", "Guide"];

export default function SavedPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredItems =
    activeFilter === "All"
      ? MOCK_SAVED_ITEMS
      : MOCK_SAVED_ITEMS.filter((item) => item.type === activeFilter);

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fafafa" }}>
          Saved Items
        </h1>
        <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
          {MOCK_SAVED_ITEMS.length} bookmarks saved to vault
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 16 }}>
        {FILTERS.map((filter) => (
          <Pill
            key={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Pill>
        ))}
      </div>

      {/* Saved List */}
      <SavedList items={filteredItems} />

      {/* Add Item CTA */}
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
              Save New Item
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
              Add articles, tutorials, or videos to your vault
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#fbbf24",
              color: "#0c0d10",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
