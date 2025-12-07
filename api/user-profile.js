// api/user-profile.js

/**
 * Mock-data för användarens profil och saldon.
 */
export const MOCK_USER_PROFILE = {
  handle: "@spawniz",
  xpBalance: 1575,
  spnBalance: 0.125, // Mock SpawnEngine Token balance
  currentRole: "Alpha Hunter / Trader",
  streakDays: 1,
  streakGoal: 7,
  walletAddress: "0x4A5e...F89C",
  isConnected: false,
};

/**
 * Simulerad funktion för att hämta aktuell profil.
 */
export function getProfile() {
  return MOCK_USER_PROFILE;
}

/**
 * Simulerad funktion för att uppdatera användarens valda roll.
 * @param {string} newRole - Den nya rollen som ska sättas.
 */
export function updateProfileRole(newRole) {
  MOCK_USER_PROFILE.currentRole = newRole;
  console.log(`[API] Role updated to: ${newRole}`);
  return MOCK_USER_PROFILE;
}

/**
 * Simulerad funktion för att ansluta/koppla från en plånbok.
 * @param {boolean} status - Ansluten eller ej.
 */
export function updateWalletStatus(status) {
  MOCK_USER_PROFILE.isConnected = status;
  if (status) {
    console.log(`[API] Wallet connected: ${MOCK_USER_PROFILE.walletAddress}`);
  } else {
    console.log("[API] Wallet disconnected.");
  }
}
