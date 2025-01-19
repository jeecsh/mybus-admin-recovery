import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from "./visuals.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PeoplePerDay = ({ charts }) => {
  if (!charts?.passengerCountPerRouteByDay?.data?.stackedBar) {
    return <p className={styles.noCharts}></p>;
  }

  const { stackedBar } = charts.passengerCountPerRouteByDay.data;
  const daysOfWeek = Object.keys(stackedBar); // Days of the week (e.g., Monday, Tuesday)
  const routes = Object.keys(stackedBar[daysOfWeek[0]] || {}); // Routes (bus IDs)

  // Modern color palette for routes
  const routeColors = [
    'rgba(255, 99, 132, 0.8)',    // Red
    'rgba(54, 162, 235, 0.8)',    // Blue
    'rgba(255, 206, 86, 0.8)',    // Yellow
    'rgba(75, 192, 192, 0.8)',    // Teal
    'rgba(153, 102, 255, 0.8)',   // Purple
    'rgba(255, 159, 64, 0.8)',    // Orange
    'rgba(199, 199, 199, 0.8)',   // Gray
    'rgba(83, 102, 255, 0.8)',    // Indigo
    'rgba(40, 167, 69, 0.8)',     // Green
    'rgba(220, 53, 69, 0.8)',     // Crimson
  ];

  // Stacked Bar Chart Data
  const stackedBarData = {
    labels: daysOfWeek, // Days of the week as labels
    datasets: routes.map((route, index) => ({
      label: route,
      data: daysOfWeek.map(day => stackedBar[day][route] || 0),
      backgroundColor: routeColors[index % routeColors.length],
      borderColor: routeColors[index % routeColors.length].replace('0.8)', '1)'),
      borderWidth: 1,
      stack: 'Stack 0',
      barThickness: 40 // Fixed bar thickness for stacked bar chart
    }))
  };

  // Heatmap Data with unique colors for each route
  const heatmapData = {
    labels: routes,
    datasets: daysOfWeek.map(day => ({
      label: day, // Day of the week as label
      data: routes.map(route => stackedBar[day][route] || 0),
      backgroundColor: routes.map((route, index) => {
        const value = stackedBar[day][route] || 0;
        const maxValue = 30;
        const intensity = Math.min((value / maxValue) * 255, 255);
        // Use the route's color with adjusted opacity
        return routeColors[index % routeColors.length].replace('0.8)', `${intensity / 255})`);
      }),
      barThickness: 20, // Thinner bars for heatmap
      barPercentage: 0.8, // Adjust bar width relative to category width
      categoryPercentage: 0.8 // Adjust spacing between categories
    }))
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 25,
        bottom: 20,
        left: 25
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: "#FFFFFF",
          font: { size: 16, family: 'Arial' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} passengers`
        },
        padding: 12,
        titleFont: { size: 14, family: 'Arial' },
        bodyFont: { size: 14, family: 'Arial' },
        usePointStyle: true
      }
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: "Day of Week", // Updated to reflect days of the week
          color: "#FFFFFF",
          font: { size: 16, family: 'Arial' },
          padding: { top: 10 }
        },
        ticks: { 
          color: "#FFFFFF",
          font: { size: 14, family: 'Arial' },
          padding: 8
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { 
          display: true, 
          text: "Passenger Count", 
          color: "#FFFFFF",
          font: { size: 16, family: 'Arial' },
          padding: { bottom: 10 }
        },
        ticks: { 
          color: "#FFFFFF",
          font: { size: 14, family: 'Arial' },
          padding: 8
        },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      }
    }
  };

  const stackedBarOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Passenger Distribution by Route Over Days of Week', // Updated title
        color: "white",
        font: { size: 24, weight: "bold", family: 'Arial' },
        padding: { top: 20, bottom: 20 }
      }
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        stacked: true
      }
    }
  };

  const heatmapOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false },
      title: {
        display: true,
        text: 'Passenger Density Heatmap by Day of Week', // Updated title
        color: "white",
        font: { size: 24, weight: "bold", family: 'Arial' },
        padding: { top: 20, bottom: 20 }
      }
    }
  };

  return (
    <div className={styles.chartViewer} style={{ minHeight: '100vh' }}>
      <div className={styles.chart} style={{ minHeight: '600px', margin: '30px 0' }}>
        <Bar data={stackedBarData} options={stackedBarOptions} />
      </div>

      <div className={styles.chart} style={{ minHeight: '600px', margin: '30px 0' }}>
        <Bar data={heatmapData} options={heatmapOptions} />
      </div>
    </div>
  );
};

export default PeoplePerDay;