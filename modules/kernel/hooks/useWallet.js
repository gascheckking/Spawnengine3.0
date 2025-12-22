import { useState } from 'react';

export default function useWallet() {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0.23);

  const connect = () => {
    setConnected(true);
  };

  const disconnect = () => {
    setConnected(false);
  };

  return { connected, balance, connect, disconnect };
}
