import React, { useEffect, useState } from 'react';

export default function RealtimeFeed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => [{ text: `Event at ${new Date().toLocaleTimeString()}` }, ...prev.slice(0, 5)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-semibold text-indigo-400 mb-3">Realtime Mesh Feed</h3>
      <ul className="space-y-1 text-sm text-gray-300">
        {events.map((e, i) => <li key={i}>{e.text}</li>)}
      </ul>
    </div>
  );
}