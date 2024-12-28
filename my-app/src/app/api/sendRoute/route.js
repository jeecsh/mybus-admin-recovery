import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function POST(req) {
  try {
    const data = await req.json(); // Parse the request body
    console.log('Received data:', data);

    // Input validation
    if (!data.routeId || !data.routeName || !data.routeCoordinates || !Array.isArray(data.routeCoordinates)) {
      return NextResponse.json({ error: 'Invalid or incomplete data' }, { status: 400 });
    }

    // Convert coordinates to Firestore GeoPoint format
    const geoPoints = data.routeCoordinates.map(coord => {
      if (typeof coord.latitude !== 'number' || typeof coord.longitude !== 'number') {
        throw new Error(`Invalid coordinate format: ${JSON.stringify(coord)}`);
      }
      return new admin.firestore.GeoPoint(coord.latitude, coord.longitude);
    });

    // Construct the document payload
    const routeData = {
      routeId: data.routeId,
      routeName: data.routeName,
      routeColor: data.routeColor || '#000000', // Default color if not provided
      routeDescription: data.routeDescription || '',
      routeCoordinates: geoPoints,
    };

    // Add the document to Firestore
    const docRef = await db.collection('routes').add(routeData);

    return NextResponse.json({ message: 'Route added successfully', route_id: docRef.id });
  } catch (error) {
    console.error('Error adding route:', error); // Log error for debugging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
