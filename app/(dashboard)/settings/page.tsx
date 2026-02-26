"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  CreditCard,
  Key,
  Bell,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

const mockApiKeys = [
  {
    id: "1",
    name: "Production Key",
    key: "hst_live_a8f2e1b4c7d9...",
    created: "Jan 15, 2026",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "CI/CD Pipeline",
    key: "hst_live_x3k9m2n5p1q4...",
    created: "Feb 1, 2026",
    lastUsed: "1 day ago",
  },
];

export default function SettingsPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corp",
      timezone: "America/New_York",
    },
  });

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 rounded-xl"
    : "bg-white border border-gray-100 rounded-xl shadow-sm";
  const inputClass = `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
    ${
      darkMode
        ? "bg-[#1F2937] border-gray-700 text-white placeholder-gray-500 focus:border-[#0A4D9E]"
        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0A4D9E] focus:ring-2 focus:ring-[#0A4D9E]/10"
    }`;

  const handleSave = async (data: any) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Profile updated successfully!");
  };

  const handleCreateKey = () => {
    const newKey: (typeof mockApiKeys)[0] = {
      id: Date.now().toString(),
      name: `Key ${apiKeys.length + 1}`,
      key: `hst_live_${Math.random().toString(36).slice(2, 14)}...`,
      created: "Feb 22, 2026",
      lastUsed: "Never",
    };
    setApiKeys((prev) => [...prev, newKey]);
    toast.success("New API key created!");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API key revoked.");
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Settings</h1>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>
          Manage your account, billing, and security preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <nav className="flex lg:flex-col gap-1 lg:w-48 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                ${
                  activeTab === tab.id
                    ? "bg-[#0A4D9E] text-white"
                    : darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className={cardClass + " p-6"}>
              <h2 className={`font-semibold mb-6 ${textPrimary}`}>
                Profile Information
              </h2>
              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center">
                    <span className="text-white text-xl font-bold">JD</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-[#0A4D9E]"}`}
                    >
                      Change avatar
                    </button>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Full Name
                    </label>
                    <input {...register("name")} className={inputClass} />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email Address
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Company (Optional)
                    </label>
                    <input {...register("company")} className={inputClass} />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Timezone
                    </label>
                    <select {...register("timezone")} className={inputClass}>
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Los_Angeles">
                        Pacific Time (PT)
                      </option>
                      <option value="Europe/London">GMT/UTC</option>
                      <option value="Europe/Berlin">
                        Central European (CET)
                      </option>
                      <option value="Asia/Tokyo">Japan (JST)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    {loading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Billing */}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 ${textPrimary}`}>
                  Current Plan
                </h2>
                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 border-[#0A4D9E] ${darkMode ? "bg-blue-900/10" : "bg-blue-50"}`}
                >
                  <div>
                    <p className="font-semibold text-[#0A4D9E]">Starter Plan</p>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>
                      Free forever · 2 projects
                    </p>
                  </div>
                  <button className="bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 ${textPrimary}`}>
                  Usage This Month
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      label: "Compute Hours",
                      used: 45,
                      total: 100,
                      unit: "hrs",
                    },
                    { label: "Bandwidth", used: 12.4, total: 100, unit: "GB" },
                    {
                      label: "Build Minutes",
                      used: 230,
                      total: 500,
                      unit: "min",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm ${textSecondary}`}>
                          {item.label}
                        </span>
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {item.used} / {item.total} {item.unit}
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
                      >
                        <div
                          className="h-full rounded-full bg-[#0A4D9E] transition-all"
                          style={{
                            width: `${(item.used / item.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 ${textPrimary}`}>
                  Payment Method
                </h2>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <div
                    className={`w-10 h-6 rounded bg-gradient-to-r from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                      &bull;&bull;&bull;&bull; 4242
                    </p>
                    <p className={`text-xs ${textSecondary}`}>Expires 12/28</p>
                  </div>
                  <button
                    className={`ml-auto text-sm ${darkMode ? "text-blue-400" : "text-[#0A4D9E]"}`}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === "api-keys" && (
            <div className={cardClass + " p-6"}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`font-semibold ${textPrimary}`}>API Keys</h2>
                  <p className={`text-xs mt-0.5 ${textSecondary}`}>
                    Use these keys to authenticate with the Hostifer API.
                  </p>
                </div>
                <button
                  onClick={handleCreateKey}
                  className="flex items-center gap-1.5 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={15} />
                  New Key
                </button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className={`p-4 rounded-lg border ${darkMode ? "border-gray-700 bg-[#1F2937]" : "border-gray-200 bg-gray-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${textPrimary}`}>
                          {apiKey.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <code
                            className={`text-xs px-2 py-0.5 rounded ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600 border border-gray-200"}`}
                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                          >
                            {revealedKeys.has(apiKey.id)
                              ? apiKey.key.replace(
                                  "...",
                                  Math.random().toString(36).slice(2, 6),
                                )
                              : apiKey.key}
                          </code>
                          <button
                            onClick={() => toggleReveal(apiKey.id)}
                            className={`p-1 rounded ${textSecondary} hover:opacity-80`}
                            aria-label="Toggle key visibility"
                          >
                            {revealedKeys.has(apiKey.id) ? (
                              <EyeOff size={13} />
                            ) : (
                              <Eye size={13} />
                            )}
                          </button>
                          <button
                            onClick={() => copyKey(apiKey.key)}
                            className={`p-1 rounded ${textSecondary} hover:opacity-80`}
                            aria-label="Copy key"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <p className={`text-xs mt-1.5 ${textSecondary}`}>
                          Created {apiKey.created} · Last used {apiKey.lastUsed}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                        aria-label="Revoke key"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className={cardClass + " p-6"}>
              <h2 className={`font-semibold mb-6 ${textPrimary}`}>
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Deployment Success",
                    desc: "When a deployment completes successfully",
                    defaultOn: true,
                  },
                  {
                    label: "Deployment Failure",
                    desc: "When a deployment fails or errors",
                    defaultOn: true,
                  },
                  {
                    label: "Usage Alerts",
                    desc: "When usage approaches plan limits",
                    defaultOn: true,
                  },
                  {
                    label: "Billing Reminders",
                    desc: "Payment due dates and receipts",
                    defaultOn: false,
                  },
                  {
                    label: "Security Alerts",
                    desc: "Suspicious login or API activity",
                    defaultOn: true,
                  },
                  {
                    label: "Product Updates",
                    desc: "New features and announcements",
                    defaultOn: false,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-start justify-between p-4 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${textSecondary}`}>
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                      <input
                        type="checkbox"
                        defaultChecked={item.defaultOn}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A4D9E]" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 ${textPrimary}`}>
                  Change Password
                </h2>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        className={inputClass + " pr-10"}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                      >
                        {showCurrentPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        className={inputClass + " pr-10"}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                      >
                        {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success("Password updated!")}
                    className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 ${textPrimary}`}>
                  Two-Factor Authentication
                </h2>
                <div
                  className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? "bg-[#1F2937]" : "bg-gray-50"}`}
                >
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      Authenticator App
                    </p>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>
                      Use an authenticator app to generate codes
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info("2FA setup coming soon!")}
                    className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors
                      ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className={cardClass + " p-6"}>
                <h2 className={`font-semibold mb-4 text-red-500`}>
                  Danger Zone
                </h2>
                <div
                  className={`p-4 rounded-lg border border-red-200 ${darkMode ? "bg-red-900/10 border-red-900" : ""}`}
                >
                  <p className={`text-sm font-medium ${textPrimary}`}>
                    Delete Account
                  </p>
                  <p className={`text-xs mt-0.5 mb-3 ${textSecondary}`}>
                    Permanently delete your account and all associated data.
                    This cannot be undone.
                  </p>
                  <button
                    onClick={() =>
                      toast.error(
                        "Account deletion requires email confirmation.",
                      )
                    }
                    className="text-sm font-medium text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
