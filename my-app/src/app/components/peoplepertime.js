import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import styles from "./visuals.module.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const PeoplePerTime = ({ charts }) => {
  // Check if the required data is available
  if (!charts?.passengerCountPerRouteByTime?.data) {
    return <p className={styles.noCharts}></p>;
  }

  const { stackedBar } = charts.passengerCountPerRouteByTime.data;

  // Stacked Bar Chart Data
  const stackedBarData = {
    labels: Object.keys(stackedBar[6] || {}), // Routes (Route 1, Route 2, etc.)
    datasets: Object.keys(stackedBar).map((hour, index) => ({
      label: `Hour ${hour}`, // Label for each stacked bar (Hour 6, Hour 7, etc.)
      data: Object.entries(stackedBar[hour]).map(([route, passengerCount]) => passengerCount || 0), // Passenger count for each route at the given hour
      backgroundColor: `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 100) % 255}, 0.6)`, // Different color for each hour
      stack: "stack1", // Stack them
    })),
  };

  // Stacked Bar Chart Options
  const stackedBarOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Passenger Count per Route by Hour",
        color: "white",
        font: { size: 19, weight: "bold" },
      },
      legend: {
        labels: {
          color: "#FFFFFF",
          font: { size: 14 },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Route", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Passenger Count", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Heatmap Data
  const heatmapData = {
    labels: Object.keys(stackedBar[6] || {}), // Routes (Route 1, Route 2, etc.)
    datasets: Object.keys(stackedBar).map((hour) => ({
      label: `Hour ${hour}`,
      data: Object.entries(stackedBar[hour]).map(([route, passengerCount]) => ({
        x: route,
        y: hour,
        v: passengerCount || 0,
      })),
      backgroundColor: (context) => {
        const value = context.raw?.v;
        if (value) {
          return `rgba(255, 99, 132, ${Math.min(value / 50, 1)})`; // Adjust transparency based on the value
        }
        return 'rgba(0, 0, 0, 0)';
      },
    })),
  };

  // Heatmap Options
  const heatmapOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Passenger Count Heatmap by Route & Hour",
        color: "white",
        font: { size: 19, weight: "bold" },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Route", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Hour", color: "#FFFFFF" },
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className={styles.chartViewer}>
      {/* Stacked Bar Chart */}
      <div className={styles.chart}>
        <Bar data={stackedBarData} options={stackedBarOptions} />
      </div>

      {/* Heatmap */}
      <div className={styles.chart}>
        <Bar data={heatmapData} options={heatmapOptions} />
      </div>
    </div>
  );
};

export default PeoplePerTime;