
import React, { useEffect, useState } from "react";
import SimulationViewer from "../components/SimulationViewer"; 

const INDEX_JSON_PATH = "/data/data_index.json";

export default {
  title: "Pages/Experiment Managers",
};

export const Default = () => {
  const [experimentName, setExperimentName] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(INDEX_JSON_PATH);
        const data = await res.json();

        const experiment = data.experiments[0];
        const managerGroup = experiment.managers[0];

        // Extract unique manager folder names
        const managerFolders = [
          ...new Set(managerGroup.csvs.map((p) => p.split("/")[2])),
        ];

        setExperimentName(managerGroup.name);
        setManagers(managerFolders);
      } catch (err) {
        console.error("Error loading index.json:", err);
      }
    }

    loadData();
  }, []);

  // Show charts for selected manager
  if (selectedManager) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => setSelectedManager(null)}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back to Managers
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {selectedManager} — Experiment {experimentName}
        </h2>

        {/* Simulation Viewer loads charts/config/table here */}
        <SimulationViewer
          experiment={experimentName}
          manager={selectedManager}
          basePath={`/data/wifi_general_results/${experimentName}/${selectedManager}`}
        />
      </div>
    );
  }

  // Default: show manager list
  if (!experimentName) {
    return (
      <div className="p-8 text-gray-500 text-sm">Loading experiment...</div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">
        Experiment {experimentName}
      </h2>

      {!managers.length && (
        <p className="text-gray-500 text-sm">Loading managers...</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {managers.map((name) => (
          <div
            key={name}
            className="border rounded-md bg-white shadow-sm p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedManager(name)}
          >
            <div className="font-semibold">{name}</div>
            <span className="text-blue-600 text-sm underline">Open</span>
          </div>
        ))}
      </div>
    </div>
  );
};
