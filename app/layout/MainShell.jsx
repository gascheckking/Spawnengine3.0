import React, { useState } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const MainShell = ({ children }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [alerts, setAlerts] = useState(2);

  return (
    <div className='flex flex-col h-screen bg-gray-950 text-gray-100'>
      <Header alerts={alerts} />
      <div className='flex flex-grow overflow-hidden'>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className='flex-grow overflow-y-auto p-6 bg-gray-900/90 backdrop-blur-sm shadow-inner'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainShell;