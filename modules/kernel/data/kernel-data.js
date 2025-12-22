// Kernel Data Aggregator
import meshEvents from './mesh-events';
import userProfile from './user-profile';

const kernelData = {
  stats: {
    packsOpened: 4321,
    totalVolume: '$1.2M',
    activeCreators: 18,
    xp: 8900,
    level: 9,
  },
  xp: {
    current: 8900,
    next: 9500,
    level: 9,
  },
  quests: [
    { id: 1, title: 'Complete Daily Pull', done: true },
    { id: 2, title: 'Claim XP Reward', done: false },
    { id: 3, title: 'Open 3 Packs', done: false },
  ],
  feed: meshEvents.getRecent(),
  user: userProfile,
};

export default kernelData;