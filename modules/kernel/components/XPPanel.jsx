import React from 'react';
import { Flame } from 'lucide-react';

export default function XPPanel({ data }) {
  const xp = data || { current: 8900, level: 9, next: 9500 };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-semibold flex items-center mb-3">
        <Flame className="text-yellow-400 mr-2" /> XP Progress
      </h3>
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${(xp.current / xp.next) * 100}%` }}></div>
      </div>
      <p className="text-sm text-gray-400">Level {xp.level} — {xp.current} / {xp.next} XP</p>
    </div>
  );
}