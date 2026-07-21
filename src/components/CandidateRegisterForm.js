"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "BASIC", icon: "person" },
  { id: 2, label: "DETAILS", icon: "work" },
  { id: 3, label: "REVIEW", icon: "checklist" },
];

export default function CandidateRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    currentRole: "",
    experience: "",
    skills: [],
    location: "",
    summary: "",
    terms: false,
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const next = () => {
    if (step === 1 && (!form.name || !form.email || !form.password)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (step === 2 && !form.currentRole) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const addSkill = (skill) => {
    if (skill && !form.skills.includes(skill)) {
      update("skills", [...form.skills, skill]);
    }
  };

  const removeSkill = (skill) => {
    update("skills", form.skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "skills") {
          data.append(key, JSON.stringify(value));
        } else if (key === "terms") {
          data.append(key, value ? "true" : "false");
        } else {
          data.append(key, value);
        }
      });

      const res = await fetch("/api/candidates/register", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Registration failed.");
        setSubmitting(false);
        return;
      }

      router.push("/candidate/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step > s.id
                  ? "bg-secondary text-white"
                  : step === s.id
                  ? "bg-secondary text-white ring-4 ring-secondary/20"
                  : "border-2 border-outline-variant text-on-surface-variant"
              }`}
            >
              {step > s.id ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                <span className="material-symbols-outlined">{s.icon}</span>
              )}
            </div>
            <span
              className={`font-label-md text-label-md ${
                step >= s.id ? "text-secondary font-bold" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Line */}
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-outline-variant" />
        <div
          className="absolute top-0 left-0 h-[2px] bg-secondary transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
      </div>

      {error && (
        <div className="mb-4 bg-error-container text-on-error-container rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-title-md text-title-md text-primary mb-1">Basic Information</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Let's start with your contact information.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  FULL NAME
                </label>
                <input
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors"
                  placeholder="Enter your legal name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    PASSWORD
                  </label>
                  <input
                    required
                    type="password"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Professional Details */}
        {step === 2 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-title-md text-title-md text-primary mb-1">Professional Details</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tell us about your career background.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Current Job Title
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors"
                    placeholder="e.g. Senior Software Engineer"
                    value={form.currentRole}
                    onChange={(e) => update("currentRole", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Years of Exp.
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors appearance-none"
                    value={form.experience}
                    onChange={(e) => update("experience", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Primary Skills
                </label>
                <div className="border border-outline-variant rounded-lg p-3 flex flex-wrap gap-2 items-center bg-surface-bright">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-md rounded-full flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="material-symbols-outlined text-[14px] cursor-pointer"
                      >
                        close
                      </button>
                    </span>
                  ))}
                  <input
                    className="flex-grow border-none focus:ring-0 p-0 text-body-sm bg-transparent"
                    placeholder="Add skill..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Preferred Location
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors appearance-none"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                >
                  <option value="">Choose a location</option>
                  <option value="remote">Remote</option>
                  <option value="berlin">Berlin</option>
                  <option value="munich">Munich</option>
                  <option value="hamburg">Hamburg</option>
                  <option value="frankfurt">Frankfurt</option>
                  <option value="cologne">Cologne</option>
                  <option value="stuttgart">Stuttgart</option>
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Professional Summary
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md focus:border-secondary transition-colors resize-none"
                  placeholder="Briefly describe your career highlights..."
                  value={form.summary}
                  onChange={(e) => update("summary", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Terms */}
        {step === 3 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-title-md text-title-md text-primary mb-1">Review & Agree</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Confirm your details and accept the terms to complete registration.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                <h3 className="font-label-md font-bold text-on-surface uppercase tracking-wider">Profile Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm">
                  <div>
                    <span className="text-on-surface-variant">Name:</span> <span className="font-semibold">{form.name}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Email:</span> <span className="font-semibold">{form.email}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Phone:</span> <span className="font-semibold">{form.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Role:</span> <span className="font-semibold">{form.currentRole}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Experience:</span> <span className="font-semibold">{form.experience}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Location:</span> <span className="font-semibold">{form.location}</span>
                  </div>
                </div>
                {form.skills.length > 0 && (
                  <div className="pt-2">
                    <span className="text-on-surface-variant text-body-sm">Skills: </span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {form.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    required
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => update("terms", e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-outline-variant text-secondary focus:ring-secondary"
                  />
                  <span className="font-body-sm text-on-surface-variant leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-secondary hover:underline font-semibold">Privacy Policy</a>{" "}
                    and understand that my personal data will be processed for recruitment purposes.
                  </span>
                </label>
              </div>

              <div className="bg-secondary-container/30 border border-secondary/20 rounded-lg p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary">info</span>
                <p className="text-body-sm text-on-secondary-container">
                  After registration, you can upload documents (Resume, Cover Letter, Certificates) and update your profile anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              className="px-6 py-3 rounded-lg bg-secondary text-white font-label-md hover:opacity-90 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-lg bg-primary text-white font-label-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
