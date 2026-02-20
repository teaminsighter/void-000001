"use client";

import { useState, useMemo } from "react";

interface CalendarViewProps {
  dailyNotes: string[]; // YYYY-MM-DD dates that have notes
  onDayClick: (date: string) => void;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  return { daysInMonth, startDay };
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarView({ dailyNotes, onDayClick }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const noteSet = useMemo(() => new Set(dailyNotes), [dailyNotes]);

  const { daysInMonth, startDay } = useMemo(
    () => getMonthData(year, month),
    [year, month]
  );

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month Navigation */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 10 }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "none",
            border: "none",
            color: "var(--void-faint)",
            cursor: "pointer",
            fontSize: 14,
            padding: "2px 8px",
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--void-text)",
          }}
        >
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "none",
            color: "var(--void-faint)",
            cursor: "pointer",
            fontSize: 14,
            padding: "2px 8px",
          }}
        >
          ›
        </button>
      </div>

      {/* Day Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "var(--void-faint)",
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} style={{ aspectRatio: "1" }} />;
          }

          const dateStr = formatDate(year, month, day);
          const hasNote = noteSet.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => hasNote && onDayClick(dateStr)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                background: "none",
                border: isToday ? "1px solid var(--void-accent)" : "none",
                borderRadius: 6,
                color: isToday ? "var(--void-accent)" : "var(--void-muted)",
                fontSize: 11,
                cursor: hasNote ? "pointer" : "default",
                position: "relative",
                opacity: hasNote ? 1 : 0.5,
              }}
            >
              {day}
              {hasNote && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--void-accent)",
                    position: "absolute",
                    bottom: 3,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
