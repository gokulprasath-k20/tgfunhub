'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { GlobalCallOverlay } from '@/components/chat/GlobalCallOverlay';

// Define the context shape based on the return type of useWebRTC
type CallContextType = ReturnType<typeof useWebRTC>;

const CallContext = createContext<CallContextType | null>(null);

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}

export function CallProvider({ children }: { children: ReactNode }) {
  const callData = useWebRTC();

  return (
    <CallContext.Provider value={callData}>
      {children}
      {/* The Global Call UI renders if there is an active/incoming call */}
      <GlobalCallOverlay />
    </CallContext.Provider>
  );
}
