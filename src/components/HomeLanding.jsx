"use client";
import Link from "next/link";

export default function HomeLanding() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-center text-gray-600 mb-10">
        Explore experiment results or visualize your own CSV data interactively.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        <Card
          href="/experiments"
          color="indigo"
          title="Experiments"
          desc="View experiment data, configurations, and charts for each manager."
        />
        <Card
          href="/dashboard"
          color="blue"
          title="Dashboard"
          desc="Upload or drag CSV files to instantly visualize SNR vs rate vs observed."
        />
      </div>
    </main>
  );
}

function Card({ href, emoji, color, title, desc }) {
  const base = color === "indigo" ? "indigo" : "blue";
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border border-${base}-200 bg-${base}-50 p-6 shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-3 text-${base}-900`}>
          <span
            className={`rounded-lg bg-white p-3 text-${base}-600 border border-${base}-200 text-lg`}
          >
            {emoji}
          </span>
          <div className={`font-semibold text-lg group-hover:text-${base}-700`}>
            {title}
          </div>
        </div>
      </div>
      <p className={`mt-3 text-sm text-${base}-900/80`}>{desc}</p>
    </Link>
  );
}
