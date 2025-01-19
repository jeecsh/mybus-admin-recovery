"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import styles from "./logs.module.css";
import { History } from "@mui/icons-material";
import Loading from "../components/loading";

export default function FeedbackLogs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logRetention, setLogRetention] = useState(30); // Default to 30 days

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const deleteExpiredLog = async (logId) => {
    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete log');
      }
      // Remove the deleted log from state
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setLogRetention(parseInt(data.logRetention) || 30); // Ensure logRetention is a number
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        
        // Process logs and handle expired ones
        const currentDate = new Date();
        data.forEach(log => {
          const logDate = new Date(log.time);
          const daysDifference = (currentDate - logDate) / (1000 * 60 * 60 * 24);
          
          if (daysDifference >= logRetention) {
            deleteExpiredLog(log.id);
          }
        });

        setLogs(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    };

    fetchSettings().then(() => fetchLogs());
  }, [logRetention]); // Re-fetch logs when logRetention changes

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
                  logs.map((log) => (
                    <LogCard 
                      key={log.id} 
                      log={log} 
                      logRetention={logRetention}
                    />
                  ))
                ) : (
                  <p className={styles.noLogs}>No logs available</p>
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

function LogCard({ log, logRetention }) {
  const formattedTime = new Date(log.time).toLocaleString();
  const logAgeInDays = (new Date() - new Date(log.time)) / (1000 * 3600 * 24);
  const daysRemaining = logRetention - Math.floor(logAgeInDays);

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