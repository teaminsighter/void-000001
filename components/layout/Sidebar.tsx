"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/types";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  // Map path to page id
  const currentPageId = PAGES.find(p => p.path === pathname)?.id || "home";

  return (
    <aside
      className="h-full flex flex-col border-r transition-all duration-200 ease-in-out"
      style={{
        width: collapsed ? 56 : 200,
        minWidth: collapsed ? 56 : 200,
        background: "#0a0b0e",
        borderColor: "var(--void-border)",
      }}
    >
      {/* Logo */}
      <div
        onClick={onToggle}
        className="flex items-center gap-2.5 border-b cursor-pointer"
        style={{
          padding: collapsed ? "14px 0" : "14px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderColor: "var(--void-border)",
        }}
      >
        <div
          className="flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          }}
        >
          V
        </div>
        {!collapsed && (
          <span
            className="text-sm font-bold"
            style={{ color: "#fafafa", letterSpacing: -0.3 }}
          >
            Void
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto" style={{ padding: "8px 6px" }}>
        {PAGES.map((page) => {
          const isActive = currentPageId === page.id;

          return (
            <Link
              key={page.id}
              href={page.path}
              prefetch={true}
              className={`flex items-center gap-2.5 rounded-md mb-0.5 transition-colors ${
                isActive ? "nav-link-active" : "nav-link"
              }`}
              style={{
                padding: collapsed ? "9px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <span
                className="text-base flex-shrink-0"
                style={{
                  width: 24,
                  textAlign: "center",
                  color: isActive ? "#f59e0b" : "#52525b",
                }}
              >
                {page.icon}
              </span>
              {!collapsed && (
                <span
                  className="text-xs"
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#fafafa" : "#71717a",
                  }}
                >
                  {page.label}
                </span>
              )}
              {/* Mail badge */}
              {!collapsed && page.id === "mail" && (
                <span
                  className="ml-auto text-xs font-semibold"
                  style={{
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#ef4444",
                    fontSize: 9,
                  }}
                >
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className="border-t flex flex-col gap-1.5"
        style={{
          padding: collapsed ? "10px 0" : "10px 12px",
          borderColor: "var(--void-border)",
        }}
      >
        {/* System health */}
        {!collapsed && (
          <div
            className="flex items-center gap-1.5"
            style={{ padding: "4px 6px" }}
          >
            <div
              className="animate-pulse"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span style={{ fontSize: 10, color: "#52525b" }}>
              All systems healthy
            </span>
          </div>
        )}

        {/* User info */}
        <div
          className="flex items-center gap-2 rounded-md"
          style={{
            padding: "6px 8px",
            background: "rgba(255, 255, 255, 0.02)",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            className="flex items-center justify-center text-xs font-bold"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "rgba(245, 158, 11, 0.12)",
              color: "#f59e0b",
            }}
          >
            U
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 11, color: "#d4d4d8", fontWeight: 500 }}>
                User
              </div>
              <div style={{ fontSize: 9, color: "#3f3f46" }}>Dhaka, BD</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
