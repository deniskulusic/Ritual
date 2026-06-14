'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type EntranceContextType = {
  isEntranceReady: boolean;
  triggerEntrance: () => void;
};

const EntranceContext = createContext<EntranceContextType>({
  isEntranceReady: false,
  triggerEntrance: () => {},
});

export function EntranceProvider({ children }: { children: ReactNode }) {
  const [isEntranceReady, setIsEntranceReady] = useState(false);

  const triggerEntrance = () => {
    setIsEntranceReady(true);
  };

  return (
    <EntranceContext.Provider value={{ isEntranceReady, triggerEntrance }}>
      {children}
    </EntranceContext.Provider>
  );
}

export function useEntrance() {
  return useContext(EntranceContext);
}
