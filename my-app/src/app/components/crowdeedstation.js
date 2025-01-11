"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat"; // Ensure heat plugin is imported
import { Bar } from "react-chartjs-2";
import styles from "./visuals.module.css";

// Make sure the chart.js plugins are correctly set up
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HeatMapLayerCustom = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    const heatData = data.map((point) => [
      point.latitude,
      point.longitude,
      point.intensity,
    ]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: Math.max(...data.map((point) => point.intensity)),
      gradient: {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        1.0: "red",
      },
    }).addTo(map);

    // Add custom markers with labels
    const customIcon = L.icon({
      iconUrl: "./mybussvg.svg", // Path to the custom marker in public folder
      iconSize: [70, 70],
      iconAnchor: [40, 40],
    });

    data.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon,
      }).addTo(map);
      marker.bindPopup(`<b>${point.station_name}</b><br>Passengers: ${point.intensity}`);
    });

    const bounds = L.latLngBounds(data.map((point) => [point.latitude, point.longitude]));
    map.fitBounds(bounds);

    return () => {
      map.removeLayer(heatLayer);
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    };
  }, [data, map]);

  return null;
};

const HeatMapAndBarChart = ({ charts = {} }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (charts?.mostCrowdedStation?.data?.length > 0) {
      setIsLoading(false);
    } else {
      console.log("No data found for mostCrowdedStation.");
      console.log("Charts Data:", charts);
    }
  }, [charts]);

  if (isLoading) {
    return 
  }

  const heatmapData = charts?.mostCrowdedStation?.data || [];

  const getBarChartData = () => {
    const stationData = heatmapData.sort((a, b) => b.intensity - a.intensity);

    return {
      labels: stationData.map((station) => station.station_name),
      datasets: [
        {
          label: "Passenger Count",
          data: stationData.map((station) => station.intensity),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const defaultCenter = heatmapData.length > 0
    ? {
        lat: heatmapData.reduce((sum, point) => sum + point.latitude, 0) / heatmapData.length,
        lng: heatmapData.reduce((sum, point) => sum + point.longitude, 0) / heatmapData.length,
      }
    : { lat: 35.1221121, lng: 33.9367454 };

  return (
    <div className={styles.chartViewer}>
      <h2 className={styles.mapTitle}>Most Crowded Stations Heatmap</h2>
      <div className={styles.mapContainer}>
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={12}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <HeatMapLayerCustom data={heatmapData} />
        </MapContainer>
      </div>

      <div className={styles.chart}>
        <Bar
          data={getBarChartData()}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: charts?.mostCrowdedStation?.processName || "Passenger Distribution",
                color: "white",
                font: { size: 19 },
              },
              legend: {
                labels: { color: "white" },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `Passengers: ${context.raw}`;
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "#FFFFFF",
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#FFFFFF" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default HeatMapAndBarChart;
