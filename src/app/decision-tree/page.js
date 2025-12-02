"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar,
} from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as htmlToImage from "html-to-image";

export default function DecisionTreePage() {
  const [data, setData] = useState(null);
  const [csvInfo, setCsvInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // CHART VISIBILITY
  const [visibleCharts, setVisibleCharts] = useState({
    accuracy: true,
    metrics: true,
    trainTest: true,
    featureImportance: true,
    confusion: true,
    roc: true,
    cv: true
  });

  const handleToggle = (chart) => {
    setVisibleCharts((prev) => ({ ...prev, [chart]: !prev[chart] }));
  };

  // DRAG ORDER
  const [chartOrder, setChartOrder] = useState([
    "accuracy",
    "metrics",
    "trainTest",
    "featureImportance",
    "confusion",
    "roc",
    "cv"
  ]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setChartOrder(reorder(chartOrder, result.source.index, result.destination.index));
  };

  const chartTitles = {
  accuracy: "Model Accuracy",
  metrics: "Model Metrics",
  trainTest: "Train vs Test Accuracy",
  featureImportance: "Feature Importance",
  confusion: "Confusion Matrix",
  roc: "ROC Curve",
  cv: "Cross-Validation Scores"
};

  // CHART REFS FOR PNG EXPORT
  const chartRefs = {
    accuracy: useRef(null),
    metrics: useRef(null),
    trainTest: useRef(null),
    featureImportance: useRef(null),
    confusion: useRef(null),
    roc: useRef(null),
    cv: useRef(null),
  };

  const downloadChartImage = async (chartKey) => {
    const ref = chartRefs[chartKey];
    if (!ref?.current) return;

    const dataUrl = await htmlToImage.toPng(ref.current, { quality: 1.0 });
    const link = document.createElement("a");
    link.download = `${chartKey}.png`;
    link.href = dataUrl;
    link.click();
  };

  // CSV UPLOAD HANDLER
  const handleDrop = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setData(null);
    setCsvInfo(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Invalid file type. Please upload a .csv file.");
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const header = lines[0].split(",").map((col) => col.trim());
      const firstRow = lines[1]?.split(",");

      if (header.length < 2) {
        setErrorMsg("CSV must include multiple feature columns + one target column.");
        setLoading(false);
        return;
      }

      if (firstRow?.every((v) => !isNaN(parseFloat(v)))) {
        setErrorMsg("Last column must be categorical target.");
        setLoading(false);
        return;
      }

      setCsvInfo({ header, firstRow });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "decision_tree");

      const res = await fetch("/api/run-ml", { method: "POST", body: formData });
      const result = await res.json();

      result.error ? setErrorMsg(result.error) : setData(result);

    } catch {
      setErrorMsg("CSV processing error");
    }

    setLoading(false);
  };

  // JSON RESULT DOWNLOAD
  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decision_tree_results.json";
    link.click();
  };

  // ------------------- UI START --------------------
  return (
    <div className="p-8 text-center">

      <h1 className="text-4xl font-bold mb-4">Decision Tree</h1>

      <p className="text-gray-700 max-w-3xl mx-auto mb-8 text-justify leading-relaxed">
        A Decision Tree is a non-parametric supervised learning method used for classification and regression tasks.
        It works by recursively splitting data into subsets based on feature values, forming a tree-like structure where
        each internal node represents a decision rule and each leaf node represents an outcome.
        Decision Trees are easy to interpret and visualize but may overfit without pruning or depth control.
      </p>

      {/* CSV DROP ZONE */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-dashed border-2 border-black p-16 rounded-lg text-lg bg-gray-50 hover:bg-gray-100 transition"
      >
        {loading ? "Processing..." : "Drag & Drop CSV File Here"}
      </div>

      {/* CSV ERROR */}
      {errorMsg && (
        <div className="mt-6 text-red-700 font-semibold bg-red-50 border border-red-300 rounded-md p-4 max-w-2xl mx-auto">
          {errorMsg}
          <p className="text-sm text-gray-700 mt-2">
            Expected format: your CSV should have multiple <b>numeric feature columns</b> and
            a final <b>categorical target column</b>. Example:
          </p>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 text-left">
{`feature1,feature2,feature3,target
5.1,3.5,1.4,setosa
4.9,3.0,1.4,setosa
6.2,3.4,5.4,virginica`}
          </pre>
        </div>
      )}

      {/* CSV SCHEMA */}
      {csvInfo && (
        <div className="mt-8 text-left max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Dataset Schema</h2>
          <table className="border-collapse border border-gray-400 mx-auto w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Column</th>
                <th className="border p-2">Example</th>
                <th className="border p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {csvInfo.header.map((col, i) => (
                <tr key={i}>
                  <td className="border p-2">{col}</td>
                  <td className="border p-2">{csvInfo.firstRow?.[i] || "-"}</td>
                  <td className="border p-2">
                    {i === csvInfo.header.length - 1 ? "Target (Label)" : "Feature (Input)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODEL RESULTS */}
      {data && !data.error && (
        <div className="mt-12">

          {/* MODEL OVERVIEW */}
          <h2 className="text-2xl font-semibold mb-4">Model Overview</h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-justify mb-8">
            The uploaded dataset was standardized and split into training (70%) and testing (30%) sets.
            A Decision Tree classifier was then trained to predict the target variable using the numerical features.
            The following sections present the model’s performance metrics and interpretability charts.
          </p>

          {/* METRIC DESCRIPTIONS */}
          <div className="max-w-4xl mx-auto text-left bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Evaluation Metrics Explained</h2>
            <ul className="list-disc ml-6 text-gray-700 text-sm leading-relaxed">
              <li><b>Accuracy</b>: Proportion of correctly predicted samples.</li>
              <li><b>Precision</b>: Fraction of relevant instances among retrieved ones.</li>
              <li><b>Recall</b>: Fraction of relevant instances successfully retrieved.</li>
              <li><b>F1-Score</b>: Harmonic mean of precision and recall, balancing both.</li>
            </ul>
          </div>

          {/* VISIBILITY PANEL */}
          <div className="bg-gray-50 p-4 rounded-lg shadow max-w-3xl mx-auto mt-10 mb-10">
            <h2 className="text-xl font-semibold mb-2">Show or Hide Charts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-sm">
              {Object.keys(visibleCharts).map((chartKey) => (
                <label key={chartKey} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleCharts[chartKey]}
                    onChange={() => handleToggle(chartKey)}
                  />
                  <span>{chartTitles[chartKey]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* -------- DRAG & DROP CHART GRID -------- */}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="charts">
              {(provided) => (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >

                  {chartOrder.map((key, index) =>
                    visibleCharts[key] && (
                      <Draggable key={key} draggableId={key} index={index}>
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className="cursor-move"
                          >

                            {/* -------------------------------------------
                                  CHART BLOCKS WITH PNG DOWNLOAD BUTTONS
                               ------------------------------------------- */}

                            {{
                              accuracy: (
                                <div ref={chartRefs.accuracy} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Model Accuracy</h2>
                                    <button
                                      onClick={() => downloadChartImage("accuracy")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <ResponsiveContainer width="100%" height={250}>
                                    <RadialBarChart
                                      cx="50%" cy="50%" innerRadius="80%" outerRadius="100%"
                                      barSize={20}
                                      data={[{ name: "Accuracy", value: data.model_accuracy[0] * 100 }]}
                                      startAngle={90} endAngle={-270}
                                    >
                                      <RadialBar dataKey="value" fill="#4F46E5" background />
                                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                                        className="text-xl font-bold">
                                        {(data.model_accuracy[0] * 100).toFixed(1)}%
                                      </text>
                                    </RadialBarChart>
                                  </ResponsiveContainer>
                                </div>
                              ),

                              metrics: (
                                <div ref={chartRefs.metrics} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Model Metrics</h2>
                                    <button
                                      onClick={() => downloadChartImage("metrics")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                      data={data.model_names.map((m, i) => ({
                                        name: m,
                                        precision: data.metrics.precision[i],
                                        recall: data.metrics.recall[i],
                                        f1: data.metrics.f1[i],
                                      }))}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Bar dataKey="precision" fill="#4F46E5" />
                                      <Bar dataKey="recall" fill="#10B981" />
                                      <Bar dataKey="f1" fill="#F59E0B" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ),

                              trainTest: (
                                <div ref={chartRefs.trainTest} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Train vs Test Accuracy</h2>
                                    <button
                                      onClick={() => downloadChartImage("trainTest")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <div className="flex justify-center gap-6">
                                    {[{ label: "Train", val: data.train_accuracy[0], color: "#4F46E5" },
                                      { label: "Test", val: data.model_accuracy[0], color: "#10B981" }].map((s, idx) => (
                                        <ResponsiveContainer key={idx} width={180} height={180}>
                                          <RadialBarChart
                                            cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                                            barSize={14}
                                            data={[{ name: s.label, value: s.val * 100 }]}
                                            startAngle={90} endAngle={-270}
                                          >
                                            <RadialBar dataKey="value" fill={s.color} background />
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                                              className="text-lg font-bold">
                                              {(s.val * 100).toFixed(1)}%
                                            </text>
                                          </RadialBarChart>
                                        </ResponsiveContainer>
                                      ))}
                                  </div>
                                </div>
                              ),

                              featureImportance: data.feature_importance && (
                                <div ref={chartRefs.featureImportance} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Feature Importance</h2>
                                    <button
                                      onClick={() => downloadChartImage("featureImportance")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                      data={data.feature_importance.Feature.map((f, i) => ({
                                        feature: f,
                                        importance: data.feature_importance.Importance[i],
                                      }))}
                                      layout="vertical"
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis type="number" />
                                      <YAxis dataKey="feature" type="category" width={150} />
                                      <Tooltip />
                                      <Bar dataKey="importance" fill="#6366F1" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ),

                              confusion: (
                                <div ref={chartRefs.confusion} className="bg-white p-4 rounded shadow overflow-auto">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                      Confusion Matrix — {data.best_model_name}
                                    </h2>
                                    <button
                                      onClick={() => downloadChartImage("confusion")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <table className="border-collapse border mx-auto text-sm">
                                    <thead>
                                      <tr>
                                        <th className="border p-2"></th>
                                        {data.target_names.map((t, i) => (
                                          <th key={i} className="border p-2">Pred {t}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.target_names.map((t, i) => (
                                        <tr key={i}>
                                          <td className="border p-2 font-semibold">Actual {t}</td>
                                          {data.confusion_matrix[i].map((val, j) => (
                                            <td key={j} className="border p-2 text-center">{val}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ),

                              roc: data.roc_points && (
                                <div ref={chartRefs.roc} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">ROC Curve</h2>
                                    <button
                                      onClick={() => downloadChartImage("roc")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={data.roc_points}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="fpr" />
                                      <YAxis dataKey="tpr" />
                                      <Tooltip />
                                      <Line dataKey="tpr" stroke="#4F46E5" strokeWidth={3} dot={false} />
                                    </LineChart>
                                  </ResponsiveContainer>

                                  <p className="text-sm italic mt-2">
                                    AUC: <b>{data.roc_auc ? data.roc_auc.toFixed(3) : "N/A"}</b>
                                  </p>
                                </div>
                              ),

                              cv: (
                                <div ref={chartRefs.cv} className="bg-white p-4 rounded shadow">
                                  <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Cross-Validation Scores</h2>
                                    <button
                                      onClick={() => downloadChartImage("cv")}
                                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                      Download PNG
                                    </button>
                                  </div>

                                  <ResponsiveContainer width="100%" height={250}>
                                    <LineChart
                                      data={data.cv_scores[data.model_names[0]].map((v, i) => ({
                                        fold: `Fold ${i + 1}`,
                                        score: v,
                                      }))}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="fold" />
                                      <YAxis domain={[0, 1]} />
                                      <Tooltip />
                                      <Line dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              )
                            }[key]}

                          </div>
                        )}
                      </Draggable>
                    )
                  )}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* SUMMARY */}
          <div className="mt-10 max-w-3xl mx-auto text-left text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-semibold mb-3">Evaluation Summary</h2>
            <p>
              The Decision Tree achieved a test accuracy of <b>{(data.model_accuracy[0] * 100).toFixed(2)}%</b>.
              It performed well on this dataset, but Decision Trees can overfit if not properly constrained.
              The consistency between train and test accuracy, along with cross-validation scores, indicates
              whether the model generalizes effectively to unseen data.
            </p>
          </div>

          <button
            onClick={downloadResults}
            className="mt-10 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            Download Results (JSON)
          </button>
        </div>
      )}

      {data?.error && (
        <p className="text-red-600 font-semibold mt-8">Error: {data.error}</p>
      )}
    </div>
  );
}
