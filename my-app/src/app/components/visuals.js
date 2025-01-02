import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
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
  ArcElement, 
  PointElement, 
  LineElement
);

const ChartViewer = ({ charts }) => {
  if (!charts?.routePopularity?.data) {
    return <p className={styles.noCharts}>No route popularity data available</p>;
  }

  // Function to get chart data
  const getChartData = (chartType) => {
    const chartData = charts.routePopularity.data[chartType];
    if (!chartData || typeof chartData !== 'object') {
      return null;
    }

    // Sort data by passenger count in descending order
    const sortedEntries = Object.entries(chartData)
      .sort(([, countA], [, countB]) => countB - countA);

    const labels = sortedEntries.map(([route]) => `Route ${route}`);
    const data = sortedEntries.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: 'Number of Passengers',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Get pie chart colors
  const getPieChartColors = (count) => {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
    ];
    
    return Array(count).fill(0).map((_, index) => 
      baseColors[index % baseColors.length]
    );
  };

  const getPieChartData = () => {
    const chartData = charts.routePopularity.data.bar;
    if (!chartData) return null;

    const sortedEntries = Object.entries(chartData)
      .sort(([, countA], [, countB]) => countB - countA);

    const labels = sortedEntries.map(([route]) => `Route ${route}`);
    const data = sortedEntries.map(([, count]) => count);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: getPieChartColors(data.length),
      }],
    };
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: charts.routePopularity.processName || 'Route Popularity Analysis',
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
            size: 12
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
    }
  };

  const barOptions = {
    ...commonOptions,
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

  const pieOptions = {
    ...commonOptions,
    maintainAspectRatio: false,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'right'
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barData = getChartData('bar');
  const pieData = getPieChartData();

  if (!barData || !pieData) {
    return <p className={styles.noCharts}>Invalid chart data format</p>;
  }

  return (
    <div className={styles.chartViewer}>
      <div className={styles.chart}>
        <Bar
          data={barData}
          options={barOptions}
        />
      </div>

      <div className={`${styles.chart} ${styles.pieChartContainer}`}>
        <div style={{ height: '400px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Pie
            data={pieData}
            options={pieOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartViewer;