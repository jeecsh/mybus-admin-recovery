import { NextResponse } from 'next/server';
import { realtimeDb } from '../../../../src/app/lib/firebaseAdmin';

export async function GET(request) {
  // Create a TransformStream for streaming the response
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Listen for real-time updates from Firebase
  const busLocationRef = realtimeDb.ref('gps_locations');
  busLocationRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      const busLocationData = snapshot.val();

      // Format the data
      const formattedLocation = {
        bus_id: busLocationData.bus_id,
        latitude: parseFloat(busLocationData.latitude),
        longitude: parseFloat(busLocationData.longitude),
        current_stop: busLocationData.current_stop,
        next_stop: busLocationData.next_stop,
        estimated: busLocationData.estimated,
        passengers: busLocationData.passengers,
        temperature: busLocationData.temperature,
        uptime: busLocationData.uptime,
        power_supply: busLocationData.power_supply,
        memory_usage: busLocationData.memory_usage,
      };

      // Send the formatted data to the client
      writer.write(new TextEncoder().encode(`data: ${JSON.stringify(formattedLocation)}\n\n`));
    }
  });

  // Handle client disconnection
  request.signal.onabort = () => {
    console.log('Client disconnected');
    busLocationRef.off(); // Stop listening to Firebase updates
    writer.close();
  };

  // Keep-alive mechanism
  const keepAliveInterval = setInterval(() => {
    writer.write(new TextEncoder().encode(': keep-alive\n\n'));
  }, 30000);

  // Cleanup on client disconnection
  request.signal.onabort = () => {
    clearInterval(keepAliveInterval);
    busLocationRef.off();
    writer.close();
  };

  // Return the streaming response
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}