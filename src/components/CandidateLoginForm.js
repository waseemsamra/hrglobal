"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Test credentials used during the testing process (enabled via ?demo=1).
const DEMO = { email: "j.thorne@talent.com", password: "password123" };

export default function CandidateLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const demo = params.get("demo") === "1";
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: demo ? DEMO.email : "",
    password: demo ? DEMO.password : "",
    remember: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/candidates/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/candidate");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Brand Header for Mobile */}
      <div className="md:hidden text-center mb-8">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary font-bold">
          CareerHub
        </h2>
      </div>

      <div className="text-left">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Welcome Back</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Enter your credentials to access your candidate dashboard.
        </p>
        {demo && (
          <div className="mt-4 bg-secondary-container/30 text-on-secondary-container border border-secondary-container rounded-lg px-4 py-2 text-label-md text-label-md">
            Test mode: email &amp; password are pre-filled — just click Sign In.{" "}
            <span className="font-bold">{DEMO.email}</span> / <span className="font-bold">{DEMO.password}</span>
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        {error && (
          <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="alex.rivers@example.com"
              className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-md placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <a className="font-label-md text-label-md text-secondary hover:underline transition-all" href="#">
              Forgot Password?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-md placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-secondary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={form.remember}
            onChange={(e) => set("remember", e.target.checked)}
            className="h-4 w-4 text-secondary focus:ring-secondary border-outline-variant rounded transition-all"
          />
          <label className="ml-2 block font-body-md text-body-md text-on-surface-variant" htmlFor="remember-me">
            Keep me signed in
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-secondary text-white font-label-md text-label-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant"></div>
        </div>
        <div className="relative flex justify-center text-label-sm font-label-sm">
          <span className="px-4 bg-surface text-outline uppercase tracking-wider">Or continue with</span>
        </div>
      </div>

      {/* Social Auth */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:opacity-80">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span className="font-label-md text-label-md text-on-surface-variant">Google</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors active:opacity-80">
          <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
          </svg>
          <span className="font-label-md text-label-md text-on-surface-variant">LinkedIn</span>
        </button>
      </div>

      {/* Footer Link */}
      <div className="text-center pt-4">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Don&apos;t have a CareerHub account?{" "}
          <Link className="text-secondary font-semibold hover:underline" href="/candidate/register">
            Create an account
          </Link>
        </p>
      </div>

      {/* Legal Mini Footer */}
      <div className="pt-12 text-center">
        <div className="flex justify-center gap-4 text-label-sm font-label-sm text-outline">
          <a className="hover:text-on-surface-variant transition-colors" href="#">Privacy Policy</a>
          <span>•</span>
          <a className="hover:text-on-surface-variant transition-colors" href="#">Terms of Service</a>
          <span>•</span>
          <a className="hover:text-on-surface-variant transition-colors" href="#">Help Center</a>
        </div>
      </div>
    </div>
  );
}
