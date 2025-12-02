"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM7 6H5a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1h-2v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6Z" />
    </svg>
  );
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [counts, setCounts] = useState({}); // date -> simulation count
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/experiments");
      const j = await r.json();
      if (j.ok) setExperiments(j.experiments || []);
    })();
  }, []);

  useEffect(() => {
    if (!experiments?.length) return;
    (async () => {
      const entries = await Promise.all(
        experiments.map(async (date) => {
          try {
            const r = await fetch(`/api/experiments/${date}`);
            const j = await r.json();
            return [date, (j.simulations || []).length];
          } catch {
            return [date, 0];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    })();
  }, [experiments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiments;
    return experiments.filter((d) => d.toLowerCase().includes(q));
  }, [experiments, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse experiment runs and drill down into simulations, configs, and charts.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a date like 20250818…"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((date) => (
            <li key={date}>
              <Link
                href={`/experiments/${date}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="rounded-lg bg-gray-100 p-2 text-gray-600">
                      <CalendarIcon className="fill-current" />
                    </span>
                    <div className="font-semibold group-hover:text-indigo-600">{date}</div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {counts[date] ?? "—"} sims
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Click to view managers (Arf, Ideal, Minstrel, …), configs, and charts.
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <span className="text-indigo-600 text-sm font-medium">Open</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gray-200" />
      <h2 className="text-lg font-semibold">No experiments found</h2>
      <p className="mt-1 text-sm text-gray-600">
        Make sure <code className="rounded bg-white/70 px-1">DATA_DIR</code> points to your data folder and restart the dev server.
      </p>
    </div>
  );
}
