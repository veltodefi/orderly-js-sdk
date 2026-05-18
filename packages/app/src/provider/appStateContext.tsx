import React, { createContext, useContext } from "react";
import {
  RestrictedInfoReturns,
  type ClientFeatureFlag,
  type MarketCategoryConfig,
} from "@veltodefi/hooks";
import { OrderSide } from "@veltodefi/types";
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
  /**
   * Custom market tab configuration.
   * Function receives the default built-in tabs and context, returns the final tab sequence.
   */
  marketTabs?: MarketCategoryConfig;
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
  /**
   * Override do taker fee exibido no order entry.
   * Quando informado, substitui o valor retornado pela API da conta.
   * Formato: string já formatada como percentual, ex: "0.02%".
   */
  takerFee?: string;
  /**
   * Override do maker fee exibido no order entry.
   * Quando informado, substitui o valor retornado pela API da conta.
   * Formato: string já formatada como percentual, ex: "0%".
   */
  makerFee?: string;
  /**
   * Override do taker fee para símbolos RWA.
   * Quando informado, substitui o valor retornado pela API da conta.
   */
  rwaTakerFee?: string;
  /**
   * Override do maker fee para símbolos RWA.
   * Quando informado, substitui o valor retornado pela API da conta.
   */
  rwaMakerFee?: string;
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
  featureFlags?: ClientFeatureFlag[];
  onPerpTrade?: (side: OrderSide) => void;
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
  veltoWithdrawOnlyMode: boolean;
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
  featureFlags?: ClientFeatureFlag[];
};

export const AppStateContext = createContext<AppContextState>({
  setCurrentChainId: (chainId?: number) => {},
  restrictedInfo: {},
  setShowAnnouncement: (show: boolean) => {},
} as AppContextState);

export const useAppContext = () => {
  return useContext(AppStateContext);
};
