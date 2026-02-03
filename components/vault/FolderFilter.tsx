"use client";

import { Pill } from "@/components/ui";

interface FolderFilterProps {
  folders: string[];
  active: string;
  onSelect: (folder: string) => void;
}

export default function FolderFilter({
  folders,
  active,
  onSelect,
}: FolderFilterProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {folders.map((folder) => (
        <Pill
          key={folder}
          active={active === folder}
          onClick={() => onSelect(folder)}
        >
          {folder}
        </Pill>
      ))}
    </div>
  );
}
