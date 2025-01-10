// app/api/station/[id]/route.js
import { db } from '../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';
export async function DELETE(req, { params }) {
    try {
      const { id } = params; // This is the custom ID (e.g., 'b10')
      console.log(`Received request to delete station with custom ID: ${id}`);
  
      // Query Firestore to find the document with the matching custom ID
      const stationsRef = db.collection('Bus-stations');
      const snapshot = await stationsRef.where('id', '==', id).get();
  
      if (snapshot.empty) {
        console.log(`Station not found with custom ID: ${id}`);
        return NextResponse.json({ error: `Station not found with custom ID: ${id}` }, { status: 404 });
      }
  
      // Delete the document(s) found
      const deletePromises = [];
      snapshot.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
      });
  
      await Promise.all(deletePromises);
  
      console.log(`Deleted station with custom ID: ${id}`);
      return NextResponse.json({ message: 'Station deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting station:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
}  export async function PUT(req, { params }) {
    try {
      const { id } = params; // This is the custom ID (e.g., 'b10')
      console.log('Received request to update station with custom ID:', id);
  
      // Query Firestore to find the document with the matching custom ID
      const stationsRef = db.collection('Bus-stations');
      const snapshot = await stationsRef.where('id', '==', id).get();
  
      if (snapshot.empty) {
        console.log(`Station not found for custom ID: ${id}`);
        return NextResponse.json({ error: `Station not found for custom ID: ${id}` }, { status: 404 });
      }
  
      // Process the request data
      const data = await req.json();
  
      // Update the document(s) found
      const updatePromises = [];
      snapshot.forEach((doc) => {
        updatePromises.push(
          doc.ref.update({
            name: data.name,
            lines: data.lines,
          })
        );
      });
  
      await Promise.all(updatePromises);
  
      console.log(`Updated station with custom ID: ${id}`);
      return NextResponse.json(
        {
          message: 'Station updated successfully',
          data: { id, name: data.name, lines: data.lines },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating station:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }