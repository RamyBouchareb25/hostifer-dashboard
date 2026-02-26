"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

const plans = [
  {
    name: "Starter",
    price: 0,
    features: [
      "2 web services",
      "512 MB RAM",
      "100 GB bandwidth",
      "Community support",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: 25,
    features: [
      "Unlimited services",
      "4 GB RAM",
      "1 TB bandwidth",
      "Priority support",
      "Custom domains",
    ],
    current: false,
    highlight: true,
  },
  {
    name: "Team",
    price: 79,
    features: [
      "Team collaboration",
      "16 GB RAM",
      "Unlimited bandwidth",
      "Dedicated support",
      "SSO",
    ],
    current: false,
  },
];

const invoices = [
  { id: "INV-001", date: "Jan 1, 2026", amount: "$0.00", status: "Paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$0.00", status: "Paid" },
];

export default function BillingPage() {
  const { darkMode } = useTheme();

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = darkMode
    ? "bg-[#111827] border border-gray-800 rounded-xl"
    : "bg-white border border-gray-100 rounded-xl shadow-sm";

  return (
    <div className="space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Billing</h1>
        <p className={`text-sm mt-0.5 ${textSecondary}`}>
          Manage your subscription and payment details.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 border-2 transition-all
              ${
                plan.current
                  ? "border-[#0A4D9E] " +
                    (darkMode ? "bg-blue-900/10" : "bg-blue-50")
                  : plan.highlight
                    ? "border-[#22C55E] " +
                      (darkMode ? "bg-green-900/10" : "bg-green-50")
                    : darkMode
                      ? "bg-[#111827] border-gray-800"
                      : "bg-white border-gray-200"
              }
            `}
          >
            {plan.highlight && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#22C55E] text-white text-xs font-semibold mb-3">
                <Zap size={11} />
                Recommended
              </div>
            )}
            <h3 className={`font-bold text-lg ${textPrimary}`}>{plan.name}</h3>
            <div className="flex items-baseline gap-1 my-2">
              <span className={`text-3xl font-bold ${textPrimary}`}>
                ${plan.price}
              </span>
              <span className={`text-sm ${textSecondary}`}>/mo</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={14} className="text-[#22C55E] flex-shrink-0" />
                  <span className={`text-sm ${textSecondary}`}>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                plan.current
                  ? null
                  : toast.success(`Upgrading to ${plan.name}...`)
              }
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  plan.current
                    ? darkMode
                      ? "bg-gray-800 text-gray-400 cursor-default"
                      : "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white"
                }
              `}
            >
              {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div className={cardClass + " p-6"}>
        <h2 className={`font-semibold mb-4 ${textPrimary}`}>Invoice History</h2>
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? "bg-[#1F2937]" : "bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono ${textSecondary}`}>
                  {inv.id}
                </span>
                <span className={`text-sm ${textSecondary}`}>{inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${textPrimary}`}>
                  {inv.amount}
                </span>
                <span className="text-xs text-green-500 font-medium">
                  {inv.status}
                </span>
                <button
                  className={`text-xs ${darkMode ? "text-blue-400" : "text-[#0A4D9E]"} hover:underline`}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
