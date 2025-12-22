// 🚀 KernelInit.js - bootar systemet, förbereder API och state
import { SystemAPI } from '../api/systemAPI';

export const KernelInit = {
  async bootSequence() {
    console.log('🧠 Booting SpawnEngine Kernel v3.3...');
    const sys = await SystemAPI.ping();
    console.log('✅ MeshOS Online:', sys);
    await new Promise(res => setTimeout(res, 1000));
    console.log('🔗 Mesh network sync established.');
    return sys;
  }
};
