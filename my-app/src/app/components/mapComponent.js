"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Define the custom icon for the marker
const customIcon = L.icon({
  iconUrl: '/mybussvg.svg', // Adjust the path based on your actual file name and loc
  iconSize: [100, 100], // Width and height of the icon
  iconAnchor: [50, 50], // Position of the icon anchor (relative to the top left corner of the icon)
});

  // Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

export default function MapComponent({ center, onMapClick, busStations }) {
  const [isMounted, setIsMounted] = useState(false);

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
    };

    fetchBusStations();
  }, []);

  // Wait for the component to mount before rendering map-related logic
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback center in case the center prop is null or undefined
  const defaultCenter = [35.12011041069839, 33.94002914428712];

  // Function to transform loc object to [lat, lng] for GeoPoint
  const transformLoc = (loc) => {
    if (loc && (loc.latitude !== undefined || loc._latitude !== undefined) && (loc.longitude !== undefined || loc._longitude !== undefined)) {
      return [loc.latitude || loc._latitude, loc.longitude || loc._longitude]; // Handle both property names
    }
    console.error('Invalid loc object:', loc);
    return null;
  };

  // Return null (empty component) if not yet mounted to avoid SSR issues
  if (!isMounted) {
    return null;
  }

  console.log('Bus Stations:', busStations);

  return (
    <MapContainer key={JSON.stringify(center)} center={[35.12011041069839, 33.94002914428712]} zoom={13} style={{ height: '300px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center || defaultCenter} icon={customIcon} />
      <MapClickHandler onMapClick={onMapClick} />
      {busStations.map((station) => {
        const position = transformLoc(station.loc);
        console.log(`Station ${station.id} position:`, position);
        if (position) {
          return (
            <Marker key={station.id} position={position} icon={customIcon}>
              <Popup>{station.name}</Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <div>
                  <strong>ID:</strong> {station.id}
                </div>
              </Tooltip>
            </Marker>
          );
        } else {
          console.error(`Invalid loc data for station ${station.id}`);
          return null; // Skip rendering the marker if loc data is invalid
        }
      })}
    </MapContainer>
  );
}