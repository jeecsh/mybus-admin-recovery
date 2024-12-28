import { db } from '../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      );
    }

    // Check if the document exists first
    const routeDoc = await db.collection('routes').doc(id).get();
    
    if (!routeDoc.exists) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Delete the document
    await db.collection('routes').doc(id).delete();

    // Return success response
    return NextResponse.json(
      { message: `Route ${id} deleted successfully` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { error: 'Failed to delete route', details: error.message },
      { status: 500 }
    );
  }
}