"use client";

import Link from "next/link";
import { useState } from "react";

const INDUSTRIES = [
  "Information Technology",
  "Logistics & Supply Chain",
  "Renewable Energy",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
];

export default function EmployerRegisterForm({ orgName = "Kinetic HR" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    industry: INDUSTRIES[0],
    location: "",
    password: "",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.agree) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/employers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          name: form.name,
          email: form.email,
          industry: form.industry,
          location: form.location,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md form-container text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-secondary text-[36px]">mark_email_read</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface mb-3">Application Submitted</h2>
        <p className="font-body-md text-on-surface-variant mb-8">
          Thanks for registering with <span className="font-bold">{orgName}</span>. Your employer
          account is now <span className="font-bold text-secondary">pending admin approval</span>.
          You&apos;ll be able to sign in once it has been reviewed.
        </p>
        <Link
          href="/employer/login"
          className="inline-flex items-center justify-center gap-2 w-full h-14 bg-secondary hover:bg-secondary-container text-white font-headline-md rounded-lg transition-all"
        >
          Back to Sign In
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </div>
    );
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

      <header className="mb-8">
        <h2 className="font-headline-xl text-headline-xl text-on-surface mb-2">Create Employer Account</h2>
        <p className="font-body-md text-on-surface-variant">
          Register your company to start posting jobs. Accounts are activated after admin approval.
        </p>
      </header>

      <form className="space-y-5" onSubmit={onSubmit}>
        {error && (
          <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {/* Company Name */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="company">
            Company Name
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
              corporate_fare
            </span>
            <input
              id="company"
              type="text"
              required
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Inc."
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="name">
            Contact Name
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
              person
            </span>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Doe"
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all"
            />
          </div>
        </div>

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

        {/* Industry + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="industry">
              Industry
            </label>
            <select
              id="industry"
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              className="w-full h-14 px-4 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all appearance-none"
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, Country"
              className="w-full h-14 px-4 bg-white border border-outline-variant rounded-lg text-body-md focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="At least 6 characters"
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

        {/* Terms */}
        <div className="flex items-center gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={form.agree}
            onChange={(e) => set("agree", e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary"
          />
          <label className="font-body-md text-on-surface-variant" htmlFor="agree">
            I agree to the{" "}
            <a className="text-secondary hover:underline" href="#">
              Terms of Service
            </a>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-14 bg-secondary hover:bg-secondary-container text-white font-headline-md rounded-lg shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create Account"}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </form>

      <footer className="mt-8 text-center">
        <p className="font-body-md text-on-surface-variant">
          Already have an employer account?{" "}
          <Link className="text-secondary font-bold hover:underline" href="/employer/login">
            Sign In
          </Link>
        </p>
      </footer>
    </div>
  );
}
