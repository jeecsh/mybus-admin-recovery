import React from "react";
import { Line, Scatter } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  Title 
} from 'chart.js';
import styles from "./visuals.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const AccuracyCharts = ({ charts }) => {
  if (!charts?.estimatedVsActual?.data) {
    return <p className={styles.noCharts}></p>;
  }

  const { scatter, line } = charts.estimatedVsActual.data;

  // Scatter Data
  const scatterData = {
    datasets: [
      {
        label: "Estimated vs Actual Times",
        data: scatter.map((point) => ({
          x: point.estimated_time, // Use estimated_time for x-axis
          y: point.actual_time,    // Use actual_time for y-axis
        })),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        pointRadius: 5,
      },
    ],
  };
  
  // Line Data
  const lineData = {
    labels: line.map((point) => point.x), // Use stop pair names as x-axis labels
    datasets: [
      {
        label: "Estimated Time",
        data: line.map((point) => point.estimated_time),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Actual Time",
        data: line.map((point) => point.actual_time),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#FFFFFF",
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Estimated: ${context.raw.x}, Actual: ${context.raw.y}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Estimated Time (minutes)", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Actual Time (minutes)", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: charts.estimatedVsActual.processName || "Estimated vs Actual Times (AVERAGE)",
        color: "white",
        font: { size: 19, weight: "bold" },
      },
      legend: {
        labels: {
          color: "#FFFFFF",
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Stop Pair", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF", maxRotation: 45, minRotation: 45 },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Time (minutes)", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className={styles.chartViewer}>
      <div className={styles.chart}>
        <Scatter data={scatterData} options={scatterOptions} />
      </div>

      <div className={styles.chart}>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
};

export default AccuracyCharts;