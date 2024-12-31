"use client";
import { useEffect, useState, useRef } from 'react';

const BusDataListener = () => {
  const [previousData, setPreviousData] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!eventSourceRef.current) {
      eventSourceRef.current = new EventSource('/api/sse', { withCredentials: true });
      
      eventSourceRef.current.onmessage = async (event) => {
        const newData = JSON.parse(event.data);
        if (previousData?.latitude !== newData.latitude || previousData?.longitude !== newData.longitude) {
          try {
            await fetch('http://127.0.0.1:8000/receive-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newData),
            });
          } catch (error) {
            console.error('Save error:', error);
          }
          setPreviousData(newData);
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
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return null;
};

export default BusDataListener;