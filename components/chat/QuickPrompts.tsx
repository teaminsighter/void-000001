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
          className="transition-colors"
          style={{
            padding: "4px 10px",
            borderRadius: 5,
            border: "1px solid #1a1b20",
            background: "#111218",
            color: "#71717a",
            fontSize: 10.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a1b20";
            e.currentTarget.style.color = "#a1a1aa";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111218";
            e.currentTarget.style.color = "#71717a";
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
