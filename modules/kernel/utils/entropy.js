
// entropy.js — Extreme Mode Mesh Entropy System
const MeshEntropy = (() => {
  let baseEntropy = Math.random();
  let stability = 0.95;
  let driftDirection = Math.random() > 0.5 ? 1 : -1;

  const pulse = () => {
    const timeFactor = Date.now() % 100000 / 100000;
    const noise = Math.sin(timeFactor * Math.PI * 2) * 0.05;
    baseEntropy += (Math.random() - 0.5) * 0.02 + noise * driftDirection;
    if (baseEntropy > 1 || baseEntropy < 0) driftDirection *= -1;
    baseEntropy = Math.max(0, Math.min(1, baseEntropy));
    stability = Math.max(0.8, Math.min(0.99, stability + (Math.random() - 0.5) * 0.01));
  };

  const getEntropy = (rarity = 'Fragment') => {
    pulse();
    const rarityWeights = {
      Fragment: 0.6,
      Shard: 0.75,
      Core: 0.85,
      Artifact: 0.93,
      Relic: 0.98,
      Omega: 0.995,
    };
    const rarityFactor = rarityWeights[rarity] || 0.5;
    const entropyValue = (baseEntropy * rarityFactor * stability) + Math.random() * (1 - stability);
    return Math.min(1, Math.max(0, entropyValue));
  };

  return { getEntropy, pulse };
})();

export default MeshEntropy;
