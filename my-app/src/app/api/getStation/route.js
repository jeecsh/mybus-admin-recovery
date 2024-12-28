// app/api/getStation/route.js

import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const snapshot = await db.collection('Bus-stations').get();
    const busStations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(busStations, { status: 200 });
  } catch (error) {
    console.error('Error fetching bus stations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
