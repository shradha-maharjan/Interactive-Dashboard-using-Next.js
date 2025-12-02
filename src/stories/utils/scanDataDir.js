// frontend/src/stories/utils/scanDataDir.js
export async function scanDataDir() {
  try {
    const res = await fetch("/data/data_index.json", { cache: "no-store" });
    if (!res.ok) {
      console.warn("data_index.json not found or invalid status:", res.status);
      return { experiments: [] };
    }

    const json = await res.json();

    // Validate structure
    if (!json || !Array.isArray(json.experiments)) {
      console.warn("Invalid data_index.json format:", json);
      return { experiments: [] };
    }

    console.log(`Loaded ${json.experiments.length} experiments`);
    return json; // { experiments: [...] }
  } catch (err) {
    console.error("Failed to load data_index.json:", err);
    return { experiments: [] };
  }
}
