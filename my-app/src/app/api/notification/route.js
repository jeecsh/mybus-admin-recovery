import { db } from '../../lib/firebaseAdmin'; // Adjust the import based on your project structure
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snapshot = await db.collection('notifications').get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json(); // Parse the request body as JSON
    console.log('Received data:', data); // Log the request body

    // Input validation
    if (!data || typeof data !== 'object' || !data.title || !data.message || !data.timeFrame) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Prepare data for Firestore
    const notificationData = {
      title: data.title,
      info: data.message,
      time: new Date(data.timeFrame), // Ensure timeFrame is stored as a timestamp
    };

    // Add document to Firestore
    const docRef = await db.collection('notifications').add(notificationData);
    return NextResponse.json({ message: 'Notification added successfully', notification_id: docRef.id });
  } catch (error) {
    console.error('Error adding notification:', error); // Log the error details
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const snapshot = await db.collection('notifications').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return NextResponse.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
