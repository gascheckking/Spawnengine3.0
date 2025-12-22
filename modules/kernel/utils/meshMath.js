
// meshMath.js — Analytical system for heat, volume & whale detection
export const detectWhale = value => value > 0.8;
export const calculateHeatSpike = (volume, changeRate) => {
  const baseline = Math.log(volume + 1) * (changeRate / 10);
  return Math.min(100, Math.max(0, baseline * 50 + Math.random() * 10));
};

export const simulateMarketShift = (seriesData) => {
  return seriesData.map(s => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const change = (Math.random() * 10 * direction).toFixed(2);
    const newHeat = Math.min(100, Math.max(0, s.heat + direction * Math.random() * 5));
    return { ...s, heat: newHeat, change: parseFloat(change), spike: direction > 0 ? 'up' : 'down' };
  });
};
