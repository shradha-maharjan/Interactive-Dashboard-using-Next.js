import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("../data/wifi_general_results");
const OUT_DIR = path.resolve("./public/generated");

if (!fs.existsSync(DATA_DIR)) {
  console.error("❌ DATA_DIR not found:", DATA_DIR);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Build experiments list
const experiments = fs
  .readdirSync(DATA_DIR)
  .filter(e => fs.statSync(path.join(DATA_DIR, e)).isDirectory())
  .sort()
  .reverse();

fs.writeFileSync(
  path.join(OUT_DIR, "experiments.json"),
  JSON.stringify({ ok: true, experiments }, null, 2)
);

console.log(`Generated experiments.json with ${experiments.length} experiments.`);

// Optional: generate per-experiment manager JSON files
for (const date of experiments) {
  const expPath = path.join(DATA_DIR, date);
  const managers = fs
    .readdirSync(expPath)
    .filter(e => fs.statSync(path.join(expPath, e)).isDirectory());

  const data = {};
  for (const m of managers) {
    const folder = path.join(expPath, m);
    const csvs = fs.readdirSync(folder).filter(f => f.endsWith(".csv"));
    data[m] = csvs;
  }

  fs.mkdirSync(path.join(OUT_DIR, date), { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, date, "index.json"),
    JSON.stringify({ ok: true, managers: data }, null, 2)
  );
}

