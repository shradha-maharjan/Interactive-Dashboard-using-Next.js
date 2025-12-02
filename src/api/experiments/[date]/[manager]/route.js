import path from "path";
import fs from "fs";
import { readFile, readdir } from "fs/promises";
import { NextResponse } from "next/server";

const ROOT = process.cwd();
const DATA_ROOT = resolveDataRoot();

export async function GET(_req, ctx) {
  const { date, manager } = await ctx.params;   
  if (!DATA_ROOT) return NextResponse.json({ ok: false, error: "DATA_ROOT not found" }, { status: 500 });

  const base = path.join(DATA_ROOT, date, manager);
  if (!fs.existsSync(base)) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // --- configs ---
  const configs = {};
  for (const fname of ["parameters.json", "metadata.json"]) {
    const p = path.join(base, fname);
    if (fs.existsSync(p)) {
      try { configs[fname] = JSON.parse(await readFile(p, "utf8")); } catch {}
    }
  }
  const others = await readdir(base);
  const wm = others.find(f => f.endsWith(".json") && f.startsWith("--wifiManager="));
  if (wm) {
    try { configs[wm] = JSON.parse(await readFile(path.join(base, wm), "utf8")); } catch {}
  }

  // --- results ---
  const csvFiles = others.filter(f => f.toLowerCase().startsWith("wifi-manager-example-") && f.toLowerCase().endsWith(".csv"));
  const results = [];
  for (const f of csvFiles) {
    const text = await readFile(path.join(base, f), "utf8");
    const { headers, rows } = parseCsvFlexible(text);
    results.push({ file: f, headers, rows: mapColumns(rows, headers) });
  }

  const logs = ["stdout.txt", "stderr.txt"].filter(f => others.includes(f));
  return NextResponse.json({ ok: true, date, manager, configs, results, logs });
}

// ---- helpers ----
function parseCsvFlexible(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const header = lines[0];
  let delim = ",";
  if (header.includes("\t")) delim = "\t"; else if (header.includes(";")) delim = ";";
  else if (/,/.test(header)) delim = ","; else delim = /\s+/;
  const headers = splitSmart(header, delim).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitSmart(lines[i], delim).map(c => c.trim());
    if (cols.length === 1 && !cols[0]) continue;
    rows.push(cols);
  }
  return { headers, rows };
}
function splitSmart(line, delim) { return delim instanceof RegExp ? line.split(delim).filter(Boolean) : line.split(delim); }
function mapColumns(rowArrays, headers) {
  const find = (cands) => {
    const keys = headers.map(h => h.toLowerCase());
    for (const c of cands) {
      const i = keys.findIndex(k => k === c || k.includes(c));
      if (i !== -1) return i;
    }
    for (let i = 0; i < headers.length; i++) if (/\d/.test(headers[i])) return i;
    return 0;
  };
  const snrIdx = find(["snr", "snr(dB)".toLowerCase(), "snr_db", "snr-db"]);
  const rateIdx = find(["rate", "802.11a-rate selected".toLowerCase(), "802.11a-rate", "selected"]);
  const obsIdx = find(["observed", "802.11a-observed".toLowerCase(), "throughput", "obs"]);
  return rowArrays.map(cols => ({
    snr: toNum(cols[snrIdx]),
    rate: toNum(cols[rateIdx]),
    observed: toNum(cols[obsIdx]),
  }));
}
function toNum(v) { const n = Number(String(v ?? "").replace(/,/g, "")); return Number.isFinite(n) ? n : undefined; }
function resolveDataRoot() {
  const cands = [
    process.env.DATA_DIR && path.resolve(process.env.DATA_DIR),
    path.join(ROOT, "data", "wifi_general_results"),
    path.join(ROOT, "..", "data", "wifi_general_results"),
  ].filter(Boolean);
  return cands.find(p => fs.existsSync(p));
}
