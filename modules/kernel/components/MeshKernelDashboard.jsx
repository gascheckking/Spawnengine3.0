import React from 'react';
import XPPanel from './XPPanel';
import ClaimPanel from './ClaimPanel';
import FeedPanel from './FeedPanel';
import '../styles/kernel-styles.css';

export default function MeshKernelDashboard() {
  return (
    <div className="kernel-dashboard">
      <header className="kernel-header">
        <h1>SpawnEngine: OS Hub</h1>
        <p>Unified multi-chain mesh for Base, Farcaster & Creator ecosystems</p>
      </header>

      <div className="stats-grid">
        <XPPanel />
        <ClaimPanel />
        <FeedPanel />
      </div>
    </div>
  );
}