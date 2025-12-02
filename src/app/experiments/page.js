import fs from "fs";
import path from "path";
import Link from "next/link";

export const revalidate = 60;

export default async function ExperimentsPage() {
  // Point to your actual folder
  const dataDir = process.env.DATA_DIR || "../data/wifi_general_results";

  // Make sure the directory exists
  if (!fs.existsSync(dataDir)) {
    console.error("DATA_DIR not found:", dataDir);
    return (
      <div className="p-6 text-red-600">
        DATA_DIR not found: {dataDir}
      </div>
    );
  }

  // Match folders like 20250818_232455
  const experiments = fs
    .readdirSync(dataDir)
    .filter((f) => /^\d{8}_\d{6}$/.test(f)) // e.g., 20250818_232455
    .sort()
    .reverse();

  if (experiments.length === 0) {
    return (
      <div className="p-6 text-gray-600">
        No experiments found in {dataDir}.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((date) => (
          <li key={date}>
            <Link
              href={`/experiments/${date}`}
              className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <div className="font-semibold">{date}</div>
              <div className="text-sm text-gray-500 mt-1">
                View managers and results
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
