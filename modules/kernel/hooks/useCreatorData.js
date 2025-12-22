import { useState, useEffect } from 'react';

export default function useCreatorData() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    setCreators([
      { id: 'c1', name: 'CreatorX', packs: 342, revenue: 12.3 },
      { id: 'c2', name: 'MeshArchitect', packs: 289, revenue: 9.8 },
    ]);
  }, []);

  return creators;
}
