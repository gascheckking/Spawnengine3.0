// Mesh Event Stream Simulation
const events = [
  { actor: 'CreatorX', action: 'opened a pack', time: '2m ago' },
  { actor: 'WhaleA', action: 'bought a relic', time: '5m ago' },
  { actor: 'MeshArchitect', action: 'completed a quest', time: '8m ago' },
];

let listeners = [];

const meshEvents = {
  getRecent: () => events,

  onUpdate(callback) {
    listeners.push(callback);
  },

  simulateNewEvent() {
    const newEvent = {
      actor: ['UserAlpha', 'DevNode', 'CollectorZ'][Math.floor(Math.random() * 3)],
      action: ['minted an NFT', 'claimed XP', 'swapped tokens'][Math.floor(Math.random() * 3)],
      time: new Date().toLocaleTimeString(),
    };
    events.unshift(newEvent);
    events.splice(5);
    listeners.forEach((cb) => cb(events));
  },
};

setInterval(() => meshEvents.simulateNewEvent(), 4000);

export default meshEvents;