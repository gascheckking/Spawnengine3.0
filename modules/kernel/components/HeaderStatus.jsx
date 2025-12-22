import React from 'react';
import { Zap, Wallet, Bell } from 'lucide-react';

export default function HeaderStatus() {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 shadow-lg border-b border-indigo-900/50">
      <div className="flex items-center space-x-3">
        <Zap className="text-indigo-500 h-6 w-6" />
        <h1 className="text-2xl font-extrabold tracking-tight">SpawnEngine · MeshOS</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button className="flex items-center bg-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-500 transition">
          <Wallet size={18} className="mr-2" /> Connect
        </button>
        <button className="relative bg-gray-700 p-2 rounded-full hover:bg-gray-600">
          <Bell size={18} />
          <span className="absolute top-0 right-0 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  );
}