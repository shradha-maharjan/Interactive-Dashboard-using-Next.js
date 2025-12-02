// // frontend/src/app/experiments/[date]/[manager]/page.js
// import SimulationClient from "./SimulationClient";

// export default async function Page({ params }) {
//   const { date, manager } = await params; 
//   return <SimulationClient date={date} manager={manager} />;
// }
import fs from "fs";
import path from "path";
import SimulationClient from "./SimulationClient";
import Papa from "papaparse";

export const revalidate = 60;

export async function generateStaticParams() {
  const root = process.env.DATA_DIR || "../data/wifi_general_results";
  if (!fs.existsSync(root)) return [];

  const params = [];

  // find all experiment date folders
  const dates = fs.readdirSync(root).filter(f => /^\d{8}_\d{6}$/.test(f));

  for (const date of dates) {
    const dateDir = path.join(root, date);
    const managers = fs
      .readdirSync(dateDir)
      .filter(
        f =>
          !f.startsWith(".") &&
          fs.lstatSync(path.join(dateDir, f)).isDirectory()
      );

    for (const manager of managers) params.push({ date, manager });
  }

  return params;
}


function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return Papa.parse(content, { header: true }).data;
}


export default async function Page({ params }) {
  const { date, manager } = await params;
  const baseDir = process.env.DATA_DIR || "../data/wifi_general_results";
  const managerDir = path.join(baseDir, date, manager);

  // Load config.json if it exists
  const configPath = path.join(managerDir, "metadata.json");
  const configs = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {};

  // Load all CSV files
  const results = fs
  .readdirSync(managerDir)
  .filter((f) => f.endsWith(".csv"))
  .map((file) => {
    const filePath = path.join(managerDir, file);
    const parsed = parseCsv(filePath);

    console.log("Parsed headers for", file, ":", Object.keys(parsed[0] || {}));

    const rows = parsed.map((r) => {
      const normalized = {};
      for (const [k, v] of Object.entries(r)) {
        const key = k.trim().toLowerCase();

        if (key.includes("snr")) normalized.snr = v;
        else if (key.includes("rate")) normalized.rate = v;
        else if (key.includes("observed")) normalized.observed = v;
      }
      return normalized;
    });

    return { file, rows };
  });

  const data = { ok: true, configs, results };
  return <SimulationClient date={date} manager={manager} initialData={data} />;
}