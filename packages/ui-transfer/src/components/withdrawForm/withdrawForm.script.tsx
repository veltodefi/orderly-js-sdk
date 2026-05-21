import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  useAccount,
  useAssetsHistory,
  useChains,
  useConfig,
  useEventEmitter,
  useLocalStorage,
  useMemoizedFn,
  useWalletConnector,
  useWalletTopic,
  useWithdraw,
} from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import {
  API,
  AccountStatusEnum,
  AssetHistorySideEnum,
  AssetHistoryStatusEnum,
  NetworkId,
} from "@veltodefi/types";
import { toast } from "@veltodefi/ui";
import { useAuthGuard } from "@veltodefi/ui-connector";
import {
  Decimal,
  int2hex,
  praseChainIdToNumber,
  toNonExponential,
} from "@veltodefi/utils";
import { ethers } from "ethers";
import { detectUserRejection, useTransferAnalytics } from "../../analytics";
import { InputStatus, WithdrawTo } from "../../types";
import { CurrentChain } from "../../types";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useVaultBalance } from "./hooks/useVaultBalance";
import { useWithdrawAccountId } from "./hooks/useWithdrawAccountId";
import { useWithdrawFee } from "./hooks/useWithdrawFee";
import { useWithdrawLTV } from "./hooks/useWithdrawLTV";
import { useWithdrawToken } from "./hooks/useWithdrawToken";

export const validateWalletAddress = (
  address: string,
): { valid: boolean; network?: "EVM" | "SOL" } => {
  if (ethers.isAddress(address)) {
    return { valid: true, network: "EVM" };
  }

  try {
    const pubKey = new PublicKey(address);
    if (PublicKey.isOnCurve(pubKey.toBytes())) {
      return { valid: true, network: "SOL" };
    }
  } catch {}

  return { valid: false };
};

export type WithdrawFormScriptReturn = ReturnType<typeof useWithdrawFormScript>;

const markPrice = 1;

export type WithdrawFormScriptOptions = {
  close?: () => void;
};

export const useWithdrawFormScript = (options: WithdrawFormScriptOptions) => {
  const { t } = useTranslation();
  const { emit } = useTransferAnalytics();
  const [crossChainTrans, setCrossChainTrans] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [assetHistory] = useAssetsHistory(
    {
      page: 1,
      pageSize: 1,
      side: AssetHistorySideEnum.WITHDRAW,
      status: AssetHistoryStatusEnum.PENDING_REBALANCE,
    },
    // update when withdraw status changed
    {
      shouldUpdateOnWalletChanged: (data) =>
        data.side === AssetHistorySideEnum.WITHDRAW,
    },
  );

  const config = useConfig();

  const brokerName = config.get("brokerName");
  const networkId = config.get("networkId") as NetworkId;

  const ee = useEventEmitter();

  const [quantity, setQuantity] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [withdrawTo, setWithdrawTo] = useState<WithdrawTo>(WithdrawTo.Wallet);

  const { wrongNetwork, widgetConfigs } = useAppContext();
  const { account, state } = useAccount();

  const [chains, { findByChainId }] = useChains(networkId, {
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const [linkDeviceStorage] = useLocalStorage("orderly_link_device", {});

  const {
    connectedChain,
    wallet,
    setChain: switchChain,
    settingChain,
  } = useWalletConnector();

  const isLoggedIn = useAuthGuard();

  const [pendingTokenSymbol, setPendingTokenSymbol] = useState<
    string | undefined
  >();

  const currentChain = useMemo(() => {
    // if (!connectedChain) return null;

    const chainId = connectedChain
      ? praseChainIdToNumber(connectedChain.id)
      : Number.parseInt(linkDeviceStorage?.chainId);

    if (!chainId) {
      return null;
    }

    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain!,
    } as CurrentChain;
  }, [findByChainId, connectedChain, linkDeviceStorage]);

  const {
    sourceToken,
    onSourceTokenChange: _OnSourceTokenChange,
    sourceTokens,
    isTokenSupportedOnChain,
  } = useWithdrawToken({
    currentChain,
    withdrawTo,
  });

  const onSourceTokenChange = useMemoizedFn((token: API.TokenInfo) => {
    emit({
      form: "withdraw",
      name: "source_token_changed",
      from_symbol: sourceToken?.symbol,
      to_symbol: token.symbol ?? "unknown",
    });
    setQuantity("");
    _OnSourceTokenChange(token);
    setPendingTokenSymbol(token.symbol);
  });

  const tokenChains = useMemo(() => {
    if (!chains) return [];

    const list = chains.map((chain) => {
      const isSupported = chain.token_infos?.some(
        (token) => token.symbol === sourceToken?.symbol,
      );

      return {
        ...chain.network_infos,
        isSupported,
      };
    });

    // Put supported chains on top, unsupported ones at the bottom
    list.sort((a, b) => {
      const aSupported = !!a.isSupported;
      const bSupported = !!b.isSupported;
      if (aSupported === bSupported) return 0;
      return aSupported ? -1 : 1;
    });

    return list;
  }, [chains, sourceToken?.symbol]);

  const enableWithdrawToExternalWallet =
    widgetConfigs?.withdraw?.enableWithdrawToExternalWallet ?? false;

  const { walletName, address } = useMemo(
    () => ({
      walletName: wallet?.label,
      address: wallet?.accounts?.[0].address,
    }),
    [wallet],
  );

  const [externalWallets, setExternalWallets] = useLocalStorage<
    { address: string; network?: "EVM" | "SOL" }[]
  >("orderly_external_wallets", []);

  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>();

  useEffect(() => {
    setSelectedWalletAddress(undefined);
  }, [currentChain?.namespace]);

  useEffect(() => {
    if (address && !selectedWalletAddress) {
      setSelectedWalletAddress(address);
    }
  }, [address, selectedWalletAddress]);

  const onSelectWallet = (address: string) => {
    setSelectedWalletAddress(address);
  };

  const onAddExternalWallet = (addr: string, network?: "EVM" | "SOL") => {
    const normalizedAddr = addr.trim();
    if (!normalizedAddr) return;

    const connectedAddress = address?.trim();
    if (
      connectedAddress &&
      connectedAddress.toLowerCase() === normalizedAddr.toLowerCase()
    ) {
      setSelectedWalletAddress(normalizedAddr);
      return;
    }

    const exists = (externalWallets || []).some((w: { address: string }) => {
      return w.address?.trim().toLowerCase() === normalizedAddr.toLowerCase();
    });

    if (!exists) {
      setExternalWallets([
        ...(externalWallets || []),
        { address: normalizedAddr, network },
      ]);
    }

    setSelectedWalletAddress(normalizedAddr);
  };

  const onQuantityChange = (qty: string) => {
    setQuantity(qty);
  };

  const amount = useMemo(() => {
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity, markPrice]);

  const { withdraw, maxAmount, unsettledPnL } = useWithdraw({
    token: sourceToken?.symbol,
    decimals: sourceToken?.token_decimal,
  });

  const qtyGreaterThanMaxAmount = useMemo<boolean>(() => {
    if (!quantity || Number.isNaN(quantity)) {
      return false;
    }
    if (!maxAmount || Number.isNaN(maxAmount)) {
      return true;
    }
    return new Decimal(quantity).gt(maxAmount);
  }, [quantity, maxAmount]);

  const {
    vaultBalanceList,
    qtyGreaterThanVault,
    crossChainWithdraw,
    vaultBalanceMessage,
  } = useVaultBalance({
    currentChain,
    sourceToken,
    withdrawTo,
    quantity,
    qtyGreaterThanMaxAmount,
  });

  const withdrawAccountIdState = useWithdrawAccountId({
    token: sourceToken?.symbol!,
    decimals: sourceToken?.token_decimal!,
    quantity,
    setQuantity,
    close: options.close,
    setLoading,
  });

  const checkIsBridgeless = useMemo(() => {
    if (wrongNetwork) {
      return false;
    }
    if (!currentChain) {
      return false;
    }
    if (networkId === "testnet") {
      return true;
    }
    if (!currentChain.info) {
      return false;
    }
    if (
      !currentChain.info.network_infos ||
      !currentChain.info.network_infos.bridgeless
    ) {
      return false;
    }
    return true;
  }, [currentChain, wrongNetwork]);

  const cleanData = () => {
    setQuantity("");
  };

  const onChainChange = useCallback(
    async (chain: API.NetworkInfos) => {
      const chainInfo = findByChainId(chain.chain_id);

      if (
        !chainInfo ||
        chainInfo.network_infos?.chain_id === currentChain?.id
      ) {
        return Promise.resolve();
      }

      emit({
        form: "withdraw",
        name: "chain_changed",
        from_chain_id: currentChain?.id,
        to_chain_id: chain.chain_id,
        wrong_network: !!wrongNetwork,
      });

      return switchChain?.({
        chainId: int2hex(Number(chainInfo.network_infos?.chain_id)),
      })
        .then((switched) => {
          if (switched) {
            toast.success(t("connector.networkSwitched"));
            // clean input value
            cleanData();
          } else {
            toast.error(t("connector.switchChain.failed"));
          }
        })
        .catch((error) => {
          toast.error(`${t("connector.switchChain.failed")}: ${error.message}`);
        });
    },
    [currentChain, switchChain, findByChainId, t, emit, wrongNetwork],
  );

  useEffect(() => {
    if (!pendingTokenSymbol || !sourceTokens || sourceTokens.length === 0) {
      return;
    }

    const matchedToken = sourceTokens.find(
      (token) => token.symbol === pendingTokenSymbol,
    );
    if (matchedToken) {
      onSourceTokenChange(matchedToken);
    }
  }, [pendingTokenSymbol, sourceTokens, onSourceTokenChange, currentChain]);

  const onWithdraw = async () => {
    const analyticsBase = {
      form: "withdraw" as const,
      withdraw_to: withdrawTo as "wallet" | "account",
      is_cross_chain: !!crossChainWithdraw,
      chain_id: currentChain?.id,
      symbol: sourceToken?.symbol,
      amount: quantity,
      fee,
    };

    emit({ ...analyticsBase, name: "action_clicked" });

    if (loading) {
      return;
    }
    if (inputStatus !== "default") {
      return;
    }

    emit({ ...analyticsBase, name: "action_submitted" });
    setLoading(true);
    return withdraw({
      amount: quantity,
      token: sourceToken?.symbol!,
      chainId: currentChain?.id!,
      allowCrossChainWithdraw: crossChainWithdraw,
      receiver: selectedWalletAddress,
    })
      .then((res) => {
        toast.success(t("transfer.withdraw.requested"));
        ee.emit("withdraw:requested");
        options.close?.();
        setQuantity("");
      })
      .catch((e) => {
        const isUserRejection = detectUserRejection(e);
        emit({
          form: "withdraw",
          name: "action_failed",
          withdraw_to: analyticsBase.withdraw_to,
          is_cross_chain: analyticsBase.is_cross_chain,
          error_code:
            typeof e?.code === "string" || typeof e?.code === "number"
              ? String(e.code)
              : null,
          error_message: e?.message ?? "Unknown error",
          is_user_rejection: isUserRejection,
        });
        if (isUserRejection) {
          toast.error(t("transfer.rejectTransaction"));
          return;
        }
        if (
          e.message.indexOf(
            "Signing off chain messages with Ledger is not yet supported",
          ) !== -1
        ) {
          ee.emit("wallet:sign-message-with-ledger-error", {
            message: e.message,
            userAddress: account.address,
          });
          return;
        }

        toast.error(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fee = useWithdrawFee({
    crossChainWithdraw,
    currentChain,
    token: sourceToken?.symbol!,
    withdrawTo,
  });

  const minAmountWarningMessage = useMemo(() => {
    const minAmount = new Decimal(
      sourceToken?.minimum_withdraw_amount ?? 0,
    ).add(fee);

    if (quantity && new Decimal(quantity).lt(minAmount)) {
      return t("transfer.withdraw.minAmount.error", {
        minAmount: toNonExponential(minAmount.toNumber()),
        currency: sourceToken?.symbol,
      });
    }
  }, [quantity, sourceToken?.minimum_withdraw_amount, fee, t]);

  const showQty = useMemo(() => {
    if (!quantity) {
      return "";
    }

    const value = new Decimal(quantity).sub(fee ?? 0);
    if (value.isNegative()) {
      return "";
    }
    return toNonExponential(value.toNumber());
  }, [fee, quantity]);

  const isTokenUnsupported = useMemo(() => {
    if (
      withdrawTo !== WithdrawTo.Wallet ||
      !currentChain ||
      !sourceToken?.symbol
    ) {
      return false;
    }
    return !isTokenSupportedOnChain(sourceToken.symbol);
  }, [withdrawTo, currentChain, sourceToken?.symbol, isTokenSupportedOnChain]);

  useEffect(() => {
    if (isTokenUnsupported && sourceToken?.symbol) {
      setInputStatus("error");
      setHintMessage(
        t("transfer.withdraw.unsupported.token", { token: sourceToken.symbol }),
      );
      return;
    }

    if (!quantity) {
      setInputStatus("default");
      setHintMessage("");
      return;
    }
    const qty = new Decimal(quantity ?? 0);
    if (unsettledPnL < 0) {
      if (qty.gt(maxAmount)) {
        setInputStatus("error");
        setHintMessage(t("transfer.insufficientBalance"));
      } else {
        setInputStatus("default");
        setHintMessage("");
      }
    }
  }, [
    quantity,
    maxAmount,
    unsettledPnL,
    crossChainTrans,
    isTokenUnsupported,
    sourceToken?.symbol,
    t,
  ]);

  const prevInputStatusRef = useRef(inputStatus);
  useEffect(() => {
    const prev = prevInputStatusRef.current;
    if (
      prev !== inputStatus &&
      (inputStatus === "error" || inputStatus === "warning")
    ) {
      emit({
        form: "withdraw",
        name: "error_surfaced",
        field: "quantity",
        message: hintMessage,
        status: inputStatus,
      });
    }
    prevInputStatusRef.current = inputStatus;
  }, [inputStatus, hintMessage, emit]);

  const disabled =
    crossChainTrans ||
    !quantity ||
    Number(quantity) === 0 ||
    ["error", "warning"].includes(inputStatus) ||
    (withdrawTo === WithdrawTo.Account &&
      !withdrawAccountIdState.toAccountId) ||
    qtyGreaterThanMaxAmount ||
    qtyGreaterThanVault ||
    !!minAmountWarningMessage ||
    isTokenUnsupported;

  useEffect(() => {
    setCrossChainTrans(!!assetHistory?.length);
  }, [assetHistory?.length]);

  // it need to use useMemoizedFn wrap ,otherwise crossChainTrans and assetHistory will be first render data
  const handleWalletTopic = useMemoizedFn((data: any) => {
    if (!crossChainTrans) {
      return;
    }
    const txId = assetHistory?.[0]?.tx_id;
    const { trxId, transStatus } = data;
    if (trxId === txId && transStatus === "COMPLETED") {
      setCrossChainTrans(false);
    }
  });

  useWalletTopic({
    onMessage: handleWalletTopic,
  });

  const { hasPositions, onSettlePnl } = useSettlePnl();

  const { currentLTV, nextLTV, ltvWarningMessage } = useWithdrawLTV({
    token: sourceToken?.symbol!,
    quantity,
  });

  const warningMessage =
    ltvWarningMessage || minAmountWarningMessage || vaultBalanceMessage;

  const filteredVaultBalanceList = useMemo(() => {
    if (withdrawTo === WithdrawTo.Account) {
      return [];
    }
    return vaultBalanceList?.filter(
      (item) => Number.parseInt(item.chain_id) === currentChain?.id,
    );
  }, [vaultBalanceList, currentChain, withdrawTo]);

  const onSwitchToSupportedNetwork = useMemoizedFn(async () => {
    if (!tokenChains || tokenChains.length === 0) return;

    const targetNetwork =
      tokenChains.find((item) => item.isSupported) ?? tokenChains[0];

    await onChainChange(targetNetwork);
  });

  const onTransfer = () => {
    const analyticsBase = {
      form: "withdraw" as const,
      withdraw_to: "account" as const,
      is_cross_chain: false,
      chain_id: currentChain?.id,
      symbol: sourceToken?.symbol,
      amount: quantity,
      fee,
    };
    emit({ ...analyticsBase, name: "action_clicked" });
    emit({ ...analyticsBase, name: "action_submitted" });
    // Internal-transfer rejection is swallowed inside useWithdrawAccountId's
    // catch; action_failed for the transfer path will be added when that
    // hook gains an onError callback.
    withdrawAccountIdState.onTransfer();
  };

  return {
    walletName,
    address,
    quantity,
    onQuantityChange,
    sourceToken,
    onSourceTokenChange,
    sourceTokens,
    inputStatus,
    hintMessage,
    amount,
    balanceRevalidating: false,
    maxQuantity: maxAmount,
    disabled,
    loading,
    unsettledPnL,
    wrongNetwork,
    settingChain,
    tokenChains,
    currentChain,
    onChainChange,
    onWithdraw,
    fee,
    crossChainWithdraw,
    crossChainTrans,
    showQty,
    networkId,
    checkIsBridgeless,
    hasPositions,
    onSettlePnl,
    brokerName,
    qtyGreaterThanMaxAmount,
    vaultBalanceList,
    ...withdrawAccountIdState,
    onTransfer,
    withdrawTo,
    setWithdrawTo,
    currentLTV,
    nextLTV,
    warningMessage,

    isLoggedIn,
    isTokenUnsupported,
    onSwitchToSupportedNetwork,

    enableWithdrawToExternalWallet,
    externalWallets,
    selectedWalletAddress: selectedWalletAddress || address,
    onSelectWallet,
    onAddExternalWallet,
    setExternalWallets,
    isEnableTrading:
      state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected,
  };
};
