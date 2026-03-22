"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Rocket,
  ExternalLink,
  GitBranch,
  Globe,
  RefreshCw,
  Trash2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/context/ThemeContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { Project, Deployment } from "@/lib/generated/prisma/client";
import { type DeployStatus } from "@/data/mockData";

// Extending the prisma types to include the relations loaded from the server
export type ProjectWithRelations = Project & {
  deployments: Deployment[];
  _count?: {
    deployments: number;
  };
};

const frameworkColors: Record<string, string> = {
  "Node.js": "#22C55E",
  React: "#38BDF8",
  Python: "#EAB308",
  Nextjs: "#000000",
  "Next.js": "#000000",
  PostgreSQL: "#0A4D9E",
};

export function ProjectCard({
  project,
  darkMode,
}: {
  project: ProjectWithRelations;
  darkMode: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 hover:border-gray-700"
    : "bg-white border border-gray-100 hover:border-gray-200 shadow-sm";

  const handleDeploy = () => {
    toast.success(`Redeploying ${project.name}...`);
  };

  const handleDelete = () => {
    toast.error(`Delete ${project.name}? This action cannot be undone.`);
    setMenuOpen(false);
  };

  const latestDeploy = project.deployments?.[0];
  const uiStatus =
    latestDeploy?.status === "LIVE"
      ? "live"
      : latestDeploy?.status === "FAILED"
        ? "failed"
        : !latestDeploy
          ? "sleeping"
          : "building";

  const lastDeployText = latestDeploy?.createdAt
    ? new Date(latestDeploy.createdAt).toLocaleDateString()
    : "Never";

  const projectUrl =
    project.customDomain ||
    (project.subdomain ? `${project.subdomain}.hostifer.me` : "");

  return (
    <div
      className={`rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style={{
              backgroundColor:
                frameworkColors[project.framework || ""] ?? "#6B7280",
            }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold truncate ${textPrimary}`}>
              {project.name}
            </h3>
            <p className={`text-xs truncate ${textSecondary}`}>
              {project.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="relative shrink-0 ml-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            aria-label="Project options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className={`absolute right-0 top-8 w-44 rounded-lg shadow-lg border z-20 py-1
                ${darkMode ? "bg-[#1F2937] border-gray-700" : "bg-white border-gray-200"}`}
              >
                <button
                  onClick={handleDeploy}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <RefreshCw size={14} />
                  Redeploy
                </button>
                <Link
                  href="/settings"
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={14} />
                  Settings
                </Link>
                <div
                  className={`my-1 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                />
                <button
                  onClick={handleDelete}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 ${darkMode ? "hover:bg-gray-800" : "hover:bg-red-50"}`}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
          <GitBranch size={12} />
          <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {project.branch}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
          <Globe size={12} />
          {project.region}
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
          <Rocket size={12} />
          {project._count?.deployments || 0} deploys
        </div>
      </div>

      <div
        className={`flex items-center justify-between pt-3 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={uiStatus as DeployStatus} />
          <span className={`text-xs ${textSecondary}`}>{lastDeployText}</span>
        </div>
        <div className="flex items-center gap-2">
          {projectUrl && (
            <a
              href={`https://${projectUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs flex items-center gap-1 font-medium ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-[#0A4D9E] hover:underline"}`}
              onClick={(e) => {
                if (!projectUrl) e.preventDefault();
              }}
            >
              <ExternalLink size={12} />
              Visit
            </a>
          )}
          <button
            onClick={handleDeploy}
            className="flex items-center gap-1.5 text-xs bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Rocket size={12} />
            Deploy
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { darkMode } = useTheme();

  const initialSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (currentQ === debouncedSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, pathname, router, searchParams]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 max-w-sm
        ${darkMode ? "bg-[#1F2937] border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-500 shadow-sm"}`}
      >
        <Search size={16} className="shrink-0" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400"
          aria-label="Search projects"
        />
      </div>

      <div className="flex gap-2">
        {["all", "live", "building", "failed", "sleeping"].map((f) => (
          <button
            key={f}
            onClick={() => handleStatusChange(f)}
            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${
                currentStatus === f
                  ? "bg-[#0A4D9E] text-white"
                  : darkMode
                    ? "bg-[#1F2937] border border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectListClient({
  projects,
}: {
  projects: ProjectWithRelations[];
}) {
  const { darkMode } = useTheme();

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Projects</h1>
          <p className={`text-sm mt-0.5 ${textSecondary}`}>
            {projects.length} projects match filters
          </p>
        </div>
        <Link
          href="/deploy"
          className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <ProjectFilters />

      {projects.length === 0 ? (
        <div
          className={`text-center py-20 rounded-xl ${darkMode ? "bg-[#111827] border border-gray-800" : "bg-white border border-gray-100"}`}
        >
          <Rocket size={40} className={`mx-auto mb-4 ${textSecondary}`} />
          <p className={`text-lg font-semibold ${textPrimary}`}>
            No projects found
          </p>
          <p className={`text-sm ${textSecondary} mt-1`}>
            Try a different search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
