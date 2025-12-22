// /app/config/constants.js

export const XP_LEVELS = [
  { level: 1, xpRequired: 0, badge: "Bronze" },
  { level: 2, xpRequired: 500, badge: "Silver" },
  { level: 3, xpRequired: 1500, badge: "Gold" },
  { level: 4, xpRequired: 3000, badge: "Platinum" },
  { level: 5, xpRequired: 6000, badge: "Diamond" },
  { level: 6, xpRequired: 12000, badge: "Mythic" },
];

export const REWARD_MULTIPLIERS = {
  dailyRitual: 1.25, // XP boost for daily consistency
  questChain: 1.5,   // Completing multiple quests in sequence
  creatorForge: 2.0, // Creator XP multiplier
  eventBonus: 3.0,   // Special event rewards
};

export const PACK_TYPES = {
  COMMON: {
    rarity: "Common",
    color: "#9BA0B4",
    xpReward: 50,
    spawnReward: 10,
  },
  RARE: {
    rarity: "Rare",
    color: "#00E0FF",
    xpReward: 150,
    spawnReward: 25,
  },
  LEGENDARY: {
    rarity: "Legendary",
    color: "#FF00E0",
    xpReward: 500,
    spawnReward: 75,
  },
  MYTHIC: {
    rarity: "Mythic",
    color: "#00FFA3",
    xpReward: 1000,
    spawnReward: 150,
  },
};

export const EVENT_TYPES = {
  PACK_OPEN: "pack_open",
  QUEST_COMPLETE: "quest_complete",
  XP_CLAIM: "xp_claim",
  FORGE_CREATE: "forge_create",
  WALLET_CONNECT: "wallet_connect",
  CAST_SHARE: "cast_share",
};

export const UI_CONSTANTS = {
  MAX_FEED_ITEMS: 15,
  REFRESH_INTERVAL_MS: 8000,
  TOAST_DURATION_MS: 2500,
};

export const DEFAULT_PROFILE = {
  username: "anon",
  wallet: null,
  xp: 0,
  spawn: 0,
  streak: 0,
  meshConnections: 0,
};

export default {
  XP_LEVELS,
  REWARD_MULTIPLIERS,
  PACK_TYPES,
  EVENT_TYPES,
  UI_CONSTANTS,
  DEFAULT_PROFILE,
};
