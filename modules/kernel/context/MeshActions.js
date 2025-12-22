export const setWallet = (wallet) => ({
  type: 'SET_WALLET',
  payload: wallet,
});

export const updateEvents = (events) => ({
  type: 'UPDATE_EVENTS',
  payload: events,
});

export const toggleTheme = () => ({
  type: 'TOGGLE_THEME',
});
