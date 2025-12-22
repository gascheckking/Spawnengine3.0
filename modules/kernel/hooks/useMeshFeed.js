import { useEffect, useState } from 'react';

export default function useMeshFeed(initialEvents = []) {
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      const mockEvent = {
        id: 'event-' + Math.floor(Math.random() * 100000),
        type: 'mesh_update',
        actor: 'User' + Math.floor(Math.random() * 10),
        value: (Math.random() * 1000).toFixed(2),
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [mockEvent, ...prev].slice(0, 30));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return { events };
}
