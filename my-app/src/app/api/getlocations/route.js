import { realtimeDb } from '../../../../src/app/lib/firebaseAdmin';  

export async function GET(req) {
  try {
    // Query Realtime Database to get the bus GPS locations
    const busLocationSnapshot = await realtimeDb.ref('gps_locations').once('value');
    
    // Check if data exists
    if (!busLocationSnapshot.exists()) {
      return new Response(
        JSON.stringify({ error: 'No bus location data available' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw data
    const busLocationData = busLocationSnapshot.val();


    // Since the data is already in the correct structure, just convert it to the format we need
    const formattedLocation = {
      bus_id: busLocationData.bus_id,
      latitude: parseFloat(busLocationData.latitude),
      longitude: parseFloat(busLocationData.longitude),
      current_stop: busLocationData.current_stop,
      next_stop: busLocationData.next_stop,
      // Include additional fields if needed
      estimated: busLocationData.estimated,
      passengers: busLocationData.passengers,
      temperature: busLocationData.temperature,
      uptime:busLocationData.uptime,
      power_supply:busLocationData.power_supply,
memory_usage:busLocationData.memory_usage,
current_time: busLocationData.current_time,

    };



    // Return as an array with one bus (or multiple buses if you have multiple)
    return new Response(
      JSON.stringify([formattedLocation]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching bus location data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}