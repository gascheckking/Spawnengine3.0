import { useEffect, useState } from 'react';

export default function useSpawnAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        id: 'alert-' + Math.floor(Math.random() * 9999),
        type: Math.random() > 0.5 ? 'whale' : 'treasure',
        message: Math.random() > 0.5 ? 'Whale spotted buying!' : 'Treasure pack opened!',
        time: new Date().toLocaleTimeString(),
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return alerts;
}
