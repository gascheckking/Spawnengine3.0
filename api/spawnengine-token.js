// api/spawnengine-token.js

/**
 * Mock-data för token- och marknadsinformation.
 */
export const MOCK_TOKEN_DATA = {
  symbol: "SPN",
  priceUsd: 0.0035,
  dailyChange: 0.08, // 8% ökning
  participants: 4521,
  tvlEth: 1.5,
  marketCap: 45000,
};

/**
 * Simulerad funktion för att hämta SPN-tokeninfo.
 */
export function getTokenData() {
  return MOCK_TOKEN_DATA;
}
