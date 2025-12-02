import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";
import { NextResponse } from "next/server";

const ROOT = process.cwd();
const DATA_ROOT = resolveDataRoot();

export async function GET() {
  if (!DATA_ROOT) return NextResponse.json({ ok: true, experiments: [] });
  const entries = await readdir(DATA_ROOT, { withFileTypes: true });
  const experiments = entries.filter(e => e.isDirectory()).map(e => e.name).sort().reverse();
  return NextResponse.json({ ok: true, experiments });
}

function resolveDataRoot() {
  const cands = [
    process.env.DATA_DIR && path.resolve(process.env.DATA_DIR),
    path.join(ROOT, "data", "wifi_general_results"),
    path.join(ROOT, "..", "data", "wifi_general_results"),
  ].filter(Boolean);
  return cands.find(p => fs.existsSync(p));
}