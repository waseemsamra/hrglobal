import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function matchQuery(id) {
  const or = [{ jobId: id }];
  if (ObjectId.isValid(id)) or.push({ _id: new ObjectId(id) });
  return { $or: or };
}

function fmtSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) return null;
  const cur = (job.currency || "").replace(/\s*\(.*\)/, "") || "";
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);
  if (job.minSalary != null && job.maxSalary != null) return `${cur}${fmt(job.minSalary)} - ${cur}${fmt(job.maxSalary)}`;
  return `${cur}${fmt(job.minSalary ?? job.maxSalary)}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 864e5);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export async function generateMetadata({ params }) {
  const { jobId } = await params;
  const db = await getDb();
  const job = await db.collection("jobs").findOne(matchQuery(jobId));
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} - ${job.department} | CareerHub`,
    description: job.description?.slice(0, 160) || "Job details",
  };
}

export default async function JobDetailPage({ params }) {
  const { jobId } = await params;
  const db = await getDb();
  const job = await db.collection("jobs").findOne(matchQuery(jobId));

  if (!job) notFound();

  let employerCompany = null;
  if (job.employerId && typeof job.employerId === "string") {
    try {
      const emp = await db.collection("employers").findOne({ _id: new ObjectId(job.employerId) });
      employerCompany = emp?.company || emp?.name || null;
    } catch {
      employerCompany = null;
    }
  }

  const postedByLabel = job.source === "employer" ? employerCompany || "Employer" : "CareerHub";

  const salary = fmtSalary(job);
  const posted = timeAgo(job.postedAt);
  const initials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const companyInitials = initials(job.department || "CareerHub");

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {/* TopNavBar */}
      <nav className="bg-surface border-b border-outline-variant sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center w-full px-container-padding-desktop max-w-[1440px] mx-auto h-16">
          <div className="flex items-center gap-gutter">
            <span className="font-title-md text-title-md font-bold text-primary">CareerHub</span>
            <div className="hidden md:flex items-center gap-stack-lg">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="/jobs">Jobs</Link>
              <Link className="font-body-md text-body-md text-secondary border-b-2 border-secondary pb-1" href="#">Candidates</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Employers</Link>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Resources</Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">settings</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
              <img
                className="w-full h-full object-cover"
                data-alt="A professional headshot of a female HR manager in a minimalist office setting, soft natural lighting, corporate modern aesthetic with clean white backgrounds and deep navy accents."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEve268ZnkxPSufPb49G0qSZa04aOPczlVATf_c7xk_4D3VW9d7u9GaAKgNXdi7c5-ggK4jUq7jiuzn4gpYfgQ-jD-5qtf62ug-YRt5Yk3HJOkGb0e-96rQbYxe7JIeCZP6Wl8I9lqNGCyYqhaT7G_lnvzQbCer6DfpGBLuyHs67lqG2pG1LzFpiN61o1BFlUJhjYUT7Lk4MK9Vn7G-8ROSDiEnGrrQv8c-iLHmxzUYUh11bbsL6xm8jeNPhiDfN0fJzTLFDMtm7SC"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg">
        {/* Job Header Section */}
        <header className="mb-stack-lg animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white border border-outline-variant p-stack-lg rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md">
            <div className="flex-1">
              <div className="flex items-center gap-stack-sm mb-base">
                <span className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-2 py-1 rounded">
                  {job.type || "Full-time"}
                </span>
                <span className="text-on-surface-variant font-label-md text-label-md">
                  Posted {posted}
                </span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.source === "employer" ? "bg-blue-50 text-blue-700" : "bg-surface-container-high text-secondary"}`}>
                  {postedByLabel}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary mb-base">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-gutter text-on-surface-variant font-body-md text-body-md">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  {job.location}
                </div>
                {salary && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary">payments</span>
                    {salary}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary">business</span>
                  {job.department}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-stack-md w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-body-md font-bold rounded hover:opacity-90 transition-all active:scale-[0.98]">
                Apply Now
              </button>
              <button className="flex-1 md:flex-none px-6 py-3 bg-white border border-outline-variant text-primary font-body-md font-bold rounded hover:bg-surface-container-low transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-secondary">bookmark</span>
                Save Job
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Column: Job Details */}
          <div className="md:col-span-8 space-y-gutter">
            {/* Job Description */}
            {job.description && (
              <section className="bg-white border border-outline-variant p-stack-lg rounded-lg">
                <h2 className="font-title-md text-title-md text-primary mb-stack-md">Job Description</h2>
                <div className="font-body-md text-body-md text-on-surface-variant space-y-stack-md whitespace-pre-line">
                  {job.description}
                </div>
              </section>
            )}

            {/* Key Responsibilities */}
            {job.keyResponsibilities && (
              <section className="bg-white border border-outline-variant p-stack-lg rounded-lg">
                <h2 className="font-title-md text-title-md text-primary mb-stack-md">Key Responsibilities</h2>
                <div className="font-body-md text-body-md text-on-surface-variant space-y-stack-md whitespace-pre-line">
                  {job.keyResponsibilities}
                </div>
              </section>
            )}

            {/* Requirements */}
            <section className="bg-white border border-outline-variant p-stack-lg rounded-lg">
              <h2 className="font-title-md text-title-md text-primary mb-stack-md">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md mb-stack-lg">
                {job.experience && (
                  <div className="flex items-center gap-stack-sm p-stack-md bg-surface-container-low rounded">
                    <span className="material-symbols-outlined text-secondary text-headline-lg">history_edu</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant uppercase">Experience</p>
                      <p className="font-title-md text-title-md text-primary">{job.experience}</p>
                    </div>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-center gap-stack-sm p-stack-md bg-surface-container-low rounded">
                    <span className="material-symbols-outlined text-secondary text-headline-lg">school</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant uppercase">Education</p>
                      <p className="font-title-md text-title-md text-primary">{job.education}</p>
                    </div>
                  </div>
                )}
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full border border-outline-variant bg-surface text-body-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {job.additionalRequirements && (
                <div className="mt-stack-lg">
                  <h3 className="font-title-md text-title-md text-primary mb-stack-md">Additional Requirements</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
                    {job.additionalRequirements}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="md:col-span-4 space-y-gutter">
            {/* Job Summary Card */}
            <div className="bg-primary text-white p-stack-lg rounded-lg shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-title-md text-title-md mb-stack-md">Job Summary</h3>
                <div className="space-y-stack-md">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="font-label-md text-label-md opacity-70">Posted</span>
                    <span className="font-body-md text-body-md font-bold">{posted}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="font-label-md text-label-md opacity-70">Applicants</span>
                    <span className="font-body-md text-body-md font-bold">{job.applicants || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="font-label-md text-label-md opacity-70">Industry</span>
                    <span className="font-body-md text-body-md font-bold text-secondary-fixed-dim">{job.category || job.department}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="font-label-md text-label-md opacity-70">Work Setup</span>
                    <span className="font-body-md text-body-md font-bold">{job.remotePolicy || job.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="font-label-md text-label-md opacity-70">Posted By</span>
                    <span className="font-body-md text-body-md font-bold">{postedByLabel}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-secondary opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Company Information */}
            <div className="bg-white border border-outline-variant p-stack-lg rounded-lg">
              <div className="flex items-center gap-stack-md mb-stack-md">
                <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-primary">
                  {companyInitials}
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-primary">{postedByLabel}</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">CareerHub Partner</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">
                {postedByLabel} is a trusted partner on CareerHub, connecting top talent with leading opportunities worldwide.
              </p>
              <div className="space-y-stack-sm">
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-secondary scale-75">groups</span>
                  50 - 200 Employees
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-secondary scale-75">language</span>
                  www.careerhub.com
                </div>
              </div>
              <button className="w-full mt-stack-lg py-2 text-secondary font-label-md text-label-md border border-secondary/20 rounded hover:bg-secondary/5 transition-colors">
                View Company Profile
              </button>
            </div>

            {/* Map / Location Placeholder */}
            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden h-48 relative">
              <div
                className="absolute inset-0 grayscale opacity-40"
                data-location={job.location}
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHyYyQ5ei9q-L74tWmKODTk9j7K11nJV2XtbmumIGtxrjkraT3AGH4sfsh5aZHNdljKL9GFETNyBynQ-vMLyHWoJoez1QAG_ormfE06YAS1LRwsEkOoHJtnHl2kozRSb44g3dT0si9kh8a5yEKBxpIGIfRcVkaGuvGbX9WSTfiEaqWExuxS7FF5RM0n7oC2r7XapGJnswKnUIZ1jXgQatoFwgoudx5-203lIt2jUNy5KfU_WHn_MqKI0o_4LtrEeEsPsnTPJGH_-fm')`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white px-3 py-1 rounded shadow-sm border border-outline-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                  <span className="font-label-md text-label-md text-primary">{job.location}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky Mobile Actions */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant p-stack-md flex gap-stack-md z-40">
        <button className="flex-1 bg-primary text-white font-body-md font-bold py-3 rounded">Apply Now</button>
        <button className="p-3 border border-outline-variant rounded">
          <span className="material-symbols-outlined text-secondary">bookmark</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-padding-desktop py-stack-lg max-w-[1440px] mx-auto gap-stack-md">
          <div className="flex flex-col md:flex-row items-center gap-stack-md">
            <span className="font-label-md text-label-md font-bold text-on-surface">CareerHub</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
              © {new Date().getFullYear()} CareerHub. All rights reserved.
            </span>
          </div>
          <div className="flex gap-stack-lg">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Compliance</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
