// // server.js (or any server-side file)
// const express = require('express');
// const admin = require('firebase-admin');
// const serviceAccount = require('./../credentials/sdkfirebase.json');

// const app = express();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // Replace with your Firebase database URL
// //   databaseURL: 'https://your-project-id.firebaseio.com',
// });

// const firestore = admin.firestore();                                                                                                                                                            

// // Example endpoint to handle route submission
// app.post('/api/addRoute', async (req, res) => {
//   try {
//     const { routeName, routeColor, routeDescription, routeCoordinates } = req.body;

//     // Validate data as needed

//     const docRef = await firestore.collection('routes').add({
//       routeName,
//       routeColor,
//       routeDescription,
//       routeCoordinates,
//     });

//     res.status(200).json({ message: 'Route submitted successfully', docId: docRef.id });
//   } catch (error) {
//     console.error('Error adding document:', error);
//     res.status(500).json({ error: 'Failed to add route' });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
