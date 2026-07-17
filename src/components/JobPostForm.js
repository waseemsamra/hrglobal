"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PERKS = [
  { icon: "health_and_safety", label: "Health Ins." },
  { icon: "fitness_center", label: "Gym Membership" },
  { icon: "laptop_mac", label: "Equipment Stipend" },
  { icon: "school", label: "Learning Budget" },
];

const STEPS = ["Job Details", "Compensation", "Requirements", "Description"];

export default function JobPostForm({ source = "admin", createdBy = null, employerId = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("jobId");
  const editing = Boolean(editJobId);

  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    employmentType: "Full-time",
    location: "On-site",
    currency: "USD ($)",
    minSalary: "",
    maxSalary: "",
    experience: "Junior (1-2 years)",
    education: "No Degree Required",
    description: "",
  });
  const [perks, setPerks] = useState({});
  const [skills, setSkills] = useState(["React.js", "TypeScript", "Tailwind CSS"]);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loadingJob, setLoadingJob] = useState(editing);
  const [editStatusValue, setEditStatusValue] = useState("Active");

  // Job titles come from the roles defined in Admin > Settings > Roles.
  const [roles, setRoles] = useState([]);
  const [customTitle, setCustomTitle] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/roles")
      .then((r) => r.json())
      .then((d) => {
        if (active) setRoles(d.roles || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Edit mode: load the existing job and prefill the form so its parameters persist.
  useEffect(() => {
    if (!editJobId) return;
    let active = true;
    setLoadingJob(true);
    fetch(`/api/jobs/${encodeURIComponent(editJobId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d.job) return;
        const j = d.job;
        const REMOTE = ["On-site", "Hybrid", "Remote"];
        setForm({
          title: j.title || "",
          department: j.department || "Engineering",
          employmentType: j.type || "Full-time",
          location: REMOTE.includes(j.location) ? j.location : j.remotePolicy || "On-site",
          currency: j.currency || "USD ($)",
          minSalary: j.minSalary != null ? String(j.minSalary) : "",
          maxSalary: j.maxSalary != null ? String(j.maxSalary) : "",
          experience: j.experience || "Junior (1-2 years)",
          education: j.education || "No Degree Required",
          description: j.description || "",
        });
        setSkills(Array.isArray(j.skills) ? [...new Set(j.skills)] : []);
        setPerks(
          Array.isArray(j.perks) ? Object.fromEntries(j.perks.map((p) => [p, true])) : {}
        );
        setEditStatusValue(j.status || "Active");
        // If the stored title isn't one of the known roles, treat it as custom.
        setRoles((prevRoles) => {
          const known = prevRoles.some((r) => r.name === j.title);
          if (j.title && !known) setCustomTitle(true);
          return prevRoles;
        });
      })
      .catch(() => {
        if (active) setStatus({ type: "error", message: "Failed to load job for editing." });
      })
      .finally(() => {
        if (active) setLoadingJob(false);
      });
    return () => {
      active = false;
    };
  }, [editJobId]);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s));
  const togglePerk = (label) => setPerks((p) => ({ ...p, [label]: !p[label] }));

  const salaryLabel = useMemo(() => {
    const sym = form.currency.match(/\(([^)]+)\)/)?.[1] || "$";
    const fmt = (v) => (v ? `${sym}${Number(v).toLocaleString()}` : null);
    const lo = fmt(form.minSalary);
    const hi = fmt(form.maxSalary);
    if (lo && hi) return `${lo} - ${hi}`;
    return lo || hi || "Competitive";
  }, [form.currency, form.minSalary, form.maxSalary]);

  const submit = async (jobStatus) => {
    if (!form.title.trim()) {
      setStatus({ type: "error", message: "Job title is required." });
      return;
    }
    setStatus({ type: "loading", message: "" });

    // Common fields shared by create (POST) and edit (PATCH).
    const fields = {
      title: form.title.trim(),
      department: form.department,
      location: form.location === "Remote" ? "Remote" : `${form.location}`,
      remotePolicy: form.location,
      type: form.employmentType,
      status: jobStatus, // "Active" (publish) or "Draft"
      minSalary: form.minSalary ? Number(form.minSalary) : null,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
      currency: form.currency,
      experience: form.experience,
      education: form.education,
      skills,
      perks: Object.keys(perks).filter((k) => perks[k]),
      description: form.description,
    };

    try {
      let res;
      if (editing) {
        // Update the existing job in place — its parameters persist.
        res = await fetch(`/api/jobs/${encodeURIComponent(editJobId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
      } else {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source, // drives ADM-/EMP- Job ID prefix
            createdBy,
            employerId,
            applicants: 0,
            ...fields,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Failed to save job." });
        return;
      }
      setStatus({
        type: "success",
        message: editing
          ? "Changes saved!"
          : (jobStatus === "Active" ? "Job published!" : "Draft saved!") +
            (data.jobId ? ` (ID: ${data.jobId})` : ""),
      });
      if (editing || jobStatus === "Active") {
        router.push(source === "employer" ? "/employer/jobs" : "/admin/jobs");
        router.refresh();
      }
    } catch (e) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }
  };

  const loading = status.type === "loading";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-stack-lg gap-4 flex-wrap">
          <div>
            <h2 className="text-title-md font-bold text-on-surface">
              {editing ? "Edit Job" : "Create New Job"}
            </h2>
            {editing && (
              <p className="text-body-sm text-on-surface-variant font-mono mt-0.5">{editJobId}</p>
            )}
          </div>
          <div className="flex items-center gap-stack-md">
            {status.type === "error" && (
              <span className="text-body-sm text-error">{status.message}</span>
            )}
            {status.type === "success" && (
              <span className="text-body-sm text-green-600">{status.message}</span>
            )}
            <button
              onClick={() => submit("Draft")}
              disabled={loading || loadingJob}
              className="flex items-center gap-2 px-stack-md py-2 text-secondary font-bold hover:bg-surface-container-low transition-colors rounded-lg disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Draft
            </button>
            <button
              onClick={() => submit(editing ? editStatusValue : "Active")}
              disabled={loading || loadingJob}
              className="bg-primary text-on-primary px-stack-lg py-2.5 rounded-lg font-label-md hover:bg-opacity-90 shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {editing ? "save" : "publish"}
              </span>
              {loading ? "Saving..." : editing ? "Save Changes" : "Publish Job"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Left column */}
          <div className="flex-1 space-y-gutter">
            {/* Steps */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant flex items-center justify-between overflow-x-auto">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-md ${
                      i === 0
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container-high text-on-surface"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-label-md whitespace-nowrap">{label}</span>
                  {i < STEPS.length - 1 && (
                    <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                  )}
                </div>
              ))}
            </div>

            {/* Job Details */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="p-gutter border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">info</span>
                  Job Details
                </h3>
                <span className="text-label-md text-secondary font-bold">Step 1 of 4</span>
              </div>
              <div className="p-gutter grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Job Title</label>
                  {!customTitle ? (
                    <select
                      value={form.title}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setCustomTitle(true);
                          set("title", "");
                        } else {
                          set("title", e.target.value);
                        }
                      }}
                      className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                    >
                      <option value="">Select a job title…</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom title…</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        className="flex-1 bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="e.g. Senior Software Engineer"
                        type="text"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomTitle(false);
                          set("title", "");
                        }}
                        className="px-4 py-3 text-secondary font-bold hover:bg-surface-container-low rounded-lg transition-colors whitespace-nowrap"
                      >
                        Use list
                      </button>
                    </div>
                  )}
                  {!customTitle && roles.length === 0 && (
                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      No roles defined yet. Add them in{" "}
                      <a href="/admin/settings" className="text-secondary font-bold hover:underline">
                        Settings → Roles
                      </a>
                      .
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option>Engineering</option>
                    <option>Product Design</option>
                    <option>Marketing</option>
                    <option>Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Employment Type</label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => set("employmentType", e.target.value)}
                    className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Freelance</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Location / Remote Policy</label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {["On-site", "Hybrid", "Remote"].map((loc) => (
                      <label
                        key={loc}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors ${
                          form.location === loc ? "bg-secondary-fixed" : "bg-surface-container-high hover:bg-secondary-fixed"
                        }`}
                      >
                        <input
                          checked={form.location === loc}
                          onChange={() => set("location", loc)}
                          className="text-secondary focus:ring-secondary"
                          name="location"
                          type="radio"
                        />
                        <span className="text-label-md">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Compensation */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="p-gutter border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  Compensation &amp; Benefits
                </h3>
              </div>
              <div className="p-gutter grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Min Salary</label>
                  <input
                    value={form.minSalary}
                    onChange={(e) => set("minSalary", e.target.value)}
                    className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="80,000"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">Max Salary</label>
                  <input
                    value={form.maxSalary}
                    onChange={(e) => set("maxSalary", e.target.value)}
                    className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="120,000"
                    type="number"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-label-md font-bold text-on-surface-variant mb-4">Core Perks</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PERKS.map((perk) => (
                      <div
                        key={perk.label}
                        onClick={() => togglePerk(perk.label)}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer group ${
                          perks[perk.label] ? "border-secondary bg-secondary-fixed" : "border-outline-variant hover:border-secondary"
                        }`}
                      >
                        <span className={`material-symbols-outlined ${perks[perk.label] ? "text-secondary" : "text-outline group-hover:text-secondary"}`}>
                          {perk.icon}
                        </span>
                        <span className="text-label-md">{perk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant">
              <div className="p-gutter border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">verified_user</span>
                  Candidate Requirements
                </h3>
              </div>
              <div className="p-gutter space-y-stack-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Experience Level</label>
                    <select
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option>Junior (1-2 years)</option>
                      <option>Mid-level (3-5 years)</option>
                      <option>Senior (5-8 years)</option>
                      <option>Lead/Principal (8+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface-variant mb-2">Education</label>
                    <select
                      value={form.education}
                      onChange={(e) => set("education", e.target.value)}
                      className="w-full bg-surface-container-low border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    >
                      <option>No Degree Required</option>
                      <option>Bachelor&apos;s Degree</option>
                      <option>Master&apos;s Degree</option>
                      <option>PhD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-3">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-md rounded-full flex items-center gap-2"
                      >
                        {s}
                        <span
                          onClick={() => removeSkill(s)}
                          className="material-symbols-outlined text-[14px] cursor-pointer"
                        >
                          close
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="w-full bg-surface-container-low border-outline-variant rounded-lg pl-4 pr-12 py-3 text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                      placeholder="Add a skill..."
                      type="text"
                    />
                    <button
                      onClick={addSkill}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary font-bold hover:text-on-secondary-fixed-variant"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant">
              <div className="p-gutter border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  Job Description
                </h3>
              </div>
              <div className="p-gutter">
                <div className="border border-outline-variant rounded-lg overflow-hidden bg-white">
                  <div className="bg-surface-container-low p-2 border-b border-outline-variant flex flex-wrap gap-1">
                    {["format_bold", "format_italic", "format_list_bulleted", "format_list_numbered"].map((ic) => (
                      <button key={ic} className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">{ic}</span>
                      </button>
                    ))}
                    <div className="w-[1px] h-6 bg-outline-variant mx-1 self-center"></div>
                    <button className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">link</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">image</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant ml-auto">
                      <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className="w-full p-4 min-h-[300px] text-body-md focus:outline-none resize-y border-none focus:ring-0"
                    placeholder="Start typing the roles, responsibilities, and company vision here..."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="w-full lg:w-[320px] space-y-gutter">
            {/* Live preview */}
            <div className="bg-primary-container text-primary-fixed p-gutter rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-secondary-container text-on-secondary px-3 py-1 rounded-full text-label-md inline-block mb-4">
                  LIVE PREVIEW
                </span>
                <h4 className="text-headline-lg-mobile font-bold leading-tight mb-2">
                  {form.title || "Job Title"}
                </h4>
                <p className="text-body-sm opacity-80 mb-6">
                  {form.department} • {form.location}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span className="text-label-md">{salaryLabel}</span>
                </div>
                <div className="flex items-center gap-2 mb-8">
                  <span className="material-symbols-outlined text-[18px]">work</span>
                  <span className="text-label-md">{form.employmentType}</span>
                </div>
                <button className="w-full py-3 bg-secondary-fixed text-on-secondary-fixed font-black rounded-lg hover:bg-on-secondary-fixed-variant hover:text-white transition-all">
                  View Public Page
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant">
              <h4 className="text-label-md font-black text-on-surface uppercase tracking-widest mb-4">
                Publishing Guidelines
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  <p className="text-body-sm text-on-surface-variant">
                    Include specific salary ranges to increase application rate by 40%.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  <p className="text-body-sm text-on-surface-variant">
                    Keywords like &quot;React&quot; or &quot;TypeScript&quot; should be added to the Requirements.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">tips_and_updates</span>
                  <p className="text-body-sm text-on-surface-variant">
                    Drafts are saved to your job posts collection.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
