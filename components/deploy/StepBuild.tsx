"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Terminal, CheckCircle2, XCircle, Circle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { syncDeploymentStatus } from "@/lib/actions/deployments";
import type { LogLine } from "@/lib/loki-client";

interface StepBuildProps {
  repoUrl: string;
  serviceName: string;
  deploymentId: string;
  onComplete: (
    deployedUrl: string,
    buildDuration?: number | null,
    region?: string,
  ) => void;
}

type StepState = "pending" | "running" | "succeeded" | "failed";

interface PipelineStep {
  name: string;
  label: string;
  status: StepState;
}

const INITIAL_STEPS: PipelineStep[] = [
  { name: "BUILD", label: "Build Image", status: "pending" },
  { name: "PROVISION", label: "Provision", status: "pending" },
  { name: "DNS", label: "Configure DNS", status: "pending" },
];

const LOG_COLORS: Record<string, string> = {
  info: "text-gray-300",
  warn: "text-yellow-400",
  error: "text-red-400",
  fatal: "text-red-500",
};

const StepIcon = ({ status }: { status: StepState }) => {
  if (status === "running")
    return <Loader2 size={14} className="animate-spin text-blue-400" />;
  if (status === "succeeded")
    return <CheckCircle2 size={14} className="text-green-400" />;
  if (status === "failed")
    return <XCircle size={14} className="text-red-400" />;
  return <Circle size={14} className="text-gray-600" />;
};

export default function StepBuild({
  serviceName,
  deploymentId,
  onComplete,
}: StepBuildProps) {
  const { darkMode } = useTheme();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [overallStatus, setOverallStatus] = useState<string>("BUILDING");
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // auto-scroll to bottom on new log lines
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // SSE log streaming
  useEffect(() => {
    const es = new EventSource(`/api/deployments/${deploymentId}/logs`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "done") {
          es.close();
          return;
        }
        if (data.type === "error") {
          setError(data.message);
          es.close();
          return;
        }
        // deduplicate by timestamp+message to avoid showing the same line twice
        // when the poller resets (e.g. on reconnect)
        setLogs((prev) => {
          const last = prev[prev.length - 1];
          if (
            last &&
            last.timestamp === data.timestamp &&
            last.message === data.message
          ) {
            return prev;
          }
          return [...prev, data as LogLine];
        });
      } catch {
        // malformed event, skip
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects on error — don't close it here
      // unless we're in a terminal state (handled by status polling below)
    };

    return () => {
      es.close();
    };
  }, [deploymentId]);

  // status polling — syncs DB state from Argo every 3 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const result = await syncDeploymentStatus(deploymentId);
        setOverallStatus(result.status);

        setSteps((prev) =>
          prev.map((s) => {
            const synced = result.steps.find((rs) => rs.name === s.name);
            return synced
              ? { ...s, status: synced.status.toLowerCase() as StepState }
              : s;
          }),
        );

        if (result.status === "LIVE") {
          if (pollRef.current) clearInterval(pollRef.current);
          eventSourceRef.current?.close();
          const url =
            result.deployedUrl ??
            `${serviceName}.${process.env.NEXT_PUBLIC_HOSTIFER_DOMAIN ?? "hostifer.me"}`;
          setTimeout(
            () => onComplete(url, result.buildDuration, result.region),
            800,
          );
        }

        if (result.status === "FAILED") {
          if (pollRef.current) clearInterval(pollRef.current);
          eventSourceRef.current?.close();
          setError(result.errorMessage ?? "Deployment failed");
        }
      } catch {
        // transient error — keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [deploymentId, serviceName, onComplete]);

  const isFailed = overallStatus === "FAILED";
  const isLive = overallStatus === "LIVE";
  const isDone = isFailed || isLive;

  return (
    <div className="space-y-4">
      {/* Pipeline step indicators */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border gap-4
          ${darkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}
      >
        {steps.map((step, i) => (
          <React.Fragment key={step.name}>
            <div className="flex items-center gap-2">
              <StepIcon status={step.status} />
              <span
                className={`text-sm font-medium
                  ${
                    step.status === "succeeded"
                      ? "text-green-400"
                      : step.status === "running"
                        ? "text-blue-400"
                        : step.status === "failed"
                          ? "text-red-400"
                          : darkMode
                            ? "text-gray-500"
                            : "text-gray-400"
                  }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px ${
                  steps[i + 1].status !== "pending"
                    ? "bg-blue-500"
                    : darkMode
                      ? "bg-gray-800"
                      : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Overall status bar */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border
          ${
            isFailed
              ? darkMode
                ? "bg-red-900/20 border-red-800"
                : "bg-red-50 border-red-200"
              : isLive
                ? darkMode
                  ? "bg-green-900/20 border-green-800"
                  : "bg-green-50 border-green-200"
                : darkMode
                  ? "bg-blue-900/20 border-blue-800"
                  : "bg-blue-50 border-blue-200"
          }`}
      >
        <div className="flex items-center gap-3">
          {!isDone && (
            <Loader2 size={18} className="animate-spin text-blue-400" />
          )}
          {isLive && <CheckCircle2 size={18} className="text-green-400" />}
          {isFailed && <XCircle size={18} className="text-red-400" />}
          <span
            className={`text-sm font-medium
              ${isFailed ? "text-red-400" : isLive ? "text-green-400" : "text-blue-400"}`}
          >
            {isFailed
              ? "Deployment failed"
              : isLive
                ? "Deployment live!"
                : "Deploying your application..."}
          </span>
        </div>
        <span
          className={`text-xs font-mono ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          {logs.length} lines
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className={`p-3 rounded-lg text-sm text-red-400
            ${
              darkMode
                ? "bg-red-900/20 border border-red-800"
                : "bg-red-50 border border-red-200"
            }`}
        >
          {error}
        </div>
      )}

      {/* Log terminal */}
      <div
        className={`rounded-xl overflow-hidden border
          ${darkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        {/* Terminal title bar */}
        <div
          className={`flex items-center justify-between px-4 py-3
            ${darkMode ? "bg-gray-900" : "bg-gray-800"}`}
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
              Build Log — {serviceName}
            </span>
          </div>
          {!isDone ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <Loader2 size={12} className="animate-spin" /> Live
            </span>
          ) : (
            <span
              className={`text-xs ${isLive ? "text-green-400" : "text-red-400"}`}
            >
              {isLive ? "Complete" : "Failed"}
            </span>
          )}
        </div>

        {/* Log lines */}
        <div
          ref={logRef}
          className="bg-gray-950 p-4 h-80 overflow-y-auto space-y-1"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
          aria-live="polite"
          aria-label="Build logs"
        >
          {logs.length === 0 && (
            <div className="text-gray-600 text-xs">Waiting for logs...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-gray-600 text-xs shrink-0 mt-px">
                {new Date(log.timestamp).toISOString().slice(11, 19)}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded text-[10px] shrink-0
                  ${
                    log.level === "error" || log.level === "fatal"
                      ? "bg-red-900/40 text-red-400"
                      : log.level === "warn"
                        ? "bg-yellow-900/40 text-yellow-400"
                        : "bg-gray-800 text-gray-500"
                  }`}
              >
                {log.stream ?? log.level}
              </span>
              <span
                className={`text-xs break-all ${LOG_COLORS[log.level] ?? "text-gray-300"}`}
              >
                {log.message}
              </span>
            </div>
          ))}
          {!isDone && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
