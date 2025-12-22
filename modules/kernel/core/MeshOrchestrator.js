// 🕹️ MeshOrchestrator.js - kör pulser, hanterar AI-insikter & meshflöden
import { MeshAPI } from '../api/meshAPI';
import { SystemAPI } from '../api/systemAPI';

export const MeshOrchestrator = {
  async runPulse(currentEvents) {
    const newEvents = await MeshAPI.getEvents();
    const insights = this.generateInsights(newEvents);
    await SystemAPI.logActivity('Pulse executed: ' + newEvents.length + ' events');
    return insights;
  },

  generateInsights(events) {
    const pulse = events.slice(0, 5).map(e => {
      const impact = (e.value * (e.rarity === 'Relic' ? 5 : 1)).toFixed(2);
      return `💠 ${e.actor} ${e.kind === 'burn' ? 'burned' : 'triggered'} ${e.rarity} worth $${impact}`;
    });
    if (pulse.length === 0) pulse.push('🌀 Mesh calm. Awaiting next entropy window...');
    return pulse;
  }
};
