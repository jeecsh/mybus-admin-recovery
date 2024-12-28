import { db } from '../../lib/firebaseAdmin'; // Ensure your Firebase Admin SDK is correctly configured
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Fetch routes from the "Routes" collection in Firestore (adjust to your Firestore setup)
    const snapshot = await db.collection('routes').get();

    // Map over the fetched documents and return the data
    const routes = snapshot.docs.map(doc => ({
      routeId: doc.id,
      ...doc.data()
    }));

    // Return the routes in the response as JSON
    return NextResponse.json(routes, { status: 200 });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  // This POST method should be used for any creation or other tasks. Currently, it is returning a method not allowed.
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(req) {
  try {
    const { id } = req.nextUrl.searchParams; // Get the ID of the route from the URL (query param)
    
    // Ensure that the ID exists in the query parameter
    if (!id) {
      return NextResponse.json({ error: 'Route ID is required for deletion' }, { status: 400 });
    }

    // Reference to the document in Firestore
    const stationRef = db.collection('routes').doc(id);
    const docSnapshot = await stationRef.get();

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Delete the document
    await stationRef.delete();
    return NextResponse.json({ message: 'Route deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
