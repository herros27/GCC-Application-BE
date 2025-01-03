const { exec } = require("child_process");
const http = require("http");
const ngrok = require("@ngrok/ngrok");
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./gcc-application-firebase-adminsdk-ioogf-0320d2e5a4.json");

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

async function sendMessage(tokens, title, body) {
  const message = {
    notification: {
      title: `${title}`,
      body: body,
    },
    tokens: tokens, // Daftar token FCM
  };

  try {
    // Gunakan admin.messaging().sendEachForMulticast() pada versi terbaru
    const response = await admin.messaging().sendEachForMulticast({
      notification: message.notification,
      tokens: tokens,
    });
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

app.post("/api/sendNotificationUploadTrash", async (req, res) => {
  const { address, title, body } = req.body;
  try {
    const tokens = await getAdminTokens(address);
    if (tokens.length === 0) {
      return res.status(404).json({
        error: "No users found with the specified role and specified address",
      });
    }

    // Mengirim pesan ke semua token yang ditemukan
    const response = await sendMessage(tokens, title, body);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

async function getAdminTokens(address) {
  try {
    // Ambil semua pengguna yang memiliki role "admin" dari koleksi users
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .where("address", "==", address)
      .get();
    if (usersSnapshot.empty) {
      console.error('No users found with the role "admin"');
      return [];
    }

    const tokens = [];

    // Iterasi melalui setiap pengguna yang memiliki role "admin"
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id; // Dapatkan UID dari dokumen pengguna

      // Ambil dokumen dari koleksi tokenNotification berdasarkan UID
      const tokenDoc = await db
        .collection("tokenNotification")
        .doc(userId)
        .get();
      if (tokenDoc.exists) {
        const tokenData = tokenDoc.data();
        console.log(
          `Document ID: ${tokenDoc.id}, Data: ${JSON.stringify(tokenData)}`
        );
        if (Array.isArray(tokenData.tokensFcm)) {
          tokens.push(...tokenData.tokensFcm); // Menggabungkan array tokensFcm
        }
      }
    }

    console.log(tokens);
    return tokens;
  } catch (error) {
    console.error("Error getting admin tokens:", error);
    return [];
  }
}

// Gunakan port berbeda untuk server HTTP
const HTTP_PORT = 3001;
const EXPRESS_PORT = 3000;

// Jalankan server Express
const server = app.listen(EXPRESS_PORT, () => {
  console.log(`Express server running on port ${EXPRESS_PORT}`);


});

// Create separate HTTP server for static content or other purposes
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Congrats you have created an ngrok web server");
  })
  .listen(HTTP_PORT, () =>
    console.log(`Node.js web server at ${HTTP_PORT} is running...`)
  );


    // // Gunakan path lengkap ke ngrok.exe
  // // const ngrokPath = '"D:\APK-GCC\ngrok.exe"';

  // const command = `ngrok start --all`;

  // // Jalankan ngrok dengan file konfigurasi
  // exec(command, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing ngrok: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`ngrok stderr: ${stderr}`);
  //     return;
  //   }
  //   console.log(`ngrok stdout: ${stdout}`);
  // });