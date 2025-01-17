"use client";

import { useState } from 'react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import MapComponent from '../components/map';
import Popup from '../components/pop'; // Import Popup component
import styles from './addRoute.module.css';

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

    setPopupData({
      title: 'Confirm Route Addition',
      message: `Are you sure you want to add the route "${routeName}" with ID "${routeId}"?`,
      routeData: formData,
    });
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sendRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(popupData.routeData),
      });

      if (!response.ok) throw new Error('Failed to submit route');

      const data = await response.json();
      console.log('Route submitted successfully:', data);

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

      setRouteId('');
      setRouteName('');
      setRouteColor('#003976');
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
      <Navbar />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Add Route</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="routeName">Route Name</label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeId">Route ID</label>
              <input
                type="text"
                id="routeId"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeColor">Route Color</label>
              <input
                type="color"
                id="routeColor"
                value={routeColor}
                onChange={handleColorChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="routeDescription">Description</label>
              <textarea
                id="routeDescription"
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                rows="4"
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>
        <div className={styles.mapContainer}>
          <MapComponent onMapClick={handleMapClick} />
        </div>
      </div>

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
