import { db } from '../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const { id } = params;  // Capture dynamic ID from the URL

  try {
    const feedbackRef = db.collection('feedback').doc(id);
    await feedbackRef.delete();
    return NextResponse.json({ message: `Feedback with ID ${id} deleted` }, { status: 200 });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
                                                                                                                                                                                                                            