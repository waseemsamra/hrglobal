"use client";

import { useEffect, useState } from "react";
import LocationsManager from "./LocationsManager";
import CategoriesManager from "./CategoriesManager";
import IndustriesManager from "./IndustriesManager";
import GenericSettingsManager from "./GenericSettingsManager";
import RolesManager from "./RolesManager";

const TABS = [
  { id: "profile", icon: "person", label: "Profile" },
  { id: "organization", icon: "corporate_fare", label: "Organization" },
  { id: "locations", icon: "public", label: "Locations" },
  { id: "categories", icon: "category", label: "Categories" },
  { id: "industries", icon: "business", label: "Industries" },
  { id: "postingFreshness", icon: "schedule", label: "Posting Freshness" },
  { id: "experience", icon: "work_history", label: "Experience" },
  { id: "gender", icon: "people", label: "Gender" },
  { id: "monthlySalary", icon: "payments", label: "Monthly Salary" },
  { id: "nationality", icon: "flag", label: "Nationality" },
  { id: "roles", icon: "badge", label: "Roles" },
  { id: "notifications", icon: "notifications_active", label: "Notifications" },
  { id: "security", icon: "shield", label: "Security" },
];

const DEFAULTS = {
  profile: { fullName: "", email: "", bio: "" },
  organization: { name: "", hqLocation: "", brandColor: "#0058BE" },
  notifications: { email: false, push: false, sla: false },
  security: { twoFactor: false },
};

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  function update(section, key, value) {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-on-surface-variant">
        Loading settings…
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-gutter">
        {/* Inner navigation sidebar */}
        <div className="col-span-12 md:col-span-3">
          <nav className="space-y-1 bg-surface-container-lowest p-stack-sm rounded-xl border border-outline-variant">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "text-secondary bg-surface-container-low font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="text-label-md font-label-md">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content panels */}
        <div className="col-span-12 md:col-span-9 space-y-gutter">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <h3 className="text-title-md font-title-md mb-stack-md">Personal Information</h3>
              <div className="flex items-start gap-stack-lg">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-surface-container"
                    alt="Profile avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7XOsDTl-gBZp7V7fLxNwzKzBo-4me_Lgfzer6a4vtzNIwTX1nmvWLPUOfRWxkKYFjieR_bjIJTjEvW8OfVaMhIoBzcJeuoXkjXNfuvpWGG5i2D56W7drR2jatFGL0dAd16cLGNo6E0Rw7y-p7RV-kbDsBlYQGWhuKw-m_bEZtmEYNixbQPmDAA0XB96zjyhIZHJFMYttEfJscVEBC_T9vUIBwAra9yZ5qg-z2qQP0XvCSIxU6xFZhWSvrI196qVFKJ8Irt3XBzYHw"
                  />
                  <button className="absolute bottom-0 right-0 bg-secondary text-on-secondary p-1.5 rounded-full border-2 border-surface-container-lowest shadow-sm hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-stack-md">
                  <div className="space-y-base">
                    <label className="text-label-md font-label-md text-on-surface-variant">FULL NAME</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                      type="text"
                      value={settings.profile.fullName}
                      onChange={(e) => update("profile", "fullName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-base">
                    <label className="text-label-md font-label-md text-on-surface-variant">EMAIL ADDRESS</label>
                    <input
                      className="w-full border border-outline-variant rounded-lg font-body-md py-2.5 px-3 bg-surface-container-low"
                      type="email"
                      disabled
                      value={settings.profile.email}
                    />
                  </div>
                  <div className="col-span-2 space-y-base">
                    <label className="text-label-md font-label-md text-on-surface-variant">BIO / HEADLINE</label>
                    <textarea
                      className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                      rows="3"
                      value={settings.profile.bio}
                      onChange={(e) => update("profile", "bio", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex justify-end gap-3">
                <button
                  className="px-6 py-2 text-secondary font-bold hover:bg-surface-container-low transition-colors rounded-lg"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  type="button"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Organization */}
          {activeTab === "organization" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <h3 className="text-title-md font-title-md mb-stack-md">Company Details</h3>
              <div className="grid grid-cols-2 gap-stack-md">
                <div className="space-y-base">
                  <label className="text-label-md font-label-md text-on-surface-variant">ORGANIZATION NAME</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                    type="text"
                    value={settings.organization.name}
                    onChange={(e) => update("organization", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-base">
                  <label className="text-label-md font-label-md text-on-surface-variant">HQ LOCATION</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                    type="text"
                    value={settings.organization.hqLocation}
                    onChange={(e) => update("organization", "hqLocation", e.target.value)}
                  />
                </div>
              </div>
              <h3 className="text-title-md font-title-md mt-stack-lg mb-stack-md">Branding Options</h3>
              <div className="grid grid-cols-2 gap-stack-md">
                <div className="space-y-base">
                  <label className="text-label-md font-label-md text-on-surface-variant">PRIMARY BRAND COLOR</label>
                  <div className="flex gap-2">
                    <input
                      className="w-12 h-10 p-1 border border-outline-variant rounded-lg cursor-pointer"
                      type="color"
                      value={settings.organization.brandColor}
                      onChange={(e) => update("organization", "brandColor", e.target.value)}
                    />
                    <input
                      className="flex-1 border border-outline-variant rounded-lg font-mono-sm px-3 py-2"
                      type="text"
                      value={settings.organization.brandColor.toUpperCase()}
                      onChange={(e) => update("organization", "brandColor", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-base">
                  <label className="text-label-md font-label-md text-on-surface-variant">COMPANY LOGO</label>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded text-on-secondary font-bold text-lg">RG</div>
                    <button className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors">
                      Replace Logo
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex justify-end">
                <button
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  type="button"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Locations */}
          {activeTab === "locations" && <LocationsManager />}

          {/* Categories */}
          {activeTab === "categories" && <CategoriesManager />}

          {/* Industries */}
          {activeTab === "industries" && <IndustriesManager />}

          {/* Posting Freshness */}
          {activeTab === "postingFreshness" && (
            <GenericSettingsManager title="Posting Freshness" apiPath="/api/settings/posting-freshness" placeholder="e.g. 0-3 days" />
          )}

          {/* Experience */}
          {activeTab === "experience" && (
            <GenericSettingsManager title="Experience" apiPath="/api/settings/experience" placeholder="e.g. Entry Level" />
          )}

          {/* Gender */}
          {activeTab === "gender" && (
            <GenericSettingsManager title="Gender" apiPath="/api/settings/gender" placeholder="e.g. Male" />
          )}

          {/* Monthly Salary */}
          {activeTab === "monthlySalary" && (
            <GenericSettingsManager title="Monthly Salary" apiPath="/api/settings/monthly-salary" placeholder="e.g. 3000-5000" />
          )}

          {/* Nationality */}
          {activeTab === "nationality" && (
            <GenericSettingsManager title="Nationality" apiPath="/api/settings/nationality" placeholder="e.g. UAE" />
          )}

          {/* Roles */}
          {activeTab === "roles" && <RolesManager />}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <h3 className="text-title-md font-title-md mb-stack-md">Alert Preferences</h3>
              <div className="divide-y divide-outline-variant">
                <ToggleRow
                  title="Email Notifications"
                  description="Receive weekly candidate summaries and system updates."
                  checked={settings.notifications.email}
                  onChange={(v) => update("notifications", "email", v)}
                />
                <ToggleRow
                  title="Browser Push Alerts"
                  description="Real-time alerts when a new document is uploaded."
                  checked={settings.notifications.push}
                  onChange={(v) => update("notifications", "push", v)}
                />
                <ToggleRow
                  title="SLA Breach Warnings"
                  description="Immediate notification for pending compliance documents."
                  checked={settings.notifications.sla}
                  onChange={(v) => update("notifications", "sla", v)}
                />
              </div>
              <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex justify-end">
                <button
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  type="button"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
                <h3 className="text-title-md font-title-md mb-stack-md">Account Security</h3>
                <div className="space-y-stack-md">
                  <div className="p-4 bg-surface-container rounded-lg border border-outline-variant flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary scale-125">verified_user</span>
                    <div className="flex-1">
                      <p className="font-body-md font-bold">Two-Factor Authentication</p>
                      <p className="font-body-sm text-on-surface-variant">
                        Two-factor authentication is currently{" "}
                        <span className="text-green-600 font-bold">
                          {settings.security.twoFactor ? "Enabled" : "Disabled"}
                        </span>
                        .
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-outline-variant bg-surface rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors">
                      Manage
                    </button>
                  </div>
                  <div className="pt-stack-md space-y-stack-sm">
                    <h4 className="text-label-md font-label-md text-on-surface-variant">CHANGE PASSWORD</h4>
                    <div className="space-y-stack-sm">
                      <input
                        className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                        placeholder="Current Password"
                        type="password"
                      />
                      <div className="grid grid-cols-2 gap-stack-sm">
                        <input
                          className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                          placeholder="New Password"
                          type="password"
                        />
                        <input
                          className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                          placeholder="Confirm New Password"
                          type="password"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-6 py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-opacity">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
                <h3 className="text-title-md font-title-md mb-stack-md">Active Sessions</h3>
                <div className="space-y-stack-md">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
                      <div>
                        <p className="font-body-md font-bold">MacBook Pro - New York, USA</p>
                        <p className="font-body-sm text-on-surface-variant">Current Session • Chrome 118.0</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 opacity-60">
                      <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                      <div>
                        <p className="font-body-md font-bold">iPhone 15 - London, UK</p>
                        <p className="font-body-sm text-on-surface-variant">Last active: 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-error font-bold text-sm hover:underline">Revoke</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success toast */}
      <div
        className={`fixed bottom-10 right-10 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl z-[100] transition-all duration-300 bg-inverse-surface text-inverse-on-surface ${
          toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-green-400">check_circle</span>
        <p className="font-body-md font-bold">Settings saved successfully</p>
      </div>
    </>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-body-md font-bold">{title}</p>
        <p className="font-body-sm text-on-surface-variant">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
      </label>
    </div>
  );
}
