"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from "recharts";

const COLORS = [
  "#3b82f6", "#f97316", "#10b981", "#ef4444", "#6366f1",
  "#14b8a6", "#8b5cf6", "#f59e0b", "#ec4899", "#22d3ee"
];

function dynamicColor(i) {
  return COLORS[i % COLORS.length];
}

export default function DashboardPage({ initialDatasets = [] }) {
  const [datasets, setDatasets] = useState(initialDatasets);

  // Dynamic columns: { id: "col_1", name: "Column 1" }
  const [extraColumns, setExtraColumns] = useState([]);

  const fileInputRef = useRef(null);
  const [binSize, setBinSize] = useState(1);
  const [chartType, setChartType] = useState("both");
  const [showLegend, setShowLegend] = useState(true);
  const [customTitle, setCustomTitle] = useState("Custom Chart");

  // Axis labels
  const [xAxisLabel, setXAxisLabel] = useState("SNR (dB)");
  const [yLeftLabel, setYLeftLabel] = useState("Value");

  // Global page zoom
  const [pageZoom, setPageZoom] = useState(1);
  const handleGlobalZoomIn = () => setPageZoom((z) => Math.min(z * 1.25, 2));
  const handleGlobalZoomOut = () => setPageZoom((z) => Math.max(z / 1.25, 0.5));
  const handleGlobalZoomReset = () => setPageZoom(1);

  /* ========== FILE UPLOAD ========== */
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

  const handleDrop = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer?.files || []);
  };

  /* ========== KEYBOARD SHORTCUTS ========== */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "=") {
        e.preventDefault();
        handleGlobalZoomIn();
      } else if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        handleGlobalZoomOut();
      } else if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        handleGlobalZoomReset();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      
      {/* ========== HEADER ========== */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Drop CSVs to visualize SNR vs Selected vs Observed + custom columns.
          </p>
        </div>

        {/* GLOBAL ZOOM */}
        <div className="flex gap-2 items-center">
          <button onClick={handleGlobalZoomOut} disabled={pageZoom <= 0.5}
            className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 disabled:opacity-50">−</button>
          <button onClick={handleGlobalZoomIn} disabled={pageZoom >= 2}
            className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 disabled:opacity-50">+</button>
          <button onClick={handleGlobalZoomReset}
            className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300">Reset</button>
        </div>
      </header>

      {/* Zoom Wrapper */}
      <div style={{
        transform: `scale(${pageZoom})`,
        transformOrigin: "top left",
        transition: "transform 0.3s ease",
      }}>

        {/* ========== CHART CONTROLS ========== */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          
          {/* Chart Type */}
          <div>
            <label className="text-sm font-medium mr-2">Chart Type:</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}
              className="border rounded px-2 py-1 text-sm">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mr-2">Title:</label>
            <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-48"/>
          </div>

          {/* Legend */}
          <div>
            <label className="text-sm font-medium mr-2">Legend:</label>
            <input type="checkbox" checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)} />
          </div>
        </div>

        {/* ========== AXIS LABELS ========== */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium mr-2">X-Axis Label:</label>
            <input value={xAxisLabel} onChange={(e) => setXAxisLabel(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-44"/>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Y-Left Label:</label>
            <input value={yLeftLabel} onChange={(e) => setYLeftLabel(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-44"/>
          </div>
        </div>

        {/* ========== ADD COLUMN BUTTON + EDITOR ========== */}
        <div className="mb-4">
          <button
            className="rounded bg-blue-500 text-white px-3 py-1 text-sm hover:bg-blue-600"
            onClick={() => {
              if (extraColumns.length >= 10) return;

              const id = `col_${extraColumns.length + 1}`;
              const name = `Column ${extraColumns.length + 1}`;

              setExtraColumns(prev => [...prev, { id, name }]);

              setDatasets(prev =>
                prev.map(ds => ({
                  ...ds,
                  rows: ds.rows.map(r => ({ ...r, [id]: 0 }))  // numeric init
                }))
              );
            }}
          >
            + Add Column (max 10)
          </button>
        </div>

        {/* Editable Column Names */}
        {extraColumns.length > 0 && (
          <div className="mb-6 space-y-2 border p-3 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-sm">Custom Column Names</h3>

            {extraColumns.map((col) => (
              <div key={col.id} className="flex items-center gap-2">
                <label className="text-sm w-20">{col.id}:</label>
                <input
                  value={col.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setExtraColumns(prev =>
                      prev.map(c =>
                        c.id === col.id ? { ...c, name: newName } : c
                      )
                    );
                  }}
                  className="border rounded px-2 py-1 text-sm w-60"
                />
              </div>
            ))}
          </div>
        )}

        {/* ========== DRAG & DROP ZONE ========== */}
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

        {/* ========== CHARTS FOR DATASETS ========== */}
        {datasets.length > 0 && (
          <div className="space-y-8">
            {datasets.map((d) => {
              const dBinned = binBySnr(d.rows, binSize);
              const sorted = [...d.rows].sort((a, b) => a.snr - b.snr);

              return (
                <ChartCard key={d.name} title={customTitle || d.name}>
                  
                  {/* LINE CHART */}
                  {chartType !== "bar" && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={sorted}
                        margin={{ top: 10, right: 50, left: 120, bottom: 40 }}>
                        
                        <CartesianGrid strokeDasharray="3 3" />
                        
                        <XAxis dataKey="snr"
                          label={{ value: xAxisLabel, position: "insideBottom", dy: 25 }}
                        />

                        <YAxis yAxisId="left" width={100}
                          label={{
                            value: yLeftLabel,
                            angle: -90,
                            position: "outsideLeft",
                            dy: 35,
                          }}
                        />

                        <Tooltip />
                        {showLegend && (
                          <Legend verticalAlign="bottom" align="center"
                            wrapperStyle={{ paddingTop: 30 }}
                          />
                        )}

                        {/* Dynamic Lines */}
                        {Object.keys(sorted[0])
                          .filter((k) => k !== "snr")
                          .map((colKey, i) => {
                            const meta = extraColumns.find(c => c.id === colKey);
                            const displayName = meta ? meta.name : colKey;

                            return (
                              <Line
                                key={colKey}
                                yAxisId="left"
                                type="monotone"
                                dataKey={colKey}
                                name={displayName}
                                stroke={dynamicColor(i)}
                                strokeWidth={2}
                                dot={false}
                              />
                            );
                          })}
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* BAR CHART */}
                  {chartType !== "line" && dBinned.length > 0 && (
                    <div className="my-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dBinned}
                          margin={{ top: 10, right: 50, left: 120, bottom: 40 }}>
                          
                          <CartesianGrid strokeDasharray="3 3" />

                          <XAxis dataKey="snr"
                            label={{
                              value: xAxisLabel,
                              position: "insideBottom",
                              dy: 25
                            }}
                          />

                          <YAxis yAxisId="left" width={100}
                            label={{
                              value: yLeftLabel,
                              angle: -90,
                              position: "outsideLeft",
                              dy: 35
                            }}
                          />

                          <Tooltip />
                          {showLegend && (
                            <Legend verticalAlign="bottom" align="center"
                              wrapperStyle={{ paddingTop: 30 }}
                            />
                          )}

                          {/* Dynamic Bars */}
                          {Object.keys(dBinned[0])
                            .filter((k) => k !== "snr")
                            .map((colKey, i) => {
                              const meta = extraColumns.find(c => c.id === colKey);
                              const displayName = meta ? meta.name : colKey;

                              return (
                                <Bar
                                  key={colKey}
                                  yAxisId="left"
                                  dataKey={colKey}
                                  name={displayName}
                                  fill={dynamicColor(i)}
                                />
                              );
                            })}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* DATA TABLE */}
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
                  <th key={col}
                    className="px-3 py-2 border-b text-left font-semibold">
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1 border-b">
                      <input
                        type="text"
                        value={row[col] ?? ""}
                        onChange={(e) => handleChange(idx, col, e.target.value)}
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

function robustParse(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return { headers: [], rows: [] };

  const header = lines[0];
  let delim = ",";
  if (header.includes("\t")) delim = "\t";
  else if (header.includes(";")) delim = ";";
  else if (/,/.test(header)) delim = ",";
  else delim = /\s+/;

  const headers = splitSmart(header, delim).map((h) => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitSmart(lines[i], delim).map((c) => c.trim());
    if (cols.length === 1 && !cols[0]) continue;
    rows.push(cols);
  }

  return { headers, rows };
}

function splitSmart(line, delim) {
  return delim instanceof RegExp
    ? line.split(delim).filter(Boolean)
    : line.split(delim);
}

function mapColumns(rowArrays, headers) {
  const idx = {
    snr: findIndex(headers, ["snr", "snr(db)", "snr_db", "snr-db"]),
    rate: findIndex(headers, ["rate", "802.11a-rate selected", "802.11a-rate", "selected"]),
    observed: findIndex(headers, ["observed", "802.11a-observed", "throughput", "obs"]),
  };

  return rowArrays.map((cols) => ({
    snr: toNum(cols[idx.snr]),
    selected: toNum(cols[idx.rate]),
    observed: toNum(cols[idx.observed]),
  }));
}

function findIndex(headers, candidates) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lower.findIndex((k) => k === c || k.includes(c));
    if (i !== -1) return i;
  }
  return 0; // fallback
}

function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function binBySnr(rows, binSize = 1) {
  const valid = (rows || []).filter((r) => isFinite(r.snr));
  if (!valid.length) return [];

  const min = Math.min(...valid.map((r) => r.snr));
  const bins = new Map();

  for (const r of valid) {
    const key = Math.round((r.snr - min) / binSize);

    if (!bins.has(key)) {
      bins.set(key, { snrSum: 0, n: 0, sums: {} });
    }

    const b = bins.get(key);

    b.snrSum += r.snr;
    b.n += 1;

    for (const col of Object.keys(r)) {
      if (col === "snr") continue;

      if (!b.sums[col]) b.sums[col] = 0;

      if (isFinite(r[col])) {
        b.sums[col] += r[col];
      }
    }
  }

  return [...bins.entries()]
    .map(([k, b]) => {
      const row = { snr: b.snrSum / b.n };

      for (const col of Object.keys(b.sums)) {
        row[col] = b.sums[col] / b.n;
      }

      return row;
    })
    .sort((a, b) => a.snr - b.snr);
}
