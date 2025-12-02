import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CANDIDATES = [
  process.env.DATA_DIR && path.resolve(process.env.DATA_DIR),
  path.join(ROOT, "data", "wifi_general_results"),
  path.join(ROOT, "..", "data", "wifi_general_results"),
].filter(Boolean);
const DATA_ROOT = CANDIDATES.find(p => fs.existsSync(p));

export async function GET(req) {
  try {
    if (!DATA_ROOT) return NextResponse.json({ ok: true, items: [] });

    // Optional: ?date=20250818_232455 to scope to one run
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const base = date ? path.join(DATA_ROOT, date) : DATA_ROOT;

    const files = await findCsvs(base);
    const items = files.map(abs => {
      const relFromRoot = path.relative(DATA_ROOT, abs);
      const folder = path.dirname(relFromRoot);
      const manager = folder.split(path.sep).pop(); // e.g., manager_On
      return {
        absPath: abs,
        relPath: relFromRoot,     // used by /api/wifi-results/file?rel=...
        name: path.basename(abs), // wifi-manager-example-*.csv
        folder,
        manager,
      };
    });
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

async function findCsvs(dir) {
  const out = [];
  async function walk(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.isFile()) {
        const bn = e.name.toLowerCase();
        // Only manager_* folders AND files starting with wifi-manager-example- AND .csv
        if (p.includes(`${path.sep}manager_`) && bn.startsWith("wifi-manager-example-") && bn.endsWith(".csv")) {
          out.push(p);
        }
      }
    }
  }
  await walk(dir);
  return out;
}
