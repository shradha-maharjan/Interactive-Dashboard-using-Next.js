
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-center text-gray-600 mb-10">
        Explore experiment data, visualize results, or quickly view CSV dashboards.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Experiments card */}
        <Link
          href="/experiments"
          className="group block rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-900">
              <div className="font-semibold text-lg group-hover:text-indigo-700">
                Experiments
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
              Browse Data
            </span>
          </div>
          <p className="mt-3 text-sm text-indigo-900/80">
            View experiment data, configurations, and charts for each manager.
          </p>
        </Link>

        {/* Dashboard card */}
        <Link
          href="/dashboard"
          className="group block rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-900">
              <div className="font-semibold text-lg group-hover:text-blue-700">
                Dashboard
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              Quick View
            </span>
          </div>
          <p className="mt-3 text-sm text-blue-900/80">
            Drag & drop CSVs or visualize experiment data quickly.
          </p>
        </Link>
      </div>
    </main>
  );
}
