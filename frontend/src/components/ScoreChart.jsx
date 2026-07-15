import React from "react";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend);

const baseOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: "#cbd5e1" } } },
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
  },
};

export const ProgressLineChart = ({ progressOverTime }) => {
  const data = {
    labels: progressOverTime.map((p) => new Date(p.date).toLocaleDateString()),
    datasets: [
      {
        label: "Overall Score",
        data: progressOverTime.map((p) => p.overallScore),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.2)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Confidence",
        data: progressOverTime.map((p) => p.confidenceScore),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };
  return <Line data={data} options={baseOptions} />;
};

export const SkillRadarChart = ({ interview }) => {
  const data = {
    labels: ["Technical", "Communication", "Behavioral", "Confidence"],
    datasets: [
      {
        label: "Score",
        data: [
          interview.technicalScore,
          interview.communicationScore,
          interview.behavioralScore,
          interview.confidenceScore,
        ],
        backgroundColor: "rgba(99,102,241,0.3)",
        borderColor: "#818cf8",
        pointBackgroundColor: "#818cf8",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { labels: { color: "#cbd5e1" } } },
    scales: {
      r: {
        angleLines: { color: "rgba(255,255,255,0.1)" },
        grid: { color: "rgba(255,255,255,0.1)" },
        pointLabels: { color: "#cbd5e1" },
        ticks: { color: "#64748b", backdropColor: "transparent" },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };
  return <Radar data={data} options={options} />;
};
