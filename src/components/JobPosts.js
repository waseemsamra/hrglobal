"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BADGE_STYLES = {
  Urgent: "bg-error-container text-on-error-container",
  Verified: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
};

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  Archived: "bg-surface-container-high text-on-surface-variant",
  Draft: "bg-amber-100 text-amber-700",
};

function formatDate(date) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function JobCard({ job, listView, onAction, busy }) {
  const router = useRouter();
  const extra = Math.max(job.applicants - 3, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const isActive = job.status === "Active";

  return (
    <article
      className={`bg-white border border-outline-variant rounded-xl overflow-hidden hover:border-secondary transition-all group flex flex-col ${
        listView ? "md:flex-row" : ""
      } ${busy ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className={`flex flex-col flex-grow ${listView ? "md:flex-1" : ""}`}>
        <div className="p-stack-md border-b border-outline-variant bg-surface-container-lowest flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                STATUS_STYLES[job.status] || "bg-surface-container-high text-secondary"
              }`}
            >
              {job.status}
            </span>
            {job.badge && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  BADGE_STYLES[job.badge] || "bg-surface-container-high text-secondary"
                }`}
              >
                {job.badge}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-secondary uppercase">
              {job.type}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
              {job.source === "employer" ? "Employer" : "Admin"}
            </span>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-outline hover:text-on-surface transition-colors"
              aria-label="Job actions"
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-outline-variant rounded-lg shadow-lg z-20 overflow-hidden py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/admin/jobs/manage?jobId=${encodeURIComponent(job.jobId)}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAction("toggle", job);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isActive ? "visibility_off" : "visibility"}
                  </span>
                  {isActive ? "Disable" : "Enable"}
                </button>
                <div className="border-t border-outline-variant my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAction("delete", job);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error-container/40 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-stack-md flex-grow">
          <h3 className="font-title-md text-on-surface group-hover:text-secondary transition-colors mb-1">
            {job.title}
          </h3>
          <p className="text-[11px] text-on-surface-variant font-mono mb-1">{job.jobId}</p>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-[16px]">apartment</span>{" "}
            {job.department} • {job.location}
          </p>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {job.employerName || "CareerHub"}
          </p>
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-dashed border-outline-variant">
            <div>
              <p className="text-label-md text-on-surface-variant">Applicants</p>
              <p className="font-title-md text-secondary">{job.applicants}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Posted</p>
              <p className="font-title-md text-on-surface">{formatDate(job.postedAt)}</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`px-stack-md py-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between ${
          listView ? "md:border-t-0 md:border-l md:flex-col md:items-start md:gap-3 md:justify-center md:min-w-[220px]" : ""
        }`}
      >
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
              style={{ opacity: 1 - i * 0.15 }}
            ></div>
          ))}
          {extra > 0 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-secondary">
              +{extra}
            </div>
          )}
        </div>
        <Link
          href={`/admin/candidates?jobId=${encodeURIComponent(job.jobId)}`}
          className="text-secondary font-bold text-body-sm hover:translate-x-1 transition-transform flex items-center gap-1"
        >
          View Applicants <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}

export default function JobPosts({ jobs: initialJobs = [], counts: initialCounts }) {
  const router = useRouter();
  const [listView, setListView] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");
  const [jobs, setJobs] = useState(initialJobs);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const counts = {
    active: jobs.filter((j) => j.status === "Active").length,
    archived: jobs.filter((j) => j.status === "Archived").length,
    draft: jobs.filter((j) => j.status === "Draft").length,
  };

  const filteredJobs = jobs.filter((j) => j.status === statusFilter);
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);

  async function handleAction(action, job) {
    setError("");
    setBusyId(job.jobId);
    try {
      if (action === "delete") {
        if (!window.confirm(`Delete "${job.title}" (${job.jobId})? This cannot be undone.`)) {
          setBusyId(null);
          return;
        }
        const res = await fetch(`/api/jobs/${encodeURIComponent(job.jobId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
        setJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
      } else if (action === "toggle") {
        const nextStatus = job.status === "Active" ? "Archived" : "Active";
        const res = await fetch(`/api/jobs/${encodeURIComponent(job.jobId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Update failed");
        setJobs((prev) =>
          prev.map((j) => (j.jobId === job.jobId ? { ...j, status: nextStatus } : j))
        );
        setStatusFilter(nextStatus);
      }
      router.refresh();
    } catch (e) {
      setError(e.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-16 p-container-padding-desktop w-full max-w-[1440px] mx-auto">
      {/* Header & view toggle */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-stack-lg gap-gutter">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Job Postings</h2>
          <p className="text-on-surface-variant mt-1">
            Manage, track, and optimize your global talent acquisition pipeline.
          </p>
        </div>
        <div className="flex items-center gap-stack-sm">
          <div className="flex border border-outline-variant rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setListView(false)}
              className={`px-4 py-2 ${
                !listView ? "bg-surface-container-high text-secondary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setListView(true)}
              className={`px-4 py-2 border-l border-outline-variant ${
                listView ? "bg-surface-container-high text-secondary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border border-outline-variant rounded-xl p-stack-md mb-stack-lg flex flex-wrap items-center gap-gutter">
        <div className="flex flex-col gap-1">
          <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Department
          </label>
          <select className="bg-surface-container-low border-none rounded-lg text-body-sm py-2 px-4 focus:ring-2 focus:ring-secondary/20 cursor-pointer min-w-[180px]">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Product Design</option>
            <option>Human Resources</option>
            <option>Marketing</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Status
          </label>
          <div className="flex gap-2">
            {[
              { key: "Active", label: `Active (${counts.active})` },
              { key: "Archived", label: `Archived (${counts.archived})` },
              { key: "Draft", label: `Drafts (${counts.draft})` },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`px-4 py-2 rounded-full text-body-sm font-semibold transition-transform active:scale-95 ${
                  statusFilter === s.key
                    ? "bg-secondary-container text-white"
                    : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-2 text-secondary font-semibold hover:underline text-body-sm">
            <span className="material-symbols-outlined">filter_list</span>
            Advanced Filters
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-stack-md bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-sm">
          {error}
        </div>
      )}

      {/* Cards grid */}
      <div
        className={`grid gap-gutter ${
          listView ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        {filteredJobs.map((job) => (
          <JobCard
            key={job.jobId}
            job={job}
            listView={listView}
            onAction={handleAction}
            busy={busyId === job.jobId}
          />
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-outline-variant rounded-xl p-stack-lg text-center text-on-surface-variant">
            No {statusFilter.toLowerCase()} job postings.
          </div>
        )}

        {/* Post New Job CTA */}
        <Link
          href="/admin/jobs/manage"
          className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-stack-lg bg-surface-container-low/30 hover:bg-surface-container-low transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined !text-4xl">post_add</span>
          </div>
          <h3 className="font-title-md text-on-surface">Post New Job</h3>
          <p className="text-body-sm text-on-surface-variant text-center max-w-[200px] mt-2">
            Create a new opening and start tracking applicants globally.
          </p>
        </Link>
      </div>

      {/* Summary widgets */}
      <section className="mt-stack-lg grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-primary-container p-stack-lg rounded-xl flex items-center justify-between overflow-hidden relative group">
          <div className="z-10 relative">
            <h4 className="font-title-md text-white mb-2">Recruitment Pipeline Health</h4>
            <p className="text-on-primary-container text-body-sm max-w-sm">
              Your average time-to-hire has decreased by 12% this month. Keep up the momentum!
            </p>
            <button className="mt-4 px-6 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-lg font-bold hover:bg-white transition-colors">
              View Detailed Report
            </button>
          </div>
          <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all"></div>
          <span className="material-symbols-outlined !text-[120px] text-on-primary-container/10 absolute right-8 bottom-[-20px]">
            trending_up
          </span>
        </div>
        <div className="bg-white border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Total Active Applicants</p>
              <p className="font-display-lg text-[32px] text-on-surface font-bold">
                {totalApplicants.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between">
            <span className="text-body-sm text-on-surface-variant">
              <strong className="text-secondary">+12%</strong> from last week
            </span>
            <span className="material-symbols-outlined text-green-500">arrow_upward</span>
          </div>
        </div>
      </section>
    </div>
  );
}
