const admin = require('firebase-admin');
const serviceAccount = require('./gcc-application-firebase-adminsdk-ioogf-d7b07b7649.json');

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function sendMessage() {
    // Array dari token perangkat yang menerima pesan
    const tokens = [
        
    'eJ3Ddt06S8-VXRayIHNTsE:APA91bFpDG-zoZLSFGuodtjBBwJDNwmIcM0q09RfUr1RXNEeydz9DLoTkXGcIVmPHjAroJj9MiwBjHSxzKV0M2QFRXxV0gjJsBbTZm17ozSDWeQ-RvBJlWf-zUKCiXDMANgyhOwOXV4Y'      ];

    // Pesan yang akan dikirim
    const message = {
        notification: {
            title: 'Hello!',
            body: 'This is a notification message.'
        },
        tokens: tokens // Array dari token perangkat
    };

    try {
        // Mengirim pesan
        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Memanggil fungsi sendMessage
sendMessage();



// const admin = require('firebase-admin');
// const axios = require('axios');
// const serviceAccount = require('./gcc-application-firebase-adminsdk-ioogf-d7b07b7649.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// async function sendMessage() {
//     // Pesan yang akan dikirim
//     const message = {
//       notification: {
//         title: 'Hello!',
//         body: 'This is a notification message.'
//       },
//       token: '' // Token perangkat yang menerima pesan
//     };
  
//     try {
//       // Mengirim pesan
//       const response = await admin.messaging().send(message);
//       console.log('Successfully sent message:', response);
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   }
  
//   sendMessage();
