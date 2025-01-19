"use client";
import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, Grid } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import styles from "./LiveTrackingButton.module.css";

// Initialize Leaflet icons
const busIcon = new L.Icon({
  iconUrl: "/buaas.png",
  iconSize: [100, 100],
  iconAnchor: [50, 50],
  popupAnchor: [0, -32],
});

const stationIcon = new L.Icon({
  iconUrl: "mybussvg.svg",
  iconSize: [100, 100],
  iconAnchor: [50, 50],
  popupAnchor: [0, -32],
});

// MapAutoPan component for smooth bus following
const MapAutoPan = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position, {
        animate: true,
        duration: 1,
        easeLinearity: 0.5,
      });
    }
  }, [position, map]);

  return null;
};

// Custom BusMarker component to handle real-time updates
const BusMarker = ({ position, icon, bus_id, setCurrentBusDetails }) => {
  const map = useMap();

  useEffect(() => {
    let marker;
    if (position) {
      marker = L.marker(position, { icon }).addTo(map);
      marker.on("click", () => setCurrentBusDetails({ bus_id }));
    }

    return () => {
      if (marker) {
        map.removeLayer(marker);
      }
    };
  }, [position, icon, map, bus_id, setCurrentBusDetails]);

  return null;
};

const LiveTrackingMap = ({ routeId }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [currentBusDetails, setCurrentBusDetails] = useState(null);
  const [routeActive, setRouteActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isComponentMounted, setIsComponentMounted] = useState(true);

  // Initialize Leaflet default icons
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
      iconUrl: "leaflet/images/marker-icon.png",
      shadowUrl: "leaflet/images/marker-shadow.png",
    });
  }, []);

  // Fetch bus locations
  const fetchBusLocations = useCallback(async () => {
    if (!isComponentMounted) return;
    
    try {
      const response = await fetch("/api/getlocations");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (!isComponentMounted) return;

      const validLocations = data.filter(
        (bus) =>
          bus &&
          bus.latitude &&
          bus.longitude &&
          bus.bus_id === routeId &&
          !isNaN(parseFloat(bus.latitude)) &&
          !isNaN(parseFloat(bus.longitude))
      );

      if (validLocations.length > 0) {
        const bus = validLocations[0];
        setBusLocation({
          latitude: parseFloat(bus.latitude),
          longitude: parseFloat(bus.longitude),
          bus_id: bus.bus_id,
        });
        setCurrentBusDetails(bus);
        setRouteActive(true);
      } else {
        setRouteActive(false);
      }

      setLastUpdate(new Date().toISOString());
    } catch (error) {
      if (isComponentMounted) {
        console.error("Error fetching bus locations:", error);
        setError("Failed to load bus locations");
      }
    }
  }, [routeId, isComponentMounted]);

  // Setup polling interval
  useEffect(() => {
    setIsComponentMounted(true);
    
    fetchBusLocations();
    const intervalId = setInterval(fetchBusLocations, 2000);

    return () => {
      setIsComponentMounted(false);
      clearInterval(intervalId);
    };
  }, [fetchBusLocations]);

  // Fetch stations data
  const fetchStations = useCallback(async () => {
    if (!isComponentMounted) return;

    try {
      const response = await fetch("/api/getStation");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (!isComponentMounted) return;

      const formattedStations = data
        .filter((station) => {
          const lines = station.lines.map((line) => parseInt(line));
          return lines.includes(parseInt(routeId));
        })
        .map((station, index) => ({
          id: `station-${index}`,
          name: station.name,
          loc: [station.loc._latitude, station.loc._longitude],
          lines: station.lines,
          arrival_time: station.arrival_time || "Not available",
        }));

      setStations(formattedStations);
    } catch (error) {
      if (isComponentMounted) {
        console.error("Error fetching stations:", error);
        setError("Failed to load station data");
      }
    }
  }, [routeId, isComponentMounted]);

  // Fetch stations on component mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Render station markers
  const renderStations = () => {
    return stations.map((station) => {
      const position = station.loc;

      if (!position || position.length !== 2) {
        console.warn(`Invalid station position for station ${station.id}:`, position);
        return null;
      }

      return (
        <Marker key={station.id} position={position} icon={stationIcon}>
          <Popup>
            <div style={{ textAlign: "center" }}>
              <strong>{station.name || "Unnamed Station"}</strong>
              {station.arrival_time && <div>Next arrival: {station.arrival_time}</div>}
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  // Render error message if there's an error
  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "error.main" }}>
        <Typography variant="h6">{error}</Typography>
        <Typography>Please refresh the page to try again</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "10px", backgroundColor: "#fff" }}>
      <div className={styles.mapContainer}>
        <MapContainer
          center={
            busLocation
              ? [busLocation.latitude, busLocation.longitude]
              : [35.12011041069839, 33.94002914428712]
          }
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {busLocation && (
            <>
              <MapAutoPan position={[busLocation.latitude, busLocation.longitude]} />
              <BusMarker
                position={[busLocation.latitude, busLocation.longitude]}
                icon={busIcon}
                bus_id={busLocation.bus_id}
                setCurrentBusDetails={setCurrentBusDetails}
              />
            </>
          )}

          {renderStations()}
        </MapContainer>
      </div>

      {lastUpdate && (
        <Typography className={styles.title}>
          {routeActive
            ? `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`
            : <span style={{ color: "#ff4d4d" }}>This route is currently inactive</span>}
        </Typography>
      )}

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
    </Box>
  );
};

export default LiveTrackingMap;