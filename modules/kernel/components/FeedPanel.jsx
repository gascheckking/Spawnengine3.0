import React from 'react';
import { Activity } from 'lucide-react';

export default function FeedPanel({ data }) {
  const feed = data || [
    { actor: 'CreatorX', action: 'opened a pack', time: '2m ago' },
    { actor: 'WhaleA', action: 'bought a relic', time: '5m ago' },
    { actor: 'MeshArchitect', action: 'completed a quest', time: '8m ago' },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-semibold flex items-center mb-3">
        <Activity className="text-indigo-400 mr-2" /> Mesh Activity
      </h3>
      <ul className="space-y-2">
        {feed.map((f, i) => (
          <li key={i} className="flex justify-between text-sm text-gray-300">
            <span><b>{f.actor}</b> {f.action}</span>
            <span className="text-gray-500">{f.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}