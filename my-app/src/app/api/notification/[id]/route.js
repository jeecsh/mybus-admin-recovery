import { db } from '../../../lib/firebaseAdmin'; // Adjust the import based on your project structure
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await db.collection('notifications').doc(id).delete();
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


