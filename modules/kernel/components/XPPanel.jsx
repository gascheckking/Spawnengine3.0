import React from 'react';
import data from '../data/kernel-data';

export default function XPPanel() {
  return (
    <div className="panel xp-panel">
      <h2>XP Balance</h2>
      <p className="stat-value">{data.xp_balance} XP</p>
      <p>Spawn Tokens: {data.spawn_token}</p>
      <p>Multi-chain Mesh: {data.multi_chain}</p>
    </div>
  );
}