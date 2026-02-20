"use client";

import { useState, useEffect, useCallback } from "react";
import { onDataChanged } from "@/lib/events";
import type { VaultFile } from "@/lib/types";
import CalendarView from "./CalendarView";
import NotePreviewModal from "./NotePreviewModal";

export default function VaultRightPanel() {
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [modalPath, setModalPath] = useState<string | null>(null);

  const loadDailyNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/list?folder=01-Daily");
      const data = await res.json();
      const dates = (data.files || [])
        .map((f: VaultFile) => f.name.replace(".md", ""))
        .filter((name: string) => /^\d{4}-\d{2}-\d{2}$/.test(name));
      setDailyDates(dates);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    loadDailyNotes();
  }, [loadDailyNotes]);

  useEffect(() => {
    return onDataChanged(() => {
      loadDailyNotes();
    }, "vault");
  }, [loadDailyNotes]);

  const handleDayClick = useCallback((date: string) => {
    setModalPath(`01-Daily/${date}.md`);
  }, []);

  const sectionHeader = {
    fontSize: 11,
    fontWeight: 600 as const,
    color: "var(--void-faint)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 10,
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Calendar View */}
      <section style={{ marginBottom: 24 }}>
        <div style={sectionHeader}>Daily Notes</div>
        <div className="void-card" style={{ padding: 12 }}>
          <CalendarView dailyNotes={dailyDates} onDayClick={handleDayClick} />
        </div>
      </section>

      {/* Note Preview Modal */}
      <NotePreviewModal
        isOpen={modalPath !== null}
        onClose={() => setModalPath(null)}
        filePath={modalPath}
      />
    </div>
  );
}
