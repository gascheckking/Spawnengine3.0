
// rarityUtils.js — Dynamic rarity-based modifiers
export const rarityColors = {
  Fragment: '#9ca3af',
  Shard: '#6366f1',
  Core: '#a855f7',
  Artifact: '#eab308',
  Relic: '#ef4444',
  Omega: '#ffffff',
};

export const rarityMultiplier = rarity => {
  switch (rarity) {
    case 'Fragment': return 1;
    case 'Shard': return 1.25;
    case 'Core': return 1.5;
    case 'Artifact': return 2.2;
    case 'Relic': return 3;
    case 'Omega': return 5;
    default: return 1;
  }
};

export const rarityPulse = rarity => {
  const base = rarityMultiplier(rarity);
  const fluctuation = (Math.sin(Date.now() / 5000 + base) + 1) / 2;
  return (base * (0.9 + fluctuation * 0.2)).toFixed(2);
};
