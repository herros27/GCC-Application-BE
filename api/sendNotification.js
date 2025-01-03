const express = require("express");
const app = express();
// Gunakan express.json() untuk menggantikan body-parser
const admin = require("firebase-admin");

// Ambil kredensial Firebase dari variabel lingkungan
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
console.log('Firebase Credentials:', process.env.FIREBASE_CREDENTIALS);

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Gunakan middleware express untuk meng-parse JSON request
app.use(express.json());

async function sendMessage(tokens, title, body) {
  const message = {
    notification: { title, body },
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast({
      notification: message.notification,
      tokens,
    });
    console.log("Message sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

app.post("/sendNotificationUploadTrash", async (req, res) => {
  const { address, title, body } = req.body;

  try {
    const tokens = await getAdminTokens(address);
    if (tokens.length === 0) {
      return res.status(404).json({ error: "No admin tokens found." });
    }
    const response = await sendMessage(tokens, title, body);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

async function getAdminTokens(address) {
  const db = admin.firestore();
  const snapshot = await db
    .collection("users")
    .where("role", "==", "admin")
    .where("address", "==", address)
    .get();

  if (snapshot.empty) {
    return [];
  }

  const tokens = [];
  for (const doc of snapshot.docs) {
    const tokenDoc = await db
      .collection("tokenNotification")
      .doc(doc.id)
      .get();

    if (tokenDoc.exists) {
      tokens.push(...(tokenDoc.data().tokensFcm || []));
    }
  }

  return tokens;
}

module.exports = app;
