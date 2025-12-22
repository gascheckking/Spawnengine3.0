
// formatter.js — Chain-aware & temporal formatting
export const formatCurrency = (value, chain = 'base') => {
  const symbols = { base: 'Ξ', zora: '◎', farcaster: '⟠' };
  const symbol = symbols[chain] || 'Ξ';
  return symbol + value.toFixed(3);
};

export const formatTimestamp = (ts, includeSeconds = false) => {
  const opts = { hour: '2-digit', minute: '2-digit' };
  if (includeSeconds) opts.second = '2-digit';
  return new Date(ts).toLocaleTimeString('sv-SE', opts);
};

export const chainLabel = chain => {
  switch (chain) {
    case 'base': return 'Base Mainnet';
    case 'zora': return 'Zora Layer';
    case 'farcaster': return 'Farcaster Relay';
    default: return 'Unknown Mesh';
  }
};
