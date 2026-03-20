import { useCallback } from "react";
import { OrderlyAppProviderProps } from "@veltodefi/react-app";
import { useIsRwaRoute } from "./useIsRwaRoute";

type SymbolListType = NonNullable<
  NonNullable<OrderlyAppProviderProps["dataAdapter"]>["symbolList"]
>;

export const useSymbolList = () => {
  const isRwaRoute = useIsRwaRoute();

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
