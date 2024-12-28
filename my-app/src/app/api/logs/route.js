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

    // Ensure required fields are present
    if (!data.info || !data.time) {
      return NextResponse.json({ error: 'Invalid or incomplete data' }, { status: 400 });
    }

    // Convert time string to Firestore Timestamp
    const timestamp = parseTimeToTimestamp(data.time);
    const logData = {
      info: data.info,  // The info field is simply a string
      time: timestamp,  // Time converted to Firestore Timestamp
    };

    // Add the log entry to Firestore
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
    const logsSnapshot = await db.collection('logs').orderBy('time', 'desc').get(); // Fetch logs in descending order of time

    // Check if logs exist
    if (logsSnapshot.empty) {
      return NextResponse.json({ message: 'No logs available' }, { status: 404 });
    }

    // Map the logs to an array
    const logs = logsSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        info: doc.data().info,
        time: doc.data().time.toDate().toISOString(), // Convert Firestore Timestamp to ISO string
      };
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
