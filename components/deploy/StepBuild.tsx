"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Terminal } from "lucide-react";
import { mockDeploymentLogs } from "@/data/mockData";
import { useTheme } from "@/context/ThemeContext";

interface StepBuildProps {
  repoUrl: string;
  serviceName: string;
  onComplete: (deployedUrl: string) => void;
}

export default function StepBuild({
  repoUrl,
  serviceName,
  onComplete,
}: StepBuildProps) {
  const { darkMode } = useTheme();
  const [logs, setLogs] = useState<typeof mockDeploymentLogs>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Generate dynamic logs based on repo info
  const buildLogs = React.useMemo(() => {
    return [
      {
        time: "00:00",
        level: "info",
        message: "Initializing deployment pipeline...",
      },
      {
        time: "00:01",
        level: "info",
        message: `Cloning repository: ${repoUrl}`,
      },
      {
        time: "00:03",
        level: "info",
        message: "Repository cloned successfully (3.2 MB)",
      },
      {
        time: "00:04",
        level: "info",
        message: "Detecting framework... Node.js detected",
      },
      {
        time: "00:05",
        level: "info",
        message: "Installing dependencies with npm install...",
      },
      {
        time: "00:12",
        level: "info",
        message: "added 847 packages in 7.2s",
      },
      {
        time: "00:13",
        level: "info",
        message:
          "Dependencies installed successfully (847 packages, 0 vulnerabilities)",
      },
      {
        time: "00:14",
        level: "info",
        message: "Running build command: npm run build",
      },
      {
        time: "00:15",
        level: "info",
        message: "Creating an optimized production build...",
      },
      {
        time: "00:22",
        level: "warn",
        message:
          "Warning: Some dependencies are not tree-shakable, bundle size may be larger than expected",
      },
      {
        time: "00:28",
        level: "info",
        message: "Compiled successfully in 14.2s",
      },
      {
        time: "00:29",
        level: "info",
        message: "Build output: 2.4 MB (gzipped: 812 KB)",
      },
      {
        time: "00:30",
        level: "info",
        message: "Build completed successfully",
      },
      {
        time: "00:31",
        level: "info",
        message: `Creating Docker image for ${serviceName}...`,
      },
      {
        time: "00:38",
        level: "info",
        message: "Docker image built: sha256:e8f2a1c9d4b7...",
      },
      {
        time: "00:39",
        level: "info",
        message: "Pushing image to container registry...",
      },
      {
        time: "00:45",
        level: "info",
        message: "Image pushed to registry successfully",
      },
      {
        time: "00:46",
        level: "info",
        message: "Provisioning deployment resources...",
      },
      {
        time: "00:50",
        level: "info",
        message: "Starting container on US-East-1...",
      },
      {
        time: "00:53",
        level: "info",
        message: "Running health checks...",
      },
      {
        time: "00:56",
        level: "info",
        message: "Health check passed (HTTP 200 in 42ms)",
      },
      {
        time: "00:57",
        level: "info",
        message: "Configuring SSL certificate...",
      },
      {
        time: "00:59",
        level: "info",
        message: "SSL certificate provisioned via Let's Encrypt",
      },
      {
        time: "01:00",
        level: "info",
        message: "Routing traffic to new deployment...",
      },
      {
        time: "01:02",
        level: "success",
        message: `Deployment successful! Live at ${serviceName}.hostifer.io`,
      },
    ];
  }, [repoUrl, serviceName]);

  // Stream logs with delay
  useEffect(() => {
    if (done) return;
    if (logIndex >= buildLogs.length) {
      // Delay the state update to avoid synchronous setState in effect
      const doneTimer = setTimeout(() => {
        setDone(true);
      }, 0);
      const completeTimer = setTimeout(() => {
        onComplete(`${serviceName}.hostifer.io`);
      }, 1200);
      return () => {
        clearTimeout(doneTimer);
        clearTimeout(completeTimer);
      };
    }
    const delay =
      logIndex < 3
        ? 400
        : logIndex > buildLogs.length - 3
          ? 500
          : 350 + Math.random() * 300;
    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, buildLogs[logIndex]]);
      setLogIndex((i) => i + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [logIndex, done, buildLogs, onComplete, serviceName]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const logColors: Record<string, string> = {
    info: darkMode ? "text-gray-300" : "text-gray-300",
    warn: "text-yellow-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  const progress = Math.round((logIndex / buildLogs.length) * 100);

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border ${
          darkMode
            ? "bg-blue-900/20 border-blue-800"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Loader2
            size={18}
            className={`animate-spin ${
              darkMode ? "text-blue-400" : "text-blue-600"
            } ${done ? "hidden" : ""}`}
          />
          {done && (
            <div className="w-4.5 h-4.5 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          <div>
            <span
              className={`text-sm font-medium ${
                darkMode ? "text-blue-300" : "text-blue-700"
              }`}
            >
              {done ? "Build complete!" : "Building your application..."}
            </span>
            <p
              className={`text-xs mt-0.5 ${
                darkMode ? "text-blue-400/70" : "text-blue-600/70"
              }`}
            >
              {done
                ? "Finalizing deployment..."
                : `Step ${Math.min(logIndex + 1, buildLogs.length)} of ${buildLogs.length}`}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-mono ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className={`h-1.5 rounded-full overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <div
          className="h-full bg-[#0A4D9E] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Log terminal */}
      <div
        className={`rounded-xl overflow-hidden border ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 ${
            darkMode ? "bg-gray-900" : "bg-gray-800"
          }`}
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
              <Terminal size={12} className="inline mr-1.5" />
              Build Log
            </span>
          </div>
          {!done && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <Loader2 size={12} className="animate-spin" />
              Live
            </span>
          )}
          {done && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              Complete
            </span>
          )}
        </div>
        <div
          ref={logRef}
          className="bg-gray-950 p-4 h-80 overflow-y-auto space-y-1"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
          aria-live="polite"
          aria-label="Build logs"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-gray-600 text-xs shrink-0 mt-px">
                {log.time}
              </span>
              <span
                className={`text-xs ${logColors[log.level] || "text-gray-300"}`}
              >
                {log.message}
              </span>
            </div>
          ))}
          {!done && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
