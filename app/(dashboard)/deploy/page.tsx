"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  GitBranch,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { mockDeploymentLogs } from "@/data/mockData";
import { useTheme } from "@/context/ThemeContext";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  hidden: boolean;
}

interface DeployForm {
  repoUrl: string;
  branch: string;
  name: string;
  region: string;
  plan: string;
  buildCommand: string;
  startCommand: string;
}

type DeployPhase = "idle" | "deploying" | "success" | "failed";

export default function DeploymentPage() {
  const { darkMode } = useTheme();
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: "1", key: "NODE_ENV", value: "production", hidden: false },
  ]);
  const [phase, setPhase] = useState<DeployPhase>("idle");
  const [logs, setLogs] = useState<typeof mockDeploymentLogs>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeployForm>({
    defaultValues: {
      branch: "main",
      region: "us-east",
      plan: "starter",
      buildCommand: "npm run build",
      startCommand: "npm start",
    },
  });

  // Simulate log streaming
  useEffect(() => {
    if (phase !== "deploying") return;
    if (logIndex >= mockDeploymentLogs.length) {
      setPhase("success");
      toast.success("Deployment successful! 🚀");
      return;
    }
    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, mockDeploymentLogs[logIndex]]);
      setLogIndex((i) => i + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [phase, logIndex]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const onSubmit = async (data: DeployForm) => {
    setPhase("deploying");
    setLogs([]);
    setLogIndex(0);
    setShowLogs(true);
  };

  const addEnvVar = () => {
    setEnvVars((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        key: "",
        value: "",
        hidden: false,
      },
    ]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEnvVar = (id: string, field: "key" | "value", val: string) => {
    setEnvVars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    );
  };

  const toggleHidden = (id: string) => {
    setEnvVars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, hidden: !e.hidden } : e)),
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

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

  const logColors = {
    info: darkMode ? "text-gray-300" : "text-gray-700",
    warn: "text-yellow-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  return (
    <div
      className="space-y-6 max-w-4xl"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>New Deployment</h1>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>
          Deploy a web service, static site, or background worker.
        </p>
      </div>

      {/* Status banner */}
      {phase !== "idle" && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            phase === "deploying"
              ? darkMode
                ? "bg-blue-900/20 border-blue-800 text-blue-300"
                : "bg-blue-50 border-blue-200 text-blue-700"
              : phase === "success"
                ? darkMode
                  ? "bg-green-900/20 border-green-800 text-green-300"
                  : "bg-green-50 border-green-200 text-green-700"
                : darkMode
                  ? "bg-red-900/20 border-red-800 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {phase === "deploying" && (
            <Loader2 size={18} className="animate-spin flex-shrink-0" />
          )}
          {phase === "success" && (
            <CheckCircle2 size={18} className="flex-shrink-0" />
          )}
          {phase === "failed" && (
            <XCircle size={18} className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium">
            {phase === "deploying" && "Deployment in progress..."}
            {phase === "success" && "Deployment successful! Your app is live."}
            {phase === "failed" && "Deployment failed. Check the logs below."}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Repo section */}
        <div className={cardClass + " p-6"}>
          <h2 className={`font-semibold mb-4 ${textPrimary}`}>Repository</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Git Repository URL
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="https://github.com/username/my-app"
                  {...register("repoUrl", {
                    required: "Repository URL is required",
                  })}
                  className={inputClass + " flex-1"}
                  aria-label="Git repository URL"
                />
              </div>
              {errors.repoUrl && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.repoUrl.message}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Branch
              </label>
              <div className="relative">
                <GitBranch
                  size={14}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                />
                <input
                  {...register("branch")}
                  className={inputClass + " pl-8"}
                  aria-label="Branch"
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Service Name
              </label>
              <input
                placeholder="my-awesome-app"
                {...register("name", { required: "Name is required" })}
                className={inputClass}
                aria-label="Service name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className={cardClass + " p-6"}>
          <h2 className={`font-semibold mb-4 ${textPrimary}`}>Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Region
              </label>
              <select
                {...register("region")}
                className={inputClass}
                aria-label="Region"
              >
                <option value="us-east">🇺🇸 US East (N. Virginia)</option>
                <option value="us-west">🇺🇸 US West (Oregon)</option>
                <option value="eu-west">🇪🇺 EU West (Frankfurt)</option>
                <option value="ap-south">🇸🇬 Asia Pacific (Singapore)</option>
                <option value="ap-east">🇯🇵 Asia East (Tokyo)</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Plan
              </label>
              <select
                {...register("plan")}
                className={inputClass}
                aria-label="Plan"
              >
                <option value="starter">
                  Starter (Free) — 512 MB RAM, Shared CPU
                </option>
                <option value="standard">
                  Standard ($7/mo) — 1 GB RAM, 0.5 CPU
                </option>
                <option value="pro">Pro ($25/mo) — 2 GB RAM, 1 CPU</option>
                <option value="enterprise">Enterprise — Custom</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Build Command
              </label>
              <input
                {...register("buildCommand")}
                className={inputClass}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                }}
                aria-label="Build command"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Start Command
              </label>
              <input
                {...register("startCommand")}
                className={inputClass}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                }}
                aria-label="Start command"
              />
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className={cardClass + " p-6"}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>
                Environment Variables
              </h2>
              <p className={`text-xs mt-0.5 ${textSecondary}`}>
                Encrypted at rest and injected at runtime
              </p>
            </div>
            <button
              type="button"
              onClick={addEnvVar}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
                ${darkMode ? "text-blue-400 hover:bg-gray-800" : "text-[#0A4D9E] hover:bg-blue-50"}
              `}
            >
              <Plus size={15} />
              Add Variable
            </button>
          </div>

          <div className="space-y-2">
            {envVars.length === 0 && (
              <p className={`text-sm text-center py-4 ${textSecondary}`}>
                No environment variables added
              </p>
            )}
            {envVars.map((env) => (
              <div key={env.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="KEY"
                  value={env.key}
                  onChange={(e) => updateEnvVar(env.id, "key", e.target.value)}
                  className={inputClass + " flex-1 uppercase"}
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "13px",
                  }}
                  aria-label="Environment variable key"
                />
                <div className="relative flex-1">
                  <input
                    type={env.hidden ? "password" : "text"}
                    placeholder="value"
                    value={env.value}
                    onChange={(e) =>
                      updateEnvVar(env.id, "value", e.target.value)
                    }
                    className={inputClass + " pr-16"}
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "13px",
                    }}
                    aria-label="Environment variable value"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleHidden(env.id)}
                      className={`p-1 rounded ${textSecondary} hover:opacity-80`}
                      aria-label="Toggle visibility"
                    >
                      {env.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(env.value)}
                      className={`p-1 rounded ${textSecondary} hover:opacity-80`}
                      aria-label="Copy value"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeEnvVar(env.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  aria-label="Remove variable"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={phase === "deploying"}
            className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
          >
            {phase === "deploying" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={16} />
                Deploy Now
              </>
            )}
          </button>

          {(phase === "deploying" ||
            phase === "success" ||
            phase === "failed") && (
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border transition-all
                ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
              `}
            >
              <Terminal size={16} />
              {showLogs ? "Hide" : "Show"} Logs
              {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </form>

      {/* Deployment logs */}
      {showLogs && (
        <div
          className={`rounded-xl overflow-hidden border ${darkMode ? "border-gray-800" : "border-gray-200"}`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 ${darkMode ? "bg-gray-900" : "bg-gray-800"}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span
                className="text-gray-400 text-xs ml-1"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                Deploy Log
              </span>
            </div>
            {phase === "deploying" && (
              <span className="flex items-center gap-1.5 text-xs text-blue-400">
                <Loader2 size={12} className="animate-spin" />
                Live
              </span>
            )}
          </div>
          <div
            ref={logRef}
            className="bg-gray-950 p-4 h-72 overflow-y-auto space-y-1"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
            aria-live="polite"
            aria-label="Deployment logs"
          >
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gray-600 text-xs flex-shrink-0 mt-px">
                  {log.time}
                </span>
                <span
                  className={`text-xs ${logColors[log.level as keyof typeof logColors] || "text-gray-300"}`}
                >
                  {log.message}
                </span>
              </div>
            ))}
            {phase === "deploying" && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span className="animate-pulse">█</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
