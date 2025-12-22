import React, { useReducer, useEffect } from 'react';
import MeshContext from './MeshContext';
import MeshReducer from './MeshReducer';
import { ACTIONS } from './MeshConstants';
import useMeshFeed from '../hooks/useMeshFeed';
import useWallet from '../hooks/useWallet';
import useSpawnAlerts from '../hooks/useSpawnAlerts';
import useCreatorData from '../hooks/useCreatorData';
import useThemeEngine from '../hooks/useThemeEngine';

export default function MeshProvider({ children }) {
  const { events } = useMeshFeed();
  const wallet = useWallet();
  const alerts = useSpawnAlerts();
  const creators = useCreatorData();
  const { theme, toggleTheme } = useThemeEngine();

  const initialState = {
    meshEvents: events,
    wallet,
    alerts,
    creators,
    theme,
  };

  const [state, dispatch] = useReducer(MeshReducer, initialState);

  useEffect(() => {
    dispatch({ type: ACTIONS.UPDATE_EVENTS, payload: events });
  }, [events]);

  return (
    <MeshContext.Provider value={{ state, dispatch, toggleTheme }}>
      {children}
    </MeshContext.Provider>
  );
}
