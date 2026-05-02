import { useEffect, useState } from 'react';

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
