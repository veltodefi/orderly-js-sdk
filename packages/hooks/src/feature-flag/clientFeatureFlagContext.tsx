import React, { createContext, useContext } from "react";

export type ClientFeatureFlag = {
  key: string;
  enabled: boolean;
};

const ClientFeatureFlagContext = createContext<ClientFeatureFlag[]>([]);

export const ClientFeatureFlagProvider: React.FC<{
  value: ClientFeatureFlag[];
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <ClientFeatureFlagContext.Provider value={value}>
      {children}
    </ClientFeatureFlagContext.Provider>
  );
};

export const useClientFeatureFlags = () => useContext(ClientFeatureFlagContext);
