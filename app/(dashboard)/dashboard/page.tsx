"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Rocket,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Globe,
  Database,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  mockProjects,
  mockDeployments,
  usageChartData,
  deploymentChartData,
  resourcePieData,
} from "@/data/mockData";
import { useTheme } from "@/context/ThemeContext";

const metrics = [
  {
    label: "Active Deployments",
    value: "18",
    change: "+3",
    positive: true,
    icon: Rocket,
    color: "#0A4D9E",
    bg: "#0A4D9E15",
  },
  {
    label: "Requests / min",
    value: "11.2K",
    change: "+12%",
    positive: true,
    icon: Activity,
    color: "#22C55E",
    bg: "#22C55E15",
  },
  {
    label: "Uptime (30d)",
    value: "99.98%",
    change: "+0.02%",
    positive: true,
    icon: CheckCircle2,
    color: "#7C3AED",
    bg: "#7C3AED15",
  },
  {
    label: "Failed Builds",
    value: "2",
    change: "-5",
    positive: true,
    icon: AlertCircle,
    color: "#EF4444",
    bg: "#EF444415",
  },
];

export default function DashboardPage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 rounded-xl"
    : "bg-white border border-gray-100 rounded-xl shadow-sm";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-28 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`lg:col-span-2 h-72 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
          />
          <div
            className={`h-72 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h1>
          <p className={`text-sm mt-0.5 ${textSecondary}`}>
            Welcome back, John. Here&apos;s what&apos;s happening.
          </p>
        </div>
        <Link
          href="/deploy"
          className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Rocket size={16} /> New Deployment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={cardClass + " p-5"}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>{m.label}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{m.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {m.positive ? (
                    <ArrowUpRight size={14} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${m.positive ? "text-green-500" : "text-red-500"}`}
                  >
                    {m.change} this week
                  </span>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: m.bg }}
              >
                <m.icon size={20} style={{ color: m.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClass + " p-5 lg:col-span-2"}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>
                Request Traffic
              </h2>
              <p className={`text-xs ${textSecondary} mt-0.5`}>
                Requests per minute over last 10 hours
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-md ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}
            >
              Today
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={usageChartData}>
              <defs>
                <linearGradient id="requestsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A4D9E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0A4D9E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bandwidthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#1F2937" : "#F3F4F6"}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: darkMode ? "#6B7280" : "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: darkMode ? "#6B7280" : "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1F2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: darkMode ? "#fff" : "#111827",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#0A4D9E"
                strokeWidth={2}
                fill="url(#requestsGrad)"
                name="Requests"
              />
              <Area
                type="monotone"
                dataKey="bandwidth"
                stroke="#7C3AED"
                strokeWidth={2}
                fill="url(#bandwidthGrad)"
                name="Bandwidth (MB)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClass + " p-5"}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>Resource Usage</h2>
              <p className={`text-xs ${textSecondary} mt-0.5`}>
                Cost breakdown
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={resourcePieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {resourcePieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1F2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {resourcePieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-xs ${textSecondary}`}>
                    {item.name}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${textPrimary}`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardClass + " p-5"}>
          <div className="mb-4">
            <h2 className={`font-semibold ${textPrimary}`}>Deploy History</h2>
            <p className={`text-xs ${textSecondary} mt-0.5`}>
              Success vs failed last 7 days
            </p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deploymentChartData} barSize={12}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#1F2937" : "#F3F4F6"}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: darkMode ? "#6B7280" : "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: darkMode ? "#6B7280" : "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1F2937" : "#fff",
                  border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="success"
                fill="#22C55E"
                name="Success"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="#EF4444"
                name="Failed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClass + " p-5 lg:col-span-2"}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${textPrimary}`}>
              Recent Deployments
            </h2>
            <Link
              href="/projects"
              className={`text-xs font-medium ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-[#0A4D9E] hover:underline"}`}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {mockDeployments.map((dep) => (
              <div
                key={dep.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <Rocket size={14} className={textSecondary} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${textPrimary}`}
                    >
                      {dep.projectName}
                    </p>
                    <StatusBadge status={dep.status} />
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${textSecondary}`}
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {dep.commit} · {dep.commitMessage}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-xs ${textSecondary}`}>{dep.createdAt}</p>
                  {dep.duration !== "—" && (
                    <p
                      className={`text-xs flex items-center gap-1 mt-0.5 ${textSecondary}`}
                    >
                      <Clock size={11} />
                      {dep.duration}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Server,
            label: "Services Running",
            value: "6",
            sub: "Across 3 regions",
            color: "#0A4D9E",
          },
          {
            icon: Globe,
            label: "Avg Response Time",
            value: "42ms",
            sub: "P95: 128ms",
            color: "#22C55E",
          },
          {
            icon: Database,
            label: "Storage Used",
            value: "12.4 GB",
            sub: "of 50 GB plan",
            color: "#7C3AED",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={cardClass + " p-5 flex items-center gap-4"}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.color + "15" }}
            >
              <item.icon size={22} style={{ color: item.color }} />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>{item.label}</p>
              <p className={`text-xl font-bold ${textPrimary}`}>{item.value}</p>
              <p className={`text-xs ${textSecondary}`}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
