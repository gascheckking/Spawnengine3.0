// api/pack-actions.js

let fragments = 12;
let shards = 2;
let relics = 0;

/**
 * Simulerad funktion för att hämta aktuell inventering.
 */
export function getInventory() {
  return { fragments, shards, relics };
}

/**
 * Simulerar att öppna ett pack och ger slumpmässiga (mock) föremål.
 */
export function simulatePackOpen() {
  // Mock-logik: Random loot
  const newFragments = Math.floor(Math.random() * 4) + 2; // 2-5 Fragments
  const newShards = Math.random() > 0.7 ? 1 : 0; // 30% chans för 1 Shard

  fragments += newFragments;
  shards += newShards;

  const lootEvents = [
    `+${newFragments} Fragments`,
    newShards > 0 ? "+1 Shard (RARE)" : "No Shard pull.",
  ];

  return {
    success: true,
    fragments: newFragments,
    shards: newShards,
    inventory: getInventory(),
    events: lootEvents,
  };
}

/**
 * Simulerar syntes: 5 Fragments + 1 Shard = 1 Relic.
 */
export function simulateSynthesis() {
  const FRAGMENTS_COST = 5;
  const SHARDS_COST = 1;

  if (fragments >= FRAGMENTS_COST && shards >= SHARDS_COST) {
    fragments -= FRAGMENTS_COST;
    shards -= SHARDS_COST;
    relics += 1;
    return {
      success: true,
      message: `Synthesis successful! Burned ${FRAGMENTS_COST} Fragments + ${SHARDS_COST} Shard. +1 Relic minted.`,
      inventory: getInventory(),
    };
  } else {
    return {
      success: false,
      message: `Synthesis failed: Requires ${FRAGMENTS_COST} Fragments and ${SHARDS_COST} Shard. Current: ${fragments} Fragments, ${shards} Shards.`,
      inventory: getInventory(),
    };
  }
}
