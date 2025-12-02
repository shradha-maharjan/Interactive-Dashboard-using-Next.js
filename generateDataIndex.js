// frontend/generateDataIndex.js
import fs from "fs";
import path from "path";

const dataRoot = path.resolve("public", "data");
const outFile = path.join(dataRoot, "data_index.json");

function scanFilesRecursively(dir) {
  let csvs = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      csvs = csvs.concat(scanFilesRecursively(fullPath));
    } else if (item.endsWith(".csv") || item.endsWith(".txt")) {
      csvs.push(path.relative(dataRoot, fullPath).replace(/\\/g, "/"));
    }
  }
  return csvs;
}

function scanExperiments(dir) {
  const experiments = [];
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return experiments;
  }

  for (const expName of fs.readdirSync(dir)) {
    const expPath = path.join(dir, expName);
    if (!fs.statSync(expPath).isDirectory()) continue;

    const managers = [];
    for (const mgrName of fs.readdirSync(expPath)) {
      const mgrPath = path.join(expPath, mgrName);
      if (!fs.statSync(mgrPath).isDirectory()) continue;

      // Recursively collect CSVs in manager folders
      const csvs = scanFilesRecursively(mgrPath);
      managers.push({ name: mgrName, csvs });
    }
    experiments.push({ name: expName, managers });
  }
  return experiments;
}

const experiments = scanExperiments(dataRoot);
fs.writeFileSync(outFile, JSON.stringify({ experiments }, null, 2));

console.log(`Generated data_index.json with ${experiments.length} experiments`);
console.log(`Output file: ${outFile}`);
