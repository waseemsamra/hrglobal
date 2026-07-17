"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployerLoginForm({ orgName = "Kinetic HR" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/employers/login", {
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
      router.push("/employer");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md form-container">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[24px]">dine_in</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary">{orgName}</h1>
      </div>

      <header className="mb-10">
        <h2 className="font-headline-xl text-headline-xl text-on-surface mb-2">Employer Portal</h2>
        <p className="font-body-md text-on-surface-variant">
          Welcome back. Please enter your credentials to manage your team.
        </p>
        <p className="mt-3 text-label-sm text-outline bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
          Demo login: <span className="font-bold text-on-surface-variant">employer@acme.com</span> / <span className="font-bold text-on-surface-variant">password123</span>
        </p>
      </header>

      <form className="space-y-6" onSubmit={onSubmit}>
        {error && (
          <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}
        {/* Email */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="email">
            Business Email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
              mail
            </span>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@company.com"
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="password">
              Password
            </label>
            <a className="font-label-md text-label-md text-secondary hover:underline transition-all" href="#">
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 pl-12 pr-12 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={form.remember}
            onChange={(e) => set("remember", e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary"
          />
          <label className="font-body-md text-on-surface-variant" htmlFor="remember">
            Remember this device for 30 days
          </label>
        </div>

        {/* Sign in */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-14 bg-secondary hover:bg-secondary-container text-white font-headline-md rounded-lg shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink mx-4 text-label-sm text-outline uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* SSO */}
        <button
          type="button"
          className="w-full h-14 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-headline-md rounded-lg transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with SSO
        </button>
      </form>

      <footer className="mt-12 text-center">
        <p className="font-body-md text-on-surface-variant">
          Don&apos;t have an employer account?{" "}
          <Link className="text-secondary font-bold hover:underline" href="/employer/register">
            Create one
          </Link>
        </p>
        <div className="mt-8 flex justify-center gap-6 text-label-sm text-outline">
          <a className="hover:text-on-surface-variant" href="#">Privacy Policy</a>
          <a className="hover:text-on-surface-variant" href="#">Terms of Service</a>
          <a className="hover:text-on-surface-variant" href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
