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
        <h1 className="void-heading">
          Saved Items
        </h1>
        <div className="void-subheading">
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
        className="void-card"
        style={{
          marginTop: 16,
          padding: 16,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--void-white)" }}>
              Save New Item
            </div>
            <div style={{ fontSize: 11, color: "var(--void-faint)", marginTop: 2 }}>
              Add articles, tutorials, or videos to your vault
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#fbbf24",
              color: "var(--void-bg)",
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
