import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function QuestSummary({ data }) {
  const quests = data || [
    { title: 'Complete Daily Pull', done: true },
    { title: 'Claim XP Reward', done: false },
    { title: 'Open 3 Packs', done: false },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-semibold mb-3">Active Quests</h3>
      <ul className="space-y-2">
        {quests.map((q, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className={`text-sm ${q.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{q.title}</span>
            {q.done && <CheckCircle className="text-green-400" size={18} />}
          </li>
        ))}
      </ul>
    </div>
  );
}