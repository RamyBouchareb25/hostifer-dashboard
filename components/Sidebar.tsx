"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderCode,
  Rocket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  LogOut,
  CreditCard,
  Activity,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MoonLoader } from "react-spinners";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useUser } from "@/hooks/useUser";

type Theme = "light" | "dark" | "system";

interface SidebarProps {
  darkMode: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderCode, label: "Projects" },
  { href: "/deploy", icon: Rocket, label: "Deploy" },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const themeOrder: Theme[] = ["system", "light", "dark"];

export function Sidebar({
  darkMode,
  theme,
  setTheme,
  mobileOpen = false,
  onMobileClose,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isLoading } = useUser();
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value);
    onCollapsedChange?.(value);
  };
  const pathname = usePathname();

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut({ callbackUrl: "/dashboard" });
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${
            darkMode
              ? "bg-[#111827] border-r border-gray-800"
              : "bg-white border-r border-gray-100 shadow-sm"
          }
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}
        >
          {/* Logout confirmation dialog */}
          <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleLogout}
                  className="px-4 min-w-20 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <MoonLoader size={16} color="white" />
                  ) : (
                    "Logout"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                H
              </span>
            </div>
            {!collapsed && (
              <span
                className={`font-bold text-lg truncate ${darkMode ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Hostifer
              </span>
            )}
          </div>
          {/* Mobile close */}
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                    ${
                      isActive
                        ? "bg-[#0A4D9E] text-white shadow-sm"
                        : darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                    ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div
          className={`p-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"} space-y-1`}
        >
          {/* Dark mode toggle */}
          <button
            onClick={() => {
              const next =
                themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];
              setTheme(next);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${
                darkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            aria-label="Toggle theme"
          >
            {theme === "system" ? (
              <Monitor size={18} />
            ) : darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
            {!collapsed && (
              <span className="text-sm font-medium">
                {theme === "system"
                  ? "System"
                  : darkMode
                    ? "Light Mode"
                    : "Dark Mode"}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={() => setIsLogoutOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${
                darkMode
                  ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            aria-label="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>

          {/* User info */}
          {!collapsed && (
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mt-1 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {isLoading
                    ? "Loading..."
                    : user?.name || user?.email || "User"}
                </p>
                <p
                  className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                >
                  Free Account
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center shadow-md
            ${darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
