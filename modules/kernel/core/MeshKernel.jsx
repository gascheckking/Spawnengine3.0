import React, { useEffect, useState } from 'react';
import { MeshOrchestrator } from './MeshOrchestrator';
import { SystemPulse } from './SystemPulse';
import { KernelInit } from './KernelInit';
import { MeshAPI } from '../api/meshAPI';
import { WalletAPI } from '../api/walletAPI';
import { CreatorAPI } from '../api/creatorAPI';
import { SystemAPI } from '../api/systemAPI';

// 🧠 MeshKernel.jsx - Hjärnan som kör hela SpawnEngine
export const MeshKernel = ({ children }) => {
  const [status, setStatus] = useState('booting');
  const [events, setEvents] = useState([]);
  const [system, setSystem] = useState({});
  const [pulse, setPulse] = useState([]);

  useEffect(() => {
    const boot = async () => {
      await KernelInit.bootSequence();
      const sys = await SystemAPI.getStatus();
      const ev = await MeshAPI.getEvents();
      setSystem(sys);
      setEvents(ev);
      setStatus('live');
    };
    boot();
  }, []);

  // Realtidsloop via MeshOrchestrator
  useEffect(() => {
    if (status === 'live') {
      const loop = setInterval(async () => {
        const newPulse = await MeshOrchestrator.runPulse(events);
        setPulse(prev => [...newPulse, ...prev].slice(0, 10));
      }, 4000);
      return () => clearInterval(loop);
    }
  }, [status, events]);

  return (
    <div className="kernel-shell bg-black text-gray-100 font-mono min-h-screen">
      <div className="p-4 text-xs text-green-400 border-b border-green-900">
        ⚙️ SpawnEngine Kernel v3.3 | STATUS: {status.toUpperCase()} | CHAIN: BASE | MESH ONLINE
      </div>
      <SystemPulse data={pulse} />
      <main>{children}</main>
    </div>
  );
};
