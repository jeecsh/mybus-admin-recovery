"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import styles from "./routes.module.css";

export default function RouteDetails({ routeId }) {
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState("Inactive");

  // Fetch and filter route details
  useEffect(() => {
    fetch("/api/getroutes") // Fetch all routes
      .then((response) => response.json())
      .then((data) => {
        const filteredRoute = data.find((route) => route.routeId === routeId);
        setRoute(filteredRoute);
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
      });
  }, [routeId]);

  // Fetch real-time status
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/sse") // Adjust to your real-time status endpoint
        .then((response) => response.json())
        .then((data) => {
          // If data is present, set status to "Active", else "Inactive"
          if (data && data.length > 0) {
            setStatus("Active");
          } else {
            setStatus("Inactive");
          }
        })
        .catch((error) => {
          console.error("Error fetching real-time status:", error);
        });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [routeId]);

  if (!route) {
    return <Typography variant="body1">Loading route details...</Typography>;
  }

  return (
    <Box className={styles.routeDetails}>
      <Box className={styles.routeCard}>
        {/* Flag Icon with route color */}
        <FlagIcon style={{ color: route.routeColor, marginRight: "10px" }} />
        
        <Box>
          <Typography variant="h6" className={styles.routeName}>
            {route.routeName}
          </Typography>
        
          <Typography
            variant="body2"
            className={
              status === "Active"
                ? styles.activeStatus
                : styles.inactiveStatus
            }
          >
            Status: {status}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
