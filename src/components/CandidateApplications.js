"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = ["Applied", "Screen", "Interview", "Offer"];

function stageIcon(i, done, isCurrent, closed) {
  if (closed) return "block";
  if (done) return "check_circle";
  if (isCurrent) return "forum";
  return "payments";
}

function ApplicationCard({ app }) {
  const router = useRouter();
  const closed = app.closed;
  const idx = app.stageIndex;

  return (
    <div
      className={`glass-card rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 ${
        closed ? "bg-surface-container-low opacity-75 border border-outline-variant border-dashed" : ""
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Basic Info */}
        <div className="lg:w-1/3">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded flex items-center justify-center shrink-0 border border-outline-variant ${
                closed ? "bg-surface-dim text-outline" : "bg-surface-container text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>
                {closed ? "history" : "apartment"}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">{app.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant font-semibold">
                {app.company}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-label-md font-label-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">distance</span> {app.location}
                </span>
                <span className="flex items-center gap-1 text-label-md font-label-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-label-md font-label-md border ${
              closed
                ? "bg-surface-variant text-on-surface-variant border-outline"
                : app.status === "Interviewing"
                ? "bg-secondary-container/30 text-on-secondary-container border-secondary-container"
                : "bg-surface-container text-on-surface-variant border-outline-variant"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${closed ? "bg-outline" : "bg-secondary"}`}></span>
            {app.status}
          </div>
        </div>

        {/* Pipeline Stepper */}
        <div className="lg:w-2/3 flex flex-col justify-center">
          <div className="relative flex justify-between w-full">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container-high z-0"></div>
            {!closed && idx >= 0 && (
              <div
                className="absolute top-5 left-0 h-[2px] bg-secondary z-0"
                style={{ width: `${(idx / (STAGES.length - 1)) * 100}%` }}
              ></div>
            )}
            {STAGES.map((label, i) => {
              const done = !closed && i <= idx;
              const isCurrent = !closed && i === idx;
              return (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      closed
                        ? "bg-outline-variant text-on-surface-variant"
                        : done
                        ? "bg-secondary text-white shadow-md"
                        : "bg-white border-2 border-surface-container-high text-outline"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {stageIcon(i, done, isCurrent, closed)}
                    </span>
                  </div>
                  <span
                    className={`text-label-md font-label-md ${
                      closed
                        ? "text-outline"
                        : done
                        ? "text-primary"
                        : isCurrent
                        ? "text-secondary font-bold"
                        : "text-outline"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end shrink-0">
          <button
            onClick={() => router.push(`/jobs?jobId=${app.jobId}`)}
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all active:scale-95 ${
              closed
                ? "text-on-surface-variant hover:bg-surface-container"
                : "bg-primary text-white hover:bg-on-primary-container"
            }`}
          >
            {closed ? "View Feedback" : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidateApplications({ candidate }) {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  useEffect(() => {
    setLoading(true);
    fetch("/api/candidates/applications")
      .then((r) => r.json())
      .then((d) => setApps(d.applications || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter((a) => {
    if (statusFilter === "All Statuses") return true;
    if (statusFilter === "Interviewing") return a.status === "Interviewing";
    if (statusFilter === "Under Review") return /review/i.test(a.status);
    if (statusFilter === "Offer Extended") return /offer/i.test(a.status);
    return true;
  });

  return (
    <main className="max-w-container-max px-margin-desktop py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-primary mb-2">My Applications</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Track your progress and manage your journey with hiring partners.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-outline-variant">
            <span className="font-label-md text-label-md text-on-surface-variant">Status:</span>
            <select
              className="bg-transparent border-none p-0 pr-6 text-label-md font-bold focus:ring-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Interviewing</option>
              <option>Under Review</option>
              <option>Offer Extended</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-outline-variant">
            <span className="font-label-md text-label-md text-on-surface-variant">Date Range:</span>
            <select
              className="bg-transparent border-none p-0 pr-6 text-label-md font-bold focus:ring-0 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="glass-card rounded-xl p-6 text-center text-on-surface-variant">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="font-headline-md text-headline-md text-on-surface mb-2">No applications yet</p>
            <p className="text-on-surface-variant mb-6">Browse open roles and submit your first application.</p>
            <button
              onClick={() => router.push("/jobs")}
              className="bg-primary text-white px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-on-primary-container"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          filtered.map((app) => <ApplicationCard key={app.jobId} app={app} />)
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button className="p-2 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded bg-primary text-white font-label-md text-label-md">1</button>
          <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface font-label-md text-label-md">
            2
          </button>
          <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface font-label-md text-label-md">
            3
          </button>
          <span className="text-on-surface-variant px-2">...</span>
          <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface font-label-md text-label-md">
            8
          </button>
          <button className="p-2 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </main>
  );
}
