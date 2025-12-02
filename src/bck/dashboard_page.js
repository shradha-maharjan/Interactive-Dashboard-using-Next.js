"use client";

import { Fragment, useMemo, useRef, useState, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from "recharts";

// export default function DashboardPage() {
//   const [datasets, setDatasets] = useState([]);
export default function DashboardPage({ initialDatasets = [] }) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const fileInputRef = useRef(null);
  const [binSize, setBinSize] = useState(1);

  const onFiles = useCallback(async (files) => {
    const newSets = [];
    for (const f of files) {
      const text = await f.text();
      const { headers, rows } = robustParse(text);
      const mapped = mapColumns(rows, headers);
      newSets.push({ name: f.name, rows: mapped });
    }
    setDatasets(prev => [...prev, ...newSets]);
  }, []);

  const handleFile = (e) => onFiles(e.target.files || []);
  const handleDrop = (e) => { e.preventDefault(); onFiles(e.dataTransfer?.files || []); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Drop CSVs to visualize <b>SNR</b> vs <b>Selected (rate)</b> vs <b>Observed</b>.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-gray-200 px-3 py-2" onClick={() => fileInputRef.current?.click()}>Upload CSVs</button>
          <button className="rounded-xl bg-gray-200 px-3 py-2" onClick={() => setDatasets([])}>Clear</button>
          <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" className="hidden" multiple onChange={handleFile}/>
        </div>
      </header>

      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={handleDrop}
        className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-gray-400"
      >
        <p className="font-medium">Drag & drop CSV/TXT files here</p>
        <p className="text-sm text-gray-500">Supports comma / tab / whitespace delimited</p>
      </div>

      {datasets.length > 0 && (
        <div className="space-y-8">
          {datasets.map((d) => {
            const dBinned = binBySnr(d.rows, binSize);
            return (
              <ChartCard key={d.name} title={d.name}>
                {/* Line chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[...d.rows].sort((a,b)=>a.snr-b.snr)} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="snr" label={{ value: "SNR (dB)", position: "insideBottom", dy: 10 }} />
                    <YAxis yAxisId="left" label={{ value: "Observed", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: "Selected (rate)", angle: 90, position: "insideRight" }} />
                    <Tooltip /><Legend />
                    <Line yAxisId="left" type="monotone" dataKey="observed" name="Observed" dot={false} strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="selected" name="Selected (rate)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>

                {/* Bar chart */}
                <div className="my-6">
                  <h5 className="mb-2 text-sm font-medium">Binned averages (bin size {binSize} dB)</h5>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dBinned} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="snr" label={{ value: "SNR (dB, binned)", position: "insideBottom", dy: 10 }} />
                      <YAxis yAxisId="left" label={{ value: "Observed (avg)", angle: -90, position: "insideLeft" }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: "Selected (avg)", angle: 90, position: "insideRight" }} />
                      <Tooltip /><Legend />
                      <Bar yAxisId="left" dataKey="observed" name="Observed (avg)" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="selected" name="Selected (avg)" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Editable table */}
                <DataTable
                  rows={d.rows}
                  onEdit={(newRows) =>
                    setDatasets((prev) =>
                      prev.map((ds) =>
                        ds.name === d.name ? { ...ds, rows: newRows } : ds
                      )
                    )
                  }
                />
              </ChartCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h4 className="mb-3 font-semibold">{title}</h4>
      {children}
    </div>
  );
}

/* --- parsing + mapping + binning helpers --- */
function robustParse(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(!lines.length) return { headers:[], rows:[] };
  const header = lines[0];
  let delim = ","; if(header.includes("\t")) delim="\t"; else if(header.includes(";")) delim=";"; else if(/,/.test(header)) delim=","; else delim=/\s+/;
  const headers = splitSmart(header,delim).map(h=>h.trim());
  const rows = [];
  for (let i=1;i<lines.length;i++){
    const cols = splitSmart(lines[i],delim).map(c=>c.trim());
    if(cols.length===1 && !cols[0]) continue;
    rows.push(cols);
  }
  return { headers, rows };
}
function splitSmart(line, delim){ return delim instanceof RegExp ? line.split(delim).filter(Boolean) : line.split(delim); }
function mapColumns(rowArrays, headers){
  const idx = {
    snr: findIndex(headers, ["snr","snr(db)","snr_db","snr-db"]),
    rate: findIndex(headers, ["rate","802.11a-rate selected","802.11a-rate","selected"]),
    observed: findIndex(headers, ["observed","802.11a-observed","throughput","obs"]),
  };
  return rowArrays.map(cols => ({
    snr: toNum(cols[idx.snr]),
    selected: toNum(cols[idx.rate]),
    observed: toNum(cols[idx.observed]),
  }));
}
function findIndex(headers, cands){
  const keys = headers.map(h=>h.toLowerCase());
  for(const c of cands){
    const i = keys.findIndex(k=>k===c || k.includes(c));
    if(i!==-1) return i;
  }
  for(let i=0;i<headers.length;i++){ if(/\d/.test(headers[i])) return i; }
  return 0;
}
function toNum(v){ const n = Number(String(v??"").replace(/,/g,"")); return Number.isFinite(n)?n:undefined; }
function binBySnr(rows, binSize=1){
  const valid = (rows||[]).filter(r=>isFinite(r.snr));
  if(!valid.length) return [];
  const min = Math.min(...valid.map(r=>r.snr));
  const bins = new Map();
  for(const r of valid){
    const key = Math.round((r.snr - min)/binSize);
    const b = bins.get(key) || { snrSum:0, n:0, obsSum:0, selSum:0 };
    b.snrSum += r.snr; b.n += 1;
    if(isFinite(r.observed)) b.obsSum += r.observed;
    if(isFinite(r.selected)) b.selSum += r.selected;
    bins.set(key,b);
  }
  return [...bins.entries()].map(([k,b])=>({
    snr: b.snrSum/b.n,
    observed: b.n? b.obsSum/b.n : undefined,
    selected: b.n? b.selSum/b.n : undefined,
  })).sort((a,b)=>a.snr-b.snr);
}

function DataTable({ rows, onEdit }) {
  const [open, setOpen] = useState(false);

  if (!rows?.length) return null;
  const columns = Object.keys(rows[0]);

  const handleChange = (rowIndex, col, value) => {
    const updated = rows.map((r, i) =>
      i === rowIndex ? { ...r, [col]: toNum(value) ?? value } : r
    );
    onEdit(updated); // send back updated rows to parent
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
      >
        {open ? "Hide Table" : "Show Table"}
      </button>

      {open && (
        <div className="overflow-x-auto mt-3 max-h-96 overflow-y-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 border-b text-left font-semibold"
                  >
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1 border-b">
                      <input
                        type="text"
                        value={r[col] ?? ""}
                        onChange={(e) => handleChange(i, col, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


"use client";

import { useRef, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Brush,
} from "recharts";

/* =======================
   DASHBOARD PAGE
======================= */
export default function DashboardPage({ initialDatasets = [] }) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const fileInputRef = useRef(null);
  const [binSize, setBinSize] = useState(1);
  const [chartType, setChartType] = useState("both");
  const [showLegend, setShowLegend] = useState(true);
  const [customTitle, setCustomTitle] = useState("Custom Chart");

  // axis label states
  const [xAxisLabel, setXAxisLabel] = useState("SNR (dB)");
  const [yLeftLabel, setYLeftLabel] = useState("Observed");
  const [yRightLabel, setYRightLabel] = useState("Selected (rate)");

  const onFiles = useCallback(async (files) => {
    const newSets = [];
    for (const f of files) {
      const text = await f.text();
      const { headers, rows } = robustParse(text);
      const mapped = mapColumns(rows, headers);
      newSets.push({ name: f.name, rows: mapped });
    }
    setDatasets((prev) => [...prev, ...newSets]);
  }, []);

  const handleFile = (e) => onFiles(e.target.files || []);
  const handleDrop = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer?.files || []);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Drop CSVs to visualize <b>SNR</b> vs <b>Selected (rate)</b> vs <b>Observed</b>.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl bg-gray-200 px-3 py-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload CSVs
          </button>
          <button
            className="rounded-xl bg-gray-200 px-3 py-2"
            onClick={() => setDatasets([])}
          >
            Clear
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.tsv"
            className="hidden"
            multiple
            onChange={handleFile}
          />
        </div>
      </header>

      {/* Chart Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium mr-2">Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mr-2">Title:</label>
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-48"
          />
        </div>

        <div>
          <label className="text-sm font-medium mr-2">Legend:</label>
          <input
            type="checkbox"
            checked={showLegend}
            onChange={(e) => setShowLegend(e.target.checked)}
          />
        </div>
      </div>

      {/* Axis Label Customization */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium mr-2">X-Axis Label:</label>
          <input
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-44"
          />
        </div>
        <div>
          <label className="text-sm font-medium mr-2">Y-Left Label:</label>
          <input
            value={yLeftLabel}
            onChange={(e) => setYLeftLabel(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-44"
          />
        </div>
        <div>
          <label className="text-sm font-medium mr-2">Y-Right Label:</label>
          <input
            value={yRightLabel}
            onChange={(e) => setYRightLabel(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-44"
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-gray-400"
      >
        <p className="font-medium">Drag & drop CSV/TXT files here</p>
        <p className="text-sm text-gray-500">
          Supports comma / tab / whitespace delimited
        </p>
      </div>

      {/* Charts + Table */}
      {datasets.length > 0 && (
        <div className="space-y-8">
          {datasets.map((d) => {
            const dBinned = binBySnr(d.rows, binSize);
            const sorted = [...d.rows].sort((a, b) => a.snr - b.snr);

            return (
              <ChartCard key={d.name} title={customTitle || d.name}>
                {/* --- Line Chart --- */}
                {chartType !== "bar" && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sorted} margin={{ top: 10, right: 60, left: 60, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="snr"
                        label={{ value: xAxisLabel, position: "insideBottom", dy: 20 }}
                      />
                      <YAxis
                        yAxisId="left"
                        width={56}  // reserve space for ticks + title
                        label={{ value: yLeftLabel, angle: -90, position: "insideLeft", offset: 12 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        width={56}
                        label={{ value: yRightLabel, angle: 90, position: "insideRight", offset: 12 }}
                      />
                      <Tooltip />
                      {showLegend && <Legend />}
                      <Line yAxisId="left" type="monotone" dataKey="observed" dot={false} strokeWidth={2} stroke="#3b82f6" />
                      <Line yAxisId="right" type="monotone" dataKey="selected" dot={false} strokeWidth={2} stroke="#f97316" />
                      <Brush dataKey="snr" height={16} stroke="#8884d8" y={270} />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* --- Bar Chart --- */}
                {chartType !== "line" && (
                  <div className="my-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={dBinned}
                        margin={{ top: 10, right: 85, left: 85, bottom: 40 }} // more padding on sides + bottom
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="snr"
                          label={{ value: xAxisLabel, position: "insideBottom", dy: 25 }}
                        />

                        {/* Left Y-axis */}
                        <YAxis
                          yAxisId="left"
                          width={80}
                          label={{
                            value: yLeftLabel,
                            angle: -90,
                            position: "insideLeft",
                            dx: -10,   // pushes text inward away from edge
                            dy: 10,    // vertically centers
                          }}
                        />

                        {/* Right Y-axis */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          width={80}
                          label={{
                            value: yRightLabel,
                            angle: 90,
                            position: "insideRight",
                            dx: 10,   // inward from right edge
                            dy: 10,
                          }}
                        />

                        <Tooltip />
                        {showLegend && <Legend />}

                        <Bar yAxisId="left" dataKey="observed" name="Observed (avg)" fill="#3b82f6" />
                        <Bar yAxisId="right" dataKey="selected" name="Selected (avg)" fill="#f97316" />

                        {/* Move brush slightly lower */}
                        <Brush dataKey="snr" height={16} stroke="#8884d8" y={272} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* --- Editable Table --- */}
                <DataTable
                  rows={d.rows}
                  onEdit={(newRows) =>
                    setDatasets((prev) =>
                      prev.map((ds) =>
                        ds.name === d.name ? { ...ds, rows: newRows } : ds
                      )
                    )
                  }
                />
              </ChartCard>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* =======================
   REUSABLE COMPONENTS
======================= */
function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h4 className="mb-3 font-semibold">{title}</h4>
      {children}
    </div>
  );
}

/* --- Restored DataTable --- */
function DataTable({ rows, onEdit }) {
  const [open, setOpen] = useState(false);

  if (!rows?.length) return null;
  const columns = Object.keys(rows[0]);

  const handleChange = (rowIndex, col, value) => {
    const updated = rows.map((r, i) =>
      i === rowIndex ? { ...r, [col]: toNum(value) ?? value } : r
    );
    onEdit(updated);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
      >
        {open ? "Hide Table" : "Show Table"}
      </button>

      {open && (
        <div className="overflow-x-auto mt-3 max-h-96 overflow-y-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 border-b text-left font-semibold"
                  >
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1 border-b">
                      <input
                        type="text"
                        value={r[col] ?? ""}
                        onChange={(e) => handleChange(i, col, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* --- parsing + mapping + binning helpers (same as before) --- */
function robustParse(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const header = lines[0];
  let delim = ",";
  if (header.includes("\t")) delim = "\t";
  else if (header.includes(";")) delim = ";";
  else if (/,/.test(header)) delim = ",";
  else delim = /\s+/;

  const headers = splitSmart(header, delim).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitSmart(lines[i], delim).map(c => c.trim());
    if (cols.length === 1 && !cols[0]) continue;
    rows.push(cols);
  }
  return { headers, rows };
}
function splitSmart(line, delim) {
  return delim instanceof RegExp ? line.split(delim).filter(Boolean) : line.split(delim);
}
function mapColumns(rowArrays, headers) {
  const idx = {
    snr: findIndex(headers, ["snr", "snr(db)", "snr_db", "snr-db"]),
    rate: findIndex(headers, ["rate", "802.11a-rate selected", "802.11a-rate", "selected"]),
    observed: findIndex(headers, ["observed", "802.11a-observed", "throughput", "obs"]),
  };
  return rowArrays.map(cols => ({
    snr: toNum(cols[idx.snr]),
    selected: toNum(cols[idx.rate]),
    observed: toNum(cols[idx.observed]),
  }));
}
function findIndex(headers, cands) {
  const keys = headers.map(h => h.toLowerCase());
  for (const c of cands) {
    const i = keys.findIndex(k => k === c || k.includes(c));
    if (i !== -1) return i;
  }
  for (let i = 0; i < headers.length; i++) {
    if (/\d/.test(headers[i])) return i;
  }
  return 0;
}
function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
function binBySnr(rows, binSize = 1) {
  const valid = (rows || []).filter(r => isFinite(r.snr));
  if (!valid.length) return [];
  const min = Math.min(...valid.map(r => r.snr));
  const bins = new Map();
  for (const r of valid) {
    const key = Math.round((r.snr - min) / binSize);
    const b = bins.get(key) || { snrSum: 0, n: 0, obsSum: 0, selSum: 0 };
    b.snrSum += r.snr;
    b.n += 1;
    if (isFinite(r.observed)) b.obsSum += r.observed;
    if (isFinite(r.selected)) b.selSum += r.selected;
    bins.set(key, b);
  }
  return [...bins.entries()]
    .map(([k, b]) => ({
      snr: b.snrSum / b.n,
      observed: b.n ? b.obsSum / b.n : undefined,
      selected: b.n ? b.selSum / b.n : undefined,
    }))
    .sort((a, b) => a.snr - b.snr);
}