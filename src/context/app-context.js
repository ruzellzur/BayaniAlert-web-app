import { createContext, useContext } from 'react';

export const AppContext = createContext(null);

// Position permissions from prototype
export const POSITION_PERMS = {
  'Barangay Captain': { announce: true, evac: true, rescue: false },
  'Kagawad': { announce: true, evac: true, rescue: false },
  'SK Chairperson': { announce: true, evac: false, rescue: false },
  'Barangay Tanod': { announce: false, evac: false, rescue: true },
  'BDRRM Officer': { announce: true, evac: true, rescue: true },
  'Rescue/Response Team': { announce: false, evac: false, rescue: true },
};

export function permsFor(position) {
  return POSITION_PERMS[position] || { announce: true, evac: true, rescue: false };
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
