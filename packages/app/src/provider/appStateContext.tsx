import React, { createContext, useContext } from "react";
import { RestrictedInfoReturns } from "@veltodefi/hooks";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";

export type RouteOption = {
  href: "/portfolio" | "/portfolio/history" | "/perp";
  name: string;
};

export type WidgetConfigs = {
  scanQRCode?: {
    onSuccess?: (url: string) => void;
  };
  subAccount?: {
    /** @deprecated The number of custom sub-accounts needs to be configured in sync with the backend. If you’re not sure about it, please don’t set this value. */
    maxSubAccountCount: number;
  };
  withdraw?: {
    /**
     * Control the "withdraw to other wallet" feature.
     * - `true` / `undefined`: enable external wallet trigger & management.
     * - `false`: only show the connected wallet address without external
     *   wallet selector or add-wallet dialog.
     */
    enableWithdrawToExternalWallet?: boolean;
  };
};

export type FeeTierType = {
  currentLevel: number;
  nextLevel: number;
  amountToNextLevel: string;
  vipTiersUrl: string;
  showLabelPrefix?: boolean;
  /**
   * Evento disparado ao clicar em "Go to VIP tiers".
   * Permite que consumidores executem ações customizadas.
   */
  onGoToVipTiers?: () => void;
};

export type VeltoProps = {
  onConnectWallet?: (
    defaultConnectWallet?: () => Promise<void>,
    sendToOnboarding?: boolean,
    params?: Record<string, any>,
  ) => void;
  mostCommonChains?: string[];
  isRestrictedRegion?: boolean;
  feeTier?: FeeTierType;
};

export type AppContextState = {
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  disabledConnect: boolean;
  /**
   * Whether the user is in a restricted region and can only perform withdrawals.
   * When true: wallet connect and withdrawal are allowed; trading, deposits, and new orders are blocked.
   */
  withdrawOnlyMode: boolean;
  currentChainId: number | undefined;
  setCurrentChainId: (chainId: number | undefined) => void;
  onChainChanged?: (
    chainId: number,
    state: { isTestnet: boolean; isWalletConnected: boolean },
  ) => void;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo: RestrictedInfoReturns;
  showAnnouncement: boolean;
  setShowAnnouncement: (show: boolean) => void;
  onRouteChange?: (option: RouteOption) => void;
  widgetConfigs?: WidgetConfigs;
  veltoProps?: VeltoProps;
  initialized: boolean;
};

export const AppStateContext = createContext<AppContextState>({
  setCurrentChainId: (chainId?: number) => {},
  restrictedInfo: {},
  setShowAnnouncement: (show: boolean) => {},
} as AppContextState);

export const useAppContext = () => {
  return useContext(AppStateContext);
};
