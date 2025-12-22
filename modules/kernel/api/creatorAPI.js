// 🎨 CreatorAPI - data och hooks för skapare och deras packs
export const CreatorAPI = {
  async getCreators() {
    return [
      { id: 'creator_001', name: 'MeshArchitect', packs: 12, xp: 8900 },
      { id: 'creator_002', name: 'ForgeLord', packs: 5, xp: 3200 },
    ];
  },

  async getCreatorById(id) {
    console.log('Fetching creator', id);
    return { id, name: 'MeshArchitect', xp: 8900, level: 9, series: ['S001-ALPHA', 'S003-ZORA'] };
  },

  async createPack({ name, rarity, price }) {
    console.log(`🧬 Creating new pack: ${name}`);
    return { id: `pack_${Date.now()}`, name, rarity, price, createdAt: Date.now() };
  },
};
