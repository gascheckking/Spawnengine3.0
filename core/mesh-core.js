// ======================================================
// 🧠 SPAWNENGINE MESH CORE v3.1 Reforge
// ------------------------------------------------------
// Central event-bus för hela plattformen.
// Kopplar ihop mock-API, Firebase, SupCast och UI.
// ------------------------------------------------------
//  © SpawnEngine / MeshOS
// ======================================================

//———IMPORT MOCK-API———//
import { getSystemActivity } from "../api/activity.js";
import { getHomeFeed } from "../api/mesh-feed.js";
import { getTokenData } from "../api/spawnengine-token.js";
import { getProfile, updateWalletStatus } from "../api/user-profile.js";

//———GLOBAL STATE———//
export const MeshCore = {
  state: {
    feed: [],
    activity: [],
    token: null,
    profile: null,
    listeners: {},
    lastEventId: 0,
  },

  //———INIT———//
  async init() {
    console.log("🧩 [MeshCore] Booting SpawnEngine Mesh v3.1...");

    // Mock-data inläsning
    this.state.feed = getHomeFeed();
    this.state.activity = getSystemActivity();
    this.state.token = getTokenData();
    this.state.profile = getProfile();

    console.log("🧩 [MeshCore] Mock data loaded.");

    // Simulerad async delay
    await new Promise((r) => setTimeout(r, 300));

    this.emit("mesh_ready", this.state);
    console.log("✅ [MeshCore] Online & Ready.");
  },

  //———EVENT DISPATCHER———//
  on(event, handler) {
    if (!this.state.listeners[event]) {
      this.state.listeners[event] = [];
    }
    this.state.listeners[event].push(handler);
  },

  off(event, handler) {
    if (!this.state.listeners[event]) return;
    this.state.listeners[event] = this.state.listeners[event].filter(
      (h) => h !== handler
    );
  },

  emit(event, data) {
    const list = this.state.listeners[event];
    if (list) list.forEach((h) => h(data));
  },

  //———MESH EVENT CREATOR———//
  push(label, kind = "system", xp = 0, meta = {}) {
    const id = ++this.state.lastEventId;
    const entry = {
      id,
      label,
      kind,
      xp,
      meta,
      ts: new Date().toISOString(),
    };
    this.state.feed.unshift(entry);
    this.emit("mesh_event", entry);
    console.log(`[MeshCore] ${label}`);
    return entry;
  },

  //———USER ACTIONS———//
  checkIn() {
    const xp = 50;
    this.state.profile.xpBalance += xp;
    this.push(`Check-in complete (+${xp} XP)`, "checkin", xp);
    this.emit("profile_update", this.state.profile);
  },

  toggleWalletConnection() {
    const newStatus = !this.state.profile.isConnected;
    updateWalletStatus(newStatus);
    this.emit("wallet_status", newStatus);
    this.push(
      newStatus ? "Wallet connected" : "Wallet disconnected",
      "wallet"
    );
  },

  //———EXTERNAL SYNC (Mock Firebase Bridge)———//
  async syncToFirebase(firebaseApi) {
    if (!firebaseApi) return console.warn("[MeshCore] Firebase not detected.");
    this.push("Syncing feed to Firestore...", "firebase");
    // Här skulle feeden pushas till "mesh_events"
  },

  //———UTILS———//
  getFeed(limit = 10) {
    return this.state.feed.slice(0, limit);
  },

  getProfile() {
    return this.state.profile;
  },

  getTokenData() {
    return this.state.token;
  },

  //———DEBUG———//
  debugDump() {
    console.table(this.state.feed);
  },
};

//———AUTOBOOT———//
if (typeof window !== "undefined") {
  window.MeshCore = MeshCore;
  MeshCore.init();
}