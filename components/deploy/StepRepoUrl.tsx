"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Github,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { validateRepo } from "@/app/actions/validateRepo";

export interface RepoInfo {
  repoUrl: string;
  branch: string;
  name: string;
  framework: string;
}

interface StepRepoUrlProps {
  onNext: (data: RepoInfo) => void;
}

const FRAMEWORK_LABELS: Record<string, { label: string; icon: string }> = {
  next: { label: "Next.js", icon: "/frameworks/nextjs.svg" },
  react: { label: "React", icon: "/frameworks/react.svg" },
  vue: { label: "Vue.js", icon: "/frameworks/vuejs.svg" },
  nuxt: { label: "Nuxt", icon: "/frameworks/nuxt.svg" },
  svelte: { label: "Svelte", icon: "/frameworks/svelte.svg" },
  angular: { label: "Angular", icon: "/frameworks/angular.svg" },
  astro: { label: "Astro", icon: "/frameworks/astro.svg" },
  gatsby: { label: "Gatsby", icon: "/frameworks/gatsby.svg" },
  remix: { label: "Remix", icon: "/frameworks/remix.svg" },
  vite: { label: "Vite", icon: "/frameworks/vite.svg" },
  node: { label: "Node.js", icon: "/frameworks/nodejs.svg" },
  python: { label: "Python", icon: "/frameworks/python.svg" },
  rust: { label: "Rust", icon: "/frameworks/rust.svg" },
  go: { label: "Go", icon: "/frameworks/go.svg" },
  java: { label: "Java", icon: "/frameworks/java.svg" },
  ruby: { label: "Ruby", icon: "/frameworks/ruby.svg" },
  elixir: { label: "Elixir", icon: "/frameworks/elixir.svg" },
  php: { label: "PHP", icon: "/frameworks/php.svg" },
  docker: { label: "Docker", icon: "/frameworks/docker.svg" },
  express: { label: "Express", icon: "/frameworks/express.svg" },
  fastify: { label: "Fastify", icon: "/frameworks/fastify.svg" },
  "not-detected": { label: "Unknown", icon: "/frameworks/default.svg" },
};

export default function StepRepoUrl({ onNext }: StepRepoUrlProps) {
  const { darkMode } = useTheme();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [branches, setBranches] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [framework, setFramework] = useState<string | null>(null);
  const [repoDescription, setRepoDescription] = useState<string | null>(null);
  const [repoStars, setRepoStars] = useState<number | null>(null);

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

  const handleValidate = async () => {
    if (!repoUrl.trim()) {
      setError("Repository URL is required");
      return;
    }

    const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(repoUrl.trim())) {
      setError(
        "Please enter a valid GitHub URL (https://github.com/owner/repo)",
      );
      setValidated(false);
      return;
    }

    setValidating(true);
    setError("");
    setValidated(null);
    setFramework(null);
    setRepoDescription(null);
    setRepoStars(null);
    setBranches([]);

    const result = await validateRepo(repoUrl.trim());

    if (result.valid) {
      setValidated(true);
      setFramework(result.framework ?? "not-detected");
      setRepoDescription(result.description ?? null);
      setRepoStars(result.stars ?? null);
      if (result.branches && result.branches.length > 0) {
        setBranches(result.branches);
      }
      if (result.defaultBranch) {
        setBranch(result.defaultBranch);
      }
      // Auto-fill name from repo URL if empty
      if (!name) {
        const repoName =
          repoUrl
            .split("/")
            .pop()
            ?.replace(/\.git$/, "") || "";
        setName(repoName);
      }
    } else {
      setValidated(false);
      setError(result.error || "Repository validation failed.");
    }

    setValidating(false);
  };

  const handleNext = () => {
    if (!validated) return;
    if (!name.trim()) {
      setError("Service name is required");
      return;
    }
    onNext({
      repoUrl: repoUrl.trim(),
      branch,
      name: name.trim(),
      framework: framework ?? "not-detected",
    });
  };

  return (
    <div className="space-y-6">
      <div className={cardClass + " p-6"}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Github size={20} className={textPrimary} />
          </div>
          <div>
            <h2 className={`font-semibold ${textPrimary}`}>
              Connect Repository
            </h2>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>
              Enter a GitHub repository URL to deploy from
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Repo URL */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Git Repository URL
            </label>
            <div className="flex gap-2">
              <input
                placeholder="https://github.com/username/my-app"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setValidated(null);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleValidate();
                  }
                }}
                className={`${inputClass} flex-1 ${
                  validated === true
                    ? "border-green-500!"
                    : validated === false
                      ? "border-red-500!"
                      : ""
                }`}
                aria-label="Git repository URL"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={validating || !repoUrl.trim()}
                className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0"
              >
                {validating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate"
                )}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            {validated === true && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Repository found and accessible
                </p>
                {/* Detected framework badge */}
                {framework && (
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      darkMode
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {FRAMEWORK_LABELS[framework] ? (
                      <Image
                        src={FRAMEWORK_LABELS[framework].icon}
                        alt={FRAMEWORK_LABELS[framework].label}
                        width={16}
                        height={16}
                        className="shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/frameworks/default.svg";
                        }}
                      />
                    ) : (
                      <Package size={14} className={textSecondary} />
                    )}
                    <span>
                      {FRAMEWORK_LABELS[framework]?.label ?? "Unknown"} detected
                    </span>
                  </div>
                )}
                {repoDescription && (
                  <p className={`text-xs ${textSecondary}`}>
                    {repoDescription}
                  </p>
                )}
                {repoStars !== null && (
                  <p className={`text-xs ${textSecondary}`}>
                    ⭐ {repoStars.toLocaleString()} stars
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Branch & Service Name - shown after validation */}
          {validated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Branch
                </label>
                <div className="relative">
                  <GitBranch
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none z-10`}
                  />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={
                      inputClass + " pl-8 pr-8 appearance-none cursor-pointer"
                    }
                    aria-label="Branch"
                  >
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))
                    ) : (
                      <option value={branch}>{branch}</option>
                    )}
                  </select>
                  <svg
                    className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Service Name
                </label>
                <input
                  placeholder="my-awesome-app"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  aria-label="Service name"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <div
          className={`mt-6 p-3 rounded-lg text-xs ${
            darkMode
              ? "bg-gray-800/50 text-gray-400"
              : "bg-gray-50 text-gray-500"
          }`}
        >
          <p className="font-medium mb-1">
            Paste any public GitHub repo URL and click Validate.
          </p>
          <p>
            We&apos;ll check the repo exists, is public, and auto-detect its
            framework.
          </p>
        </div>
      </div>

      {/* Next button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!validated || !name.trim()}
          className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
