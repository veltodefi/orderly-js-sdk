import React, { createContext, useContext } from "react";

const WithdrawOnlyModeContext = createContext<boolean>(false);

export const WithdrawOnlyModeProvider: React.FC<{
  value: boolean;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <WithdrawOnlyModeContext.Provider value={value}>
      {children}
    </WithdrawOnlyModeContext.Provider>
  );
};

export const useWithdrawOnlyMode = () => useContext(WithdrawOnlyModeContext);
