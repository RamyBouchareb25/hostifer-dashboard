"use client";

import React from "react";
import {
  Rocket,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { mockDeployments } from "@/data/mockData";
import { useTheme } from "@/context/ThemeContext";

const activityItems = [
  {
    type: "deploy",
    project: "api-gateway",
    message: "Deployed successfully",
    time: "2 min ago",
    status: "live" as const,
  },
  {
    type: "build",
    project: "frontend-dashboard",
    message: "Build started",
    time: "5 min ago",
    status: "building" as const,
  },
  {
    type: "alert",
    project: "ml-pipeline",
    message: "Build failed: dependency error",
    time: "3 hr ago",
    status: "failed" as const,
  },
  {
    type: "deploy",
    project: "auth-service",
    message: "Deployed successfully",
    time: "1 hr ago",
    status: "live" as const,
  },
  {
    type: "redeploy",
    project: "static-website",
    message: "Manual redeploy triggered",
    time: "2 days ago",
    status: "live" as const,
  },
  {
    type: "deploy",
    project: "api-gateway",
    message: "Deployed successfully",
    time: "6 hr ago",
    status: "live" as const,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  deploy: <Rocket size={16} className="text-[#22C55E]" />,
  build: <Clock size={16} className="text-[#0A4D9E]" />,
  alert: <AlertCircle size={16} className="text-red-500" />,
  redeploy: <RefreshCw size={16} className="text-[#7C3AED]" />,
};

export default function ActivityPage() {
  const { darkMode } = useTheme();

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 rounded-xl"
    : "bg-white border border-gray-100 rounded-xl shadow-sm";

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Activity</h1>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>
          All deployment and system events across your projects.
        </p>
      </div>

      <div className={cardClass + " p-6"}>
        <h2 className={`font-semibold mb-6 ${textPrimary}`}>Recent Activity</h2>

        <div className="relative">
          {/* Timeline line */}
          <div
            className={`absolute left-5 top-0 bottom-0 w-px ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
          />

          <div className="space-y-6">
            {activityItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4 relative">
                {/* Icon dot */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10
                  ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200 shadow-sm"}`}
                >
                  {iconMap[item.type] || <CheckCircle2 size={16} />}
                </div>

                <div
                  className={`flex-1 pb-4 border-b last:border-0 last:pb-0 ${darkMode ? "border-gray-800" : "border-gray-100"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-sm font-semibold ${textPrimary}`}>
                        {item.project}
                      </span>
                      <span className={`text-sm mx-2 ${textSecondary}`}>·</span>
                      <span className={`text-sm ${textSecondary}`}>
                        {item.message}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className={`text-xs mt-1 ${textSecondary}`}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployments table */}
      <div className={cardClass + " p-6"}>
        <h2 className={`font-semibold mb-4 ${textPrimary}`}>All Deployments</h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className={`text-xs font-medium ${textSecondary}`}>
                <th className="text-left py-2 pr-4">Project</th>
                <th className="text-left py-2 pr-4">Branch / Commit</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Duration</th>
                <th className="text-left py-2 pr-4">Triggered By</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockDeployments.map((dep) => (
                <tr
                  key={dep.id}
                  className={`border-t text-sm transition-colors ${darkMode ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-50 hover:bg-gray-50"}`}
                >
                  <td className={`py-3 pr-4 font-medium ${textPrimary}`}>
                    {dep.projectName}
                  </td>
                  <td className="py-3 pr-4">
                    <div
                      className={`flex items-center gap-1.5 ${textSecondary}`}
                    >
                      <GitBranch size={12} />
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "12px",
                        }}
                      >
                        {dep.branch} · {dep.commit}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate max-w-[200px] ${textSecondary}`}
                    >
                      {dep.commitMessage}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={dep.status} />
                  </td>
                  <td
                    className={`py-3 pr-4 ${textSecondary}`}
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "12px",
                    }}
                  >
                    {dep.duration}
                  </td>
                  <td className={`py-3 pr-4 ${textSecondary}`}>
                    {dep.triggeredBy}
                  </td>
                  <td className={`py-3 ${textSecondary}`}>{dep.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
