"use client";

const STATUS_STYLES = {
  Interviewing: {
    cls: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-600 animate-pulse",
  },
  Verified: {
    cls: "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-600",
  },
  "In Progress": {
    cls: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-600",
  },
  Pending: {
    cls: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminOverview({ metrics, registrations = [] }) {
  return (
    <div className="max-w-[1440px] mx-auto space-y-gutter">
      {/* Metrics Bento */}
      <div className="flex md:grid md:grid-cols-12 gap-4 md:gap-gutter overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-container-padding-mobile md:mx-0 px-container-padding-mobile md:px-0">
        <div className="w-[85vw] max-w-[320px] md:w-auto md:col-span-3 flex-shrink-0 snap-start">
          <MetricCard
            icon="groups"
            label="Total Candidates"
            value={metrics.totalCandidates.toLocaleString()}
            sub={
              <span className="text-[12px] text-green-600 font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% this
                month
              </span>
            }
          />
        </div>
        <div className="w-[85vw] max-w-[320px] md:w-auto md:col-span-3 flex-shrink-0 snap-start">
          <MetricCard
            icon="clinical_notes"
            label="Active Openings"
            value={metrics.activeOpenings.toLocaleString()}
            sub={<p className="text-[12px] text-on-surface-variant font-medium">85 Priority roles</p>}
          />
        </div>
        <div className="w-[85vw] max-w-[320px] md:w-auto md:col-span-3 flex-shrink-0 snap-start">
          <MetricCard
            icon="avg_time"
            label="Avg. Time-to-Hire"
            value={metrics.avgTimeToHire}
            sub={
              <p className="text-[12px] text-on-surface-variant font-medium">
                Global benchmark: 24d
              </p>
            }
          />
        </div>
        <div className="w-[85vw] max-w-[320px] md:w-auto md:col-span-3 flex-shrink-0 snap-start">
          <MetricCard
            icon="verified"
            label="Offer Acceptance"
            value={metrics.offerAcceptance}
            sub={
              <span className="text-[12px] text-green-600 font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +2.1%
              </span>
            }
          />
        </div>
      </div>

      {/* Middle Section: Map and Pending Actions */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Geographical Map */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
            <div>
              <h4 className="text-title-md font-bold text-on-surface">International Hiring Density</h4>
              <p className="text-label-md text-on-surface-variant">
                Candidate distribution across active regional hubs
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-label-md bg-surface-container-low border border-outline-variant rounded-lg">
                View Global
              </button>
              <button className="px-3 py-1 text-label-md bg-surface-container-low border border-outline-variant rounded-lg">
                By Region
              </button>
            </div>
          </div>
          <div className="flex-1 relative min-h-[400px]">
            <div className="absolute inset-0 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover grayscale-[20%] opacity-80"
                alt="World map of international hiring density"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfvFztuL4vU2vbGyXzvctlY5P5ecsfNms1Q8DzpC2MxzMYjLz3yzDvLiR2r5rjr2C5cqf1LMyrP4ika-hAW6OaHLV2KmF1RazqEvRxSR7ZYHawZbn-6knob2FXB6-unAhweLlRT20MottrkVOr-U7wJvNe1vfyfAmjtrGVkraYdyXcCme8vqtf7Ze-RxJ7yWdGkysRxjZplJUgP6VX_2ZwF4hmr4VCll-ATu5CjWOnyVzV_zLDZMhL62bSYovxWWzJw717VNQfdEIT"
              />
            </div>
            <div className="absolute bottom-6 left-6 bg-surface-container-lowest/90 backdrop-blur-md p-4 border border-outline-variant rounded-lg shadow-lg">
              <p className="text-label-md font-bold mb-3">Region Performance</p>
              <div className="space-y-2">
                {[
                  { name: "Europe", dot: "bg-secondary", val: "4,201" },
                  { name: "North America", dot: "bg-secondary/60", val: "3,892" },
                  { name: "APAC", dot: "bg-secondary/30", val: "2,149" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between gap-gutter">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.dot}`}></span>
                      <span className="text-body-sm">{r.name}</span>
                    </div>
                    <span className="text-body-sm font-bold">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
          <div className="p-stack-md border-b border-outline-variant">
            <h4 className="text-title-md font-bold text-on-surface">Pending Actions</h4>
            <p className="text-label-md text-on-surface-variant">Requiring your attention</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-stack-md space-y-stack-md">
            <ActionItem
              tag="Verification"
              time="2h ago"
              name="Elena Rodriguez"
              desc="Identity & Background check documents pending review for Senior DevOps role."
              primary="Verify"
              secondary="View"
            />
            <ActionItem
              tag="Approval"
              time="5h ago"
              name="Interview Panel: Senior Architect"
              desc="Schedule approval requested for 4 stakeholders for final round."
              primary="Approve"
              secondary="Reschedule"
              altTag
            />
            <ActionItem
              tag="Verification"
              time="1d ago"
              name="Marcus Weber"
              desc="Education credentials for Berlin hub candidate require manual audit."
              primary="Verify"
              secondary="View"
            />
          </div>
          <div className="p-stack-md bg-surface-container-low/50">
            <button className="w-full text-secondary font-bold text-label-md py-1 flex items-center justify-center gap-1 hover:underline">
              View all 24 tasks <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
          <div>
            <h4 className="text-title-md font-bold text-on-surface">Recent Registrations</h4>
            <p className="text-label-md text-on-surface-variant">
              Latest candidates across all departments
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
              <button className="px-4 py-2 bg-surface-container-high text-on-surface text-label-md font-bold">
                Active
              </button>
              <button className="px-4 py-2 hover:bg-surface-container-low text-on-surface-variant text-label-md">
                On Hold
              </button>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-lg text-label-md font-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                {["Candidate", "Position", "Department", "Location", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-stack-md py-4 text-label-md text-on-surface-variant font-black uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-stack-md py-4 text-label-md text-on-surface-variant font-black uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-stack-md py-10 text-center text-on-surface-variant">
                    No registrations yet. New sign-ups from the landing page appear here.
                  </td>
                </tr>
              ) : (
                registrations.map((r, i) => {
                  const st = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
                  return (
                    <tr
                      key={r.id || i}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-stack-md py-4">
                        <div className="flex items-center gap-stack-md">
                          <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center text-[10px]">
                            {initials(r.name)}
                          </div>
                          <div>
                            <p className="text-body-sm font-bold text-on-surface">{r.name}</p>
                            <p className="text-[12px] text-on-surface-variant">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-stack-md py-4 text-body-sm text-on-surface">{r.position}</td>
                      <td className="px-stack-md py-4 text-body-sm text-on-surface-variant">
                        {r.department}
                      </td>
                      <td className="px-stack-md py-4 text-body-sm text-on-surface-variant">
                        {r.location}
                      </td>
                      <td className="px-stack-md py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center w-fit gap-1 ${st.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {r.status}
                        </span>
                      </td>
                      <td className="px-stack-md py-4 text-right">
                        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            more_vert
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <p className="text-label-md text-on-surface-variant">
            Showing {registrations.length} of {metrics.totalRegistrations.toLocaleString()} total
            registrations
          </p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg text-label-md font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }) {
  return (
    <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex items-center gap-stack-md">
      <div className="w-14 h-14 bg-secondary/10 text-secondary flex items-center justify-center rounded-xl">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <h3 className="text-headline-lg font-headline-lg">{value}</h3>
        {sub}
      </div>
    </div>
  );
}

function ActionItem({ tag, time, name, desc, primary, secondary, altTag }) {
  return (
    <div className="p-stack-md bg-surface-container-low border border-outline-variant rounded-lg hover:border-secondary transition-colors cursor-pointer group">
      <div className="flex justify-between mb-2">
        <span
          className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-tighter ${
            altTag
              ? "bg-surface-variant text-secondary"
              : "bg-secondary-fixed text-on-secondary-fixed-variant"
          }`}
        >
          {tag}
        </span>
        <span className="text-[10px] text-on-surface-variant">{time}</span>
      </div>
      <h5 className="text-body-sm font-bold text-on-surface">{name}</h5>
      <p className="text-body-sm text-on-surface-variant mb-stack-md line-clamp-1">{desc}</p>
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-primary text-on-primary text-label-md rounded-lg font-bold">
          {primary}
        </button>
        <button className="px-3 py-2 border border-outline-variant text-on-surface text-label-md rounded-lg">
          {secondary}
        </button>
      </div>
    </div>
  );
}
