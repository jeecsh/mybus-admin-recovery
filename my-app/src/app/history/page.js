"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import styles from "./logs.module.css";
import { History } from "@mui/icons-material";
import Loading from "../components/loading"; // Import the Loading component


export default function FeedbackLogs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(true); // Track the loading state
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        setLogs(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
    const realtimeUpdate = setInterval(fetchLogs, 1000); // Update logs every 1 second

    return () => {
      clearInterval(realtimeUpdate); // Cleanup on unmount
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
      <div className={`${styles.content} ${!isSidebarOpen ? styles.shifted : ''}`}>
      <main>
        <div className={styles.logsContainer}>
          <h1 className={styles.pageTitle}>Logs</h1>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <LogCard key={index} log={log} />
            ))
          ) : (
            <p className={styles.noLogs}>No logs available</p>
          )}
        </div>
      </main>
      </div>
      </> )}
    </div>
  );
}
function LogCard({ log }) {
    const formattedTime = new Date(log.time).toLocaleString();
    const logAgeInDays = (new Date() - new Date(log.time)) / (1000 * 3600 * 24);
    const daysRemaining = 30 - Math.floor(logAgeInDays);
  
    return (
      <div className={styles.logCard}>
        <div className={styles.cardContent}>
          <div className={styles.timestamp}>
            <History className={styles.icon} />
            <span>{formattedTime}</span>
          </div>
          <div className={styles.logMessage}>{log.info}</div>
  
          <div className={styles.daysRemaining}>
            {daysRemaining <= 0
              ? "This log has expired and will be deleted."
              : `This log will be deleted in ${daysRemaining} days.`}
          </div>
        </div>
        
      </div>
    );
  }
  