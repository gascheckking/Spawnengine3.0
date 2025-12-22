
// xpSystem.js — Adaptive XP & Level Logic
import { rarityMultiplier } from './rarityUtils.js';
import MeshEntropy from './entropy.js';

let globalXP = 0;
let globalLevel = 1;

export const calculateXP = (event, momentum = 1) => {
  const baseXP = 25 + Math.random() * 75;
  const rarityBoost = rarityMultiplier(event.rarity || 'Fragment');
  const entropyBoost = MeshEntropy.getEntropy(event.rarity);
  const momentumFactor = Math.pow(momentum, 1.2);
  const finalXP = Math.floor(baseXP * rarityBoost * (entropyBoost + 0.5) * momentumFactor);
  globalXP += finalXP;
  if (globalXP >= globalLevel * 1000) globalLevel++;
  return { earned: finalXP, total: globalXP, level: globalLevel };
};

export const getCurrentXP = () => ({ globalXP, globalLevel });
