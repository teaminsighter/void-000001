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
          border: "1px solid #1a1b20",
          background: "#111218",
          color: "#fafafa",
          fontSize: 13,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#52525b",
          fontSize: 14,
        }}
      >
        ⌕
      </div>
    </div>
  );
}
