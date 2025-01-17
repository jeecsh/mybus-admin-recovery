"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import styles from "./sys.module.css";
import Popup from "../components/pop";
import { 
  Thermostat, Memory, BatteryFull, CameraAlt, RestartAlt, Speed, Timer 
} from "@mui/icons-material";
import Loading from "../components/loading"; // Import the Loading component

export default function SystemHealth() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [actionType, setActionType] = useState(null); // "restart" or "shutdown"
  const [loading, setLoading] = useState(true); // Track loading state
  const [systemData, setSystemData] = useState({
    temperature: null,
    cpuUsage: 0,
    memoryUsage: 0,
    voltage: null,
    lowVoltageWarning: false,
    cameraConnected: null,
    raspberryPiStatus: "Disconnected",
    uptime: null,
    powerSupply: null,
  });

  const eventSourceRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const setDisconnectedState = () => {
    setSystemData(prevData => ({
      ...prevData,
      temperature: null,
      cpuUsage: 0,
      memoryUsage: 0,
      voltage: null,
      lowVoltageWarning: false,
      cameraConnected: false,
      raspberryPiStatus: "Disconnected",
      uptime: null,
      powerSupply: null,
    }));
  };

  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => {
        setConfirmationMessage(null); // Clear the message after 3 seconds
      }, 3000);
  
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [confirmationMessage]);

  const handleFirebaseUpdate = async () => {
    if (!actionType) return;

    try {
      const response = await fetch(`/api/getlocations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: actionType, // "reboot" or "shutdown"
          value: true,
        }),
      });

      if (response.ok) {
        console.log(`${actionType} action triggered successfully`);
        setConfirmationMessage(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} successfully `);

        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            info: `user "${actionType}" the system`,
            time: new Date().toISOString(),
          }),
        });
      } else {
        console.error("Failed to update Firebase:", response.statusText);
      }

    } catch (error) {
      console.error("Error updating Firebase:", error);
    } finally {
      setPopupVisible(false); // Hide the popup after confirming the action
    }
  };

  const openPopup = (type) => {
    setActionType(type); // Set the action type ("reboot" or "shutdown")
    setPopupVisible(true); // Show the popup
  };

  const closePopup = () => {
    setPopupVisible(false);
    setActionType(null);
  };

  useEffect(() => {
    const setupEventSource = () => {
      if (!eventSourceRef.current) {
        eventSourceRef.current = new EventSource("/api/sse", { withCredentials: true });

        eventSourceRef.current.onopen = () => {
          console.log("SSE connection opened");
        };

        eventSourceRef.current.onmessage = (event) => {
          // Clear any existing timeout
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }

          const newData = JSON.parse(event.data);

          setSystemData({
            temperature: parseFloat(newData.temperature),
            cpuUsage: parseFloat(newData.cpu_usage),
            memoryUsage: parseFloat(newData.memory_usage),
            voltage: 5,
            lowVoltageWarning: newData.lowVoltageWarning,
            cameraConnected: true,
            raspberryPiStatus: "Connected",
            uptime: newData.uptime,
            powerSupply: "5V",
          });

          setLoading(false); // Stop loading once data is received

          // Set a new timeout to mark as disconnected if no data is received
          connectionTimeoutRef.current = setTimeout(() => {
            setDisconnectedState();
          }, 5000); // Consider disconnected if no data received for 5 seconds
        };

        eventSourceRef.current.onerror = (error) => {
          console.error("SSE error:", error);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          setDisconnectedState();
          
          // Attempt to reconnect after a delay
          setTimeout(setupEventSource, 5000);
        };
      }
    };

    setupEventSource();

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <header className={styles.navbar}>
            <Navbar />
          </header>

          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          <main
            className={`${styles.mainContent} ${
              !isSidebarOpen ? styles.shifted : ""
            }`}
          >
            <div className={styles.statusHeader}>
              <h2
                style={{
                  color: systemData.raspberryPiStatus === "Connected" ? "green" : "red",
                }}
              >
                Raspberry Pi is {systemData.raspberryPiStatus}
              </h2>
            </div>

            <div className={styles.grid}>
              {/* Temperature */}
              <Card
                title="Temperature"
                icon={<Thermostat style={{ color: "red" }} />}
                value={systemData.temperature !== null ? `${systemData.temperature} °C` : "N/A"}
                isWarning={systemData.temperature > 70}
              />

              {/* CPU Usage */}
              <Card
                title="CPU Usage"
                icon={<Speed style={{ color: "blue" }} />}
                customContent={<ProgressBar percentage={systemData.cpuUsage} />}
              />

              {/* Memory Usage */}
              <Card
                title="Memory Usage"
                icon={<Memory style={{ color: "purple" }} />}
                customContent={
                  <>
                    <ProgressBar percentage={systemData.memoryUsage} />
                    <p className={styles.smallText}>
                      {systemData.memoryUsage?.toFixed(1)}% Used
                    </p>
                  </>
                }
              />

              {/* Power Supply */}
              <Card
                title="Power Supply"
                icon={<BatteryFull style={{ color: "orange" }} />}
                value={systemData.powerSupply || "N/A"}
                isWarning={systemData.powerSupply === "N/A"}
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
              />

              {/* System Uptime */}
              <Card
                title="System Uptime"
                icon={<Timer style={{ color: "blue" }} />}
                value={systemData.uptime || "N/A"}
              />

              {/* Raspberry Pi Actions */}
              <Card
                title="Actions"
                icon={<RestartAlt style={{ color: "gray" }} />}
                customContent={
                  <>
                    <button
                      className={styles.button}
                      onClick={() => openPopup("reboot")}
                    >
                      Restart Raspberry Pi
                    </button>
                    <button
                      className={styles.button}
                      onClick={() => openPopup("shutdown")}
                    >
                      Shutdown Raspberry Pi
                    </button>
                    {confirmationMessage && (
                      <div className={styles.toast}>
                        {confirmationMessage}
                      </div>
                    )}
                  </>
                }
              />
            </div>
          </main>
        </>
      )}

      {popupVisible && (
        <Popup
          title={`Confirm ${actionType}`}
          message={`Are you sure you want to ${actionType} the Raspberry Pi?`}
          onClose={closePopup}
          onConfirm={handleFirebaseUpdate}
        />
      )}
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
            isWarning || value === "N/A" || value === "Disconnected" || value === null ? styles.warning : styles.normal
          }`}
        >
          {value === null ? "N/A" : value}
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
