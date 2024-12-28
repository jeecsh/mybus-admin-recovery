"use client";
import { useEffect, useState } from 'react';

const BusDataListener = () => {
  const [previousData, setPreviousData] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        // Fetch the latest bus location data from your endpoint
        const response = await fetch('/api/getlocations');
        const data = await response.json();
        
        if (data && data.length > 0) {
          const newData = data[0]; // Assuming your API returns an array of buses, and you want the first one

          // Format the data as per your required structure
          const formattedData = {
            bus_id: newData.bus_id,
            latitude: parseFloat(newData.latitude),
            longitude: parseFloat(newData.longitude),
            current_stop: newData.current_stop,
            next_stop: newData.next_stop,
            estimated: newData.estimated,
            passengers: newData.passengers,
          };

          // Check if the location has changed (bus is moving)
          if (previousData && (formattedData.latitude !== previousData.latitude || formattedData.longitude !== previousData.longitude)) {
            // Data changed, send it to the backend to save to CSV
            const saveResponse = await fetch('http://127.0.0.1:8000/receive-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formattedData),
            });

            const saveData = await saveResponse.json();
            console.log('Data saved:', saveData);
          }

          // Update previous data with new data for next comparison
          setPreviousData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching bus location data:', error);
      }
    };

    // Poll the API every 5 seconds (you can adjust the interval)
    const intervalId = setInterval(fetchBusData, 5000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [previousData]);

  return null; // No UI is rendered since we just want to listen for data
};

export default BusDataListener;
