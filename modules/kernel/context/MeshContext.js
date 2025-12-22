import { createContext, useContext } from 'react';

const MeshContext = createContext();

export function useMesh() {
  const context = useContext(MeshContext);
  if (!context) throw new Error('useMesh must be used within a MeshProvider');
  return context;
}

export default MeshContext;
