import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement 
} from 'chart.js';
import styles from "./visuals.module.css";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement
);

const MostCrowdedTimeChart = ({ charts }) => {
  if (!charts?.mostCrowdedTime?.data) {
    return <p className={styles.noCharts}></p>;
  }

  // Function to format hour labels
  const formatHourLabel = (hour) => {
    const numHour = parseInt(hour);
    if (isNaN(numHour)) return hour;
    
    const period = numHour >= 12 ? 'PM' : 'AM';
    const displayHour = numHour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  // Function to generate Chart.js data configuration
  const getChartData = (chartType) => {
    const chartData = charts.mostCrowdedTime.data[chartType];
    if (!chartData) return null;

    // Sort hours numerically
    const sortedEntries = Object.entries(chartData)
      .map(([hour, count]) => [parseInt(hour), count])
      .sort(([hourA], [hourB]) => hourA - hourB);

    const labels = sortedEntries.map(([hour]) => formatHourLabel(hour));
    const data = sortedEntries.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: 'Number of Passengers',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          tension: 0.4 // Smooth lines for line chart
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: charts.mostCrowdedTime.processName || 'Most Crowded Time by Passengers',
        color: 'white',
        font: {
          size: 19,
          weight: 'bold'
        },
      },
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 14
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => `Passengers: ${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#FFFFFF',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12
          }
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            size: 12
          },
          callback: (value) => value.toLocaleString()
        },
      },
    },
  };

  const lineData = getChartData('line');
  const barData = getChartData('bar');

  if (!lineData || !barData) {
    return <p className={styles.noCharts}>Invalid chart data format</p>;
  }

  return (
    <div className={styles.chartViewer}>
      <div className={styles.chart}>
        <Line
          data={lineData}
          options={chartOptions}
        />
      </div>

      <div className={styles.chart}>
        <Bar
          data={barData}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default MostCrowdedTimeChart;