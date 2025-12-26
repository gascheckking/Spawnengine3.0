/* ============================================================
   SPAWNENGINE FIREBASE BRIDGE v6.0 — Hybrid Offline-Sync Ready
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* —— CONFIG —— */
const firebaseConfig = {
  apiKey: "AIzaSyCXXXXXXX",
  authDomain: "spawnengine.firebaseapp.com",
  projectId: "spawnengine",
  storageBucket: "spawnengine.appspot.com",
  messagingSenderId: "1032847XXXX",
  appId: "1:1032847XXXX:web:12345abcde",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* —— LOG EVENT (Offline-aware) —— */
export async function logMeshEvent(type, message, xp = 0) {
  try {
    if (!navigator.onLine) {
      const offlineEvents =
        JSON.parse(localStorage.getItem("meshEventsOffline")) || [];
      offlineEvents.push({
        type,
        message,
        xp,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("meshEventsOffline", JSON.stringify(offlineEvents));
      console.log("📡 Offline — buffered MeshEvent:", message);
      return;
    }

    await addDoc(collection(db, "meshEvents"), {
      type,
      message,
      xp,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ [Firebase] Logged Mesh Event:", message);
  } catch (err) {
    console.error("🔥 Firebase log error:", err);
  }
}

/* —— FETCH FEED —— */
export async function fetchMeshFeed() {
  const snapshot = await getDocs(collection(db, "meshEvents"));
  return snapshot.docs.map((doc) => doc.data());
}

/* —— REPLAY BUFFER WHEN BACK ONLINE —— */
window.addEventListener("online", async () => {
  const buffered =
    JSON.parse(localStorage.getItem("meshEventsOffline")) || [];
  if (!buffered.length) return;
  console.log(`🔄 Replaying ${buffered.length} offline events...`);

  for (const e of buffered) {
    try {
      await logMeshEvent(e.type, e.message, e.xp);
      console.log("✅ Replayed:", e.message);
    } catch (err) {
      console.warn("⚠️ Failed to replay:", e.message, err);
    }
  }

  localStorage.removeItem("meshEventsOffline");
});

/* —— HEARTBEAT LISTENER (from SW) —— */
navigator.serviceWorker?.addEventListener("message", (event) => {
  if (event.data?.type === "MESH_HEARTBEAT") {
    const ts = new Date(event.data.timestamp);
    console.log("💓 Mesh heartbeat received:", ts.toLocaleTimeString());
  }
});