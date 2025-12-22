import React from 'react';
import { Zap, Wallet, Bell } from 'lucide-react';

const Header = ({ alerts }) => (
  <header className='flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800 shadow-lg'>
    <div className='flex items-center space-x-2'>
      <Zap className='text-indigo-500 h-6 w-6' />
      <h1 className='text-xl font-bold text-white'>SpawnEngine</h1>
    </div>
    <div className='flex items-center space-x-3'>
      <button className='flex items-center bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-full text-white font-semibold'>
        <Wallet size={18} className='mr-2' /> Wallet Connected
      </button>
      <button className={`relative p-2 rounded-full ${alerts > 0 ? 'bg-red-600 animate-bounce' : 'bg-gray-800 hover:bg-gray-700'}`}>
        <Bell size={18} />
        {alerts > 0 && (
          <span className='absolute top-0 right-0 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900'>
            {alerts}
          </span>
        )}
      </button>
    </div>
  </header>
);

export default Header;