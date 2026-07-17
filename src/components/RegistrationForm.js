"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORG_SIZES = [
  "1-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    orgSize: ORG_SIZES[0],
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        // For testing: if the account already exists, just continue to the dashboard.
        if (res.status === 409) {
          setStatus({
            type: "success",
            message: "Account found. Redirecting to your dashboard...",
          });
          router.push("/admin");
          return;
        }
        setStatus({
          type: "error",
          message: data.error || "Registration failed. Please try again.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Account created! Redirecting to your dashboard...",
      });
      // Redirect to the dashboard (no login required for testing).
      router.push("/admin");
    } catch (err) {
      console.error("Registration request failed:", err);
      setStatus({
        type: "error",
        message:
          "Network error. If you just restarted the server, please refresh the page (Cmd+Shift+R) and try again.",
      });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div className="lg:col-span-5 z-10">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
        <h2 className="text-title-md font-title-md mb-2">Create Account</h2>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Start managing your global workforce today. No credit card required.
        </p>
        <form className="space-y-stack-md" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant block">Work Email</label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]"
              >
                mail
              </span>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                placeholder="name@company.com"
                type="email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-stack-sm">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant block">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant block">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                type="text"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant block">Organization Size</label>
            <select
              name="orgSize"
              value={form.orgSize}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all appearance-none"
            >
              {ORG_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {status.type === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary-fixed px-4 py-3 text-body-sm text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              {status.message}
            </div>
          )}
          {status.type === "error" && (
            <div className="flex items-center gap-2 rounded-lg bg-error-container px-4 py-3 text-body-sm text-on-error-container">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {status.message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-label-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Continue to Dashboard"}
              {!isLoading && (
                <span className="material-symbols-outlined">arrow_forward</span>
              )}
            </button>
          </div>
          <p className="text-[11px] text-on-tertiary-container text-center leading-normal">
            By signing up, you agree to our{" "}
            <a className="text-secondary hover:underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-secondary hover:underline" href="#">
              Privacy Policy
            </a>
            . We&apos;ll send you periodic product updates.
          </p>
        </form>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-outline-variant"></div>
          <span className="text-label-md text-on-surface-variant">OR REGISTER WITH</span>
          <div className="h-px flex-1 bg-outline-variant"></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-stack-sm">
          <button
            type="button"
            className="flex items-center justify-center gap-2 border border-outline-variant py-2.5 rounded-lg text-label-md hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">cloud</span>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 border border-outline-variant py-2.5 rounded-lg text-label-md hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">shield</span>
            Okta
          </button>
        </div>
      </div>
    </div>
  );
}
