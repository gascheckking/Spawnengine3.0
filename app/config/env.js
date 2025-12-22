// /app/config/env.js

export const ENV = {
  APP_NAME: "SpawnEngine",
  VERSION: "v3.9-beta",
  MODE: process.env.NODE_ENV || "development",

  // === API ENDPOINTS ===
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.spawnengine.xyz/v1",

  // === NETWORK CONFIG ===
  NETWORKS: {
    BASE: {
      name: "Base",
      chainId: 8453,
      rpc: "https://mainnet.base.org",
      explorer: "https://basescan.org",
    },
    OPTIMISM: {
      name: "Optimism",
      chainId: 10,
      rpc: "https://mainnet.optimism.io",
      explorer: "https://optimistic.etherscan.io",
    },
    POLYGON: {
      name: "Polygon",
      chainId: 137,
      rpc: "https://polygon-rpc.com",
      explorer: "https://polygonscan.com",
    },
  },

  // === TOKENS ===
  TOKENS: {
    XP: { symbol: "XP", decimals: 18, address: "0xXP000..." },
    SPN: { symbol: "SPN", decimals: 18, address: "0xSPN000..." },
  },

  // === FIREBASE CONFIG ===
  FIREBASE: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  // === WALLET / ONCHAIN ===
  WALLET: {
    defaultChain: "BASE",
    supportedChains: ["BASE", "OPTIMISM", "POLYGON"],
  },

  // === FEATURE FLAGS ===
  FEATURES: {
    enableXP: true,
    enableSpawn: true,
    enableCreatorForge: true,
    enableCrossChain: true,
  },
};

export default ENV;
