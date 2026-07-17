import Link from "next/link";
import { Suspense } from "react";
import { getDb } from "@/lib/mongodb";
import { getOrgName } from "@/lib/settings";
import HeroSearch from "@/components/HeroSearch";

export async function generateMetadata() {
  const org = await getOrgName();
  return {
    title: `${org} | Find Your Dream Job Globally`,
    description:
      "Search thousands of active job postings in the world's leading cities. Browse by country, city, and industry.",
  };
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
      const count = jobsRaw.filter((j) =>
        (j.location || "").toLowerCase().includes(city.name.toLowerCase())
      ).length;
      cityCounts.push({ name: city.name, country: c.name, count });
    }
  }
  cityCounts.sort((a, b) => b.count - a.count);

  return {
    countries: countries.map((c) => ({ id: c._id.toString(), name: c.name, code: c.code })),
    categories: categories.map((c) => ({ id: c._id.toString(), name: c.name })),
    cities: cityCounts,
    jobs: jobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      salary: formatSalary(j),
      badge: j.badge || null,
    })),
    totalActive: jobsRaw.length,
    filtered: Boolean(q || country),
  };
  } catch (err) {
    console.error("Homepage data load error:", err);
    return {
      countries: [],
      categories: [],
      cities: [],
      jobs: [],
      totalActive: 0,
      filtered: Boolean(q || country),
    };
  }
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const { countries, categories, cities, jobs, totalActive, filtered } = await loadData(sp);
  const orgName = await getOrgName();

  const topCities = cities.slice(0, 4);
  const featured = jobs.slice(0, 6);

  return (
    <div className="overflow-x-hidden">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-container-padding-desktop max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {orgName}
            </span>
            <nav className="hidden md:flex gap-6">
              <Link
                className="font-title-md text-title-md text-secondary border-b-2 border-secondary pb-1 transition-colors"
                href="/jobs"
              >
                Jobs
              </Link>
              <Link
                className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded"
                href="/admin/candidates"
              >
                Candidates
              </Link>
              <Link
                className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded"
                href="/admin"
              >
                Employers
              </Link>
              <a
                className="font-title-md text-title-md text-on-surface-variant hover:text-secondary hover:bg-surface-container-low transition-colors px-2 rounded"
                href="#featured"
              >
                Resources
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <Link
                href="/register"
                className="px-4 py-2 text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-80 transition-all font-semibold"
              >
                Register
              </Link>
            </div>
            <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
              <span className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low p-2 rounded-full">
                notifications
              </span>
              <Link href="/admin" className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low p-2 rounded-full">
                account_circle
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover"
              alt="City skyline at dusk"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpy1RCEJCKlP6RSm9nfLABU-VCVqjYO7GBNSZYhHReISa3r-Y4PYagB6ZLn2Bz1UEHCsA30MxsumL6rC7DEw0JcrS5AZy6lYpbCVR9K2SAeUEPtWNf4Xco7qZCv8CaDC1GGzFHv04vgvhh-5wjW6PvvchX9qKtZ7wmRG2qV2qn69nPXgllEuVZ2oANlDrbHHULaH30mxzsN5hD2BhTw5UA7Cg3_S1ozCoyYwYF36upPghfImZA9QJhzFQv3woz9dPxhgG-iV9Yctpj"
            />
            <div className="absolute inset-0 hero-gradient"></div>
          </div>
          <div className="relative z-10 w-full max-w-4xl px-container-padding-mobile text-center">
            <h1 className="font-display-lg text-display-lg text-white mb-stack-md">
              Find Your Dream Job Globally
            </h1>
            <p className="font-title-md text-title-md text-white/90 mb-stack-lg">
              Search over {totalActive.toLocaleString()} active job postings in the world&apos;s
              leading cities.
            </p>
            <Suspense fallback={<div className="glass-card p-4 rounded-xl h-20" />}>
              <HeroSearch countries={countries} />
            </Suspense>
          </div>
        </section>

        {/* Bento Grid: Browse Categories */}
        <section className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack-lg">
            Explore Career Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {/* Browse by City (large feature) */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md hover:bg-surface-container transition-all group">
              <div className="flex justify-between items-center mb-stack-md">
                <h3 className="font-title-md text-title-md text-on-surface">Browse by City</h3>
                <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topCities.length === 0 && (
                  <p className="text-on-surface-variant text-body-sm col-span-2">
                    No cities configured yet.
                  </p>
                )}
                {topCities.map((city) => (
                  <Link
                    key={`${city.country}-${city.name}`}
                    href={`/jobs?location=${encodeURIComponent(city.name)}`}
                    className="p-3 rounded-lg hover:bg-white flex items-center justify-between border border-transparent hover:border-outline-variant transition-all"
                  >
                    <span>{city.name}</span>
                    <span className="text-secondary font-mono-sm">{city.count} Jobs</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Browse by Industry */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md hover:bg-surface-container transition-all group">
              <div className="flex justify-between items-center mb-stack-md">
                <h3 className="font-title-md text-title-md text-on-surface">By Industry</h3>
                <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <ul className="space-y-2">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(cat.name)}`}
                      className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-outline">
                        {CATEGORY_ICONS[cat.name] || "work"}
                      </span>{" "}
                      {cat.name}
                    </Link>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-on-surface-variant text-body-sm">No categories yet.</li>
                )}
              </ul>
            </div>

            {/* Browse by Country */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md hover:bg-surface-container transition-all group">
              <div className="flex justify-between items-center mb-stack-md">
                <h3 className="font-title-md text-title-md text-on-surface">By Country</h3>
                <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <ul className="space-y-2">
                {countries.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/jobs?location=${encodeURIComponent(c.name)}`}
                      className="block p-2 rounded bg-surface-container-low text-on-surface font-semibold text-center hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
                {countries.length === 0 && (
                  <li className="text-on-surface-variant text-body-sm">No countries yet.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section
          id="featured"
          className="bg-surface-container-low py-stack-lg border-y border-outline-variant scroll-mt-20"
        >
          <div className="max-w-[1440px] mx-auto px-container-padding-desktop">
            <div className="flex justify-between items-end mb-stack-lg">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  {filtered ? "Matching Jobs" : "Featured Jobs"}
                </h2>
                <p className="text-on-surface-variant">
                  {filtered
                    ? `${jobs.length} result${jobs.length === 1 ? "" : "s"} found`
                    : "Recommended opportunities based on market trends"}
                </p>
              </div>
              {filtered && (
                <Link className="text-secondary font-semibold hover:underline flex items-center gap-1" href="/#featured">
                  Clear filters
                </Link>
              )}
            </div>

            {featured.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
                No active jobs found. Try adjusting your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                {featured.map((job, i) => (
                  <div
                    key={job.id}
                    className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant hover:shadow-lg transition-all flex gap-stack-md"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0 bg-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-4xl">work</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-title-md text-title-md text-on-surface">{job.title}</h3>
                        <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-md text-label-md whitespace-nowrap">
                          {job.badge || BADGE_LABELS[i % BADGE_LABELS.length]}
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-semibold">{job.department}</p>
                      <div className="mt-stack-sm flex flex-wrap gap-4 text-on-surface-variant text-body-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">location_on</span>{" "}
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">payments</span>{" "}
                            {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>{" "}
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Counter */}
        <section className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
            <div>
              <p className="font-display-lg text-display-lg text-secondary">
                {totalActive.toLocaleString()}
              </p>
              <p className="text-on-surface-variant uppercase font-label-md tracking-widest">
                Active Jobs
              </p>
            </div>
            <div>
              <p className="font-display-lg text-display-lg text-secondary">2.5M</p>
              <p className="text-on-surface-variant uppercase font-label-md tracking-widest">
                Candidates
              </p>
            </div>
            <div>
              <p className="font-display-lg text-display-lg text-secondary">
                {categories.length}
              </p>
              <p className="text-on-surface-variant uppercase font-label-md tracking-widest">
                Categories
              </p>
            </div>
            <div>
              <p className="font-display-lg text-display-lg text-secondary">
                {countries.length}
              </p>
              <p className="text-on-surface-variant uppercase font-label-md tracking-widest">
                Countries
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full py-stack-lg px-container-padding-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-[1440px] mx-auto">
        <div className="space-y-4">
          <span className="font-title-md text-title-md font-bold text-on-surface">{orgName}</span>
          <p className="text-on-surface-variant text-body-sm">
            The world&apos;s leading recruitment platform connecting top talent with global
            opportunities. Secure your future with our systematic hiring infrastructure.
          </p>
          <p className="text-on-surface-variant text-body-sm font-bold">
            © {new Date().getFullYear()} {orgName}. All rights reserved.
          </p>
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
      </footer>
    </div>
  );
}
