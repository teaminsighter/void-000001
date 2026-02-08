"use client";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  "Plan my day",
  "Check email",
  "Search vault",
  "Log something",
  "Set reminder",
  "CRM update",
];

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PROMPTS.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelect(prompt)}
          className="void-hover-row"
          style={{
            padding: "4px 10px",
            borderRadius: 5,
            border: "1px solid var(--void-border)",
            background: "var(--void-surface)",
            color: "var(--void-dim)",
            fontSize: 10.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
