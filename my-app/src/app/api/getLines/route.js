import { db } from '../../lib/firebaseAdmin.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const snapshot = await db.collection('buslines').get();
    const busLines = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        bus_id: doc.id,
        latitude: parseFloat(data.latitude) || null,
        longitude: parseFloat(data.longitude) || null,
        current_stop: data.current_stop || null,
        next_stop: data.next_stop || null,
      };
    });
    return NextResponse.json(busLines);
  } catch (error) {
    console.error('Error fetching bus lines:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}