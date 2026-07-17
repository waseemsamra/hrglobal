"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TABS = [
  { id: "profile", icon: "business", label: "Company Profile" },
  { id: "team", icon: "groups", label: "Team Management" },
  { id: "notifications", icon: "notifications_active", label: "Notifications" },
];

const INDUSTRIES = [
  "Information Technology",
  "Logistics & Supply Chain",
  "Renewable Energy",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
];

const TEAM = [
  { name: "Sarah Mitchell", email: "sarah.m@company.com", role: "Admin", status: "Active" },
  { name: "David Chen", email: "d.chen@company.com", role: "Recruiter", status: "Active" },
  { name: "Elena Rodriguez", email: "elena.r@company.com", role: "Reviewer", status: "Pending" },
];

const ROLE_STYLES = {
  Admin: "bg-primary/10 text-primary",
  Recruiter: "bg-secondary/10 text-secondary",
  Reviewer: "bg-on-surface-variant/10 text-on-surface-variant",
};

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
    </label>
  );
}

export default function EmployerSettingsPanel() {
  const searchParams = useSearchParams();
  const initialTab = TABS.some((t) => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [profile, setProfile] = useState({
    name: "",
    industry: INDUSTRIES[0],
    description: "",
  });
  const [notifications, setNotifications] = useState({
    newApplication: true,
    interviewReminders: true,
    monthlyReport: false,
    securityAlerts: true,
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // Load company profile from the signed-in employer; notifications from settings.
  useEffect(() => {
    fetch("/api/employers/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const emp = d?.employer;
        if (emp) {
          setProfile({
            name: emp.company || emp.name || "",
            industry: emp.industry || INDUSTRIES[0],
            description: emp.description || "",
          });
          if (emp.logoId) setLogoUrl(`/api/settings/logo?t=${Date.now()}`);
        }
      })
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const n = d.settings?.notifications || {};
        setNotifications((prev) => ({ ...prev, ...n }));
      })
      .catch(() => {});
  }, []);

  const setProf = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setNotif = (k) => setNotifications((p) => ({ ...p, [k]: !p[k] }));

  async function uploadLogo(file) {
    setLogoLoading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/settings/logo", { method: "POST", body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Upload failed");
      }
      setLogoUrl(`/api/settings/logo?t=${Date.now()}`);
      setStatus({ type: "success", message: "Logo updated." });
    } catch (e) {
      setStatus({ type: "error", message: e.message || "Failed to upload logo." });
    } finally {
      setLogoLoading(false);
    }
  }

  async function removeLogo() {
    setLogoLoading(true);
    try {
      const res = await fetch("/api/settings/logo", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLogoUrl(null);
      setStatus({ type: "success", message: "Logo removed." });
    } catch {
      setStatus({ type: "error", message: "Failed to remove logo." });
    } finally {
      setLogoLoading(false);
    }
  }

  async function saveProfile() {
    setStatus({ type: "loading", message: "" });
    try {
      const res = await fetch("/api/employers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: profile.name,
          name: profile.name,
          industry: profile.industry,
          description: profile.description,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus({ type: "success", message: "Profile saved." });
    } catch {
      setStatus({ type: "error", message: "Failed to save profile." });
    }
  }

  async function saveNotifications() {
    setStatus({ type: "loading", message: "" });
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      if (!res.ok) throw new Error();
      setStatus({ type: "success", message: "Notification rules updated." });
    } catch {
      setStatus({ type: "error", message: "Failed to update notifications." });
    }
  }

  return (
    <div className="max-w-container-max mx-auto p-gutter">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-2">Employer Settings</h1>
        <p className="text-on-surface-variant font-body-md text-body-md">
          Manage your company presence, team roles, and platform notifications.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Tabs */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all border bg-surface-container-lowest shadow-sm flex items-center justify-between group ${
                  isActive
                    ? "border-primary ring-1 ring-primary/10"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined ${
                      isActive ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span className="font-headline-md text-headline-md">{t.label}</span>
                </div>
                <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                  chevron_right
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="col-span-12 md:col-span-9">
          {status.type === "success" && (
            <div className="mb-4 bg-secondary/10 text-secondary rounded-lg px-4 py-2 text-body-md">
              {status.message}
            </div>
          )}
          {status.type === "error" && (
            <div className="mb-4 bg-error-container text-on-error-container rounded-lg px-4 py-2 text-body-md">
              {status.message}
            </div>
          )}

          {/* Company Profile */}
          {activeTab === "profile" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant flex items-center justify-center">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-[48px]">
                        corporate_fare
                      </span>
                    )}
                    {logoLoading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                        <span className="material-symbols-outlined text-white animate-spin">
                          progress_activity
                        </span>
                      </div>
                    )}
                  </div>
                  <label
                    className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-lg shadow-lg hover:opacity-90 transition-colors cursor-pointer"
                    title="Upload logo"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLogo(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -bottom-2 -left-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant p-2 rounded-lg shadow-lg hover:bg-error-container hover:text-on-error-container transition-colors"
                      title="Remove logo"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">
                        Company Legal Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProf("name", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">
                        Industry Vertical
                      </label>
                      <select
                        value={profile.industry}
                        onChange={(e) => setProf("industry", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md appearance-none"
                      >
                        {INDUSTRIES.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Public Description
                    </label>
                    <textarea
                      rows={4}
                      value={profile.description}
                      onChange={(e) => setProf("description", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={saveProfile}
                      disabled={status.type === "loading"}
                      className="bg-secondary text-on-secondary px-6 py-2.5 rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all disabled:opacity-60"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md text-primary">Team Members</h3>
                  <button className="flex items-center gap-2 text-secondary font-label-md text-label-md hover:bg-secondary-container/40 px-3 py-1.5 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">NAME</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">ROLE</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">STATUS</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {TEAM.map((m) => (
                        <tr key={m.email} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[18px]">person</span>
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-bold text-on-surface">
                                  {m.name}
                                </p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant">
                                  {m.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-label-md text-label-md ${
                                ROLE_STYLES[m.role] || ROLE_STYLES.Reviewer
                              }`}
                            >
                              {m.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`flex items-center gap-2 ${
                                m.status === "Pending" ? "text-on-surface-variant" : ""
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  m.status === "Active" ? "bg-secondary" : "bg-outline"
                                }`}
                              ></div>
                              <span className="font-body-md text-body-md">{m.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">
                              more_vert
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <h3 className="font-headline-md text-headline-md text-primary mb-6">
                Notification Preferences
              </h3>
              <div className="space-y-8">
                <section>
                  <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">
                    Hiring Updates
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface">
                          New Candidate Application
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Get notified instantly when someone applies to an open role.
                        </p>
                      </div>
                      <Toggle
                        checked={notifications.newApplication}
                        onChange={() => setNotif("newApplication")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface">
                          Interview Reminders
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Receive alerts 30 minutes before a scheduled interview begins.
                        </p>
                      </div>
                      <Toggle
                        checked={notifications.interviewReminders}
                        onChange={() => setNotif("interviewReminders")}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">
                    Administrative
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface">
                          Monthly Analytics Report
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          A summary of your team&apos;s hiring metrics and platform usage.
                        </p>
                      </div>
                      <Toggle
                        checked={notifications.monthlyReport}
                        onChange={() => setNotif("monthlyReport")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface">
                          Security Alerts
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Notifications about new logins and account permission changes.
                        </p>
                      </div>
                      <Toggle
                        checked={notifications.securityAlerts}
                        onChange={() => setNotif("securityAlerts")}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-outline-variant flex justify-end">
                  <button
                    onClick={saveNotifications}
                    disabled={status.type === "loading"}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                  >
                    Update Notification Rules
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
