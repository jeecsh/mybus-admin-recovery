"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FlagIcon from "@mui/icons-material/Flag";
import RouteDetails from "./routedetails";
import LiveTrackingButton from "./LiveTrackingButton";
import Popup from "./pop";
import { useRouter } from "next/navigation";
import styles from "./RoutesOverview.module.css";

export default function RoutesOverview() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [blurred, setBlurred] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function fetchRoutes() {
      fetch("/api/getroutes")
        .then((response) => response.json())
        .then((data) => {
          // Sort routes by routeId in ascending order
          const sortedRoutes = data.sort((a, b) => a.routeId - b.routeId);
          setRoutes(sortedRoutes);
        })
        .catch((error) => {
          console.error("Error fetching routes:", error);
        });
    }

    fetchRoutes();
  }, []);

  const handleRouteClick = (routeId) => {
    if (deleteMode) {
      setRouteToDelete(routeId);
      setShowPopup(true);
    } else {
      setSelectedRoute((prev) => (prev === routeId ? null : routeId));
    }
  };

  const handleAddClick = () => {
    router.push("/addRoute");
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
    setBlurred(true);
  };

  const handleDeleteRoute = () => {
    if (routeToDelete) {
      fetch(`/api/getroutes/${routeToDelete}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete route");
          }
          setRoutes((prev) =>
            prev.filter((route) => route.routeId !== routeToDelete)
          );
          setShowPopup(false);
          setBlurred(false);
        })
        .catch((error) => {
          console.error("Error deleting route:", error);
        });
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setRouteToDelete(null);
    setBlurred(false);
  };

  return (
    <Box className={styles.routesOverview}>
      <Box className={`${styles.container} ${blurred ? styles.blurred : ""}`}>
        <Box className={styles.routeList}>
          {routes
            .slice() // Ensure we don't modify the original array
            .sort((a, b) => a.routeId - b.routeId) // Sort by routeId
            .map((route) => (
              <Box
                key={route.routeId}
                className={`${styles.routeCard} ${
                  selectedRoute === route.routeId ? styles.selectedCard : ""
                }`}
                onClick={() => handleRouteClick(route.routeId)}
              >
                {/* Flag Icon with route color */}
                <FlagIcon
                  style={{
                    color: route.routeColor,
                    marginRight: "10px",
                  }}
                />
                <Typography className={styles.routeName}>
                  Line {route.routeId}
                </Typography>
              </Box>
            ))}
          <Box className={styles.actionButtons}>
            <Box className={styles.actionCard} onClick={toggleDeleteMode}>
              <RemoveCircleIcon className={styles.icon} />
            </Box>
            <Box className={styles.actionCard} onClick={handleAddClick}>
              <AddCircleIcon className={styles.icon} />
            </Box>
          </Box>
        </Box>
      </Box>
      {deleteMode && (
        <Box className={styles.deletePrompt}>
          <Typography>Select a route to delete</Typography>
        </Box>
      )}
      <Box className={styles.detailsSection}>
        {selectedRoute ? (
          <>
            <RouteDetails routeId={selectedRoute} />
            <LiveTrackingButton routeId={selectedRoute} />
          </>
        ) : (
          <Typography className={styles.placeholder}>
            Choose a line to view details.
          </Typography>
        )}
      </Box>
      {showPopup && (
        <Popup
          title="Confirm Deletion"
          message="Are you sure you want to delete this route?"
          onClose={closePopup}
          onConfirm={handleDeleteRoute}
        />
      )}
    </Box>
  );
}
