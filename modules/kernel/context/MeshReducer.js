import { ACTIONS } from './MeshConstants';

export default function MeshReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_EVENTS:
      return { ...state, meshEvents: action.payload };
    case ACTIONS.TOGGLE_THEME:
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case ACTIONS.SET_WALLET:
      return { ...state, wallet: action.payload };
    default:
      return state;
  }
}
