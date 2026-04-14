import React, { createContext, useContext } from 'react';

interface SyncSignalContextType {
  syncSignal: number;
}

export const SyncSignalContext = createContext<SyncSignalContextType>({ syncSignal: 0 });

export function useSyncSignal(): SyncSignalContextType {
  return useContext(SyncSignalContext);
}
