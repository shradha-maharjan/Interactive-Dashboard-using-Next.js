
"use client";
import Link from "next/link";

export default function ExperimentClient({ date, initialData }) {
  const sims = initialData?.simulations || [];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Experiment {date}</h1>
      <ul className="grid md:grid-cols-2 gap-3">
        {sims.map((m) => (
          <li key={m} className="rounded border p-3">
            <div className="font-semibold">{m}</div>
            <Link
              className="text-blue-600 underline text-sm"
              href={`/experiments/${date}/${m}`}
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
