/**
 * Dynamically scans the /data folder structure and builds:
 * {
 *   experiments: [
 *     {
 *       name: "20250818_232455",
 *       managers: [
 *         {
 *           name: "manager_Minstrel",
 *           csvs: ["wifi-manager-example-Minstrel-802.11a.csv", ...]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
// frontend/src/stories/utils/loadDataDir.js
export async function scanDataDir() {
  try {
    // Step 1: Fetch the top-level directory (e.g., /data/wifi_general_results/)
    const base = "/data/wifi_general_results/";
    const res = await fetch(base);
    const html = await res.text();

    // Step 2: Parse HTML links from directory listing
    const experimentFolders = [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => h.endsWith("/"))
      .filter((h) => !h.startsWith("?") && !h.startsWith("/"))
      .map((h) => h.replace(/\/$/, "")); // remove trailing slash

    // Step 3: For each experiment folder, fetch its managers (subfolders)
    const experiments = [];
    for (const exp of experimentFolders) {
      const expUrl = `${base}${exp}/`;
      const subRes = await fetch(expUrl);
      const subHtml = await subRes.text();

      const managerFolders = [...subHtml.matchAll(/href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((h) => h.endsWith("/"))
        .filter((h) => !h.startsWith("?") && !h.startsWith("/"))
        .map((h) => h.replace(/\/$/, ""));

      const managers = [];
      for (const mgr of managerFolders) {
        const mgrUrl = `${expUrl}${mgr}/`;
        const mgrRes = await fetch(mgrUrl);
        const mgrHtml = await mgrRes.text();

        // Find CSVs inside each manager folder
        const csvFiles = [...mgrHtml.matchAll(/href="([^"]+\.csv)"/g)].map(
          (m) => m[1]
        );

        managers.push({ name: mgr, csvs: csvFiles });
      }

      experiments.push({ name: exp, managers });
    }

    console.log("Experiments scanned:", experiments);
    return { ok: true, experiments };
  } catch (err) {
    console.error("Error scanning data dir:", err);
    return { ok: false, experiments: [] };
  }
}
