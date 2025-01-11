"use client";
import { useEffect, useState, useRef } from 'react';

const BusDataListener = () => {
  const [previousData, setPreviousData] = useState(null);
  const eventSourceRef = useRef(null);

  // Helper function to format the date
  const formatDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!eventSourceRef.current) {
      console.log('Creating EventSource connection...');
      eventSourceRef.current = new EventSource('/api/sse', { withCredentials: true });
      
      eventSourceRef.current.onmessage = async (event) => {
        const newData = JSON.parse(event.data);
        console.log('Received data:', newData);

        // Check for missing fields
        const requiredFields = ['bus_id', 'current_stop', 'next_stop', 'latitude', 'longitude', 'passengers', 'estimated'];
        const missingFields = requiredFields.filter(field => !(field in newData));

        if (missingFields.length > 0) {
          console.warn('Missing fields in incoming data:', missingFields);
          return; // Skip processing if required fields are missing
        }

        // Filter the data to include only fields in the BusData model
        const filteredData = {
          bus_id: newData.bus_id,
          current_stop: newData.current_stop,
          next_stop: newData.next_stop,
          latitude: newData.latitude,
          longitude: newData.longitude,
          passengers: newData.passengers,
          estimated: newData.estimated,
          current_time: formatDate(new Date()), // Use the formatted date
        };

        console.log('Filtered data:', filteredData);

        if (previousData?.latitude !== newData.latitude || previousData?.longitude !== newData.longitude) {
          try {
            console.log('Sending data to backend...');
            const response = await fetch('http://127.0.0.1:8000/receive-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(filteredData),
            });

            if (!response.ok) {
              const errorDetails = await response.json();
              console.error('Backend error:', errorDetails);
            } else {
              console.log('Data successfully sent to backend');
            }

            setPreviousData(newData); // Update state only if the request succeeds
          } catch (error) {
            console.error('Save error:', error);
          }
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE error:', error);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }

    return () => {
      if (eventSourceRef.current) {
        console.log('Closing EventSource connection...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [previousData]);

  return null;
};

export default BusDataListener;