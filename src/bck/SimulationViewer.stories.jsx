// frontend/src/stories/SimulationViewer.stories.jsx
import SimulationViewer from "../components/SimulationViewer";

export default {
  title: "Pages/Simulation Viewer",
  component: SimulationViewer,
};

export const Default = () => (
  <SimulationViewer
    manager={{
      name: "manager_Minstrel",
      csvs: [
        "wifi_general_results/20250818_232455/manager_Minstrel/wifi-manager-example-Minstrel-802.11a.csv",
        "wifi_general_results/20250818_232455/manager_Minstrel/stdout.txt",
      ],
    }}
    onBack={() => alert("Back clicked")}
  />
);
