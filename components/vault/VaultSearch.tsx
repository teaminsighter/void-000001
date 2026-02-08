"use client";

interface VaultSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function VaultSearch({
  value,
  onChange,
  placeholder = "Search vault...",
}: VaultSearchProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="outline-none w-full"
        style={{
          padding: "10px 14px",
          paddingLeft: 36,
          borderRadius: 8,
          border: "1px solid var(--void-border)",
          background: "var(--void-surface)",
          color: "var(--void-white)",
          fontSize: 13,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--void-faint)",
          fontSize: 14,
        }}
      >
        ⌕
      </div>
    </div>
  );
}
