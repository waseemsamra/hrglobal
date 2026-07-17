"use client";

import { useMemo, useState } from "react";

const MEMBERS = [
  {
    name: "Sarah Chen",
    email: "sarah.c@company.io",
    role: "Admin",
    department: "Product & Engineering",
    status: "Active",
    lastActive: "2 mins ago",
    initials: "SC",
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@company.io",
    role: "Recruiter",
    department: "Talent Acquisition",
    status: "Active",
    lastActive: "1 hour ago",
    initials: "MT",
  },
  {
    name: "Elena Lavoie",
    email: "e.lavoie@company.io",
    role: "Interviewer",
    department: "Design",
    status: "Pending",
    lastActive: "Invited 2d ago",
    initials: "EL",
  },
  {
    name: "Jessica Wu",
    email: "jess.wu@company.io",
    role: "Recruiter",
    department: "Sales",
    status: "Active",
    lastActive: "15 mins ago",
    initials: "JW",
  },
];

const FILTERS = ["All Members", "Admins", "Recruiters", "Interviewers"];

const ROLE_STYLES = {
  Admin: "bg-primary-container text-on-primary-container",
  Recruiter: "bg-surface-container text-on-surface-variant",
  Interviewer: "bg-surface-container text-on-surface-variant",
};

const ROLE_TIERS = [
  {
    role: "Admin",
    icon: "admin_panel_settings",
    iconClass: "bg-primary-container text-on-primary-container",
    desc: "Full access to company settings, billing, and all department data.",
  },
  {
    role: "Recruiter",
    icon: "badge",
    iconClass: "bg-secondary-container text-on-secondary-container",
    desc: "Can create jobs, manage candidates, and move stages in the pipeline.",
  },
  {
    role: "Interviewer",
    icon: "rate_review",
    iconClass: "bg-surface-container-high text-on-surface-variant",
    desc: "Limited access to specific candidates for interview feedback only.",
  },
];

export default function EmployerTeamPanel() {
  const [filter, setFilter] = useState("All Members");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = MEMBERS;
    if (filter !== "All Members") {
      const singular = filter.slice(0, -1); // Admins -> Admin
      list = list.filter((m) => m.role === singular);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, query]);

  const stats = {
    total: MEMBERS.length,
    pending: MEMBERS.filter((m) => m.status === "Pending").length,
    admins: MEMBERS.filter((m) => m.role === "Admin").length,
  };

  return (
    <div className="p-margin-desktop max-w-container-max mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary">Team Management</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Manage permissions, invite new members, and organize your recruitment departments.
          </p>
        </div>
        <button className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95">
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-label-md text-label-md">Invite Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Members</p>
          <h3 className="font-headline-lg text-headline-lg text-primary">{stats.total}</h3>
          <div className="mt-4 flex items-center gap-1 text-secondary text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+3 this month</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Pending Invites</p>
          <h3 className="font-headline-lg text-headline-lg text-primary">
            {String(stats.pending).padStart(2, "0")}
          </h3>
          <div className="mt-4 flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Expires in 48h</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Admin Seats</p>
          <h3 className="font-headline-lg text-headline-lg text-primary">{stats.admins}/06</h3>
          <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full"
              style={{ width: `${Math.round((stats.admins / 6) * 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Active Interviews</p>
          <h3 className="font-headline-lg text-headline-lg text-primary">124</h3>
          <div className="mt-4 flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>Across 4 departments</span>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-primary text-on-primary"
                    : "hover:bg-surface-container text-on-surface-variant"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="pl-8 pr-3 py-1.5 text-label-md font-label-md border border-outline-variant rounded-lg bg-surface-container-low focus:ring-2 focus:ring-secondary/20 outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-label-md font-label-md border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {["Member", "Role", "Department", "Status", "Last Active"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-6 py-4 text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                    No members match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.email} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                          {m.initials}
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-bold">{m.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-label-sm font-label-md ${
                          ROLE_STYLES[m.role] || ROLE_STYLES.Recruiter
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{m.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            m.status === "Active" ? "bg-secondary" : "bg-outline"
                          }`}
                        ></div>
                        <span
                          className={`text-body-md font-medium ${
                            m.status === "Active" ? "text-secondary" : "text-on-surface-variant"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{m.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      {m.status === "Pending" ? (
                        <button className="px-4 py-1.5 text-label-sm font-label-md text-secondary hover:bg-secondary-container/40 rounded-lg transition-colors">
                          Resend
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            more_vert
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-sm font-label-md text-on-surface-variant">
            Showing {filtered.length} of {MEMBERS.length} members
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg text-label-sm font-bold">
              1
            </button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="mt-12">
        <h3 className="font-headline-md text-headline-md text-primary mb-6">Role Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLE_TIERS.map((t) => (
            <div key={t.role} className="bg-surface p-6 border border-outline-variant rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${t.iconClass}`}>
                <span className="material-symbols-outlined">{t.icon}</span>
              </div>
              <h4 className="font-label-md text-label-md font-bold mb-2">{t.role}</h4>
              <p className="text-body-md text-on-surface-variant">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
