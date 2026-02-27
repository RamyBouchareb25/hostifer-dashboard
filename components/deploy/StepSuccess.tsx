"use client";

import React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Rocket,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

interface StepSuccessProps {
  serviceName: string;
  deployedUrl: string;
  repoUrl: string;
  onNewDeploy: () => void;
}

export default function StepSuccess({
  serviceName,
  deployedUrl,
  repoUrl,
  onNewDeploy,
}: StepSuccessProps) {
  const { darkMode } = useTheme();

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 rounded-xl"
    : "bg-white border border-gray-100 rounded-xl shadow-sm";

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${deployedUrl}`);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div
        className={`text-center py-10 px-6 rounded-xl border ${
          darkMode
            ? "bg-green-900/10 border-green-800/50"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              darkMode ? "bg-green-900/30" : "bg-green-100"
            }`}
          >
            <CheckCircle2
              size={36}
              className={darkMode ? "text-green-400" : "text-green-600"}
            />
          </div>
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            darkMode ? "text-green-300" : "text-green-700"
          }`}
        >
          Congratulations! 🎉
        </h2>
        <p
          className={`text-sm mb-6 ${
            darkMode ? "text-green-400/80" : "text-green-600"
          }`}
        >
          Your application <strong>{serviceName}</strong> has been deployed
          successfully.
        </p>

        {/* URL display */}
        <div
          className={`inline-flex items-center gap-3 px-5 py-3 rounded-lg ${
            darkMode
              ? "bg-gray-900 border border-gray-700"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <Globe
            size={16}
            className={darkMode ? "text-green-400" : "text-green-600"}
          />
          <a
            href={`https://${deployedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-mono font-medium ${
              darkMode ? "text-white" : "text-gray-900"
            } hover:underline`}
          >
            https://{deployedUrl}
          </a>
          <button
            type="button"
            onClick={copyUrl}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Copy URL"
          >
            <Copy size={14} />
          </button>
          <a
            href={`https://${deployedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Deployment details */}
      <div className={cardClass + " p-6"}>
        <h3 className={`font-semibold mb-4 ${textPrimary}`}>
          Deployment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className={`text-xs ${textSecondary}`}>Service</p>
              <p className={`text-sm font-medium ${textPrimary}`}>
                {serviceName}
              </p>
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Repository</p>
              <p className={`text-sm font-medium ${textPrimary}`}>{repoUrl}</p>
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Deployment ID</p>
              <p className={`text-sm font-mono ${textPrimary}`}>dep-a8f2e1c9</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className={`text-xs ${textSecondary}`}>Region</p>
              <p className={`text-sm font-medium ${textPrimary}`}>
                🇺🇸 US East (N. Virginia)
              </p>
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Build Duration</p>
              <p className={`text-sm font-medium ${textPrimary}`}>1m 02s</p>
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Status</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Shield,
            title: "SSL Enabled",
            desc: "HTTPS auto-configured",
          },
          {
            icon: Zap,
            title: "Auto-scaling",
            desc: "Scales with traffic",
          },
          {
            icon: Rocket,
            title: "CI/CD Ready",
            desc: "Push to deploy enabled",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className={`flex items-center gap-3 p-4 rounded-xl ${
              darkMode
                ? "bg-[#111827] border border-gray-800"
                : "bg-white border border-gray-100 shadow-sm"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <feature.icon
                size={16}
                className={darkMode ? "text-blue-400" : "text-[#0A4D9E]"}
              />
            </div>
            <div>
              <p className={`text-sm font-medium ${textPrimary}`}>
                {feature.title}
              </p>
              <p className={`text-xs ${textSecondary}`}>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onNewDeploy}
          className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
        >
          <Rocket size={16} />
          Deploy Another
        </button>
        <a
          href={`https://${deployedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border transition-all
            ${
              darkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          Visit Site
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
