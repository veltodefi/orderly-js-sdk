import { FC, useEffect, useRef, useState } from "react";
import { useAccount } from "@veltodefi/hooks";
import { Trans, useTranslation } from "@veltodefi/i18n";
import { API, AccountStatusEnum } from "@veltodefi/types";
import {
  Box,
  Flex,
  Text,
  textVariants,
  Tabs,
  TabPanel,
  ArrowLeftRightIcon,
  Divider,
  Tooltip,
  InfoIcon,
  cn,
  OpenInNewIcon,
} from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import {
  deriveWithdrawWarningType,
  normalizeQuickfillPercentage,
  useTransferAnalytics,
} from "../../analytics";
import { WithdrawTo } from "../../types";
import { LtvWidget } from "../LTV";
import { TextAreaInput } from "../accountIdInput";
import { AmountSelector, Percentages } from "../amountSelector";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { ExchangeDivider } from "../exchangeDivider";
import { QuantityInput } from "../quantityInput";
import { UnsettlePnlInfo } from "../unsettlePnlInfo";
import { WithdrawAction } from "../withdrawAction";
import { WithdrawWarningMessage } from "../withdrawWarningMessage";
import { AddWalletDialog } from "./addWalletDialog";
import { WalletSelector } from "./walletSelector";
import { WithdrawFormScriptReturn } from "./withdrawForm.script";

export type WithdrawFormProps = {
  onAuditLinkClick?: () => void;
  /**
   * Optional node rendered inside the form's scroll container, above the
   * fields. The dialog passes its onboarding header (title + subtitle) here
   * so it scrolls with the rest of the form on short viewports.
   */
  header?: React.ReactNode;
} & WithdrawFormScriptReturn;

const isNonPositive = (value: unknown): boolean => {
  if (value === null || value === undefined || value === "") return true;
  try {
    return new Decimal(String(value)).lte(0);
  } catch {
    return true;
  }
};

export const WithdrawForm: React.FC<WithdrawFormProps> = (props) => {
  const {
    address,
    walletName,
    loading,
    disabled,
    quantity,
    onQuantityChange,
    sourceToken,
    amount,
    maxQuantity,
    tokenChains,
    currentChain,
    fee,
    settingChain,
    crossChainTrans,
    checkIsBridgeless,
    withdrawTo,
    sourceTokens,
    onSourceTokenChange,
    vaultBalanceList,
    qtyGreaterThanMaxAmount,
    isTokenUnsupported,
    onSwitchToSupportedNetwork,
    externalWallets,
    selectedWalletAddress,
    onSelectWallet,
    onAddExternalWallet,
    isEnableTrading,
    enableWithdrawToExternalWallet,
    onAuditLinkClick,
  } = props;

  const { t } = useTranslation();
  const { emit } = useTransferAnalytics();
  const { state: accountState } = useAccount();
  const isConnected = accountState.status !== AccountStatusEnum.NotConnected;
  const [selectedPercentage, setSelectedPercentage] = useState<Percentages>();
  const [addWalletOpen, setAddWalletOpen] = useState(false);

  const handleAddExternalWallet = (
    address: string,
    network?: "EVM" | "SOL",
  ) => {
    onAddExternalWallet?.(address, network);
    emit({
      form: "withdraw",
      name: "add_wallet_submitted",
      network: network ?? null,
    });
  };

  const lastEmittedQuantityRef = useRef<string>("");
  const handleQuantityFieldBlur = () => {
    const value = quantity ?? "";
    if (value && value !== lastEmittedQuantityRef.current) {
      emit({
        form: "withdraw",
        name: "quantity_entered",
        amount: value,
        symbol: sourceToken?.symbol,
      });
      lastEmittedQuantityRef.current = value;
    }
  };

  const externalAddressesRef = useRef(
    new Set((externalWallets ?? []).map((w: { address: string }) => w.address)),
  );
  const handleSelectWallet = (addr: string) => {
    onSelectWallet?.(addr);
    const isExternal = addr !== address;
    emit({
      form: "withdraw",
      name: "wallet_selected",
      selection_type: isExternal ? "external" : "connected",
      is_new_wallet: isExternal && !externalAddressesRef.current.has(addr),
    });
    externalAddressesRef.current.add(addr);
  };

  const handleAddWalletOpen = () => {
    setAddWalletOpen(true);
    emit({ form: "withdraw", name: "add_wallet_opened" });
  };

  const handleSwitchSupportedNetwork = () => {
    emit({ form: "withdraw", name: "switch_network_clicked" });
    onSwitchToSupportedNetwork?.();
  };

  // warning_shown
  const prevWarningTypeRef =
    useRef<ReturnType<typeof deriveWithdrawWarningType>>(null);
  useEffect(() => {
    const next = deriveWithdrawWarningType({
      isConnected,
      crossChainTrans: !!crossChainTrans,
      qtyGreaterThanMaxAmount: !!qtyGreaterThanMaxAmount,
      checkIsBridgeless: !!checkIsBridgeless,
      message: props.warningMessage,
    });
    if (next && next !== prevWarningTypeRef.current) {
      emit({ form: "withdraw", name: "warning_shown", warning_type: next });
    }
    prevWarningTypeRef.current = next;
  }, [
    isConnected,
    crossChainTrans,
    qtyGreaterThanMaxAmount,
    checkIsBridgeless,
    props.warningMessage,
    emit,
  ]);

  // account_id_entered — fires when account lookup resolves to a valid account
  const prevAccountIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (props.toAccountId && props.toAccountId !== prevAccountIdRef.current) {
      emit({
        form: "withdraw",
        name: "account_id_entered",
        lookup_succeeded: !!props.toAccountInfo,
      });
      prevAccountIdRef.current = props.toAccountId;
    }
  }, [props.toAccountId, props.toAccountInfo, emit]);

  const internalWithdrawPanel = (
    <TabPanel
      title={t("transfer.withdraw.otherAccount", {
        brokerName: props.brokerName,
      })}
      value={WithdrawTo.Account}
    >
      <TextAreaInput
        label={t("common.accountId")}
        value={props.toAccountId}
        onChange={props.setToAccountId}
        status={props.toAccountIdInputStatus}
        hintMessage={props.toAccountIdHintMessage}
        disabled={!props.isLoggedIn}
        placeholder={t("transfer.withdraw.accountIdOrAddress.placeholder")}
        enableAccountLookup
        accountInfo={props.toAccountInfo}
        accountDropdownOpen={props.toAccountInfoDropdownOpen}
        setAccountDropdownOpen={props.setToAccountInfoDropdownOpen}
      />
      {/* <Box px={2} className="oui-mt-[-4px] oui-text-base-1 oui-flex oui-items-center oui-gap-1">
        <InfoIcon size={10} className="oui-text-base-1" />
        <Text size="xs" weight="regular">
          {t("transfer.withdraw.accountIdOrAddress.hint")}
        </Text>
      </Box> */}

      <WalletBalance
        sourceToken={sourceToken}
        sourceQuantity={props.showQty}
        className={"oui-mt-4"}
      />
      <Divider className="oui-bg-base-6 oui-my-4" />

      <Flex
        direction="column"
        className="oui-text-base-1"
        itemAlign="start"
        gap={2}
        mt={2}
      >
        <LtvWidget
          showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
          currentLtv={props.currentLTV}
          nextLTV={props.nextLTV}
        />
        <Fee fee={fee} withdrawTo={withdrawTo} />
      </Flex>
    </TabPanel>
  );

  return (
    <Box
      id="oui-withdraw-form"
      className={cn(
        textVariants({ weight: "semibold" }),
        "oui-h-full oui-min-h-0 oui-flex oui-flex-col",
      )}
    >
      <div className="oui-flex-1 oui-min-h-0 oui-overflow-y-auto oui-overflow-x-hidden custom-scrollbar oui-flex oui-flex-col">
        {props.header && (
          <div className="oui-shrink-0 oui-px-5">{props.header}</div>
        )}
        <Box className="oui-mb-6 lg:oui-mb-8 oui-px-5">
          <Box className="md:oui-bg-base-8 md:oui-p-4 oui-rounded-[16px]">
            <Box className="oui-mb-4">
              <BrokerWallet />
            </Box>

            <Flex direction={"column"} itemAlign={"stretch"} gap={2}>
              <div onBlur={handleQuantityFieldBlur}>
                <QuantityInput
                  classNames={{
                    root: "oui-bg-transparent oui-border oui-border-base-1 oui-rounded-2xl",
                  }}
                  value={quantity}
                  iconSize="md"
                  onValueChange={onQuantityChange}
                  token={sourceToken}
                  tokens={sourceTokens}
                  onTokenChange={onSourceTokenChange}
                  status={props.inputStatus}
                  hintMessage={props.hintMessage}
                  hintSuffix={
                    isTokenUnsupported ? (
                      <button
                        type="button"
                        onClick={handleSwitchSupportedNetwork}
                        className="oui-inline-flex oui-items-center oui-gap-1 oui-text-2xs oui-font-semibold oui-text-primary"
                      >
                        {t("common.switch")}
                        <ArrowLeftRightIcon
                          size={16}
                          className="oui-text-primary oui-mt-0.5"
                          opacity={1}
                        />
                      </button>
                    ) : undefined
                  }
                  vaultBalanceList={vaultBalanceList}
                  testId="oui-testid-withdraw-dialog-quantity-input"
                  displayType="vaultBalance"
                  disabled={!props.isLoggedIn}
                />
              </div>

              <AmountSelector
                maxAmount={maxQuantity.toString()}
                disabled={isNonPositive(maxQuantity)}
                selectedPercentage={selectedPercentage}
                onClick={({ selectedPercentage, selectedValue }) => {
                  setSelectedPercentage(selectedPercentage);
                  onQuantityChange(selectedValue);
                  lastEmittedQuantityRef.current = selectedValue;
                  emit({
                    form: "withdraw",
                    name: "quickfill_clicked",
                    percentage:
                      normalizeQuickfillPercentage(selectedPercentage),
                    resulting_amount: selectedValue,
                    max_amount: maxQuantity.toString(),
                  });
                }}
              />

              <AvailableQuantity
                token={sourceToken}
                quantity={amount}
                maxQuantity={maxQuantity.toString()}
                loading={props.balanceRevalidating}
                tooltipContent={t("transfer.withdraw.available.tooltip", {
                  amount: maxQuantity.toString(),
                })}
              />

              <UnsettlePnlInfo
                unsettledPnl={props.unsettledPnL}
                hasPositions={props.hasPositions}
                onSettlePnl={async () => {
                  emit({
                    form: "withdraw",
                    name: "settle_pnl_clicked",
                    unsettled_pnl: props.unsettledPnL,
                  });
                  return props.onSettlePnl?.();
                }}
                tooltipContent={t("settle.unsettled.tooltip")}
                dialogContent={<Trans i18nKey="settle.settlePnl.description" />}
              />
            </Flex>
          </Box>

          <ExchangeDivider variant="withdraw" withdrawTo={withdrawTo} />

          <Box className="md:oui-bg-base-8 md:oui-p-4 oui-rounded-[16px]">
            <Tabs
              value={withdrawTo}
              onValueChange={(tab) => {
                if (tab !== withdrawTo) {
                  emit({
                    form: "withdraw",
                    name: "subtab_changed",
                    from: withdrawTo as "wallet" | "account",
                    to: tab as "wallet" | "account",
                  });
                }
                (props.setWithdrawTo as (t: string) => void)(tab);
              }}
              variant="contained"
              classNames={{
                tabsList: "oui-w-full !oui-space-x-0",
                tabsContent:
                  "oui-pt-4 oui-animate-in oui-fade-in oui-slide-in-from-bottom-2 oui-duration-500 oui-ease-in-out",
                trigger:
                  "oui-flex-1 !oui-rounded-none first:!oui-rounded-l-lg last:!oui-rounded-r-lg oui-h-[40px] oui-text-sm oui-font-normal data-[state=active]:oui-font-normal",
              }}
            >
              <TabPanel
                title={t("transfer.web3Wallet.my")}
                value={WithdrawTo.Wallet}
              >
                {isEnableTrading && enableWithdrawToExternalWallet && (
                  <WalletSelector
                    connectedWallet={
                      address
                        ? {
                            name: walletName || t("common.wallet"),
                            address,
                            namespace: currentChain?.namespace,
                          }
                        : undefined
                    }
                    externalWallets={externalWallets || []}
                    selectedAddress={selectedWalletAddress ?? ""}
                    onSelect={handleSelectWallet}
                    onAddExternalWallet={handleAddWalletOpen}
                  />
                )}

                <ChainSelect
                  chains={tokenChains}
                  value={currentChain!}
                  onValueChange={props.onChainChange}
                  wrongNetwork={props.wrongNetwork}
                  loading={settingChain}
                  disabled={!props.isLoggedIn}
                />

                <WalletBalance
                  sourceToken={sourceToken}
                  sourceQuantity={props.showQty}
                  className={"oui-mt-4"}
                />

                <Divider className="oui-bg-base-6 oui-my-4" />

                <Flex
                  direction="column"
                  className="oui-text-base-1"
                  itemAlign="start"
                  gap={2}
                  mt={2}
                >
                  <LtvWidget
                    showDiff={
                      typeof quantity !== "undefined" && Number(quantity) > 0
                    }
                    currentLtv={props.currentLTV}
                    nextLTV={props.nextLTV}
                  />
                  <Fee fee={fee} withdrawTo={withdrawTo} />
                  {onAuditLinkClick && <AuditLink onClick={onAuditLinkClick} />}
                </Flex>
              </TabPanel>
              {internalWithdrawPanel}
            </Tabs>
          </Box>
        </Box>
      </div>
      <div className="oui-shrink-0 oui-px-5 oui-pt-3">
        <WithdrawWarningMessage
          checkIsBridgeless={checkIsBridgeless}
          crossChainTrans={crossChainTrans}
          qtyGreaterThanMaxAmount={qtyGreaterThanMaxAmount}
          message={props.warningMessage}
        />
        <WithdrawAction
          className="oui-w-full lg:oui-w-full"
          checkIsBridgeless={checkIsBridgeless}
          networkId={props.networkId}
          disabled={disabled}
          loading={loading}
          onWithdraw={props.onWithdraw}
          crossChainWithdraw={props.crossChainWithdraw}
          currentChain={currentChain}
          address={address}
          quantity={quantity}
          fee={fee}
          withdrawTo={withdrawTo}
          onTransfer={props.onTransfer}
        />
      </div>
      {enableWithdrawToExternalWallet && (
        <AddWalletDialog
          open={addWalletOpen}
          onOpenChange={setAddWalletOpen}
          onConfirm={handleAddExternalWallet}
          chain={currentChain}
        />
      )}
    </Box>
  );
};

const WalletBalance = ({
  sourceToken,
  sourceQuantity,
  className,
}: {
  sourceToken?: API.TokenInfo;
  sourceQuantity?: number | string;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"} className={className}>
      <Text size={"sm"} weight="regular" className="oui-text-base-1">
        {`${t("extend.transfer.walletBalance")}:`}
      </Text>

      <Text size={"lg"} className="oui-text-primary-contrast oui-font-semibold">
        {sourceToken ? `${sourceQuantity || 0} ${sourceToken.symbol}` : "0"}
      </Text>
    </Flex>
  );
};

const FeeTooltipContent = () => {
  const { t } = useTranslation();

  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className="oui-w-72 oui-max-w-72 oui-text-primary-contrast"
    >
      <Text size="sm" weight="semibold">
        {t("transfer.deposit.estGasFee")}
      </Text>
      <Text size="2xs" weight="regular">
        {t("transfer.deposit.destinationGasFee.description")}
      </Text>
    </Flex>
  );
};

const Fee = ({ fee, withdrawTo }: { fee: number; withdrawTo: string }) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="row"
      mt={1}
      itemAlign="start"
      justify="between"
      className="oui-w-full"
    >
      <Text size="sm" weight="regular">
        <Flex>
          {withdrawTo === WithdrawTo.Wallet
            ? t("transfer.deposit.estGasFee")
            : t("common.fee")}

          <Tooltip className="oui-p-2" content={<FeeTooltipContent />}>
            <InfoIcon
              size={13}
              className="oui-ml-1 oui-cursor-pointer oui-text-base-1"
            />
          </Tooltip>
        </Flex>
      </Text>
      <Text size="sm" weight="regular">
        {withdrawTo === WithdrawTo.Wallet ? " ≈ " : " = "}
        {fee}
      </Text>
    </Flex>
  );
};

const AuditLink: FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="oui-flex oui-items-center oui-gap-1 oui-text-primary oui-text-sm oui-font-regular hover:oui-text-primary-light oui-cursor-pointer"
    >
      <Text size="sm" weight="regular" className="oui-text-primary">
        {t("transfer.deposit.auditedProtocol", "Audited protocol")}
      </Text>
      <OpenInNewIcon aria-hidden size={16} className="oui-text-primary" />
    </button>
  );
};
