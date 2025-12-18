// ======================================================
// 🧠 SPAWNENGINE MESH CORE v3.1 — Reforge Build
// ------------------------------------------------------
// Central event-bus för hela SpawnEngine-plattformen.
// Kopplar ihop mock-API, MeshBridge, UI och Mesh-bg.js.
// ------------------------------------------------------
//  © SpawnEngine / MeshOS — 2025
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
    initialized: false
  },

  //———INIT———//
  async init() {
    console.log("%c🧩 [MeshCore] Booting SpawnEngine Mesh v3.1...", "color:#14b8a6");

    // Mock-data inläsning
    this.state.feed = getHomeFeed();
    this.state.activity = getSystemActivity();
    this.state.token = getTokenData();
    this.state.profile = getProfile();

    console.log("%c[MeshCore] Mock data loaded.", "color:#6366f1");

    // Simulerad async delay
    await new Promise((r) => setTimeout(r, 400));

    this.state.initialized = true;
    this.emit("mesh_ready", this.state);

    console.log("%c✅ [MeshCore] Online & Ready.", "color:#10b981");

    // Starta mockad eventström
    this.startEventStream();

    return this.state;
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

    // Triggera MeshBridge automatiskt
    this.emit("event", {
      type: this.mapKindToType(kind),
      data: meta,
      xp
    });

    console.log(`%c[MeshCore] ${label}`, "color:#3cf6ff");
    return entry;
  },

  //———KIND → TYPE MAPPNING———//
  mapKindToType(kind) {
    const map = {
      "system": "SYSTEM",
      "checkin": "XP_GAIN",
      "wallet": "MARKET_BUY",
      "firebase": "SYNC",
      "market": "MARKET_BUY",
      "social": "SOCIAL_CAST",
      "reward": "CREATOR_REWARD"
    };
    return map[kind] || "GENERIC";
  },

  //———USER ACTIONS———//
  checkIn() {
    const xp = 50;
    this.state.profile.xpBalance += xp;
    this.push(`✅ Check-in complete (+${xp} XP)`, "checkin", xp);
    this.emit("profile_update", this.state.profile);
  },

  toggleWalletConnection() {
    const newStatus = !this.state.profile.isConnected;
    updateWalletStatus(newStatus);
    this.emit("wallet_status", newStatus);
    this.push(
      newStatus ? "🔗 Wallet connected" : "🔴 Wallet disconnected",
      "wallet"
    );
  },

  rewardCreator(amount = 25) {
    this.state.profile.xpBalance += amount;
    this.push(`💎 Creator reward claimed (+${amount} XP)`, "reward", amount);
  },

  castToFarcaster() {
    this.push("💬 Cast sent to Farcaster", "social", 10);
  },

  //———MOCK EVENT STREAM———//
  startEventStream() {
    const eventPool = [
      () => this.checkIn(),
      () => this.castToFarcaster(),
      () => this.rewardCreator(),
      () => this.toggleWalletConnection()
    ];

    setInterval(() => {
      const action = eventPool[Math.floor(Math.random() * eventPool.length)];
      action();
    }, 8000); // 8 sekunder mellan “on-chain events”
  },

  //———EXTERNAL SYNC (Mock Firebase Bridge)———//
  async syncToFirebase(firebaseApi) {
    if (!firebaseApi) return console.warn("[MeshCore] Firebase not detected.");
    this.push("☁️ Syncing feed to Firestore...", "firebase");
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

  debugDump() {
    console.table(this.state.feed);
  },
};

//———AUTOBOOT———//
if (typeof window !== "undefined") {
  window.MeshCore = MeshCore;
  MeshCore.init();
}