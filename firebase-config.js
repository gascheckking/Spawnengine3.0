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

    if (!navigator.onLine) {
      const offlineEvents = JSON.parse(localStorage.getItem("meshEventsOffline")) || [];
      offlineEvents.push({ type, message, xp, timestamp: new Date().toISOString() });
      localStorage.setItem("meshEventsOffline", JSON.stringify(offlineEvents));
      console.log("📡 Offline — Event buffered locally:", message);
      return;
    }

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
}// —— Replay Buffered Events When Back Online —— //
window.addEventListener("online", async () => {
  const buffered = JSON.parse(localStorage.getItem("meshEventsOffline")) || [];
  for (const e of buffered) {
    try {
      await logMeshEvent(e.type, e.message, e.xp);
      console.log("✅ Replayed offline event:", e.message);
    } catch (err) {
      console.warn("⚠️ Failed to replay event:", e.message, err);
    }
  }
  localStorage.removeItem("meshEventsOffline");
});

// —— Heartbeat from Service Worker —— //
navigator.serviceWorker?.addEventListener("message", (event) => {
  if (event.data?.type === "MESH_HEARTBEAT") {
    console.log("💓 Mesh heartbeat received", new Date(event.data.timestamp));
    // Optional: show reconnection UI here
  }
});