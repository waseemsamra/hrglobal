import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";
import CandidateShell from "@/components/CandidateShell";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Candidate Dashboard | CareerHub" };
}

// Pipeline stages used to render the progress stepper.
const STAGES = ["Applied", "Screen", "Interview", "Offer"];

// Map a stored listStatus to a pipeline stage index (0-3).
function stageIndex(status = "Applied") {
  const s = status.toLowerCase();
  if (s.includes("screen")) return 1;
  if (s.includes("interview")) return 2;
  if (s.includes("offer")) return 3;
  if (s.includes("declin") || s.includes("closed") || s.includes("reject")) return -1;
  return 0;
}

async function getDashboardData(candidateId) {
  try {
    const db = await getDb();
    const c = await db.collection("candidates").findOne(
      { _id: ObjectId.createFromHexString(candidateId) },
      {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          department: 1,
          location: 1,
          listStatus: 1,
          stage: 1,
          avatar: 1,
        },
      }
    );

    // Derive a single application card from the candidate's current pipeline.
    const status = c?.listStatus || "Applied";
    const closed = /declin|closed|reject/i.test(status);
    const idx = stageIndex(status);
    const applications = [
      {
        company: c?.department || "Your Application",
        title: c?.role || "Application",
        location: c?.location || "",
        status,
        stageIndex: closed ? -1 : idx,
        closed,
      },
    ];

    const interviewing = status.toLowerCase().includes("interview");
    const interviews = interviewing
      ? [{ month: "Oct", day: "14", title: "Technical Interview", time: "10:00 AM", medium: "Google Meet", company: c?.department || "Employer" }]
      : [];

    return { candidate: c, applications, interviews, interviewing };
  } catch (err) {
    console.error("Candidate dashboard load error:", err);
    return { candidate: null, applications: [], interviews: [], interviewing: false };
  }
}

function Stepper({ stageIndex, closed }) {
  return (
    <div className="relative px-2">
      <div className={`absolute top-1.5 left-0 w-full h-0.5 ${closed ? "bg-error/20" : "bg-surface-container-highest"}`} />
      {!closed && stageIndex >= 0 && (
        <div
          className="absolute top-1.5 left-0 h-0.5 bg-secondary"
          style={{ width: `${(stageIndex / (STAGES.length - 1)) * 100}%` }}
        />
      )}
      <div className="relative flex justify-between">
        {STAGES.map((label, i) => {
          const done = closed ? i === 0 : i <= stageIndex;
          const isCurrent = !closed && i === stageIndex;
          const colorClass = closed
            ? i === 0
              ? "bg-error text-error"
              : "bg-surface-container-highest text-outline"
            : done
            ? "bg-secondary text-secondary"
            : "bg-surface-container-highest text-outline";
          return (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-white z-10 ${colorClass}`} />
              <span
                className={`text-label-sm mt-2 ${
                  closed && i > 0 ? "text-outline opacity-50" : isCurrent || done ? "font-bold text-secondary" : "text-outline"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_PILL = {
  Interviewing: "bg-secondary-container/30 text-on-secondary-container",
  "Under Review": "bg-surface-container text-on-surface-variant",
  Closed: "bg-error-container text-error",
  Applied: "bg-surface-container-highest text-on-surface-variant",
  Declined: "bg-error-container text-error",
};

const RECOMMENDED = [
  { title: "Principal UX Engineer", company: "Vanguard Labs", loc: "Remote", tags: ["TypeScript", "Tailwind"], saved: false },
  { title: "Staff Product Designer", company: "Adobe", loc: "San Jose, CA", tags: ["Figma", "Design Systems"], saved: false },
  { title: "Creative Technologist", company: "The New York Times", loc: "Hybrid", tags: ["WebGL", "GSAP"], saved: true },
];

export default async function CandidateDashboardPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  const { applications, interviews, interviewing } = await getDashboardData(candidate.id);
  const firstName = (candidate.name || "Candidate").split(/\s+/)[0];

  return (
    <CandidateShell candidate={candidate} active="Dashboard">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-margin-desktop custom-scrollbar">
          <div className="max-w-container-max mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-headline-xl font-headline-xl text-primary">Welcome back, {firstName}</h1>
              <p className="text-body-lg text-on-surface-variant mt-2">
                {interviewing
                  ? "You have an interview scheduled. Keep up the momentum!"
                  : "Track your applications and discover new opportunities."}
              </p>
            </div>

            {/* Status Cards Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-label-md font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
                    Active Applications
                  </p>
                  <p className="text-headline-xl font-bold">{applications.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined">description</span>
                </div>
              </div>

              <div className="bg-secondary-container p-6 rounded-xl border border-secondary/20 flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="z-10">
                  <p className="text-label-md font-label-md text-on-secondary-container mb-1 uppercase tracking-wider">
                    Interview Invitations
                  </p>
                  <p className="text-headline-xl font-bold text-secondary">
                    {String(interviews.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center z-10 shadow-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    event_available
                  </span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">send</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Profile Completion
                  </p>
                  <span className="text-label-md font-bold text-secondary">85%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "85%" }} />
                </div>
                <p className="text-label-sm text-on-surface-variant mt-3">Add &apos;Project Portfolio&apos; to reach 100%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Application Status */}
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                    <h2 className="text-headline-md font-headline-md">Recent Application Status</h2>
                    <Link href="/candidate/applications" className="text-secondary text-label-md font-bold hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-outline-variant">
                    {applications.length === 0 ? (
                      <div className="p-8 text-center text-on-surface-variant">
                        No active applications yet.{" "}
                        <Link href="/jobs" className="text-secondary font-bold hover:underline">
                          Browse jobs
                        </Link>
                      </div>
                    ) : (
                      applications.map((a, i) => (
                        <div key={i} className="p-6 hover:bg-surface-container-low transition-colors">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center font-bold text-outline">
                                {a.company.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-body-lg font-bold">{a.title}</h3>
                                <p className="text-body-md text-on-surface-variant">
                                  {a.company} • {a.location}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-label-sm rounded-full font-bold ${
                                STATUS_PILL[a.status] || "bg-surface-container-highest text-on-surface-variant"
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                          <Stepper stageIndex={a.stageIndex} closed={a.closed} />
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Upcoming Interviews */}
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                      Upcoming Interviews
                    </h2>
                    <button className="p-1 hover:bg-surface-container rounded transition-colors">
                      <span className="material-symbols-outlined text-body-md">calendar_month</span>
                    </button>
                  </div>
                  {interviews.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant">No interviews scheduled.</p>
                  ) : (
                    <div className="space-y-4">
                      {interviews.map((iv, i) => (
                        <div key={i} className="flex gap-4 p-3 bg-surface-container-low rounded-lg border-l-4 border-secondary">
                          <div className="text-center min-w-[40px]">
                            <p className="text-label-sm font-bold text-secondary uppercase">{iv.month}</p>
                            <p className="text-headline-md font-bold">{iv.day}</p>
                          </div>
                          <div>
                            <p className="text-body-md font-bold">{iv.title}</p>
                            <p className="text-label-sm text-on-surface-variant">
                              {iv.time} • {iv.medium}
                            </p>
                            <p className="text-label-sm font-medium text-secondary mt-1">{iv.company}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="w-full mt-6 py-2.5 border border-outline-variant text-label-md font-bold rounded-lg hover:bg-surface-container-low transition-colors">
                    Prepare for Interviews
                  </button>
                </section>

                {/* Recommended Jobs */}
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                  <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                    Recommended Jobs
                  </h2>
                  <div className="space-y-5">
                    {RECOMMENDED.map((j, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-body-md font-bold group-hover:text-secondary transition-colors">
                              {j.title}
                            </h4>
                            <p className="text-label-sm text-on-surface-variant">
                              {j.company} • {j.loc}
                            </p>
                          </div>
                          <button className={j.saved ? "text-secondary" : "text-outline hover:text-secondary"}>
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={j.saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {j.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/jobs"
                    className="w-full mt-6 flex items-center justify-center gap-2 text-secondary text-label-md font-bold py-2 rounded hover:bg-secondary/5"
                  >
                    Explore More <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                  </Link>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <Link
        href="/jobs"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-full shadow-xl hover:scale-105 transform transition-all active:scale-95"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="font-bold">Find New Job</span>
      </Link>
    </CandidateShell>
  );
}
