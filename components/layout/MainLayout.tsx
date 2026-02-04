"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { useKeyboard } from "@/hooks/useKeyboard";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useKeyboard();

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{ background: "var(--void-bg)" }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar onSearchClick={() => setCommandPaletteOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Palette overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
