"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar
} from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as htmlToImage from "html-to-image";

export default function LogisticRegressionPage() {
  const [data, setData] = useState(null);
  const [csvInfo, setCsvInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // chart visibility
  const [visibleCharts, setVisibleCharts] = useState({
    accuracy: true,
    metrics: true,
    trainTest: true,
    confusion: true,
    roc: true,
    cv: true
  });

  // CHART ORDER
  const [chartOrder, setChartOrder] = useState([
    "accuracy",
    "metrics",
    "trainTest",
    "confusion",
    "roc",
    "cv",
  ]);

  const chartTitles = {
  accuracy: "Model Accuracy",
  metrics: "Model Metrics",
  trainTest: "Train vs Test Accuracy",
  confusion: "Confusion Matrix",
  roc: "ROC Curve",
  cv: "Cross-Validation Scores"
};

  // REFS FOR DOWNLOAD
  const chartRefs = {
    accuracy: useRef(null),
    metrics: useRef(null),
    trainTest: useRef(null),
    confusion: useRef(null),
    roc: useRef(null),
    cv: useRef(null),
  };

  // DOWNLOAD IMAGE HANDLER
  const downloadChartImage = async (chartKey) => {
    const ref = chartRefs[chartKey];
    if (!ref?.current) return;

    const dataUrl = await htmlToImage.toPng(ref.current, { quality: 1.0 });
    const link = document.createElement("a");
    link.download = `${chartTitles[chartKey]}.png`;
    link.href = dataUrl;
    link.click();
  };

  // toggle charts
  const handleToggle = (chart) => {
    setVisibleCharts((prev) => ({ ...prev, [chart]: !prev[chart] }));
  };

  // reorder
  const reorder = (list, start, end) => {
    const result = Array.from(list);
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = reorder(chartOrder, result.source.index, result.destination.index);
    setChartOrder(newOrder);
  };

  /** FILE UPLOAD HANDLER */
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
      const lines = text.split("\n").filter((line) => line.trim().length > 0);
      const header = lines[0].split(",").map((col) => col.trim());
      const firstRow = lines[1]?.split(",");

      const allNumeric = firstRow?.every((v) => !isNaN(parseFloat(v)));
      if (allNumeric) {
        setErrorMsg("Invalid CSV. Last column must be a categorical class label.");
        setLoading(false);
        return;
      }

      setCsvInfo({ header, firstRow });

      const formData = new FormData();
      formData.append("file", file);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
      const res = await fetch(`${apiBase}/api/run-ml`, { method: "POST", body: formData });
      const result = await res.json();

      result.error ? setErrorMsg(result.error) : setData(result);
    } catch {
      setErrorMsg("Error processing CSV file.");
    }
    setLoading(false);
  };

  /** DOWNLOAD RESULTS JSON */
  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "logistic_regression_results.json";
    link.click();
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Logistic Regression</h1>
      <p className="text-gray-700 max-w-3xl mx-auto mb-8 text-justify leading-relaxed">
        Logistic Regression is a supervised machine learning algorithm primarily used for classification tasks.
        It models the probability that a given input belongs to a specific class using the <b>sigmoid (logistic)</b> function.
        The output is a probability between 0 and 1, which can be thresholded to classify new data points.
        Logistic Regression is interpretable, efficient, and ideal for linearly separable datasets.
      </p>
      {/* CSV UPLOAD */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-dashed border-2 p-16 rounded-lg text-lg transition ${
          errorMsg ? "border-red-500 bg-red-50" : "border-black bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {loading ? "Processing..." : "Drag & Drop CSV File Here"}
      </div>

      {/* ERROR */}
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

      {/* SCHEMA */}
      {csvInfo && (
        <div className="mt-8 text-left max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Dataset Schema</h2>
          <table className="table-auto w-full border text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border p-2">Column</th>
              <th className="border p-2">Example Value</th>
              <th className="border p-2">Role</th>
            </tr></thead>
            <tbody>
              {csvInfo.header.map((col, i) => (
                <tr key={i}>
                  <td className="border p-2">{col}</td>
                  <td className="border p-2">{csvInfo.firstRow?.[i] || "-"}</td>
                  <td className="border p-2">{i === csvInfo.header.length - 1 ? "Target (Label)" : "Feature (Input)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODEL RESULTS */}
      {data && (
        <div className="mt-12">
          {/* Overview Description */}
          <h2 className="text-2xl font-semibold mb-4">Model Overview</h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-justify mb-8">
            The uploaded dataset was standardized using <b>StandardScaler</b> and split into
            training (70%) and testing (30%) sets. Logistic Regression was then fitted to predict the
            target column using the numerical features. The following sections describe model
            performance and evaluation metrics.
          </p>

          {/* Metric Explanation box */}
          <div className="max-w-4xl mx-auto text-left bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Evaluation Metrics</h2>
            <ul className="list-disc ml-6 text-gray-700 text-sm leading-relaxed">
              <li><b>Accuracy</b>: Percent of correct predictions</li>
              <li><b>Precision</b>: Ratio of true positives among predicted positives</li>
              <li><b>Recall</b>: Ratio of true positives among actual positives</li>
              <li><b>F1-Score</b>: Harmonic mean of precision & recall</li>
            </ul>
          </div>

          {/* CHART VISIBILITY */}
          <div className="mt-8 bg-gray-50 p-4 rounded-md shadow max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Show or Hide Charts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(visibleCharts).map((chartkey) => (
                <label key={chartkey} className="flex items-center gap-2">
                  <input type="checkbox" checked={visibleCharts[chartkey]} onChange={() => handleToggle(chartkey)} />
                  <span>{chartTitles[chartkey]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* DRAGGABLE CHARTS */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="charts">
              {(provided) => (
                <div
                  className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {chartOrder.map((chartKey, index) =>
                    visibleCharts[chartKey] && (
                      <Draggable key={chartKey} draggableId={chartKey} index={index}>
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className="cursor-move"
                          >
                            {/* CHART WRAPPER */}
                            <div
                              ref={chartRefs[chartKey]}
                              className="bg-white p-4 rounded-lg shadow relative"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold capitalize">
                                  {chartTitles[chartKey]}
                                </h2>

                                <button
                                  onClick={() => downloadChartImage(chartKey)}
                                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  Download PNG
                                </button>
                              </div>

                              {/* RENDER SPECIFIC CHART */}
                              {{
                                accuracy: (
                                  <ResponsiveContainer width="100%" height={250}>
                                    <RadialBarChart
                                      cx="50%" cy="50%" innerRadius="80%" outerRadius="100%"
                                      barSize={20}
                                      data={[{ name: "Accuracy", value: data.model_accuracy[0] * 100 }]}
                                      startAngle={90} endAngle={-270}
                                    >
                                      <RadialBar dataKey="value" fill="#4F46E5" background />
                                      <text
                                        x="50%" y="50%" textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-xl font-bold"
                                      >
                                        {(data.model_accuracy[0] * 100).toFixed(1)}%
                                      </text>
                                    </RadialBarChart>
                                  </ResponsiveContainer>
                                ),

                                metrics: (
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
                                ),

                                trainTest: (
                                  <div className="flex justify-center gap-6">
                                    {[
                                      { label: "Train", val: data.train_accuracy[0], color: "#4F46E5" },
                                      { label: "Test", val: data.model_accuracy[0], color: "#10B981" },
                                    ].map((s, idx) => (
                                      <ResponsiveContainer key={idx} width={180} height={180}>
                                        <RadialBarChart
                                          cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                                          barSize={14}
                                          data={[{ name: s.label, value: s.val * 100 }]}
                                          startAngle={90} endAngle={-270}
                                        >
                                          <RadialBar dataKey="value" fill={s.color} background />
                                          <text
                                            x="50%" y="50%" textAnchor="middle"
                                            dominantBaseline="middle"
                                            className="text-lg font-bold"
                                          >
                                            {(s.val * 100).toFixed(1)}%
                                          </text>
                                        </RadialBarChart>
                                      </ResponsiveContainer>
                                    ))}
                                  </div>
                                ),

                                confusion: (
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
                                          {data.confusion_matrix[i].map((v, j) => (
                                            <td key={j} className="border p-2 text-center">
                                              {v}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ),

                                roc: data.roc_points && (
                                  <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={data.roc_points}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="fpr" />
                                      <YAxis dataKey="tpr" />
                                      <Tooltip />
                                      <Line
                                        dataKey="tpr"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        dot={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ),

                                cv: (
                                  <ResponsiveContainer width="100%" height={250}>
                                    <LineChart
                                      data={data.cv_scores[data.model_names[0]].map((v, i) => ({
                                        fold: "Fold " + (i + 1),
                                        score: v,
                                      }))}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="fold" />
                                      <YAxis domain={[0, 1]} />
                                      <Tooltip />
                                      <Line
                                        dataKey="score"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        dot={{ r: 5 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ),
                              }[chartKey]}
                            </div>
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

          {/* Evaluation Summary */}
          <div className="mt-10 text-gray-700 max-w-3xl text-left mx-auto leading-relaxed">
            <h2 className="text-2xl font-semibold mb-2">Evaluation Summary</h2>
            <p>
              The model achieved <b>{(data.model_accuracy[0] * 100).toFixed(2)}%</b> test accuracy indicating that it
              correctly predicted the class labels for most samples in the test dataset. High precision and recall values
              indicate balanced performance across classes. The consistency of cross-validation scores suggests strong
              generalization without significant overfitting.
            </p>
          </div>

          {/* DOWNLOAD FINAL JSON */}
          <button
            onClick={downloadResults}
            className="mt-10 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            Download Results (JSON)
          </button>
        </div>
      )}
    </div>
  );
}
