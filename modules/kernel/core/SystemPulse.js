import React from 'react';

// 💓 SystemPulse.js - visar Mesh-pulser i realtid i UI
export const SystemPulse = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="p-3 text-gray-600 text-xs border-b border-gray-800">
      Awaiting first mesh pulse...
    </div>
  );

  return (
    <div className="border-b border-gray-800 bg-black/60 p-3 text-xs overflow-x-auto whitespace-nowrap">
      {data.map((pulse, i) => (
        <span key={i} className="inline-block mr-6 text-green-400 animate-pulse">
          {pulse}
        </span>
      ))}
    </div>
  );
};
