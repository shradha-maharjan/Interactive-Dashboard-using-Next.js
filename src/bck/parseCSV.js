import Papa from "papaparse";

/**
 * Parse CSV or TXT file content into structured rows.
 * @param {string} url - URL (relative to /data/)
 */
export async function parseCSV(url) {
  const res = await fetch(url);
  const text = await res.text();

  const parsed = Papa.parse(text.trim(), { header: true });
  const rows = parsed.data.map((r) => ({
    snr: parseFloat(r["SNR(dB)"] || r["snr"] || r["SNR"] || 0),
    selected: parseFloat(
      r["802.11a-rate selected"] || r["selected"] || r["rate"] || 0
    ),
    observed: parseFloat(
      r["802.11a-observed"] || r["observed"] || r["throughput"] || 0
    ),
  }));

  return rows.filter((r) => !isNaN(r.snr));
}
