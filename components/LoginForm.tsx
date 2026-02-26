"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Github, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { signIn } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider.toLowerCase(), { callbackUrl: "/dashboard" });
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

      {/* Left panel — form */}
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
          Welcome back
        </h1>
        <p
          className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Sign in to your Hostifer account
        </p>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuth("GitHub")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
              ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
            `}
          >
            <Github size={16} />
            GitHub
          </button>
          <button
            onClick={() => handleOAuth("Google")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
              ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
            `}
          >
            <Mail size={16} />
            Google
          </button>
        </div>

        {/* Divider */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
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
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
                ${
                  darkMode
                    ? "bg-[#1F2937] border-gray-700 text-white placeholder-gray-500 focus:border-[#0A4D9E]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0A4D9E] focus:ring-2 focus:ring-[#0A4D9E]/10"
                }
                ${errors.email ? "border-red-500" : ""}
              `}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Password
              </label>
              <a href="#" className="text-xs text-[#0A4D9E] hover:underline">
                Reset Password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              {...register("remember")}
              className="w-4 h-4 rounded border-gray-300 text-[#0A4D9E] focus:ring-[#0A4D9E]"
            />
            <label
              htmlFor="remember"
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0A4D9E] hover:bg-[#0a3d7e] disabled:opacity-60 text-white py-3 rounded-lg font-medium text-sm transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          className={`text-center text-sm mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#0A4D9E] font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Right panel — decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#0A4D9E] to-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#22C55E]/20 rounded-full blur-3xl" />
        </div>
        <div className="text-center text-white relative px-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Deploy with confidence</h2>
          <p className="text-blue-200 text-lg max-w-sm mx-auto leading-relaxed">
            From code to production in minutes. Trusted by thousands of
            developers worldwide.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "99.99%", label: "Uptime" },
              { value: "1m 23s", label: "Avg Deploy" },
              { value: "25+", label: "Regions" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-blue-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
