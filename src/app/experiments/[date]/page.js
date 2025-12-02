// // frontend/src/app/experiments/[date]/page.js
// import ExperimentClient from "./ExperimentClient";

// export default async function Page({ params }) {
//   const { date } = await params;   
//   return <ExperimentClient date={date} />;
// }

import fs from "fs";
import path from "path";
import ExperimentClient from "./ExperimentClient";

export const revalidate = 60;

export async function generateStaticParams() {
  const dataDir = process.env.DATA_DIR || "../data/wifi_general_results";
  const dates = fs.readdirSync(dataDir).filter((f) => /^\d+$/.test(f));
  return dates.map((date) => ({ date }));
}

export default async function Page({ params }) {
  const { date } = await params;
  const baseDir = path.join(process.env.DATA_DIR || "./data", date);
  const managers = fs
    .readdirSync(baseDir)
    .filter((f) => !f.startsWith(".") && fs.lstatSync(path.join(baseDir, f)).isDirectory());

  const data = { ok: true, simulations: managers };
  return <ExperimentClient date={date} initialData={data} />;
}
