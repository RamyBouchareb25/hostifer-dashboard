"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ArrowLeft,
  ArrowRight,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  hidden: boolean;
}

interface ConfigData {
  region: string;
  plan: string;
  buildCommand: string;
  startCommand: string;
  envVars: EnvVar[];
}

interface StepConfigEnvProps {
  onNext: (data: ConfigData) => void;
  onBack: () => void;
}

export default function StepConfigEnv({ onNext, onBack }: StepConfigEnvProps) {
  const { darkMode } = useTheme();
  const [region, setRegion] = useState("alg-central-1");
  const [plan, setPlan] = useState("starter");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [startCommand, setStartCommand] = useState("npm start");
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: "1", key: "NODE_ENV", value: "production", hidden: false },
  ]);
  const regions = [
    { value: "alg-central-1", label: "🇩🇿 Algeria Central (Algiers)" },
    { value: "alg-west-1", label: "🇩🇿 Algeria West (Oran)" },
    { value: "alg-east-1", label: "🇩🇿 Algeria East (Constantine)" },
  ];

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

  const addEnvVar = () => {
    setEnvVars((prev) => [
      ...prev,
      { id: Date.now().toString(), key: "", value: "", hidden: false },
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

  const handleNext = () => {
    onNext({ region, plan, buildCommand, startCommand, envVars });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className={cardClass + " p-6"}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Settings2 size={20} className={textPrimary} />
          </div>
          <div>
            <h2 className={`font-semibold ${textPrimary}`}>Configuration</h2>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>
              Configure build settings and environment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
              aria-label="Region"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
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
              className={`block text-sm font-medium mb-1.5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Build Command
            </label>
            <input
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
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
              className={`block text-sm font-medium mb-1.5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Start Command
            </label>
            <input
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
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

      {/* Environment Variables Card */}
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
              ${
                darkMode
                  ? "text-blue-400 hover:bg-gray-800"
                  : "text-[#0A4D9E] hover:bg-blue-50"
              }
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
                className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                aria-label="Remove variable"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border transition-all
            ${
              darkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
        >
          Deploy
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
