import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Utility to convert a string to a Firestore Timestamp
const parseTimeToTimestamp = (timeString) => {
  const date = new Date(timeString);
  return admin.firestore.Timestamp.fromDate(date);
};

// POST handler to add a new log entry
export async function POST(req) {
  try {
    const data = await req.json();
    console.log('Received data:', data);

    if (!data.info || !data.time) {
      return NextResponse.json({ error: 'Invalid or incomplete data' }, { status: 400 });
    }

    const timestamp = parseTimeToTimestamp(data.time);
    const logData = {
      info: data.info,
      time: timestamp,
    };

    const docRef = await db.collection('logs').add(logData);
    return NextResponse.json({ message: 'Log entry created successfully', log_id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding log entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET handler to fetch log entries
export async function GET() {
  try {
    const logsSnapshot = await db.collection('logs').orderBy('time', 'desc').get();

    if (logsSnapshot.empty) {
      return NextResponse.json({ message: 'No logs available' }, { status: 404 });
    }

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      info: doc.data().info,
      time: doc.data().time.toDate().toISOString(),
    }));

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE handler to remove a specific log
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const logId = url.pathname.split('/').pop();

    if (!logId) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    await db.collection('logs').doc(logId).delete();
    return NextResponse.json({ message: 'Log deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}