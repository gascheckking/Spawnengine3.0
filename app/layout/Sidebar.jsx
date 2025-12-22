import React from 'react';
import { LayoutDashboard, Activity, Briefcase, Gem, Code, MessageSquare, Users, Settings } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trading', label: 'Trading Wall', icon: Activity },
    { id: 'packs', label: 'Packs & Inventory', icon: Briefcase },
    { id: 'pull_lab', label: 'Pull Lab', icon: Gem },
    { id: 'creator_forge', label: 'Creator Forge', icon: Code },
    { id: 'spawn_feed', label: 'SpawnFeed', icon: MessageSquare },
    { id: 'sup_cast', label: 'SupCast', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className='w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto p-4 flex flex-col'>
      <div className='space-y-2'>
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex items-center w-full p-3 rounded-lg transition-all font-medium ${
              activeView === id
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon size={20} className='mr-3' /> {label}
          </button>
        ))}
      </div>
      <div className='mt-auto pt-4 border-t border-gray-800 text-xs text-gray-500 font-mono'>
        SpawnEngine HUD v1.0
      </div>
    </aside>
  );
};

export default Sidebar;