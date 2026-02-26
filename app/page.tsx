"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Rocket,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
  Code,
  Activity,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const features = [
  {
    icon: Rocket,
    title: "Instant Deployments",
    description:
      "Push to git and watch your app deploy in seconds. Zero-downtime deployments with automatic rollbacks.",
    color: "#0A4D9E",
  },
  {
    icon: Zap,
    title: "Auto Scaling",
    description:
      "Your infrastructure scales automatically with demand. Pay only for what you use, never over-provision.",
    color: "#22C55E",
  },
  {
    icon: Shield,
    title: "Built-in Security",
    description:
      "Automated SSL certificates, DDoS protection, and SOC 2 compliant infrastructure out of the box.",
    color: "#7C3AED",
  },
  {
    icon: Globe,
    title: "Global Edge Network",
    description:
      "Deploy to 25+ regions worldwide. Low latency for your users, wherever they are.",
    color: "#EAB308",
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description:
      "Full observability with logs, metrics, and alerts. Know about issues before your users do.",
    color: "#EF4444",
  },
  {
    icon: Code,
    title: "Any Stack",
    description:
      "Deploy Node.js, Python, Go, Ruby, Java, and more. Support for any Dockerfile-based app.",
    color: "#0A4D9E",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 0,
    description: "Perfect for hobby projects and prototypes",
    features: [
      "2 projects",
      "512 MB RAM",
      "1 GB disk",
      "Community support",
      "Shared CPU",
      "100 GB bandwidth/mo",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 25,
    description: "For professional developers and teams",
    features: [
      "Unlimited projects",
      "4 GB RAM",
      "50 GB disk",
      "Priority support",
      "Dedicated CPU",
      "1 TB bandwidth/mo",
      "Custom domains",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited projects",
      "32 GB RAM",
      "500 GB disk",
      "24/7 dedicated support",
      "Dedicated servers",
      "Unlimited bandwidth",
      "SSO / SAML",
      "SLA guarantee",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-[#0F172A] text-white" : "bg-white text-gray-900"}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className={`sticky top-0 z-50 border-b ${darkMode ? "bg-[#0F172A]/90 border-gray-800 backdrop-blur" : "bg-white/90 border-gray-100 backdrop-blur"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span
                className={`font-bold text-xl ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Hostifer
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 flex-1">
              <a
                href="#features"
                className={`text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Features
              </a>
              <a
                href="#pricing"
                className={`text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Pricing
              </a>
              <a
                href="#docs"
                className={`text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                Docs
              </a>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link
                href="/login"
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${darkMode ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}
              >
                Login
              </Link>
              <button
                onClick={() => router.push("/signup")}
                className="bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Started Free
              </button>
            </div>
            <button
              className="md:hidden ml-auto p-2 rounded-lg text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div
            className={`md:hidden px-4 pb-4 ${darkMode ? "bg-[#0F172A]" : "bg-white"}`}
          >
            <div className="flex flex-col gap-3">
              <a
                href="#features"
                className={`text-sm py-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Features
              </a>
              <a
                href="#pricing"
                className={`text-sm py-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Pricing
              </a>
              <Link
                href="/login"
                className={`text-sm py-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Login
              </Link>
              <button
                onClick={() => router.push("/signup")}
                className="bg-[#0A4D9E] text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0A4D9E]/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-20 w-72 h-72 bg-[#7C3AED]/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-[#22C55E]/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 bg-[#0A4D9E]/10 text-[#0A4D9E] border border-[#0A4D9E]/20">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Now in Public Beta — Free to start
          </div>
          <h1
            className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Deploy Anything,
            <br />
            <span className="bg-gradient-to-r from-[#0A4D9E] via-[#7C3AED] to-[#22C55E] bg-clip-text text-transparent">
              Scale Effortlessly
            </span>
          </h1>
          <p
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Hostifer is the cloud platform built for developers. Deploy web
            services, APIs, databases, and cron jobs with a single git push. No
            DevOps expertise required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/signup")}
              className="flex items-center justify-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-8 py-3.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#0A4D9E]/25"
            >
              Start Deploying Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-medium border transition-all ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              View Demo Dashboard
            </button>
          </div>
          <div
            className={`mt-16 mx-auto max-w-2xl rounded-xl overflow-hidden shadow-2xl text-left ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-gray-900 border border-gray-700"}`}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span
                className="ml-2 text-gray-400 text-xs"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                hostifer deploy
              </span>
            </div>
            <div
              className="p-4"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              <p className="text-green-400 text-sm">$ git push origin main</p>
              <p className="text-gray-500 text-sm mt-1">
                Connecting to Hostifer...
              </p>
              <p className="text-blue-400 text-sm mt-1">
                {"\u2192"} Detecting runtime: Node.js 20
              </p>
              <p className="text-blue-400 text-sm">
                {"\u2192"} Installing dependencies...
              </p>
              <p className="text-blue-400 text-sm">
                {"\u2192"} Building application...
              </p>
              <p className="text-blue-400 text-sm">
                {"\u2192"} Deploying to US-East-1...
              </p>
              <p className="text-green-400 text-sm mt-1">
                {"\u2713"} Deployed successfully in 1m 23s
              </p>
              <p className="text-gray-300 text-sm">
                {"\uD83D\uDE80"} Live at: https://my-app.hostifer.io
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className={`py-12 border-y ${darkMode ? "border-gray-800 bg-[#111827]" : "border-gray-100 bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Developers" },
              { value: "2M+", label: "Deployments / month" },
              { value: "99.99%", label: "Uptime SLA" },
              { value: "25+", label: "Global Regions" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Everything you need to ship faster
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Hostifer handles the infrastructure so you can focus on building
              great software.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`p-6 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${darkMode ? "bg-[#111827] border-gray-800 hover:border-gray-700" : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: feature.color + "20" }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3
                  className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className={`py-20 lg:py-32 ${darkMode ? "bg-[#111827]" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Simple, transparent pricing
            </h2>
            <p
              className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              No hidden fees. Start free, scale as you grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${plan.highlighted ? "bg-[#0A4D9E] text-white shadow-2xl shadow-[#0A4D9E]/30 scale-105" : darkMode ? "bg-[#1F2937] border border-gray-700" : "bg-white border border-gray-200 shadow-sm"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#22C55E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3
                    className={`font-semibold text-lg mb-2 ${plan.highlighted ? "text-white" : darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${plan.highlighted ? "text-blue-200" : darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span
                      className={`text-4xl font-bold ${plan.highlighted ? "text-white" : darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.highlighted ? "text-blue-200" : darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check
                        size={16}
                        className={
                          plan.highlighted
                            ? "text-blue-200 flex-shrink-0"
                            : "text-[#22C55E] flex-shrink-0"
                        }
                      />
                      <span
                        className={`text-sm ${plan.highlighted ? "text-blue-100" : darkMode ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push("/signup")}
                  className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${plan.highlighted ? "bg-white text-[#0A4D9E] hover:bg-blue-50" : "bg-[#0A4D9E] text-white hover:bg-[#0a3d7e]"}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Ready to deploy your first app?
          </h2>
          <p
            className={`text-lg mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Join 50,000+ developers shipping faster with Hostifer. No credit
            card required.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="flex items-center gap-2 mx-auto bg-[#0A4D9E] hover:bg-[#0a3d7e] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all hover:shadow-xl hover:shadow-[#0A4D9E]/25"
          >
            Get Started for Free <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 border-t ${darkMode ? "border-gray-800 bg-[#111827]" : "border-gray-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span
                className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Hostifer
              </span>
            </div>
            <p
              className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              © 2026 Hostifer Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Docs", "Status"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className={`text-sm transition-colors ${darkMode ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
