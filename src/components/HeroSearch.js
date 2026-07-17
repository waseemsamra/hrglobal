"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function HeroSearch({ countries = [] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [country, setCountry] = useState(params.get("country") || "");

  function submit(e) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (country) sp.set("location", country);
    const qs = sp.toString();
    router.push(qs ? `/jobs?${qs}` : `/jobs`);
  }

  return (
    <form
      onSubmit={submit}
      className="glass-card p-4 rounded-xl shadow-lg border border-white/20"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
            placeholder="Job Title, Profession, Industry..."
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            location_on
          </span>
          <select
            className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none appearance-none"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:scale-95 transition-all active:opacity-80"
        >
          Find Jobs
        </button>
      </div>
    </form>
  );
}
