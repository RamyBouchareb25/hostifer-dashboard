"use client";

import React from "react";
import type { DeployStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: DeployStatus;
  showDot?: boolean;
}

const statusConfig: Record<
  DeployStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  live: {
    label: "Live",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  building: {
    label: "Building",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  failed: {
    label: "Failed",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  sleeping: {
    label: "Sleeping",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot} ${status === "building" ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}
