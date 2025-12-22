// 🔗 MeshAPI - hanterar all aktivitet i One Event Mesh
export const MeshAPI = {
  async getEvents() {
    // Hämtar senaste händelserna från Mesh
    return [
      { id: 1, kind: 'pack_open', actor: '0x89C...4D2f', value: 150.32, rarity: 'Shard', timestamp: Date.now() },
      { id: 2, kind: 'burn', actor: '0x7Aa...9Ef1', value: 50.00, rarity: 'Fragment', timestamp: Date.now() - 20000 },
    ];
  },

  async postEvent(event) {
    console.log('📡 New event pushed to Mesh:', event);
    return { success: true, event };
  },

  async getSeriesStats() {
    return [
      { id: 'S001-ALPHA', name: 'Alpha Drop V1', heat: 78, change: 12.3 },
      { id: 'S002-BETA', name: 'Base Beta Set', heat: 22, change: -4.5 },
      { id: 'S003-ZORA', name: 'Zora Coin Rail', heat: 95, change: 25.1 },
    ];
  },
};
