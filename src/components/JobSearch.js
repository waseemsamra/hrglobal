"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const JOB_TYPES = ["Full-time", "Contract", "Part-time", "Temporary", "Internship"];
const LEVELS = [
  "Student/ Fresh graduate",
  "Junior Professional",
  "Experienced professional",
  "Supervisor / Manager",
  "Top Management / Director",
];
const REMOTE = ["Remote", "Hybrid", "On-site"];
const DATE_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];
const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "salary", label: "Highest Salary" },
];

function formatSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) return null;
  const cur = (job.currency || "").replace(/\s*\(.*\)/, "") || "€";
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);
  if (job.minSalary != null && job.maxSalary != null)
    return `${cur}${fmt(job.minSalary)} - ${cur}${fmt(job.maxSalary)}`;
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

export default function JobSearch({ candidate = null }) {
  const router = useRouter();
  const params = useSearchParams();
  const isCandidate = Boolean(candidate);

  const [q, setQ] = useState(params.get("q") || "");
  const [data, setData] = useState({ jobs: [], total: 0, page: 1, totalPages: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [viewed, setViewed] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load the signed-in candidate's viewed + wishlist state.
  useEffect(() => {
    if (!isCandidate) return;
    fetch("/api/candidates/jobs")
      .then((r) => (r.ok ? r.json() : { viewed: [], wishlist: [] }))
      .then((d) => {
        setViewed(new Set(d.viewed || []));
        setWishlist(new Set(d.wishlist || []));
      })
      .catch(() => {});
  }, [isCandidate]);

  const types = useMemo(() => new Set((params.get("types") || "").split(",").filter(Boolean)), [params]);
  const levels = useMemo(() => new Set((params.get("levels") || "").split(",").filter(Boolean)), [params]);
  const remote = useMemo(() => new Set((params.get("remote") || "").split(",").filter(Boolean)), [params]);
  const minSalary = params.get("minSalary") || "30000";
  const datePosted = params.get("datePosted") || "7d";
  const sort = params.get("sort") || "relevance";
  const page = parseInt(params.get("page") || "1", 10) || 1;
  const country = params.get("country") || "";
  const city = params.get("city") || "";
  const industry = params.get("industry") || "";

  // Cities for the currently selected country (dependent dropdown).
  const citiesForCountry = useMemo(() => {
    const found = countries.find((c) => c.name === country);
    return found ? found.cities || [] : [];
  }, [countries, country]);

  const buildQuery = useCallback(
    (overrides = {}) => {
      const sp = new URLSearchParams(params.toString());
      const set = (k, v) => {
        if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) sp.delete(k);
        else sp.set(k, Array.isArray(v) ? v.join(",") : v);
      };
      if ("q" in overrides) set("q", overrides.q);
      if ("location" in overrides) set("location", overrides.location);
      if ("country" in overrides) set("country", overrides.country);
      if ("city" in overrides) set("city", overrides.city);
      if ("industry" in overrides) set("industry", overrides.industry);
      if ("types" in overrides) set("types", overrides.types);
      if ("levels" in overrides) set("levels", overrides.levels);
      if ("remote" in overrides) set("remote", overrides.remote);
      if ("minSalary" in overrides) set("minSalary", overrides.minSalary);
      if ("datePosted" in overrides) set("datePosted", overrides.datePosted);
      if ("sort" in overrides) set("sort", overrides.sort);
      // Reset to page 1 on any filter change unless explicitly paging
      set("page", "page" in overrides ? overrides.page : "1");
      return sp.toString();
    },
    [params]
  );

  const push = useCallback(
    (overrides) => router.push(`/jobs?${buildQuery(overrides)}`, { scroll: false }),
    [router, buildQuery]
  );

  // Load countries (with cities) + categories once for filter dropdowns.
  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([loc, cat]) => {
        setCountries(loc.countries || []);
        setCategories(cat.categories || []);
      })
      .catch((e) => console.error(e));
  }, []);

  // Fetch jobs whenever the URL query changes.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const sp = new URLSearchParams(params.toString());
    sp.set("status", "Active");
    sp.set("pageSize", "20");
    if (!sp.get("datePosted")) sp.set("datePosted", "7d");
    fetch(`/api/jobs?${sp.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [params]);

  function toggleSet(current, value, key) {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    push({ [key]: Array.from(next) });
  }

  function toggleBookmark(id) {
    const willAdd = !wishlist.has(id);
    setWishlist((prev) => {
      const next = new Set(prev);
      if (willAdd) next.add(id);
      else next.delete(id);
      return next;
    });
    // Keep the legacy local-only set in sync for non-candidate sessions.
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (willAdd) next.add(id);
      else next.delete(id);
      return next;
    });
    if (isCandidate) {
      fetch("/api/candidates/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wishlist", jobId: id, value: willAdd }),
      }).catch(() => {});
    }
  }

  function markViewed(id) {
    if (!isCandidate || viewed.has(id)) return;
    setViewed((prev) => new Set(prev).add(id));
    fetch("/api/candidates/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view", jobId: id, value: true }),
    }).catch(() => {});
  }

  const jobs = data.jobs || [];
  const locationLabel = city || country || "all locations";

  return (
    <>
      {/* Secondary Search Bar */}
      <section className="bg-surface-container-lowest border-b border-outline-variant py-8">
        <div className="max-w-[1440px] mx-auto px-container-padding-desktop">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              push({ q });
            }}
            className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-outline-variant shadow-sm"
          >
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none font-body-md text-body-md"
                placeholder="Job Title, Profession, Industry..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-secondary text-on-secondary px-8 py-3 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Find Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-container-padding-desktop py-stack-lg flex gap-gutter">
        {/* Sidebar Filters */}
        <aside className="w-[280px] shrink-0 hidden md:flex flex-col gap-stack-lg">
          {/* Country */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">By Country</h3>
            <select
              value={country}
              onChange={(e) => push({ country: e.target.value, city: "" })}
              className="w-full bg-transparent border border-outline-variant rounded-lg font-body-sm text-body-sm px-3 py-2"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City (depends on country) */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">By City</h3>
            <select
              value={city}
              disabled={!country}
              onChange={(e) => push({ city: e.target.value })}
              className="w-full bg-transparent border border-outline-variant rounded-lg font-body-sm text-body-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{country ? "All Cities" : "Select a country first"}</option>
              {citiesForCountry.map((ct) => (
                <option key={ct.id} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
          <hr className="border-outline-variant" />

          {/* Industry */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">By Industry</h3>
            <select
              value={industry}
              onChange={(e) => push({ industry: e.target.value })}
              className="w-full bg-transparent border border-outline-variant rounded-lg font-body-sm text-body-sm px-3 py-2"
            >
              <option value="">All Industries</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <hr className="border-outline-variant" />

          {/* Job Type */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">Job Type</h3>
            {JOB_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-sm border-outline text-secondary focus:ring-secondary w-5 h-5"
                  checked={types.has(t)}
                  onChange={() => toggleSet(types, t, "types")}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {t}
                </span>
              </label>
            ))}
          </div>
          <hr className="border-outline-variant" />

          {/* Experience Level */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">Experience Level</h3>
            {LEVELS.map((l) => (
              <label key={l} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-sm border-outline text-secondary focus:ring-secondary w-5 h-5"
                  checked={levels.has(l)}
                  onChange={() => toggleSet(levels, l, "levels")}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">{l}</span>
              </label>
            ))}
          </div>
          <hr className="border-outline-variant" />

          {/* Salary Range */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">
              Min Salary (€{Number(minSalary).toLocaleString()})
            </h3>
            <input
              type="range"
              min="30000"
              max="150000"
              step="5000"
              value={minSalary}
              onChange={(e) => push({ minSalary: e.target.value })}
              className="w-full accent-secondary"
            />
            <div className="flex justify-between font-mono-sm text-on-surface-variant mt-1">
              <span>30k</span>
              <span>150k+</span>
            </div>
          </div>
          <hr className="border-outline-variant" />

          {/* Remote Policy */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">Remote Policy</h3>
            <div className="flex flex-wrap gap-2">
              {REMOTE.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleSet(remote, r, "remote")}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${
                    remote.has(r)
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <hr className="border-outline-variant" />

          {/* Date Posted */}
          <div className="flex flex-col gap-stack-sm">
            <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">Date Posted</h3>
            <select
              value={datePosted}
              onChange={(e) => push({ datePosted: e.target.value })}
              className="w-full bg-transparent border border-outline-variant rounded-lg font-body-sm text-body-sm px-3 py-2"
            >
              {DATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main Feed */}
        <div className="flex-1 flex flex-col gap-stack-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {loading ? "Searching…" : `${data.total.toLocaleString()} Jobs found`}
                {!loading && (city || country)
                  ? ` in ${city || country}`
                  : ""}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Hand-picked recruitment opportunities for {locationLabel}
                {industry ? ` · ${industry}` : ""}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-md text-label-md text-outline">SORT BY</span>
              <select
                value={sort}
                onChange={(e) => push({ sort: e.target.value })}
                className="border-none bg-transparent font-title-md text-body-md font-bold text-secondary focus:ring-0 cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Listing Table */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            {loading && (
              <div className="p-12 text-center text-on-surface-variant">Loading jobs…</div>
            )}
            {!loading && jobs.length === 0 && (
              <div className="p-12 text-center text-on-surface-variant">
                No jobs match your filters. Try broadening your search.
              </div>
            )}
            {!loading && jobs.length > 0 && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Company
                    </th>
                    {isCandidate && (
                      <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Viewed
                      </th>
                    )}
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {jobs.map((job) => {
                    const bookmarked = bookmarks.has(job.id);
                    const saved = isCandidate ? wishlist.has(job.id) : bookmarked;
                    const isViewed = isCandidate && viewed.has(job.id);
                    return (
                      <tr
                        key={job.id}
                        className={`hover:bg-surface-container-low transition-colors group ${
                          isViewed ? "bg-secondary-container/20" : ""
                        }`}
                      >
                        {/* Position */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => markViewed(job.id)}
                            className="flex items-center gap-3 text-left"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                isViewed
                                  ? "bg-secondary-container border-secondary text-on-secondary-container"
                                  : "bg-surface-container-low border-outline-variant text-secondary"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl">
                                {isViewed ? "visibility" : "work"}
                              </span>
                            </div>
                            <div>
                              <p className="font-body-md font-bold text-on-surface group-hover:text-secondary transition-colors">
                                {job.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {job.type}
                                </span>
                                {job.badge && (
                                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-label-md text-[10px] uppercase">
                                    {job.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </td>
                        {/* Location */}
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {job.location}
                          </span>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-on-surface-variant font-body-sm text-body-sm whitespace-nowrap">
                          {timeAgo(job.postedAt)}
                        </td>
                        {/* Company */}
                        <td className="px-4 py-3">
                          <span className="font-body-sm text-body-sm text-secondary font-semibold">
                            {job.department}
                          </span>
                        </td>
                        {/* Viewed */}
                        {isCandidate && (
                          <td className="px-4 py-3">
                            {isViewed ? (
                              <span className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Viewed
                              </span>
                            ) : (
                              <span className="text-outline-variant font-label-md text-label-md">—</span>
                            )}
                          </td>
                        )}
                        {/* Wishlist */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleBookmark(job.id)}
                            className={`transition-colors ${
                              saved
                                ? "text-secondary"
                                : "text-outline-variant hover:text-secondary"
                            }`}
                            aria-label="Add to wishlist"
                            title={saved ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              bookmark
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && data.totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-outline-variant py-stack-md mt-4">
              <button
                disabled={page <= 1}
                onClick={() => push({ page: String(page - 1) })}
                className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors font-label-md text-label-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span> Previous
              </button>
              <div className="flex gap-2">
                {pageNumbers(page, data.totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`e${idx}`} className="w-10 h-10 flex items-center justify-center text-outline">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => push({ page: String(p) })}
                      className={`w-10 h-10 rounded-lg font-label-md text-label-md transition-colors ${
                        p === page
                          ? "bg-secondary text-on-secondary"
                          : "hover:bg-surface-container-high"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                disabled={page >= data.totalPages}
                onClick={() => push({ page: String(page + 1) })}
                className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors font-label-md text-label-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          )}
        </div>
      </main>
    </>
  );
}

function pageNumbers(current, total) {
  const pages = [];
  const add = (p) => pages.push(p);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) add(i);
    return pages;
  }
  add(1);
  if (current > 3) add("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) add(i);
  if (current < total - 2) add("...");
  add(total);
  return pages;
}
