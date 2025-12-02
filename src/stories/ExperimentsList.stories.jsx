
import React, { useEffect, useState } from "react";
import { scanDataDir } from "./utils/scanDataDir";

export default {
  title: "Pages/Experiment List",
};

export const ExperimentsList = () => {
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    (async () => {
      const { experiments } = await scanDataDir();
      setExperiments(experiments);
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Experiments</h1>
      {!experiments.length && <p className="text-gray-500">Loading...</p>}
      <ul className="grid md:grid-cols-2 gap-3">
        {experiments.map((e) => (
          <li key={e.name} className="rounded border p-4 bg-white shadow-sm">
            <div className="font-semibold">{e.name}</div>
            <div className="text-sm text-gray-600">{e.managers.length} managers</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
