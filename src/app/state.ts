import { createContext, useContext, useSyncExternalStore } from 'react';
import { storage } from '../services/storage/storage';
export const useSavedData = () => useSyncExternalStore(storage.subscribe, storage.getSnapshot);
export const ActivityContext = createContext({ active: false, setActive: (_active: boolean) => {} });
export const useActivity = () => useContext(ActivityContext);
