"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, Bell, Search } from "lucide-react";
import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode, theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`min-h-screen flex ${darkMode ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}
    >
      <SessionProvider>
        <Toaster
          position="top-right"
          theme={darkMode ? "dark" : "light"}
          richColors
        />

        <Sidebar
          darkMode={darkMode}
          theme={theme}
          setTheme={setTheme}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        {/* Main content */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
        >
          {/* Top bar */}
          <header
            className={`h-16 flex items-center gap-4 px-4 lg:px-6 border-b flex-shrink-0 sticky top-0 z-30
            ${darkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100 shadow-sm"}
          `}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div
              className={`hidden sm:flex items-center gap-2 flex-1 max-w-md px-3 py-2 rounded-lg border
            ${
              darkMode
                ? "bg-[#1F2937] border-gray-700 text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }
          `}
            >
              <Search size={16} className="flex-shrink-0" />
              <input
                type="text"
                placeholder="Search projects, deployments..."
                className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400"
                style={{ fontFamily: "Inter, sans-serif" }}
                aria-label="Search"
              />
              <kbd
                className={`hidden md:inline-flex px-1.5 py-0.5 text-xs rounded border ${darkMode ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-400"}`}
              >
                ⌘K
              </kbd>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                className={`relative p-2 rounded-lg transition-colors
                ${darkMode ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}
              `}
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full"
                  aria-label="New notifications"
                />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-semibold">JD</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </SessionProvider>
    </div>
  );
}
