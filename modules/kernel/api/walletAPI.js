// 💼 WalletAPI - hanterar användarens walletstatus och interaktioner
export const WalletAPI = {
  async connect() {
    console.log('🔌 Wallet connected (mocked)');
    return { address: '0x89C...4D2f', balance: 0.23, chain: 'Base' };
  },

  async getBalance(address) {
    console.log('💰 Fetching balance for', address);
    return { balance: 0.23, symbol: 'ETH' };
  },

  async sendTransaction({ to, value }) {
    console.log(`🚀 Sending ${value} ETH to ${to}`);
    return { txHash: '0xmocktx123456789', status: 'pending' };
  },
};
