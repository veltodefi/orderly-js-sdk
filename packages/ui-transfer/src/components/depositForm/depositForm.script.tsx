import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  useDeposit,
  useIndexPricesStream,
  useOrderlyContext,
} from "@veltodefi/hooks";
import { useAppContext } from "@veltodefi/react-app";
import { API, ChainNamespace, NetworkId } from "@veltodefi/types";
import { useAuthGuard } from "@veltodefi/ui-connector";
import { useTransferAnalytics } from "../../analytics";
import { useActionType } from "./hooks/useActionType";
import { useChainSelect } from "./hooks/useChainSelect";
import { useCollateralValue } from "./hooks/useCollateralValue";
import { useConvertThreshold } from "./hooks/useConvertThreshold";
import { useDepositAction } from "./hooks/useDepositAction";
import { useDepositFee } from "./hooks/useDepositFee";
import { useDepositFormQuantities } from "./hooks/useDepositQuantities";
import { useDepositValidation } from "./hooks/useDepositValidation";
import { useNativeBalance } from "./hooks/useNativeBalance";
import { useOrderlyTokens } from "./hooks/useOrderlyTokens";
import { useToken } from "./hooks/useToken";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { useSwapTokens } from "./swap/use1inchTokens";
import { SWAP_CONTRACT_ADDRESS, useSwapDeposit } from "./swap/useSwapDeposit";
import { filterAndSortTokens } from "./utils";

export type DepositFormScriptReturn = ReturnType<typeof useDepositFormScript>;

export type DepositFormScriptOptions = {
  close?: () => void;
};

export const useDepositFormScript = (options: DepositFormScriptOptions) => {
  const { wrongNetwork } = useAppContext();
  const { enableSwapDeposit } = useOrderlyContext();
  const { account } = useAccount();
  const networkId = useConfig("networkId") as NetworkId;
  const { emit } = useTransferAnalytics();

  const {
    chains,
    currentChain,
    settingChain,
    onChainChange: rawOnChainChange,
  } = useChainSelect();

  const prevChainIdRef = useRef<number | undefined>(currentChain?.id);
  useEffect(() => {
    prevChainIdRef.current = currentChain?.id;
  }, [currentChain?.id]);

  const onChainChange = useCallback(
    (chain: API.NetworkInfos) => {
      const result = rawOnChainChange(chain);
      emit({
        form: "deposit",
        name: "chain_changed",
        from_chain_id: prevChainIdRef.current,
        to_chain_id: chain.chain_id,
        wrong_network: !!wrongNetwork,
      });
      return result;
    },
    [rawOnChainChange, emit, wrongNetwork],
  );

  const swapTokens = useSwapTokens(currentChain?.id, enableSwapDeposit);
  const orderlyTokens = useOrderlyTokens(currentChain);

  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange: rawOnSourceTokenChange,
    setSourceTokens,
    onTargetTokenChange,
  } = useToken(orderlyTokens);

  const onSourceTokenChange = useCallback(
    (token: API.TokenInfo) => {
      const result = rawOnSourceTokenChange(token);
      emit({
        form: "deposit",
        name: "source_token_changed",
        from_symbol: sourceToken?.symbol,
        to_symbol: token.symbol ?? "unknown",
      });
      return result;
    },
    [rawOnSourceTokenChange, emit, sourceToken?.symbol],
  );

  const { getIndexPrice } = useIndexPricesStream();

  const {
    balance,
    allowance,
    depositFee,
    depositFeeFetched,
    depositFeeFailed,
    balanceRevalidating,
    depositFeeRevalidating,
    quantity,
    setQuantity,
    approve,
    deposit,
    fetchBalance,
    fetchBalances,
    targetChain,
    isNativeToken,
  } = useDeposit({
    address: sourceToken?.address,
    decimals: sourceToken?.decimals,
    srcChainId: currentChain?.id,
    srcToken: sourceToken?.symbol,
    dstToken: targetToken?.symbol,
    depositorAddress: enableSwapDeposit ? SWAP_CONTRACT_ADDRESS : undefined,
  });

  const { balance: nativeBalance, isLoading: nativeBalanceRevalidating } =
    useNativeBalance({
      fetchBalance,
      targetChain,
    });

  const { balances: tokenBalances, isLoading: batchBalancesRevalidating } =
    useTokenBalances({ orderlyTokens, swapTokens, fetchBalances });

  useEffect(() => {
    const sortedTokens = filterAndSortTokens(
      orderlyTokens,
      swapTokens,
      tokenBalances,
      getIndexPrice,
    );
    setSourceTokens(sortedTokens);
  }, [orderlyTokens, swapTokens, tokenBalances]);

  const needSwap = useMemo(() => {
    return (
      !!sourceToken?.symbol &&
      !!targetToken?.symbol &&
      sourceToken.symbol !== targetToken?.symbol
    );
  }, [sourceToken, targetToken]);

  const {
    swapPrice,
    swapQuantity,
    swapMinReceived,
    swapPriceRevalidating,
    slippage,
    onSlippageChange,
    onSwapDeposit,
    error: swapErrorMessage,
  } = useSwapDeposit({
    sourceToken,
    targetToken,
    currentChain,
    quantity,
    depositFee,
  });

  const {
    maxQuantity,
    maxDepositAmount,
    targetQuantity,
    swapPriceInUSD,
    quantityNotional,
    indexPrice,
    swapIndexPrice,
  } = useDepositFormQuantities({
    sourceToken,
    targetToken,
    balance: balance || "0",
    quantity,
    needSwap,
    swapQuantity,
    swapPrice,
    getIndexPrice,
  });

  const nativeSymbol = useMemo(() => {
    return currentChain?.info?.nativeToken?.symbol;
  }, [currentChain]);

  const onDepositSuccess = useCallback(() => {
    setQuantity("");
    options.close?.();
  }, []);

  const {
    isMutating: depositRevalidating,
    depositError,
    setDepositError,
    onApprove,
    onDeposit,
    onApproveAndDeposit,
  } = useDepositAction({
    quantity,
    approve,
    deposit,
    needSwap,
    swapDeposit: onSwapDeposit,
    onSuccess: onDepositSuccess,
    analyticsContext: {
      chain_id: currentChain?.id,
      symbol: sourceToken?.symbol,
    },
  });

  useEffect(() => {
    setQuantity("");
    setDepositError("");
    // when sourceToken or currentChain?.id changes, clean state
  }, [sourceToken, currentChain?.id]);

  const fee = useDepositFee({ nativeSymbol, depositFee, getIndexPrice });

  const {
    inputStatus,
    hintMessage,
    validationMessage,
    depositDisabled,
    targetInputStatus,
    targetHintMessage,
    showSourceDepositCap,
    showTargetDepositCap,
    slippageValidate,
  } = useDepositValidation({
    sourceToken,
    targetToken,
    quantity,
    targetQuantity,
    maxQuantity,
    isNativeToken,
    depositFee,
    depositFeeFetched,
    depositFeeFailed,
    depositFeeRevalidating,
    nativeBalanceRevalidating,
    dstGasFee: fee.dstGasFee,
    nativeSymbol,
    nativeBalance,
    account,
    currentChain,
    depositError,
    needSwap,
  });

  const usdcToken = useMemo(() => {
    return sourceTokens?.find((item) => item.symbol === "USDC");
  }, [sourceTokens]);

  const actionType = useActionType({ allowance, quantity, maxQuantity });

  const isLoggedIn = useAuthGuard();

  const {
    collateralRatio,
    collateralContributionQuantity,
    currentLTV,
    nextLTV,
  } = useCollateralValue({
    sourceToken,
    targetToken,
    quantity,
    indexPrice: needSwap ? swapIndexPrice : indexPrice,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

  const loading =
    depositFeeRevalidating || depositRevalidating || swapPriceRevalidating;

  const disabled =
    !sourceToken ||
    !quantity ||
    Number(quantity) === 0 ||
    depositDisabled ||
    loading ||
    !!swapErrorMessage;

  const targetQuantityLoading = swapPriceRevalidating;

  const warningMessage = validationMessage || swapErrorMessage;

  const [activeSubTab, _setActiveSubTab] = useState<
    "web3" | "exclusive_deposit"
  >("web3");

  const setActiveSubTab = useCallback(
    (next: "web3" | "exclusive_deposit") => {
      if (next === activeSubTab) {
        _setActiveSubTab(next);
        return;
      }
      emit({
        form: "deposit",
        name: "subtab_changed",
        from_subtab: activeSubTab,
        to_subtab: next,
      });
      _setActiveSubTab(next);
    },
    [activeSubTab, emit],
  );

  const showExclusiveDeposit =
    account.walletAdapter?.chainNamespace !== ChainNamespace.solana;

  const messageToString = (v: unknown): string | undefined =>
    typeof v === "string" ? v : v != null ? String(v) : undefined;

  const prevInputStatusRef = useRef(inputStatus);
  useEffect(() => {
    const prev = prevInputStatusRef.current;
    if (
      prev !== inputStatus &&
      (inputStatus === "error" || inputStatus === "warning")
    ) {
      emit({
        form: "deposit",
        name: "error_surfaced",
        field: "quantity",
        message: messageToString(hintMessage),
        status: inputStatus,
      });
    }
    prevInputStatusRef.current = inputStatus;
  }, [inputStatus, hintMessage, emit]);

  const prevWarningRef = useRef<string | undefined>(
    messageToString(warningMessage),
  );
  useEffect(() => {
    const next = messageToString(warningMessage);
    const prev = prevWarningRef.current;
    if (!prev && next) {
      emit({
        form: "deposit",
        name: "error_surfaced",
        field: "global",
        message: next,
        status: "warning",
      });
    }
    prevWarningRef.current = next;
  }, [warningMessage, emit]);

  return {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,

    nativeSymbol,
    isNativeToken,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    maxDepositAmount,
    onQuantityChange: setQuantity,
    hintMessage,
    inputStatus,
    targetInputStatus,
    targetHintMessage,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    onApproveAndDeposit,
    wrongNetwork,
    balanceRevalidating,
    batchBalancesRevalidating,
    loading,
    disabled,
    networkId,
    fee,
    collateralRatio,
    currentLTV,
    nextLTV,
    ltv_threshold,
    negative_usdc_threshold,
    isConvertThresholdLoading,
    slippage,
    onSlippageChange,
    slippageValidate,
    swapMinReceived,
    usdcToken,

    needSwap,
    swapPrice,
    swapPriceInUSD,
    warningMessage,
    targetQuantity,
    targetQuantityLoading,

    isLoggedIn,
    showSourceDepositCap,
    showTargetDepositCap,
    quantityNotional,

    activeSubTab,
    setActiveSubTab,
    showExclusiveDeposit,
  };
};
