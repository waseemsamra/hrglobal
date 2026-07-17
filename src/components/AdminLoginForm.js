"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
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
      const res = await fetch("/api/admin/login", {
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
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full max-w-md px-margin-mobile py-stack-unit flex-grow flex flex-col justify-center">
      <div className="mb-gutter text-center space-y-2">
        <h1 className="font-headline-lg text-headline-lg text-primary">Welcome to the Admin Portal</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Please enter your credentials to access the management suite.
        </p>
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl login-card-glow p-8 space-y-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="email">
              ADMIN EMAIL OR USERNAME
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                mail
              </span>
              <input
                id="email"
                type="text"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="admin@organization.com or admin"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                PASSWORD
              </label>
              <a className="font-label-sm text-label-sm text-secondary hover:underline transition-all" href="#">
                Forgot Password?
              </a>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:border-secondary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <input
              id="remember"
              type="checkbox"
              checked={form.remember}
              onChange={(e) => set("remember", e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary"
            />
            <label className="font-body-md text-body-md text-on-surface-variant select-none" htmlFor="remember">
              Remember this device for 30 days
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-secondary hover:bg-on-secondary-container text-on-secondary py-3.5 rounded-lg font-headline-md text-headline-md flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
            {!submitting && <span className="material-symbols-outlined text-[18px]">login</span>}
          </button>
        </form>
        <div className="pt-4 border-t border-outline-variant flex gap-3 items-start opacity-70">
          <span className="material-symbols-outlined text-outline text-[20px]">verified_user</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Enterprise Grade Security. All sessions are monitored and logged for compliance (ISO 27001).
          </p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant hover:border-secondary transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">help_center</span>
            <span className="font-label-md text-label-md text-primary">Need Help?</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Contact System Administrator</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant hover:border-secondary transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">rss_feed</span>
            <span className="font-label-md text-label-md text-primary">System Status</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">All Systems Operational</p>
        </div>
      </div>
    </main>
  );
}
