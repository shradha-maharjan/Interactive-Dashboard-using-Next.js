import path from "path";
import fs from "fs";
import { readdir } from "fs/promises";
import { NextResponse } from "next/server";

const ROOT = process.cwd();
const DATA_ROOT = resolveDataRoot();

export async function GET(_req, ctx) {
  const { date } = await ctx.params;            
  if (!DATA_ROOT) return NextResponse.json({ ok: true, simulations: [] });

  const base = path.join(DATA_ROOT, date);
  if (!fs.existsSync(base)) return NextResponse.json({ ok: true, simulations: [] });

  const entries = await readdir(base, { withFileTypes: true });
  const simulations = entries
    .filter(e => e.isDirectory() && e.name.startsWith("manager_"))
    .map(e => e.name)
    .sort();

  return NextResponse.json({ ok: true, date, simulations });
}

function resolveDataRoot() {
  const cands = [
    process.env.DATA_DIR && path.resolve(process.env.DATA_DIR),
    path.join(ROOT, "data", "wifi_general_results"),
    path.join(ROOT, "..", "data", "wifi_general_results"),
  ].filter(Boolean);
  return cands.find(p => fs.existsSync(p));
}