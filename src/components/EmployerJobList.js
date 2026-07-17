"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_DOT = {
  Active: "bg-secondary",
  Draft: "bg-outline",
  Archived: "bg-error",
};
const STATUS_TEXT = {
  Active: "text-secondary",
  Draft: "text-on-surface-variant",
  Archived: "text-error",
};
const DEPT_BADGE = "px-3 py-1 bg-surface-container-high rounded-full text-label-sm font-label-sm text-on-surface-variant uppercase tracking-tight";

const PAGE_SIZE = 10;

export default function EmployerJobList({ employerId }) {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [dateFilter, setDateFilter] = useState("Date: All Time");
  const [menuOpen, setMenuOpen] = useState(null);
  const [page, setPage] = useState(1);
  const tableRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs?pageSize=200&employerId=${encodeURIComponent(employerId)}&status=`
      );
      const data = await res.json();
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Row click micro-interaction (ignore clicks on buttons/links).
  useEffect(() => {
    const rows = tableRef.current?.querySelectorAll(".data-table-row") || [];
    const handlers = [];
    rows.forEach((row) => {
      const h = (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        row.classList.add("opacity-70");
        setTimeout(() => row.classList.remove("opacity-70"), 200);
      };
      row.addEventListener("click", h);
      handlers.push([row, h]);
    });
    return () => handlers.forEach(([r, h]) => r.removeEventListener("click", h));
  }, [jobs, page]);

  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  // Interviews / avg time to fill aren't tracked yet — shown as illustrative 0.
  const interviewsScheduled = 0;
  const avgTimeToFill = "18 Days";

  const departments = ["All Departments", "Engineering", "Product", "Design", "Marketing"];

  const filtered = jobs.filter((j) => {
    const deptOk = deptFilter === "All Departments" || j.department === deptFilter;
    let statusOk = true;
    if (statusFilter === "Active") statusOk = j.status === "Active";
    else if (statusFilter === "Draft") statusOk = j.status === "Draft";
    else if (statusFilter === "Pending") statusOk = false; // employers have no Pending
    else if (statusFilter === "Closed") statusOk = j.status === "Archived";
    return deptOk && statusOk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function toggleStatus(job) {
    const next = job.status === "Active" ? "Archived" : "Active";
    await fetch(`/api/jobs/${encodeURIComponent(job.jobId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setMenuOpen(null);
    load();
  }

  async function remove(job) {
    if (!confirm(`Delete "${job.title}" permanently?`)) return;
    await fetch(`/api/jobs/${encodeURIComponent(job.jobId)}`, { method: "DELETE" });
    setMenuOpen(null);
    load();
  }

  const stats = [
    {
      label: "TOTAL ACTIVE POSTS",
      value: activeJobs,
      sub: "+4 from last month",
      icon: "work",
      iconWrap: "bg-primary-fixed text-primary",
    },
    {
      label: "TOTAL APPLICANTS",
      value: totalApplicants.toLocaleString(),
      sub: "+12% conversion",
      icon: "person_add",
      iconWrap: "bg-secondary-container text-on-secondary-container",
    },
    {
      label: "INTERVIEWS SCHEDULED",
      value: interviewsScheduled,
      sub: "Not yet tracked",
      icon: "event_available",
      iconWrap: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    {
      label: "AVG. TIME TO FILL",
      value: avgTimeToFill,
      sub: "75% of target",
      subBar: true,
      icon: "timer",
      iconWrap: "bg-surface-container-high text-on-surface-variant",
    },
  ];

  return (
    <div className="p-8 max-w-container-max mx-auto">
      {/* Header & Primary Action */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary">My Job Posts</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Manage and monitor your active career listings
          </p>
        </div>
        <Link
          href="/employer/jobs/manage"
          className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-secondary/20"
        >
          <span className="material-symbols-outlined">add</span>
          POST NEW JOB
        </Link>
      </div>

      {/* Statistics Overview: Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex items-start justify-between"
          >
            <div>
              <p className="text-on-surface-variant font-label-md text-label-md mb-2">{s.label}</p>
              <h3 className="font-headline-lg text-headline-lg text-primary">{s.value}</h3>
              {s.subBar ? (
                <div className="w-24 h-1.5 bg-surface-container-high rounded-full mt-3">
                  <div className="w-3/4 h-full bg-secondary rounded-full"></div>
                </div>
              ) : (
                <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  {s.sub}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${s.iconWrap}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">filter_list</span>
          <select
            className="bg-transparent border-none text-body-md focus:ring-0 cursor-pointer pr-8"
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
          >
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">category</span>
          <select
            className="bg-transparent border-none text-body-md focus:ring-0 cursor-pointer pr-8"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>Status: All</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
          <select
            className="bg-transparent border-none text-body-md focus:ring-0 cursor-pointer pr-8"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option>Date: All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="ml-auto text-on-surface-variant text-body-md">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}-
          {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} posts
        </div>
      </div>

      {/* Job Listings Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Job Title &amp; Location
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Applicants
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant" ref={tableRef}>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                  No job posts match the current filters.
                </td>
              </tr>
            ) : (
              pageItems.map((j) => (
                <tr key={j.jobId} className="data-table-row transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-headline-md text-headline-md text-primary">{j.title}</p>
                      <p className="text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {j.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={DEPT_BADGE}>{j.department}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`flex items-center gap-2 font-label-md text-label-md ${STATUS_TEXT[j.status]}`}>
                      <span
                        className={`w-2 h-2 rounded-full ${STATUS_DOT[j.status] || "bg-outline"} ${
                          j.status === "Active" ? "animate-pulse" : ""
                        }`}
                      ></span>
                      {j.status === "Archived" ? "CLOSED" : j.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {j.applicants > 0 ? (
                      <Link
                        href={`/employer/candidates?jobId=${j.jobId}`}
                        className="flex items-center gap-2 group"
                      >
                        <span className="font-headline-md text-headline-md text-primary">
                          {j.applicants}
                        </span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm group-hover:text-secondary underline underline-offset-4 decoration-outline-variant">
                          VIEW ALL
                        </span>
                      </Link>
                    ) : (
                      <span className="font-headline-md text-headline-md text-outline">0</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setMenuOpen(menuOpen === j.jobId ? null : j.jobId)}
                        className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                      {menuOpen === j.jobId && (
                        <div className="absolute right-0 top-10 z-10 w-40 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 text-left">
                          <button
                            onClick={() => router.push(`/employer/jobs/manage?jobId=${encodeURIComponent(j.jobId)}`)}
                            className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(j)}
                            className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-body-md flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {j.status === "Active" ? "visibility_off" : "visibility"}
                            </span>
                            {j.status === "Active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => remove(j)}
                            className="w-full text-left px-4 py-2 hover:bg-error-container text-error text-body-md flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded font-label-sm text-label-sm ${
                  p === safePage
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body-md text-on-surface-variant">Rows per page:</span>
            <select className="bg-transparent border-none text-body-md focus:ring-0 cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
