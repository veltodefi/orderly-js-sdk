import React, { createContext, useContext } from "react";

const VeltoWithdrawOnlyModeContext = createContext<boolean>(false);

export const VeltoWithdrawOnlyModeProvider: React.FC<{
  value: boolean;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <VeltoWithdrawOnlyModeContext.Provider value={value}>
      {children}
    </VeltoWithdrawOnlyModeContext.Provider>
  );
};

export const useWithdrawOnlyMode = () => useContext(VeltoWithdrawOnlyModeContext);
