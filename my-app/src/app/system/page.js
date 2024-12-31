"use client";

import { useState, useEffect, useRef } from "react";
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

  const eventSourceRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);  
  };

  useEffect(() => {
    if (!eventSourceRef.current) {
      eventSourceRef.current = new EventSource('/api/sse', { withCredentials: true });

      eventSourceRef.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);

        setSystemData(prevData => ({
          ...prevData,
          temperature: parseFloat(newData.temperature) || prevData.temperature,
          memoryUsage: parseFloat(newData.memory_usage) || prevData.memoryUsage,
          powerSupply: newData.power_supply || prevData.powerSupply,
          uptime: newData.uptime || prevData.uptime,
        }));
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE error:', error);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
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