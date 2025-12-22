
import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [alerts, setAlerts] = useState(0);
  const [syncStatus, setSyncStatus] = useState('live');

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(prev => (prev === 'live' ? 'syncing' : 'live'));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView,
      theme,
      setTheme,
      alerts,
      setAlerts,
      syncStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
