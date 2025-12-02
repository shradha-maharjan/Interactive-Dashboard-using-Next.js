// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
// } from "recharts";

// export default function SimulationClient({ date, manager }) {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     let abort = false;
//     (async () => {
//       try {
//         const r = await fetch(`/api/experiments/${date}/${manager}`);
//         const j = await r.json();
//         if (!abort) setData(j.ok ? j : { ok: false, error: "Failed to load" });
//       } catch (e) {
//         if (!abort) setData({ ok: false, error: String(e) });
//       }
//     })();
//     return () => { abort = true; };
//   }, [date, manager]);

//   if (!data) return <div className="p-6">Loading…</div>;
//   if (!data.ok) return <div className="p-6 text-red-600">Error: {data.error || "Unknown error"}</div>;

//   const { configs, results = [] } = data;

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">{date} / {manager}</h1>

//       <ConfigsPanel configs={configs} />

//       <div className="space-y-4">
//         {results.map((res, idx) => (
//           <CsvPanel
//             key={res.file || idx}
//             fileName={res.file}
//             rows={res.rows}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function ConfigsPanel({ configs }) {
//   const [open, setOpen] = useState(false);
//   const [showFull, setShowFull] = useState(false);

//   const jsonPreview = useMemo(() => {
//     if (!open) return "";
//     try {
//       const s = JSON.stringify(configs, null, 2);
//       if (showFull || s.length <= 5000) return s;
//       return s.slice(0, 5000) + "\n… (truncated)";
//     } catch {
//       return "Unable to render configuration JSON.";
//     }
//   }, [configs, open, showFull]);

//   return (
//     <details className="rounded border p-4" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
//       <summary className="cursor-pointer font-semibold">Configuration (click to open)</summary>

//       {open && (
//         <div className="mt-3 space-y-2">
//           <div className="text-sm text-gray-600">
//             Large configs are truncated for performance.
//             {" "}
//             {!showFull && <button className="underline" onClick={() => setShowFull(true)}>Show full</button>}
//             {showFull && <button className="underline" onClick={() => setShowFull(false)}>Show less</button>}
//           </div>
//           <pre className="text-sm overflow-auto bg-gray-50 p-3 rounded max-h-[50vh]">
// {jsonPreview}
//           </pre>
//         </div>
//       )}
//     </details>
//   );
// }

// function CsvPanel({ fileName, rows }) {
//   const [open, setOpen] = useState(true);         
//   const [showTable, setShowTable] = useState(false);
//   const [page, setPage] = useState(1);
//   const pageSize = 100;

//   const decimated = useMemo(
//     () => (open ? sanitizeAndDecimate(rows) : []),
//     [open, rows]
//   );

//   const tableRows = useMemo(() => {
//     return (rows || [])
//       .map(r => ({
//         snr: toNum(r?.snr),
//         selected: toNum(r?.rate),   
//         observed: toNum(r?.observed),
//       }))
//       .filter(r =>
//         Number.isFinite(r.snr) &&
//         (Number.isFinite(r.observed) || Number.isFinite(r.selected))
//       )
//       .sort((a, b) => a.snr - b.snr);
//   }, [rows]);

//   const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize));
//   const paged = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return tableRows.slice(start, start + pageSize);
//   }, [tableRows, page]);

//   // CSV download (client-side)
//   const downloadCsv = () => {
//     const header = "snr,selected,observed\n";
//     const body = tableRows
//       .map(r => [r.snr, r.selected ?? "", r.observed ?? ""].join(","))
//       .join("\n");
//     const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = fileName?.replace(/\.csv$/i, "") + "-clean.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <details className="rounded border p-4" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
//       <summary className="cursor-pointer font-semibold">
//         {fileName} — SNR vs Selected vs Observed {open ? `(${decimated.length} pts)` : ""}
//       </summary>

//       {open && (
//         <div className="mt-3 space-y-3">
//           {/* Chart */}
//           <ResponsiveContainer width="100%" height={360}>
//             <LineChart data={decimated}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="snr" label={{ value: "SNR (dB)", position: "insideBottom", dy: 10 }} />
//               <YAxis yAxisId="left" label={{ value: "Observed", angle: -90, position: "insideLeft" }} />
//               <YAxis yAxisId="right" orientation="right" label={{ value: "Selected (rate)", angle: 90, position: "insideRight" }} />
//               <Tooltip />
//               <Legend />
//               <Line yAxisId="left" type="monotone" dataKey="observed" name="Observed" dot={false} strokeWidth={2} />
//               <Line yAxisId="right" type="monotone" dataKey="selected" name="Selected (rate)" dot={false} strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>

//           {/* Table controls */}
//           <div className="flex flex-wrap items-center gap-2">
//             <button
//               className="rounded bg-gray-100 px-3 py-1 text-sm"
//               onClick={() => setShowTable(s => !s)}
//             >
//               {showTable ? "Hide table" : "Show table"}
//             </button>
//             {showTable && (
//               <>
//                 <span className="text-sm text-gray-600">
//                   {tableRows.length} rows • page {page} / {totalPages}
//                 </span>
//                 <div className="ml-auto flex items-center gap-2">
//                   <button
//                     className="rounded bg-gray-100 px-2 py-1 text-sm disabled:opacity-50"
//                     disabled={page <= 1}
//                     onClick={() => setPage(p => Math.max(1, p - 1))}
//                   >
//                     ◀ Prev
//                   </button>
//                   <button
//                     className="rounded bg-gray-100 px-2 py-1 text-sm disabled:opacity-50"
//                     disabled={page >= totalPages}
//                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                   >
//                     Next ▶
//                   </button>
//                   <button className="rounded bg-indigo-600 px-3 py-1 text-sm text-white" onClick={downloadCsv}>
//                     Download CSV
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Table */}
//           {showTable && (
//             <div className="overflow-auto rounded border">
//               <table className="min-w-full text-sm">
//                 <thead className="sticky top-0 bg-gray-100">
//                   <tr>
//                     <th className="px-3 py-2 text-left font-medium">#</th>
//                     <th className="px-3 py-2 text-left font-medium">SNR (dB)</th>
//                     <th className="px-3 py-2 text-left font-medium">Selected (rate)</th>
//                     <th className="px-3 py-2 text-left font-medium">Observed</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paged.map((r, i) => (
//                     <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
//                       <td className="px-3 py-2">{(page - 1) * pageSize + i + 1}</td>
//                       <td className="px-3 py-2">{fmt(r.snr)}</td>
//                       <td className="px-3 py-2">{fmt(r.selected)}</td>
//                       <td className="px-3 py-2">{fmt(r.observed)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </details>
//   );
// }

// // number helpers (reuse in file)
// function toNum(v) {
//   const n = Number(String(v ?? "").replace(/,/g, ""));
//   return Number.isFinite(n) ? n : undefined;
// }
// function fmt(v) {
//   if (v == null || !Number.isFinite(v)) return "—";
//   if (Math.abs(v) >= 1000) return v.toFixed(0);
//   if (Math.abs(v) >= 100) return v.toFixed(1);
//   if (Math.abs(v) >= 10) return v.toFixed(2);
//   return v.toFixed(3);
// }


// function sanitizeAndDecimate(rows, maxPts = 300) {
//   const valid = (rows || [])
//     .map(r => ({
//       snr: toNum(r?.snr),
//       observed: toNum(r?.observed),
//       selected: toNum(r?.rate), // <- map rate -> selected
//     }))
//     .filter(r => Number.isFinite(r.snr) && (Number.isFinite(r.observed) || Number.isFinite(r.selected)))
//     .sort((a, b) => a.snr - b.snr);

//   if (valid.length <= maxPts) return valid;

//   const minS = valid[0].snr;
//   const maxS = valid[valid.length - 1].snr;
//   const binSize = Math.max((maxS - minS) / maxPts, 0.5);

//   const bins = new Map();
//   for (const p of valid) {
//     const idx = Math.floor((p.snr - minS) / binSize);
//     const b = bins.get(idx) || { snrSum: 0, obsSum: 0, selSum: 0, n: 0 };
//     b.snrSum += p.snr;
//     if (Number.isFinite(p.observed)) b.obsSum += p.observed;
//     if (Number.isFinite(p.selected)) b.selSum += p.selected;
//     b.n += 1;
//     bins.set(idx, b);
//   }

//   return [...bins.entries()]
//     .map(([, b]) => ({
//       snr: b.snrSum / b.n,
//       observed: b.obsSum ? b.obsSum / b.n : undefined,
//       selected: b.selSum ? b.selSum / b.n : undefined,
//     }))
//     .filter(p => Number.isFinite(p.snr))
//     .sort((a, b) => a.snr - b.snr);
// }

// function toNum(v) {
//   const n = Number(String(v ?? "").replace(/,/g, ""));
//   return Number.isFinite(n) ? n : undefined;
// // }


"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function SimulationClient({ date, manager, initialData }) {
  const [data] = useState(initialData);
  if (!data?.ok)
    return (
      <div className="p-6 text-red-600">
        Error loading data for {date}/{manager}
      </div>
    );

  const { configs, results = [] } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {date} / {manager}
      </h1>

      <ConfigsPanel configs={configs} />

      <div className="space-y-4">
        {results.map((res, idx) => (
          <CsvPanel key={res.file || idx} fileName={res.file} rows={res.rows} />
        ))}
      </div>
    </div>
  );
}

function ConfigsPanel({ configs }) {
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const jsonPreview = useMemo(() => {
    if (!open) return "";
    try {
      const s = JSON.stringify(configs, null, 2);
      if (showFull || s.length <= 5000) return s;
      return s.slice(0, 5000) + "\n… (truncated)";
    } catch {
      return "Unable to render configuration JSON.";
    }
  }, [configs, open, showFull]);

  return (
    <details
      className="rounded border p-4"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold">
        Configuration (click to open)
      </summary>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="text-sm text-gray-600">
            Large configs are truncated for performance.{" "}
            {!showFull && (
              <button
                className="underline"
                onClick={() => setShowFull(true)}
              >
                Show full
              </button>
            )}
            {showFull && (
              <button
                className="underline"
                onClick={() => setShowFull(false)}
              >
                Show less
              </button>
            )}
          </div>
          <pre className="text-sm overflow-auto bg-gray-50 p-3 rounded max-h-[50vh]">
            {jsonPreview}
          </pre>
        </div>
      )}
    </details>
  );
}

function CsvPanel({ fileName, rows }) {
  const [open, setOpen] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const decimated = useMemo(
    () => (open ? sanitizeAndDecimate(rows) : []),
    [open, rows]
  );

  const tableRows = useMemo(() => {
    return (rows || [])
      .map((r) => ({
        snr: toNum(r?.snr),
        selected: toNum(r?.rate),
        observed: toNum(r?.observed),
      }))
      .filter(
        (r) =>
          Number.isFinite(r.snr) &&
          (Number.isFinite(r.observed) || Number.isFinite(r.selected))
      )
      .sort((a, b) => a.snr - b.snr);
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableRows.slice(start, start + pageSize);
  }, [tableRows, page]);

  const downloadCsv = () => {
    const header = "snr,selected,observed\n";
    const body = tableRows
      .map((r) => [r.snr, r.selected ?? "", r.observed ?? ""].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName?.replace(/\.csv$/i, "") + "-clean.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <details
      className="rounded border p-4"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold">
        {fileName} — SNR vs Selected vs Observed{" "}
        {open ? `(${decimated.length} pts)` : ""}
      </summary>

      {open && (
        <div className="mt-3 space-y-3">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={decimated}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="snr"
                label={{
                  value: "SNR (dB)",
                  position: "insideBottom",
                  dy: 10,
                }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Observed",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Selected (rate)",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="observed"
                name="Observed"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="selected"
                name="Selected (rate)"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded bg-gray-100 px-3 py-1 text-sm"
              onClick={() => setShowTable((s) => !s)}
            >
              {showTable ? "Hide table" : "Show table"}
            </button>
            {showTable && (
              <>
                <span className="text-sm text-gray-600">
                  {tableRows.length} rows • page {page} / {totalPages}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="rounded bg-gray-100 px-2 py-1 text-sm disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ◀ Prev
                  </button>
                  <button
                    className="rounded bg-gray-100 px-2 py-1 text-sm disabled:opacity-50"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next ▶
                  </button>
                  <button
                    className="rounded bg-indigo-600 px-3 py-1 text-sm text-white"
                    onClick={downloadCsv}
                  >
                    Download CSV
                  </button>
                </div>
              </>
            )}
          </div>

          {showTable && (
            <div className="overflow-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">
                      SNR (dB)
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Selected (rate)
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Observed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-3 py-2">{fmt(r.snr)}</td>
                      <td className="px-3 py-2">{fmt(r.selected)}</td>
                      <td className="px-3 py-2">{fmt(r.observed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </details>
  );
}

function toNum(v) {
  if (v === null || v === undefined) return undefined;

  const s = String(v).trim();
  if (s === "") return undefined; 

  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
function fmt(v) {
  if (v == null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1000) return v.toFixed(0);
  if (Math.abs(v) >= 100) return v.toFixed(1);
  if (Math.abs(v) >= 10) return v.toFixed(2);
  return v.toFixed(3);
}
function sanitizeAndDecimate(rows, maxPts = 300) {
  const valid = (rows || [])
    .map((r) => ({
      snr: toNum(r?.snr),
      observed: toNum(r?.observed),
      selected: toNum(r?.rate),
    }))
    .filter(
      (r) =>
        Number.isFinite(r.snr) &&
        (Number.isFinite(r.observed) || Number.isFinite(r.selected))
    )
    .sort((a, b) => a.snr - b.snr);

  if (valid.length <= maxPts) return valid;

  const minS = valid[0].snr;
  const maxS = valid[valid.length - 1].snr;
  const binSize = Math.max((maxS - minS) / maxPts, 0.5);

  const bins = new Map();
  for (const p of valid) {
    const idx = Math.floor((p.snr - minS) / binSize);
    const b = bins.get(idx) || { snrSum: 0, obsSum: 0, selSum: 0, n: 0 };
    b.snrSum += p.snr;
    if (Number.isFinite(p.observed)) b.obsSum += p.observed;
    if (Number.isFinite(p.selected)) b.selSum += p.selected;
    b.n += 1;
    bins.set(idx, b);
  }

  return [...bins.values()]
    .map((b) => ({
      snr: b.snrSum / b.n,
      observed: b.obsSum ? b.obsSum / b.n : undefined,
      selected: b.selSum ? b.selSum / b.n : undefined,
    }))
    .filter((p) => Number.isFinite(p.snr))
    .sort((a, b) => a.snr - b.snr);
}
