"use client";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { sanitizeAndDecimate, toNum, fmt } from "./utils";

export function CsvPanel({ fileName, rows }) {
  const [open, setOpen] = useState(true);
  const decimated = useMemo(() => (open ? sanitizeAndDecimate(rows) : []), [open, rows]);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded border p-4">
      <summary className="font-semibold cursor-pointer">
        {fileName} — SNR vs Selected vs Observed
      </summary>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={decimated}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="snr" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dataKey="observed" stroke="#3b82f6" dot={false} />
          <Line dataKey="selected" stroke="#f97316" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </details>
  );
}
