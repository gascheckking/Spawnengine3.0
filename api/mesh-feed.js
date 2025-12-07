// api/mesh-feed.js

/**
 * Mock-data för Mesh Feed (visas på Home-fliken).
 */
export const MOCK_HOME_FEED = [
  "⚡ +50 XP - Daily check-in complete.",
  "🎴 Starter mesh pack opened: 3 Fragments, 1 Shard.",
  "🏆 Quest 'Connect Wallet' completed: +100 XP.",
  "🌐 New Base transaction detected: Pack bought (0.025 ETH).",
  "⚡ +25 XP - Active in mesh for 30 minutes.",
  "⚔️ Weekly quest initialized: Mint 1 new Base NFT.",
];

/**
 * Simulerad funktion för att hämta flödesdata.
 */
export function getHomeFeed() {
  return MOCK_HOME_FEED;
}
