"use client";

import { useState } from "react";

const TABS = ["profile", "security", "notifications"];

function Toggle({ defaultChecked = false }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={on}
        onChange={(e) => setOn(e.target.value)}
      />
      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
    </label>
  );
}

export default function CandidateSettings({ candidate }) {
  const [tab, setTab] = useState("profile");
  const name = candidate?.name || "";
  const email = candidate?.email || "";
  const role = candidate?.role || "";

  const setTabState = (id) => setTab(id);

  return (
    <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-surface">
      <header className="mb-8">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Portal Settings</h1>
        <p className="text-body-lg text-on-surface-variant">
          Manage your account preferences, security settings, and notification frequency.
        </p>
      </header>

      {/* Settings Tabs Navigation */}
      <div className="flex gap-8 border-b border-outline-variant mb-8 overflow-x-auto whitespace-nowrap">
        {TABS.map((id) => (
          <button
            key={id}
            onClick={() => setTabState(id)}
            className={`pb-4 text-headline-md font-headline-md font-semibold transition-all ${
              tab === id
                ? "text-secondary border-b-2 border-secondary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {id === "profile" ? "Profile" : id === "security" ? "Account Security" : "Notifications"}
          </button>
        ))}
      </div>

      {/* Profile Section */}
      {tab === "profile" && (
        <section className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  {candidate?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="w-full h-full rounded-full object-cover border-4 border-surface-container"
                      src={candidate.avatar}
                      alt={name}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary-container text-on-primary flex items-center justify-center border-4 border-surface-container font-bold text-4xl">
                      {(name || "C").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-secondary text-on-secondary p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Edit Avatar</span>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                  <input
                    className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5"
                    type="text"
                    defaultValue={name}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Email Address</label>
                  <input
                    className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5"
                    type="email"
                    defaultValue={email}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Role</label>
                  <input
                    className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5"
                    type="text"
                    defaultValue={role}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Location</label>
                  <input
                    className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5"
                    type="text"
                    defaultValue={candidate?.location || ""}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Professional Summary</label>
              <textarea
                className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5"
                rows="4"
                defaultValue={candidate?.summary || ""}
              />
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
              <a className="text-secondary font-label-md text-label-md hover:underline flex items-center gap-1" href="#">
                <span className="material-symbols-outlined text-[18px]">lock_person</span> Privacy &amp; Access
              </a>
              <div className="flex gap-4">
                <button className="px-6 py-2 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors">
                  Cancel
                </button>
                <button className="px-8 py-2 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Account Security Section */}
      {tab === "security" && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary">password</span>
                <h2 className="font-headline-md text-headline-md">Change Password</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Current Password</label>
                  <input className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">New Password</label>
                    <input className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Confirm New Password</label>
                    <input className="w-full rounded-lg border border-outline-variant focus:border-secondary focus:ring-secondary text-body-md py-2.5" type="password" />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end gap-4">
                <button className="px-6 py-2 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors">Cancel</button>
                <button className="px-8 py-2 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow hover:opacity-90 transition-opacity">Update Password</button>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary">security</span>
                <h2 className="font-headline-md text-headline-md">Authentication</h2>
              </div>
              <p className="text-body-md text-on-surface-variant mb-6">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                <div>
                  <p className="font-label-md text-label-md font-bold">Two-Factor (2FA)</p>
                  <p className="text-[11px] text-on-surface-variant">Via Authenticator App</p>
                </div>
                <Toggle defaultChecked />
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">devices</span>
                <h2 className="font-headline-md text-headline-md">Active Sessions</h2>
              </div>
              <button className="text-error font-label-md text-label-md hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors">Log out other devices</button>
            </div>
            <div className="divide-y divide-outline-variant">
              <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold">This Device</p>
                    <p className="text-[11px] text-on-surface-variant">Web Browser • Active Now</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase">Current Session</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Notifications Section */}
      {tab === "notifications" && (
        <section className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md">Channel Preferences</h2>
              <p className="text-body-md text-on-surface-variant">Control how you receive alerts across different channels.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">mail</span>
                  <span className="font-label-md text-label-md">Email Notifications</span>
                </div>
                <Toggle defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">sms</span>
                  <span className="font-label-md text-label-md">SMS Alerts</span>
                </div>
                <Toggle />
              </div>
              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">notifications_active</span>
                  <span className="font-label-md text-label-md">Push Notifications</span>
                </div>
                <Toggle defaultChecked />
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md">Notification Categories</h2>
              <p className="text-body-md text-on-surface-variant">Select which events trigger a notification.</p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Email</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Push</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {[
                  { c: "Job Alerts", d: "New openings matching your profile", email: true, push: true, sms: false },
                  { c: "Application Status Updates", d: "When your application moves to a new stage", email: true, push: true, sms: true },
                  { c: "Interview Invites", d: "Scheduling requests and reminders", email: true, push: true, sms: true },
                  { c: "Marketing", d: "Monthly newsletters and career advice", email: false, push: false, sms: false },
                ].map((row) => (
                  <tr key={row.c}>
                    <td className="px-6 py-4">
                      <p className="font-label-md text-label-md font-bold">{row.c}</p>
                      <p className="text-[11px] text-on-surface-variant">{row.d}</p>
                    </td>
                    <td className="px-6 py-4 text-center"><input defaultChecked={row.email} className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></td>
                    <td className="px-6 py-4 text-center"><input defaultChecked={row.push} className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></td>
                    <td className="px-6 py-4 text-center"><input defaultChecked={row.sms} className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant flex justify-end gap-4">
              <button className="px-6 py-2 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors">Reset Defaults</button>
              <button className="px-8 py-2 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow hover:opacity-90 transition-opacity">Save Preferences</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
