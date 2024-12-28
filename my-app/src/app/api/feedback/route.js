import { db } from '../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snapshot = await db.collection('feedback').get();
    const feedbacks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        feedback: data.feedback,
        timestamp: data.timestamp ? data.time   .toDate() : null,  // Convert Firestore Timestamp to JS Date
      };
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
