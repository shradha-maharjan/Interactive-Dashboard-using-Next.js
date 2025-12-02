"use client";
import { useState, useMemo } from "react";

export function ConfigsPanel({ configs }) {
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const jsonPreview = useMemo(() => {
    if (!open) return "";
    try {
      const s = JSON.stringify(configs, null, 2);
      if (showFull || s.length <= 4000) return s;
      return s.slice(0, 4000) + "\n… (truncated)";
    } catch {
      return "Invalid config format.";
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
        <pre className="mt-3 text-sm overflow-auto bg-gray-50 p-3 rounded max-h-[50vh]">
          {jsonPreview}
        </pre>
      )}
    </details>
  );
}
