import { useCallback } from "react";
import { OrderlyAppProviderProps } from "@veltodefi/react-app";

type SymbolListType = NonNullable<
  NonNullable<OrderlyAppProviderProps["dataAdapter"]>["symbolList"]
>;

export const useSymbolList = (isRwaRoute?: boolean) => {
  return useCallback<SymbolListType>(
    (original, { rwaSymbolsInfo }) => {
      if (isRwaRoute) {
        return original.filter((item) => !!rwaSymbolsInfo[item.symbol]);
      }
      return original;
    },
    [isRwaRoute],
  );
};
