"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import styles from "./sys.module.css";
import { 
  Thermostat, Memory, BatteryFull, CameraAlt, RestartAlt, Speed, Timer 
} from "@mui/icons-material";

export default function SystemHealth() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [systemData, setSystemData] = useState({
    temperature: 0,
    cpuUsage: 55,
    memoryUsage: 0,
    voltage: 1.2,
    lowVoltageWarning: false,
    cameraConnected: true,
    raspberryPiStatus: "Connected",
    uptime: '0:00:00',
    powerSupply: 'N/A'
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch('/api/getlocations');
        if (!response.ok) {
          throw new Error('Failed to fetch system data');
        }
        const rawData = await response.json();
        console.log('Raw data received:', rawData);
        
        // Extract the actual data (first item if it's an array)
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        console.log('Processed data:', data);

        if (data) {
          setSystemData(prevData => ({
            ...prevData,
            temperature: parseFloat(data.temperature) || prevData.temperature,
            memoryUsage: parseFloat(data.memory_usage) || prevData.memoryUsage,
            powerSupply: data.power_supply || prevData.powerSupply,
            uptime: data.uptime || prevData.uptime,
          }));
        }
      } catch (error) {
        console.error('Error fetching system data:', error);
      }
    };

    // Initial fetch
    fetchSystemData();

    // Set up real-time listener using Firebase Realtime Database
    const realtimeUpdate = setInterval(fetchSystemData, 1000);

    return () => {
      clearInterval(realtimeUpdate);
    };
  }, []);

  // Add console log to check if data is updating
  useEffect(() => {
    console.log('System data updated:', systemData);
  }, [systemData]);

  return (
    <div className={styles.container}>
      <header className={styles.navbar}>
        <Navbar />
      </header>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`${styles.mainContent} ${
          !isSidebarOpen ? styles.shifted : ""
        }`}
      >
        <div className={styles.grid}>
          {/* Temperature */}
          <Card
            title="Temperature"
            icon={<Thermostat style={{ color: "red" }} />}
            value={`${systemData.temperature} °C`}
            isWarning={systemData.temperature > 70}
          />

          {/* CPU Usage */}
          <Card
            title="CPU Usage"
            icon={<Speed style={{ color: "blue" }} />}
            customContent={
              <ProgressBar percentage={systemData.cpuUsage} />
            }
          />

          {/* Memory Usage */}
          <Card
            title="Memory Usage"
            icon={<Memory style={{ color: "purple" }} />}
            customContent={
              <>
                <ProgressBar
                  percentage={systemData.memoryUsage}
                />
                <p className={styles.smallText}>
                  {systemData.memoryUsage.toFixed(1)}% Used
                </p>
              </>
            }
          />

          {/* Power Supply */}
          <Card
            title="Power Supply"
            icon={<BatteryFull style={{ color: "orange" }} />}
            value={systemData.powerSupply}
            isWarning={systemData.powerSupply === 'N/A'}
          />

          {/* Camera Status */}
          <Card
            title="Camera Status"
            icon={
              <CameraAlt
                style={{
                  color: systemData.cameraConnected ? "green" : "red",
                }}
              />
            }
            value={systemData.cameraConnected ? "Connected" : "Disconnected"}
            isWarning={!systemData.cameraConnected}
          />

          {/* System Uptime */}
          <Card
            title="System Uptime"
            icon={<Timer style={{ color: "blue" }} />}
            value={systemData.uptime}
          />

          {/* Raspberry Pi Actions */}
          <Card
            title="Actions"
            icon={<RestartAlt style={{ color: "gray" }} />}
            customContent={
              <button className={styles.button}>
                Restart Raspberry Pi
              </button>
            }
          />
        </div>
      </main>
    </div>
  );
}

function Card({ title, icon, value, isWarning, warningMessage, customContent }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.icon}>{icon}</span>
        <h3>{title}</h3>
      </div>
      {value && (
        <p
          className={`${styles.value} ${
            isWarning ? styles.warning : styles.normal
          }`}
        >
          {value}
        </p>
      )}
      {isWarning && warningMessage && (
        <p className={styles.warning}>{warningMessage}</p>
      )}
      {customContent && <div>{customContent}</div>}
    </div>
  );
}

function ProgressBar({ percentage }) {
  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}