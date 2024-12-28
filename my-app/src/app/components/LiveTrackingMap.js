"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, Grid } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import styles from "../components/LiveTrackingButton.module.css";

const MapAutoPan = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

const LiveTrackingMap = ({ routeId }) => {
  const [busLocations, setBusLocations] = useState([]);
  const [stations, setStations] = useState([]);
  const [currentBusDetails, setCurrentBusDetails] = useState(null);
  const [routeActive, setRouteActive] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
      iconUrl: "leaflet/images/marker-icon.png",
      shadowUrl: "leaflet/images/marker-shadow.png",
    });
    setIsMounted(true);
  }, []);

  const fetchBusLocations = async () => {
    try {
      const response = await fetch("/api/getlocations");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const validLocations = data.filter(
        (bus) =>
          bus &&
          bus.latitude &&
          bus.longitude &&
          bus.bus_id === routeId &&
          !isNaN(parseFloat(bus.latitude)) &&
          !isNaN(parseFloat(bus.longitude))
      );

      if (validLocations.length === 0) {
        setRouteActive(false);
      } else {
        setRouteActive(true);
        setBusLocations(validLocations);
        setCurrentBusDetails(validLocations[0]);
      }
    } catch (error) {
      console.error("Error fetching bus locations:", error);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch("/api/getStation");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data2 = await response.json();

      // Log to debug the stations and lines data
      console.log("Stations data:", data2);

      // Filter stations by routeId in the lines array and then map the required data
      const formattedStations = data2
        .filter((station) => {
          console.log(`Checking station ${station.name} lines:`, station.lines); // Log station lines
          const lines = station.lines.map(line => parseInt(line)); // Ensure the lines are integers
          return lines.includes(parseInt(routeId)); // Compare routeId with the lines
        })
        .map((station) => ({
          id: station.Id,
          name: station.name,
          loc: [station.loc._latitude, station.loc._longitude],
          lines: station.lines,
          arrival_time: station.arrival_time || "Not available",
        }));

      console.log("Filtered Stations:", formattedStations); // Log filtered stations

      setStations(formattedStations); // Set the filtered stations
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  useEffect(() => {
    fetchBusLocations();
    fetchStations();
    const interval = setInterval(fetchBusLocations, 5000); // Re-fetch bus locations every 5 seconds
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [routeId]);

  const busIcon = new L.Icon({
    iconUrl: "/buaas.png",
    iconSize: [100, 100],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const stationIcon = new L.Icon({
    iconUrl: "mybussvg.svg",
    iconSize: [100, 100],
    iconAnchor: [50, 50],
    popupAnchor: [0, -32],
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "10px", backgroundColor: "#fff" }}>
      {routeActive ? (
        <>
          <MapContainer
            center={
              currentBusDetails
                ? [currentBusDetails.latitude, currentBusDetails.longitude]
                : [35.12011041069839, 33.94002914428712]
            }
            zoom={14}
            style={{ width: "100%", height: "400px", borderRadius: "8px", border: "2px solid #ddd" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapAutoPan
              position={
                currentBusDetails
                  ? [currentBusDetails.latitude, currentBusDetails.longitude]
                  : null
              }
            />
            {busLocations.map((bus) => (
              <Marker
                key={`bus-${bus.bus_id}`}
                position={[bus.latitude, bus.longitude]}
                icon={busIcon}
                eventHandlers={{
                  click: () => setCurrentBusDetails(bus),
                }}
              >
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <strong>Bus {bus.bus_id}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}
            {stations.map((station) => {
              const position = station.loc; // Extract the loc array directly
              if (
                position &&
                position.length === 2 &&
                !isNaN(parseFloat(position[0])) && position[0] >= -90 && position[0] <= 90 &&
                !isNaN(parseFloat(position[1])) && position[1] >= -180 && position[1] <= 180
              ) {
                return (
                  <Marker
                    key={`station-${station.id}`}
                    position={position} // Use the loc array directly as position
                    icon={stationIcon}
                  >
                    <Popup>
                      <div style={{ textAlign: "center" }}>
                        <strong>{station.name}</strong>
                        {station.arrival_time && (
                          <div>Next arrival: {station.arrival_time}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null; // Skip rendering the marker if the position is invalid
            })}
          </MapContainer>

          <Typography variant="body2" sx={{ color: "gray", textAlign: "center", marginTop: "10px" }}>
            Stations rendered are only associated with the current bus route.
          </Typography>

          {currentBusDetails && (
            <Box className={styles.detailsSection}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography className={styles.infoItem}>
                    <DirectionsBusIcon className={styles.icon} />
                    <strong>Bus ID:</strong> {currentBusDetails.bus_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={styles.infoItem}>
                    <PeopleIcon className={styles.icon} />
                    <strong>Passengers:</strong> {currentBusDetails.passengers || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={styles.infoItem}>
                    <LocationOnIcon className={styles.icon} />
                    <strong>Current Stop:</strong> {currentBusDetails.current_stop || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography className={styles.infoItem}>
                    <ArrowForwardIcon className={styles.icon} />
                    <strong>Next Stop:</strong> {currentBusDetails.next_stop || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="h6" sx={{ color: "#ff4d4d", fontWeight: "bold", textAlign: "center" }}>
          This route is not active.
        </Typography>
      )}
    </Box>
  );
};

export default LiveTrackingMap;