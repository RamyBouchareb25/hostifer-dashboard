"use client";

import React, { useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import StepRepoUrl, { type RepoInfo } from "./StepRepoUrl";
import StepConfigEnv from "./StepConfigEnv";
import StepBuild from "./StepBuild";
import StepSuccess from "./StepSuccess";

type Step = "repo" | "config" | "build" | "success";

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "repo", label: "Repository", number: 1 },
  { key: "config", label: "Configure", number: 2 },
  { key: "build", label: "Build & Deploy", number: 3 },
  { key: "success", label: "Live", number: 4 },
];

export default function DeployWizard() {
  const { darkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>("repo");
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [deployedUrl, setDeployedUrl] = useState("");

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const handleRepoNext = (data: RepoInfo) => {
    setRepoInfo(data);
    setCurrentStep("config");
  };

  const handleConfigNext = () => {
    setCurrentStep("build");
  };

  const handleBuildComplete = useCallback((url: string) => {
    setDeployedUrl(url);
    setCurrentStep("success");
  }, []);

  const handleNewDeploy = () => {
    setRepoInfo(null);
    setDeployedUrl("");
    setCurrentStep("repo");
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

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isCompleted = i < stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-[#0A4D9E] text-white"
                        : darkMode
                          ? "bg-gray-800 text-gray-500 border border-gray-700"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isCurrent
                      ? textPrimary
                      : isCompleted
                        ? darkMode
                          ? "text-green-400"
                          : "text-green-600"
                        : textSecondary
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    i < stepIndex
                      ? "bg-green-500"
                      : darkMode
                        ? "bg-gray-800"
                        : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      {currentStep === "repo" && <StepRepoUrl onNext={handleRepoNext} />}

      {currentStep === "config" && (
        <StepConfigEnv
          onNext={handleConfigNext}
          onBack={() => setCurrentStep("repo")}
        />
      )}

      {currentStep === "build" && repoInfo && (
        <StepBuild
          repoUrl={repoInfo.repoUrl}
          serviceName={repoInfo.name}
          onComplete={handleBuildComplete}
        />
      )}

      {currentStep === "success" && repoInfo && (
        <StepSuccess
          serviceName={repoInfo.name}
          deployedUrl={deployedUrl}
          repoUrl={repoInfo.repoUrl}
          onNewDeploy={handleNewDeploy}
        />
      )}
    </div>
  );
}
