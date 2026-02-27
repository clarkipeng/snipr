import { createContext, useContext, useState } from 'react';

type PendingRequestsContextType = {
  pendingCount: number;
  setPendingCount: (count: number) => void;
};

const PendingRequestsContext = createContext<PendingRequestsContextType>({
  pendingCount: 0,
  setPendingCount: () => {},
});

export function PendingRequestsProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  return (
    <PendingRequestsContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </PendingRequestsContext.Provider>
  );
}

export function usePendingRequests() {
  return useContext(PendingRequestsContext);
}
