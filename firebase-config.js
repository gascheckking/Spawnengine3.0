/* ============================================================
   SPAWNENGINE FIREBASE BRIDGE v4.0
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXXXXXXX",
  authDomain: "spawnengine.firebaseapp.com",
  projectId: "spawnengine",
  storageBucket: "spawnengine.appspot.com",
  messagingSenderId: "1032847XXXX",
  appId: "1:1032847XXXX:web:12345abcde"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function logMeshEvent(type, message, xp) {
  try {
    await addDoc(collection(db, "meshEvents"), {
      type,
      message,
      xp,
      timestamp: new Date().toISOString()
    });
    console.log("✅ [Firebase] Logged Mesh Event:", message);
  } catch (err) {
    console.error("🔥 Firebase log error:", err);
  }
}

export async function fetchMeshFeed() {
  const snapshot = await getDocs(collection(db, "meshEvents"));
  return snapshot.docs.map(doc => doc.data());
}