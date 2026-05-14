import { useCallback, useEffect, useState } from "react";
import { useAccount, useMarginModeBySymbol } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { AccountStatusEnum, MarginMode } from "@veltodefi/types";
import { modal, toast, useScreen } from "@veltodefi/ui";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@veltodefi/ui-connector";

export type MarginModeSwitchScriptOptions = {
  symbol: string;
  close?: () => void;
};

export const useMarginModeSwitchScript = (
  options: MarginModeSwitchScriptOptions,
) => {
  const { symbol, close } = options;
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const { state: accountState } = useAccount();

  const {
    marginMode: currentMarginMode,
    update,
    isPermissionlessListing,
  } = useMarginModeBySymbol(symbol);

  const [selectedMarginMode, setSelectedMarginMode] =
    useState<MarginMode>(currentMarginMode);

  useEffect(() => {
    setSelectedMarginMode(currentMarginMode);
  }, [currentMarginMode]);

  const applyMarginMode = useCallback(
    async (mode: MarginMode) => {
      const result = await update(mode);
      setSelectedMarginMode(mode);
      return result;
    },
    [update],
  );

  const onSelect = useCallback(
    (mode: MarginMode) => {
      if (mode === currentMarginMode) {
        close?.();
        return;
      }

      if (accountState.status < AccountStatusEnum.EnableTrading) {
        close?.();
        modal.show(isMobile ? WalletConnectorSheetId : WalletConnectorModalId);
        return;
      }

      close?.();

      applyMarginMode(mode)
        .then(() => {
          toast.success(t("marginMode.updatedSuccessfully"));
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update margin mode",
          );
        });
    },
    [
      accountState.status,
      applyMarginMode,
      close,
      currentMarginMode,
      isMobile,
      t,
    ],
  );

  return {
    symbol,
    isMobile,
    currentMarginMode,
    selectedMarginMode,
    setSelectedMarginMode,
    applyMarginMode,
    close,
    onSelect,
    isPermissionlessListing,
  };
};

export type MarginModeSwitchState = ReturnType<
  typeof useMarginModeSwitchScript
>;
