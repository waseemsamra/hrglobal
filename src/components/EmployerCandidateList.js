"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_STYLES = {
  Applied: "bg-surface-container-high text-on-surface-variant border-outline-variant",
  Screening: "bg-secondary/10 text-secondary border-secondary/20",
  Interviewing: "bg-tertiary/10 text-on-tertiary-container border-tertiary/20",
  Offered: "bg-tertiary-fixed/40 text-on-tertiary-fixed border-tertiary/30",
  Declined: "bg-error-container text-on-error-container border-error/20",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isInternational(location = "") {
  return /international|remote/i.test(location);
}

export default function EmployerCandidateList({ candidates = [], total, job = null }) {
  const router = useRouter();
  const [selected, setSelected] = useState({});

  const toggle = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));
  const openCandidate = (id) => router.push(`/employer/candidates/${id}`);

  return (
    <section className="p-gutter max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {job ? `Applicants for ${job.title}` : "Applicants"}
          </h2>
          <p className="text-on-surface-variant mt-1">
            {job
              ? `Showing ${total.toLocaleString()} applicant${total === 1 ? "" : "s"} related to this job post.`
              : `Reviewing ${total.toLocaleString()} applicant${total === 1 ? "" : "s"} across your job posts.`}
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Active job filter banner */}
      {job && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 mb-stack-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-secondary font-body-sm">
            <span className="material-symbols-outlined text-[20px]">work</span>
            <span>
              Filtered by job post: <strong>{job.title}</strong>
              {job.department ? ` • ${job.department}` : ""}{" "}
              <span className="font-mono text-xs opacity-70">({job.jobId})</span>
            </span>
          </div>
          <Link
            href="/employer/candidates"
            className="flex items-center gap-1 text-secondary font-bold text-body-sm hover:underline whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Clear filter
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-stack-md flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
          <span className="font-label-md uppercase tracking-wider text-on-surface-variant">Filters</span>
        </div>
        <div className="h-6 w-px bg-outline-variant"></div>
        <select className="bg-surface-container-low border-none rounded-lg font-body-sm text-body-sm px-4 py-2 focus:ring-2 focus:ring-secondary/20 min-w-[140px]">
          <option>All Locations</option>
          <option>Domestic (Local)</option>
          <option>International</option>
          <option>Remote (Global)</option>
        </select>
        <select className="bg-surface-container-low border-none rounded-lg font-body-sm text-body-sm px-4 py-2 focus:ring-2 focus:ring-secondary/20 min-w-[160px]">
          <option>All Statuses</option>
          <option>Applied</option>
          <option>Screening</option>
          <option>Interviewing</option>
          <option>Offered</option>
          <option>Declined</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-on-surface-variant font-body-sm">Sort by:</span>
          <button className="flex items-center gap-1 font-bold text-secondary font-body-sm">
            Recent Activity
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="p-4"></th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Candidate Name</th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Current Role</th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Experience</th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant font-body-sm">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-on-surface-variant">
                  {job ? (
                    <>No applicants related to this job post yet.</>
                  ) : (
                    <>No applicants for your job posts yet.</>
                  )}
                </td>
              </tr>
            ) : (
              candidates.map((c, i) => {
                const statusCls = STATUS_STYLES[c.listStatus] || STATUS_STYLES.Applied;
                return (
                  <tr
                    key={c.candidateId}
                    onClick={() => openCandidate(c.candidateId)}
                    className={`cursor-pointer hover:bg-surface-container-low transition-colors ${
                      i % 2 === 1 ? "bg-surface-bright/50" : ""
                    } ${selected[c.candidateId] ? "bg-surface-container-low" : ""}`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!selected[c.candidateId]}
                        onChange={() => toggle(c.candidateId)}
                        className="rounded border-outline text-secondary focus:ring-secondary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-secondary">
                            {initials(c.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className="text-xs text-on-surface-variant">{c.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{c.role}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          {isInternational(c.location) ? "public" : "location_on"}
                        </span>
                        {c.location || "—"}
                      </div>
                    </td>
                    <td className="p-4">{c.experience || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${statusCls}`}>
                        {c.listStatus || "Applied"}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openCandidate(c.candidateId)}
                        className="p-1 hover:bg-surface-container-high rounded transition-colors"
                      >
                        <span className="material-symbols-outlined">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
          <p className="text-on-surface-variant text-body-sm">
            Showing 1 to {candidates.length} of {total.toLocaleString()} candidates
          </p>
          <div className="flex gap-2">
            <button
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-4 py-2 bg-secondary text-white rounded-lg font-bold">1</button>
            <button className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
              2
            </button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
