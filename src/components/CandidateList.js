"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_STYLES = {
  Applied: "bg-gray-100 text-gray-800 border-gray-200",
  Screening: "bg-secondary/10 text-secondary border-secondary/20",
  Interviewing: "bg-blue-100 text-blue-800 border-blue-200",
  Offered: "bg-green-100 text-green-800 border-green-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isInternational(location = "") {
  return /international|remote/i.test(location);
}

const EMPTY = {
  candidateId: "",
  name: "",
  email: "",
  role: "",
  department: "",
  location: "",
  experience: "",
  listStatus: "Applied",
  status: "Active Hiring",
};

export default function CandidateList({ candidates = [], total, job = null }) {
  const router = useRouter();
  const [selected, setSelected] = useState({});
  const [modal, setModal] = useState(null); // { mode: "add"|"edit", candidate }
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));
  const openCandidate = (id) => router.push(`/admin/candidates/${id}`);

  const openAdd = () => {
    setForm(EMPTY);
    setError("");
    setModal({ mode: "add" });
  };

  const openEdit = (c) => {
    setForm({
      candidateId: c.candidateId,
      name: c.name,
      email: c.email,
      role: c.role,
      department: c.department || "",
      location: c.location,
      experience: c.experience || "",
      listStatus: c.listStatus,
      status: c.status || "Active Hiring",
    });
    setError("");
    setModal({ mode: "edit", candidate: c });
  };

  const closeModal = () => setModal(null);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      if (modal.mode === "add") {
        const res = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to create candidate.");
      } else {
        const res = await fetch(`/api/admin/candidates/${modal.candidate.candidateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update candidate.");
      }
      closeModal();
      router.refresh();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete candidate "${c.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/candidates/${c.candidateId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.refresh();
    } catch (e) {
      alert(e.message || "Failed to delete.");
    }
  };

  const toggleBlock = async (c) => {
    try {
      const res = await fetch(`/api/admin/candidates/${c.candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !c.blocked }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      router.refresh();
    } catch (e) {
      alert(e.message || "Failed to update.");
    }
  };

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  return (
    <section className="p-container-padding-desktop flex-1">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            {job ? `Applicants for ${job.title}` : "Candidate Management"}
          </h2>
          <p className="text-on-surface-variant mt-1">
            {job
              ? `Showing ${total.toLocaleString()} applicant${total === 1 ? "" : "s"} related to this job post.`
              : `Manage ${total.toLocaleString()} candidate${total === 1 ? "" : "s"} — create, edit, block, or remove.`}
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors active:opacity-80">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-bold hover:opacity-90 transition-opacity active:opacity-80"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Candidate
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
            href="/admin/candidates"
            className="flex items-center gap-1 text-secondary font-bold text-body-sm hover:underline whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Clear filter
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 mb-stack-md flex flex-wrap items-center gap-4">
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
        <select className="bg-surface-container-low border-none rounded-lg font-body-sm text-body-sm px-4 py-2 focus:ring-2 focus:ring-secondary/20 min-w-[140px]">
          <option>Experience Level</option>
          <option>Junior (0-2y)</option>
          <option>Mid-Level (3-5y)</option>
          <option>Senior (6-10y)</option>
          <option>Executive (10y+)</option>
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
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
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
                    <>
                      No candidates yet. Run <code className="font-mono-sm">npm run seed</code> to add
                      sample data.
                    </>
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
                    className={`cursor-pointer hover:bg-slate-100 transition-colors ${
                      i % 2 === 1 ? "bg-surface-bright/50" : ""
                    } ${selected[c.candidateId] ? "bg-surface-container-low" : ""} ${
                      c.blocked ? "opacity-60" : ""
                    }`}
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
                          <p className="font-bold flex items-center gap-2">
                            {c.name}
                            {c.blocked && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-error border border-error">
                                BLOCKED
                              </span>
                            )}
                          </p>
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit"
                          className="p-1.5 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => toggleBlock(c)}
                          title={c.blocked ? "Unblock" : "Block"}
                          className={`p-1.5 hover:bg-surface-container-high rounded transition-colors ${
                            c.blocked ? "text-secondary" : "text-on-surface-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {c.blocked ? "lock_open" : "block"}
                          </span>
                        </button>
                        <button
                          onClick={() => remove(c)}
                          title="Delete"
                          className="p-1.5 hover:bg-error-container rounded transition-colors text-on-surface-variant hover:text-error"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 bg-white flex justify-between items-center border-t border-outline-variant">
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

      {/* Add / Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {modal.mode === "add" ? "Add Candidate" : "Edit Candidate"}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-surface-container-low rounded">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-body-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Role</label>
                  <input
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    placeholder="Senior Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Experience</label>
                  <input
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    placeholder="5 Years"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Stage Status</label>
                  <select
                    value={form.listStatus}
                    onChange={(e) => set("listStatus", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  >
                    <option>Applied</option>
                    <option>Screening</option>
                    <option>Interviewing</option>
                    <option>Offered</option>
                    <option>Declined</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Hiring Status</label>
                  <input
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-outline-variant px-6 py-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy || !form.name || !form.role}
                className="px-6 py-2 rounded-lg bg-secondary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {busy ? "Saving…" : modal.mode === "add" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
