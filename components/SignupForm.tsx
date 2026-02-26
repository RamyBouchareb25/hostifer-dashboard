"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Github, Mail, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { signIn } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  terms: boolean;
}

export default function SignupForm() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();
  const password = watch("password", "");

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "bg-red-500" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
    ];
    return levels[score];
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error ?? "Signup failed");
        return;
      }

      // Auto sign-in after successful registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInRes?.error) {
        toast.error(
          "Account created but could not sign in. Please log in manually.",
        );
        router.push("/login");
      } else {
        toast.success("Account created! Welcome to Hostifer 🚀");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex ${darkMode ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Toaster
        position="top-right"
        theme={darkMode ? "dark" : "light"}
        richColors
      />

      {/* Left panel — decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#0A4D9E] via-[#7C3AED] to-[#22C55E]/70 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#22C55E]/20 rounded-full blur-3xl" />
        </div>
        <div className="text-white text-center relative px-8 max-w-md">
          <h2 className="text-4xl font-bold mb-4">Start building today</h2>
          <p className="text-blue-200 text-lg mb-10">
            Free forever. No credit card needed.
          </p>
          <div className="space-y-4 text-left">
            {[
              "Deploy unlimited static sites",
              "2 web services included",
              "Global CDN included",
              "Automated SSL certificates",
              "GitHub & GitLab integration",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-blue-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className={`flex flex-col justify-center w-full max-w-md mx-auto lg:mx-0 px-8 py-12 ${darkMode ? "bg-[#111827]" : "bg-white"} lg:shadow-xl`}
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span
            className={`font-bold text-xl ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Hostifer
          </span>
        </div>

        <h1
          className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Create your account
        </h1>
        <p
          className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Free to start. Upgrade when you&apos;re ready.
        </p>

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
            ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <Github size={16} />
            GitHub
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
            ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <Mail size={16} />
            Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div
              className={`w-full border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            />
          </div>
          <div className="relative flex justify-center">
            <span
              className={`px-3 text-sm ${darkMode ? "bg-[#111827] text-gray-500" : "bg-white text-gray-400"}`}
            >
              Or
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
                ${
                  darkMode
                    ? "bg-[#1F2937] border-gray-700 text-white placeholder-gray-500 focus:border-[#0A4D9E]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0A4D9E] focus:ring-2 focus:ring-[#0A4D9E]/10"
                }
                ${errors.name ? "border-red-500" : ""}
              `}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
                ${
                  darkMode
                    ? "bg-[#1F2937] border-gray-700 text-white placeholder-gray-500 focus:border-[#0A4D9E]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0A4D9E] focus:ring-2 focus:ring-[#0A4D9E]/10"
                }
                ${errors.email ? "border-red-500" : ""}
              `}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all
                  ${
                    darkMode
                      ? "bg-[#1F2937] border-gray-700 text-white placeholder-gray-500 focus:border-[#0A4D9E]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0A4D9E] focus:ring-2 focus:ring-[#0A4D9E]/10"
                  }
                  ${errors.password ? "border-red-500" : ""}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        strength.score >= i
                          ? strength.color
                          : darkMode
                            ? "bg-gray-700"
                            : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p
                    className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Password strength:{" "}
                    <span className="font-medium">{strength.label}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              {...register("terms", { required: "Please accept the terms" })}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0A4D9E] focus:ring-[#0A4D9E]"
            />
            <label
              htmlFor="terms"
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              I agree to the{" "}
              <a href="#" className="text-[#0A4D9E] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#0A4D9E] hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-60 text-white py-3 rounded-lg font-medium text-sm transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p
          className={`text-center text-sm mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#0A4D9E] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
