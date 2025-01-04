"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BusLineSelector from "../components/buslineselect";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Popup from "../components/pop"; // Import the Popup component
import "leaflet/dist/leaflet.css";
import styles from "./addStationPage.module.css";
import Box from "@mui/material/Box";
import Loading from "../components/loading";
import TextField from "@mui/material/TextField";

// Dynamically import the Map component to ensure it only renders on the client side
const MapComponent = dynamic(() => import("../components/mapComponent"), { ssr: false });

export default function AddStationPage() {
  const [stationName, setStationName] = useState("");
  const [stationLocation, setStationLocation] = useState([51.505, -0.09]); // Default location
  const [selectedBusLines, setSelectedBusLines] = useState([]);
  const [mapId, setMapId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busStations, setBusStations] = useState([]);
  const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Track sidebar state
  const [isPopupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const [popupData, setPopupData] = useState(null); // Data to display in the popup
const [loading,setLoading] = useState(true); // Track the loading state
  useEffect(() => {
    setIsMounted(true); // Ensure map rendering only happens on the client
  }, []);

  useEffect(() => {
    const fetchBusStations = async () => {
      try {
        const response = await fetch("/api/getStation");
        if (!response.ok) {
          throw new Error("Failed to fetch bus stations");
        }
        const data = await response.json();
        setBusStations(data);
      } catch (error) {
        console.error("Error fetching bus stations:", error);
        

      }
      setLoading(false); 

    };

    fetchBusStations();
  }, []);

  const busLines = [
    { id: 1, name: "Bus Line 1" },
    { id: 2, name: "Bus Line 2" },
    { id: 3, name: "Bus Line 3" },
    { id: 4, name: "Bus Line 4" },
    { id: 5, name: "Bus Line 5" },
  ];

  const handleMapClick = (e) => {
    setStationLocation([e.latlng.lat, e.latlng.lng]);
  };

  const formatLocation = ([lat, lng]) => ({
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!stationName || !mapId || selectedBusLines.length === 0) {
      setError("Please fill out all required fields.");
      return;
    }

    const formattedLocation = formatLocation(stationLocation);
    const stationData = {
      Id: mapId,
      name: stationName,
      loc: formattedLocation,
      lines: selectedBusLines.map((line) => parseInt(line, 10)),
    };

    setPopupData({
      title: "Confirm Station Addition",
      message: `Are you sure you want to add station "${stationName}" with ID "${mapId}"?`,
      stationData,
    });
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch("/api/addStation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(popupData.stationData),
      });

      if (!response.ok) {
        throw new Error("Failed to add station");
      }

      const data = await response.json();
      setSuccessMessage("Station added successfully!");
      setPopupVisible(false);

      // Log the action
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          info: `Station "${stationName}" with ID "${mapId}" has been added.`,
          time: new Date().toISOString(),
        }),
      });
    } catch (error) {
      setError("Failed to add station.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    
    <div className={styles.container}>
         {loading ? (
      <Loading />
    ) : (
      <>
    
      <Navbar />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`${styles.content} ${!isSidebarOpen ? styles.shifted : ""}`}>
        <h1 className={styles.heading}>Add Station</h1>
        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        <Box
          component="form"
          sx={{ "& .MuiTextField-root": { m: 1, width: "100%" } }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className={styles.formWrapper}>
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <TextField
                  required
                  id="outlined-required"
                  label="Station Name"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="Enter station name"
                  variant="outlined"
                />
                <TextField
                  required
                  id="mapId"
                  label="Map ID"
                  value={mapId}
                  onChange={(e) => setMapId(e.target.value)}
                  placeholder="Enter map ID"
                  variant="outlined"
                />
                <TextField
                  id="outlined-loc"
                  label="Location"
                  value={`Lat: ${stationLocation[0].toFixed(6)}, Long: ${stationLocation[1].toFixed(6)}`}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
                <BusLineSelector
                  busLines={busLines}
                  selectedBusLines={selectedBusLines}
                  setSelectedBusLines={setSelectedBusLines}
                />
                <button type="submit" className={styles.button1}>
                  Add Station
                </button>
              </div>
            </div>
            <div className={styles.mapSection}>
              <label className={styles.label}>Location</label>
              {isMounted && (
                <MapComponent
                  center={stationLocation}
                  onMapClick={handleMapClick}
                  busStations={busStations}
                />
              )}
            </div>
          </div>
        </Box>
      </div>
      {isPopupVisible && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupVisible(false)}
          onConfirm={handleConfirm}
        />

    

      )}

      </> )}
    </div>
  );
}
