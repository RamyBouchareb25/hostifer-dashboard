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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/ThemeContext";
import { useDebounce } from "@/hooks/useDebounce";
import { syncProjectDeletionStatus } from "@/lib/actions/projects";
import type { Project, Deployment } from "@/lib/generated/prisma/client";
import { type DeployStatus } from "@/data/mockData";

// Extending the prisma types to include the relations loaded from the server
export type ProjectWithRelations = Project & {
  deployments: Deployment[];
  _count?: {
    deployments: number;
  };
  deleteWorkflowName?: string | null;
};

const frameworkColors: Record<string, string> = {
  "Node.js": "#22C55E",
  React: "#38BDF8",
  Python: "#EAB308",
  Nextjs: "#000000",
  "Next.js": "#000000",
  PostgreSQL: "#0A4D9E",
};

function DeleteProjectDialog({
  open,
  projectName,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  projectName: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");

  const canConfirm =
    confirmation.trim() === projectName && !isSubmitting && open;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmation("");
    }

    if (isSubmitting && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>Delete {projectName}?</DialogTitle>
          <DialogDescription>
            This will stop the Argo workflow, remove the project namespace, and
            permanently delete the project record after cleanup finishes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Type{" "}
            <span className="font-semibold text-foreground">{projectName}</span>{" "}
            to confirm.
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={projectName}
            autoComplete="off"
            spellCheck={false}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {isSubmitting ? "Deleting..." : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectCard({
  project,
  darkMode,
}: {
  project: ProjectWithRelations;
  darkMode: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 hover:border-gray-700"
    : "bg-white border border-gray-100 hover:border-gray-200 shadow-sm";
  const projectStatus = String(project.status);
  const isProjectDeleting = projectStatus === "DELETING" || isDeleting;

  const handleDeploy = () => {
    if (isProjectDeleting) return;
    toast.success(`Redeploying ${project.name}...`);
  };

  const handleDelete = () => {
    if (isProjectDeleting) return;
    setMenuOpen(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error ?? "Failed to delete project");
        return;
      }

      toast.success(`Deleting ${project.name}...`);
      setDeleteModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (projectStatus !== "DELETING" || !project.deleteWorkflowName) return;

    let active = true;

    const pollDeletion = async () => {
      try {
        const result = await syncProjectDeletionStatus(project.id);

        if (!active) return;

        if (result.status === "DELETED") {
          active = false;
          router.refresh();
          return;
        }

        if (result.errorMessage) {
          active = false;
          toast.error(result.errorMessage);
        }
      } catch (error) {
        if (!active) return;

        if (error instanceof Error && error.message === "Project not found") {
          active = false;
          router.refresh();
        }
      }
    };

    void pollDeletion();
    const interval = setInterval(() => {
      void pollDeletion();
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [project.deleteWorkflowName, project.id, projectStatus, router]);

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
  const badgeStatus = projectStatus === "DELETING" ? "deleting" : uiStatus;

  return (
    <div
      className={`rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${cardClass} ${isProjectDeleting ? "opacity-80" : ""}`}
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
            disabled={isProjectDeleting}
            className={`p-1.5 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            aria-label="Project options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && !isProjectDeleting && (
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
                  disabled={isProjectDeleting}
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
                  disabled={isProjectDeleting}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-50 ${darkMode ? "hover:bg-gray-800" : "hover:bg-red-50"}`}
                >
                  <Trash2 size={14} />
                  {isDeleting ? "Deleting..." : "Delete"}
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
          <StatusBadge status={badgeStatus as DeployStatus} />
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
            disabled={isProjectDeleting}
            className="flex items-center gap-1.5 text-xs bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:bg-[#0A4D9E]/60 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Rocket size={12} />
            Deploy
          </button>
        </div>
      </div>

      <DeleteProjectDialog
        open={deleteModalOpen}
        projectName={project.name}
        isSubmitting={isDeleting}
        onOpenChange={setDeleteModalOpen}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
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
