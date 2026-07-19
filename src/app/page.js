import Link from "next/link";
import { Suspense } from "react";
import HeroSearch from "@/components/HeroSearch";
import { getDb } from "@/lib/mongodb";
import { getOrgName } from "@/lib/settings";

export async function generateMetadata() {
  try {
    const org = await getOrgName();
    return {
      title: `${org} | Find Your Dream Job Globally`,
      description:
        "Search thousands of active job postings in the world's leading cities. Browse by country, city, and industry.",
    };
  } catch {
    return {
      title: "HR System | Find Your Dream Job Globally",
      description:
        "Search thousands of active job postings in the world's leading cities. Browse by country, city, and industry.",
    };
  }
}

// Always render fresh data from MongoDB.
export const dynamic = "force-dynamic";

const CATEGORY_ICONS = {
  Engineering: "apartment",
  Automotive: "directions_car",
  "Tech & Software": "terminal",
  Technology: "terminal",
  Healthcare: "medical_services",
  Design: "brush",
  Product: "inventory_2",
  Marketing: "campaign",
  Data: "analytics",
  "Human Resources": "groups",
  Finance: "account_balance",
};

const BADGE_LABELS = ["Verified", "Hot Job", "New", "Urgent"];

function formatSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) return null;
  const cur = (job.currency || "").replace(/\s*\(.*\)/, "") || "";
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);
  if (job.minSalary != null && job.maxSalary != null) {
    return `${cur}${fmt(job.minSalary)} - ${cur}${fmt(job.maxSalary)}`.trim();
  }
  return `${cur}${fmt(job.minSalary ?? job.maxSalary)}`.trim();
}

async function loadData(searchParams) {
  try {
    const db = await getDb();
    const [countries, categories, jobsRaw] = await Promise.all([
      db.collection("countries").find({}).sort({ name: 1 }).toArray(),
      db.collection("categories").find({}).sort({ name: 1 }).toArray(),
      db.collection("jobs").find({ status: "Active" }).sort({ postedAt: -1 }).toArray(),
    ]);

    const q = (searchParams?.q || "").toLowerCase();
    const country = searchParams?.country || "";

    let jobs = jobsRaw;
    if (q) {
      jobs = jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q) ||
          (j.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (country) {
      jobs = jobs.filter((j) => (j.location || "").toLowerCase().includes(country.toLowerCase()));
    }

    // Aggregate job counts per city (from locations) using job.location substring match.
    const cityCounts = [];
    for (const c of countries) {
      for (const city of c.cities || []) {
        if (typeof city !== "string") continue;
        const count = jobsRaw.filter((j) =>
          (j.location || "").toLowerCase().includes(city.toLowerCase())
        ).length;
        if (count > 0) cityCounts.push({ city, country: c.name, count });
      }
    }

    const categoryCounts = categories
      .map((cat) => ({
        name: cat.name,
        count: jobsRaw.filter((j) => j.category === cat.name).length,
      }))
      .sort((a, b) => b.count - a.count);

    const countryCounts = countries
      .map((c) => ({
        name: c.name,
        count: jobsRaw.filter((j) =>
          (j.location || "").toLowerCase().includes(c.name.toLowerCase())
        ).length,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      countries,
      categories,
      jobs,
      cityCounts: cityCounts.slice(0, 40),
      categoryCounts: categoryCounts.slice(0, 20),
      countryCounts,
      totalActive: jobsRaw.length,
      filtered: Boolean(q || country),
    };
  } catch (err) {
    console.error("Homepage data load error:", err);
    return {
      countries: [],
      categories: [],
      jobs: [],
      cityCounts: [],
      categoryCounts: [],
      countryCounts: [],
      totalActive: 0,
      filtered: Boolean(q || country),
    };
  }
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const { countries, categories, jobs, cityCounts, categoryCounts, countryCounts, totalActive, filtered } = await loadData(sp);
  let orgName = "HR System";
  try {
    orgName = await getOrgName();
  } catch {
    orgName = "HR System";
  }

  const featured = jobs.slice(0, 4);
  const topCountries = countryCounts.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-container-padding-desktop max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{orgName}</span>
            <nav className="hidden md:flex gap-6">
              <Link className="font-title-md text-title-md text-secondary border-b-2 border-secondary pb-1 transition-colors" href="/jobs">
                Jobs
              </Link>
              <Link className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded" href="/admin/candidates">
                Candidates
              </Link>
              <Link className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded" href="/admin">
                Employers
              </Link>
              <Link className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded" href="/">
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <Link
                href="/candidate/login"
                className="px-4 py-2 text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold"
              >
                Login
              </Link>
              <Link
                href="/employer/login"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-80 transition-all font-semibold"
              >
                Employer
              </Link>
            </div>
            <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
              <span className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low p-2 rounded-full">notifications</span>
              <span className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low p-2 rounded-full">account_circle</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Split Screen Hero Section */}
        <section className="relative min-h-[600px] flex flex-col md:flex-row overflow-hidden bg-primary-container">
          {/* Content Side */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-container-padding-desktop z-10">
            <div className="max-w-xl">
              <h1 className="font-display-lg text-display-lg text-white mb-stack-md">Find Your Dream Job Globally</h1>
              <p className="font-title-md text-title-md text-white/90 mb-stack-lg">Search over 10,000 active job postings in the world&apos;s leading cities.</p>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/60">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-white placeholder:text-white/50"
                      placeholder="Job Title, Profession, Industry..."
                      type="text"
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/60">location_on</span>
                    <select className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none appearance-none text-white">
                      <option className="text-on-surface">All Countries</option>
                      {countries.map((c) => (
                        <option key={c._id} className="text-on-surface">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="bg-secondary text-white w-full py-4 rounded-lg font-bold hover:scale-95 transition-all active:opacity-80">
                    Find Jobs
                  </button>
                </div>
              </div>
              {/* Integrated Stats Counter */}
              <div className="grid grid-cols-4 gap-4 mt-stack-lg border-t border-white/10 pt-stack-md">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-secondary">10k+</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">Active Jobs</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-secondary">2.5M</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">Candidates</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-secondary">500+</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">Employers</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-secondary">45+</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">Countries</p>
                </div>
              </div>
            </div>
          </div>
          {/* Image Side */}
          <div className="hidden md:block w-1/2 relative h-full">
            <img
              className="w-full h-full object-cover"
              data-alt="A cinematic, wide-angle photograph of a futuristic global city skyline at dusk with glowing orange and blue lights. The urban landscape features iconic glass skyscrapers and busy highways with light trails. The overall mood is professional, ambitious, and high-energy, perfectly suited for a premium global recruitment platform."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbfVsk6hvTHgc3pFJ3J6AReArhhydRoeMt15pE3XPq1PHBXqGH_p1QzHiwH7St5uNYHw7HUqQMJV0CbWC4oZNk-X06w91QwAAj366af8ReKambXm0UQfp20rSURnf7kBgw1MKIkBvNbVGcuUQpcV9vRpnjy2QgY9JE_yT2AdX1NxN-PDgrf3AuSdhBvSLepU5vZ-_ybVG15XfpniVhJIWRgmR3osac8AGEKdB_M_dWWj15nq8pOWiOfbv3qz3YHdo9R9og2b__sB5a"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-transparent to-transparent"></div>
          </div>
        </section>

        {/* Horizontal Layout for Career Categories */}
        <section className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack-lg">Explore Career Opportunities</h2>
          <div className="flex flex-col gap-6">
            {/* Row 1: Countries (Horizontal List) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-title-md text-title-md text-on-surface">Browse by Country</h3>
                <Link className="text-secondary font-semibold flex items-center gap-1 hover:underline" href="#">
                  View all countries <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCountries.map((c) => (
                  <Link key={c.name} className="p-4 rounded-lg bg-surface hover:bg-surface-container transition-all flex items-center justify-between border border-outline-variant" href={`/jobs?country=${encodeURIComponent(c.name)}`}>
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-secondary font-mono-sm">{c.count.toLocaleString()} Jobs</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Row 2: Industries & Cities (Two Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry List */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
                <h3 className="font-title-md text-title-md text-on-surface mb-4 flex justify-between items-center">
                  By Industry
                  <span className="material-symbols-outlined text-outline">apartment</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryCounts.slice(0, 8).map((cat) => (
                    <Link key={cat.name} className="px-4 py-2 rounded-full border border-outline-variant hover:border-secondary hover:text-secondary cursor-pointer transition-colors bg-white" href={`/jobs?q=${encodeURIComponent(cat.name)}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* City Pills */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
                <h3 className="font-title-md text-title-md text-on-surface mb-4 flex justify-between items-center">
                  By City
                  <span className="material-symbols-outlined text-outline">location_city</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {cityCounts.slice(0, 8).map((item) => (
                    <Link key={item.city} className="py-2 px-4 rounded border border-outline-variant hover:bg-secondary hover:text-white transition-all text-on-surface font-semibold text-center" href={`/jobs?country=${encodeURIComponent(item.country)}`}>
                      {item.city}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1-Column List for Featured Jobs */}
        <section className="bg-surface-container-low py-stack-lg border-y border-outline-variant">
          <div className="max-w-[1000px] mx-auto px-container-padding-desktop">
            <div className="flex justify-between items-end mb-stack-lg">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Featured Jobs</h2>
                <p className="text-on-surface-variant">Recommended opportunities based on market trends</p>
              </div>
              <Link className="text-secondary font-semibold hover:underline flex items-center gap-1" href="/jobs">
                View all jobs <span className="material-symbols-outlined text-base">open_in_new</span>
              </Link>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden featured-jobs-list">
              {featured.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant">
                  No active jobs right now. Please check back later.
                </div>
              ) : (
                featured.map((job) => {
                  const badge = BADGE_LABELS[Math.floor(Math.random() * BADGE_LABELS.length)];
                  const salary = formatSalary(job);
                  const company = job.company || job.employer || orgName;
                  return (
                    <div key={job._id} className="p-6 hover:bg-surface transition-all flex flex-col sm:flex-row gap-6">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0 bg-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline text-[32px]">corporate_fare</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                          <div>
                            <h3 className="font-title-md text-title-md text-on-surface leading-tight">{job.title}</h3>
                            <p className="text-secondary font-semibold">{company}</p>
                          </div>
                          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-md text-label-md w-fit">{badge}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-on-surface-variant text-body-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">location_on</span> {job.location || "Remote"}
                          </span>
                          {salary && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">payments</span> {salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">schedule</span> {job.type || "Full-time"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link href={`/jobs/${job.jobId}`} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold w-full sm:w-auto text-center">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full py-stack-lg px-container-padding-desktop max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="space-y-4">
            <span className="font-title-md text-title-md font-bold text-on-surface">{orgName}</span>
            <p className="text-on-surface-variant text-body-sm">The world&apos;s leading recruitment platform connecting top talent with global opportunities. Secure your future with our systematic hiring infrastructure.</p>
            <p className="text-on-surface-variant text-body-sm font-bold">© {new Date().getFullYear()} {orgName}. All rights reserved.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-label-md text-on-surface uppercase mb-2">Platform</p>
              <a className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="#">Privacy Policy</a>
              <a className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="#">Terms of Service</a>
              <a className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="#">Cookie Policy</a>
            </div>
            <div className="space-y-2">
              <p className="font-label-md text-on-surface uppercase mb-2">Solutions</p>
              <Link className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="/admin">Recruitment Solutions</Link>
              <a className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="#">Mobile App</a>
              <a className="block text-on-surface-variant text-body-sm hover:text-secondary hover:underline transition-all" href="#">Contact Support</a>
            </div>
          </div>
          <div className="bg-white p-stack-md rounded-xl border border-outline-variant h-fit">
            <p className="font-label-md text-on-surface uppercase mb-4">Download Our App</p>
            <div className="flex gap-4">
              <div className="flex-1 bg-on-surface text-white p-2 rounded flex items-center gap-2 cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-2xl">phone_iphone</span>
                <div className="leading-tight">
                  <p className="text-[10px]">Download on the</p>
                  <p className="text-xs font-bold">App Store</p>
                </div>
              </div>
              <div className="flex-1 bg-on-surface text-white p-2 rounded flex items-center gap-2 cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                <div className="leading-tight">
                  <p className="text-[10px]">Get it on</p>
                  <p className="text-xs font-bold">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* App Install Banner (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full bg-secondary-container text-on-secondary-container py-3 px-4 flex justify-between items-center z-50 transform translate-y-0 transition-transform md:hidden" id="install-banner">
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined text-on-secondary-container p-1" type="button">close</button>
          <div className="bg-white rounded-lg p-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
          </div>
          <div>
            <p className="font-bold text-sm">{orgName} App</p>
            <p className="text-[10px]">Faster searching on iOS &amp; Android</p>
          </div>
        </div>
        <button className="bg-white text-secondary px-4 py-1.5 rounded-lg font-bold text-sm">INSTALL APP</button>
      </div>
    </div>
  );
}
