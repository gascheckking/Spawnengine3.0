
import React, { createContext, useState, useContext, useEffect } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallets, setWallets] = useState([
    { id: 'vault', balance: 0.23, name: 'Vault' },
    { id: 'sniper', balance: 0.05, name: 'Sniper' },
    { id: 'treasury', balance: 1.5, name: 'Treasury' },
  ]);
  const [activeWallet, setActiveWallet] = useState(wallets[0]);

  useEffect(() => {
    const syncWallets = setInterval(() => {
      setWallets(prev =>
        prev.map(w => ({ ...w, balance: parseFloat((w.balance + (Math.random() - 0.5) * 0.01).toFixed(3)) }))
      );
    }, 10000);
    return () => clearInterval(syncWallets);
  }, []);

  return (
    <WalletContext.Provider value={{ wallets, activeWallet, setActiveWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
