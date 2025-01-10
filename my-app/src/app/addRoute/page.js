"use client";

import { useState } from 'react';
import Navbar from '../components/navbar'; 
import Sidebar from '../components/sidebar'; 
import MapComponent from '../components/map';
import Popup from '../components/pop'; // Import Popup component
import styles from '../addRoute/addRoute.module.css';

export default function AddRoutePage() {
  const [routeId, setRouteId] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#000000');
  const [routeDescription, setRouteDescription] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Track sidebar state
  const [isPopupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const [popupData, setPopupData] = useState(null); // Data to display in the popup
  const handleColorChange = (e) => {
    setRouteColor(e.target.value);
  };

  const handleMapClick = (coordinates) => {
    setRouteCoordinates(coordinates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      routeId,
      routeName,
      routeColor,
      routeDescription,
      routeCoordinates,
    };

    // Set up the popup data before showing the confirmation popup
    setPopupData({
      title: "Confirm Route Addition",
      message: `Are you sure you want to add the route "${routeName}" with ID "${routeId}"?`,
      routeData: formData,
    });
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    try {
      // Send the route data API request
      const response = await fetch('http://localhost:3000/api/sendRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(popupData.routeData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit route');
      }

      const data = await response.json();
      console.log('Route submitted successfully:', data);

      // Log the action (send a log API call)
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: `Route titled "${routeName}" with ID "${routeId}" has been added.`,
          time: new Date().toISOString(),
        }),
      });

      // Reset form fields and hide popup after successful submission
      setRouteId('');
      setRouteName('');
      setRouteColor('#000000');
      setRouteDescription('');
      setRouteCoordinates([]);
      setPopupVisible(false);
    } catch (error) {
      console.error('Error submitting route:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className={styles.pageLayout}>
      <Navbar className={styles.navbar} />
      <div className={styles.mainContent}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`${styles.content} ${!isSidebarOpen ? styles.shifted : ''}`}>
          <h1 className={styles.title}>Add Route</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="routeName" className={styles.label}>Route Name:</label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeId" className={styles.label}>Route ID:</label>
              <input
                type="text"
                id="routeId"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeColor" className={styles.label}>Route Color:</label>
              <input
                type="color"
                id="routeColor"
                value={routeColor}
                onChange={handleColorChange}
                className={styles.colorPicker}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeDescription" className={styles.label}>Description:</label>
              <textarea
                id="routeDescription"
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                className={styles.textareaField}
                rows="4"
              />
            </div>
            <div className={styles.mapSection}>
              <MapComponent onMapClick={handleMapClick} />
            </div>
            <button type="submit" className={styles.submitButton}>Submit</button>
          </form>
        </div>
      </div>

      {/* Popup Component */}
      {isPopupVisible && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupVisible(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
