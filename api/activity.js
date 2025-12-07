// api/activity.js

/**
 * Mock-data för generell system-/nätverksaktivitet.
 */
export const MOCK_SYSTEM_ACTIVITY = [
  "Mesh booted · XP core online · v0.3 mock stream.",
  "Pack reveal widget registered for 2 external apps (mock).",
  "Contest arena seeded with “First 100 pulls” bounty (mock).",
  "📡 SupCast ticket opened: Gas failed.",
  "⚙️ Maintenance: Revalidate cache (v1.2).",
  "🧰 New Builder Role unlocked for @spawniz.",
];

/**
 * Simulerad funktion för att hämta systemaktivitet.
 */
export function getSystemActivity() {
  return MOCK_SYSTEM_ACTIVITY;
}
