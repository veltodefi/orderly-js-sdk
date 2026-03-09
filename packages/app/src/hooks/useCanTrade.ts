import { useMemo } from "react";
import { useAccount } from "@veltodefi/hooks";
import { AccountStatusEnum } from "@veltodefi/types";
import { useAppContext } from "../provider/appStateContext";

export function useCanTrade() {
  const { state } = useAccount();

  const { wrongNetwork, disabledConnect, withdrawOnlyMode } = useAppContext();

  const canTrade = useMemo(() => {
    return (
      !wrongNetwork &&
      !disabledConnect &&
      !withdrawOnlyMode &&
      (state.status === AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
    );
  }, [state.status, wrongNetwork, disabledConnect, withdrawOnlyMode]);

  return canTrade;
}
