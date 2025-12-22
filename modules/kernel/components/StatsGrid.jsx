import React from 'react';

export default function StatsGrid({ data }) {
  const stats = data || [
    { label: 'Total Packs Opened', value: '4,321', color: 'text-indigo-400' },
    { label: 'Total Volume (24h)', value: '$1.2M', color: 'text-green-400' },
    { label: 'Active Creators', value: '18', color: 'text-purple-400' },
    { label: 'My XP / Level', value: '8,900 / 9', color: 'text-yellow-400' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded-xl shadow-md border border-indigo-900/50">
          <p className="text-sm text-gray-400">{s.label}</p>
          <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </section>
  );
}