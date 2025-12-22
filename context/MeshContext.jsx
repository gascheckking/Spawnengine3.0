
import React, { createContext, useState, useContext, useEffect } from 'react';
import { generateMockEvent } from '../data/meshEvents';

const MeshContext = createContext();

export const MeshProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const loop = setInterval(() => {
      const newEvent = generateMockEvent(events.length);
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
      const xpGain = Math.floor(Math.random() * 20) + 5;
      setXp(prev => {
        const newXp = prev + xpGain;
        if (newXp >= level * 1000) setLevel(level + 1);
        return newXp;
      });
    }, 6000);
    return () => clearInterval(loop);
  }, [events, level]);

  return (
    <MeshContext.Provider value={{ events, xp, level }}>
      {children}
    </MeshContext.Provider>
  );
};

export const useMesh = () => useContext(MeshContext);
