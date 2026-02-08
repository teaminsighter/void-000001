"use client";

import { useState, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { AgentRightPanel } from "@/components/agent";
import { HomeRightPanel } from "@/components/dashboard";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useTheme } from "@/hooks/useTheme";

interface MainLayoutProps {
  children: React.ReactNode;
}

function AgentRightPanelWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("c");

  const handleSelectConversation = useCallback(
    (id: string) => {
      router.replace(`/agent?c=${id}`);
    },
    [router]
  );

  const handleNewChat = useCallback(() => {
    router.replace("/agent");
  }, [router]);

  return (
    <AgentRightPanel
      activeConversationId={conversationId}
      onSelectConversation={handleSelectConversation}
      onNewChat={handleNewChat}
    />
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useKeyboard();
  const { theme, toggle: toggleTheme } = useTheme();
  const pathname = usePathname();
  const showRightPanel = pathname === "/agent" || pathname === "/";

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
        <Topbar
          onSearchClick={() => setCommandPaletteOpen(true)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        {/* Page content + optional right panel */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          {showRightPanel && (
            <aside
              className="overflow-y-auto border-l"
              style={{
                width: 300,
                minWidth: 300,
                borderColor: "var(--void-border)",
                background: "var(--void-bg)",
              }}
            >
              {pathname === "/agent" ? (
                <Suspense>
                  <AgentRightPanelWrapper />
                </Suspense>
              ) : (
                <HomeRightPanel />
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Command Palette overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
