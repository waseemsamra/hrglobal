"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_STYLES = {
  Active: "bg-secondary/10 text-secondary",
  Pending: "bg-tertiary/10 text-on-tertiary-container",
  Suspended: "bg-error-container text-on-error-container",
};

const INDUSTRIES = [
  "Information Technology",
  "Logistics & Supply Chain",
  "Renewable Energy",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  industry: INDUSTRIES[0],
  location: "",
  password: "",
};

export default function EmployerManager() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "idle", text: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/employers");
      const data = await res.json();
      setEmployers(data.employers || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load employers." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function createEmployer(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "idle", text: "" });
    try {
      const res = await fetch("/api/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Failed to create employer." });
        setSaving(false);
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setMsg({ type: "success", text: "Employer created." });
      await load();
    } catch {
      setMsg({ type: "error", text: "Failed to create employer." });
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id, status) {
    await fetch(`/api/employers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this employer? Their job posts will be kept but unlinked.")) return;
    await fetch(`/api/employers/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = employers.filter((e) => {
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totals = {
    all: employers.length,
    active: employers.filter((e) => e.status === "Active").length,
    pending: employers.filter((e) => e.status === "Pending").length,
    suspended: employers.filter((e) => e.status === "Suspended").length,
  };

  return (
    <div className="p-8 max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-1">Employers</h1>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Manage employer accounts, approvals, and their job postings.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Employer"}
        </button>
      </div>

      {msg.type === "success" && (
        <div className="mb-4 bg-secondary/10 text-secondary rounded-lg px-4 py-2 text-body-md">{msg.text}</div>
      )}
      {msg.type === "error" && (
        <div className="mb-4 bg-error-container text-on-error-container rounded-lg px-4 py-2 text-body-md">{msg.text}</div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={createEmployer}
          className="mb-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Contact / Account Name *</label>
            <input required value={form.name} onChange={(e) => setF("name", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Business Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Company</label>
            <input value={form.company} onChange={(e) => setF("company", e.target.value)} placeholder="Defaults to account name" className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Industry</label>
            <select value={form.industry} onChange={(e) => setF("industry", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary appearance-none">
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Location</label>
            <input value={form.location} onChange={(e) => setF("location", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">Temp Password</label>
            <input value={form.password} onChange={(e) => setF("password", e.target.value)} placeholder="Defaults to password123" className="w-full px-4 py-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={saving} type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-60">
              {saving ? "Creating…" : "Create Employer"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employers…"
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant outline-none focus:border-primary"
          />
        </div>
        <div className="flex bg-surface-container-low border border-outline-variant rounded-lg p-1">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-label-md transition-colors ${
                statusFilter === s ? "bg-surface-container-lowest shadow-sm font-bold" : "text-on-surface-variant"
              }`}
            >
              {s}
              {s === "All" ? ` (${totals.all})` : s === "Active" ? ` (${totals.active})` : s === "Pending" ? ` (${totals.pending})` : ` (${totals.suspended})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 text-label-md text-on-surface-variant">Company</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant">Jobs</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant">Applicants</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">No employers found.</td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/employers/${e.id}`} className="font-bold text-on-surface hover:text-primary hover:underline">
                        {e.company || e.name}
                      </Link>
                      <div className="text-label-sm text-on-surface-variant">{e.industry || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{e.email}</td>
                    <td className="px-6 py-4 text-body-md">
                      {e.activeJobs}/{e.jobs}
                    </td>
                    <td className="px-6 py-4 text-body-md">{e.applicants}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${STATUS_STYLES[e.status] || ""}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {e.status !== "Active" && (
                          <button onClick={() => setStatus(e.id, "Active")} title="Approve / Activate" className="p-2 rounded-lg hover:bg-secondary/10 text-secondary">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                        )}
                        {e.status !== "Suspended" && (
                          <button onClick={() => setStatus(e.id, "Suspended")} title="Suspend" className="p-2 rounded-lg hover:bg-error-container text-error">
                            <span className="material-symbols-outlined text-[20px]">block</span>
                          </button>
                        )}
                        <Link href={`/admin/employers/${e.id}`} title="View" className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </Link>
                        <button onClick={() => remove(e.id)} title="Delete" className="p-2 rounded-lg hover:bg-error-container text-error">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
