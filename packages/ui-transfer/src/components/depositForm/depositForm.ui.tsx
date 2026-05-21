import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import {
  Box,
  Flex,
  textVariants,
  Text,
  cn,
  Spinner,
  Divider,
  Tips,
  Tabs,
  TabPanel,
  OpenInNewIcon,
  useScreen,
} from "@veltodefi/ui";
import {
  normalizeQuickfillPercentage,
  useTransferAnalytics,
} from "../../analytics";
import { InputStatus } from "../../types";
import { LtvWidget } from "../LTV";
import { ActionButton } from "../actionButton";
import { AmountSelector } from "../amountSelector";
import type { Percentages } from "../amountSelector";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { CollateralContribution } from "../collateralContribution";
import { CollateralRatioWidget } from "../collateralRatio";
import { ExchangeDivider } from "../exchangeDivider";
import { ExclusiveDeposit } from "../exclusiveDeposit";
import { Fee } from "../fee";
import { MinimumReceived } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { Slippage } from "../slippage";
import { Web3Wallet } from "../web3Wallet";
import { YieldBearingReminder } from "../yieldBearingReminder";
import { ConvertRate } from "./components/convertRate";
import { DepositTokenValueFormatter } from "./components/depositTokenValueFormatter";
import { Notice } from "./components/notice";
import { type DepositFormScriptReturn } from "./depositForm.script";

type Props = { onAuditLinkClick?: () => void } & DepositFormScriptReturn;

// Common animation classes for reusability
const animationClasses =
  "oui-animate-in oui-fade-in oui-slide-in-from-bottom-2 oui-duration-500 oui-ease-in-out";

export const DepositForm: FC<Props> = (props) => {
  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    maxDepositAmount,
    onQuantityChange,
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
    loading,
    disabled,
    networkId,
    fee,
    collateralRatio,
    currentLTV,
    nextLTV,
    slippage,
    onSlippageChange,
    swapMinReceived,
    needSwap,
    swapPrice,
    swapPriceInUSD,
    warningMessage,
    usdcToken,
    targetQuantity,
    targetQuantityLoading,
    batchBalancesRevalidating,
    showSourceDepositCap,
    showTargetDepositCap,
    slippageValidate,
    quantityNotional,
    activeSubTab,
    setActiveSubTab,
    showExclusiveDeposit,
    onAuditLinkClick,
  } = props;

  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const { emit } = useTransferAnalytics();
  const [selectedPercentage, setSelectedPercentage] = useState<Percentages>();

  const lastEmittedQuantityRef = useRef<string>("");
  const handleQuantityFieldBlur = () => {
    const value = quantity ?? "";
    if (value && value !== lastEmittedQuantityRef.current) {
      emit({
        form: "deposit",
        name: "quantity_entered",
        amount: value,
        symbol: sourceToken?.symbol,
      });
      lastEmittedQuantityRef.current = value;
    }
  };

  const lastEmittedSlippageRef = useRef<number | undefined>(slippage);
  const handleSlippageFieldBlur = () => {
    if (slippage !== undefined && slippage !== lastEmittedSlippageRef.current) {
      const validation =
        typeof slippageValidate === "function"
          ? slippageValidate(slippage)
          : undefined;
      emit({
        form: "deposit",
        name: "slippage_changed",
        value: slippage,
        validate_status: validation || undefined,
      });
      lastEmittedSlippageRef.current = slippage;
    }
  };

  useEffect(() => {
    setSelectedPercentage(undefined);
  }, [targetToken?.symbol]);

  const tokenValueFormatter = (value: string) => (
    <DepositTokenValueFormatter
      value={value}
      userMaxQty={targetToken?.user_max_qty}
    />
  );

  const renderContent = (token?: string) => {
    if (balanceRevalidating) {
      return (
        <Flex key="spinner" justify={"center"}>
          <Spinner size="md" />
        </Flex>
      );
    }

    if (token === "USDC") {
      return (
        <Flex
          key="usdc-content"
          direction="column"
          className={cn("oui-text-base-1", animationClasses)}
          itemAlign="start"
          gap={2}
        >
          <Fee {...fee} nativeSymbol={props.nativeSymbol} />
          {onAuditLinkClick && <AuditLink onClick={onAuditLinkClick} />}
        </Flex>
      );
    }

    return (
      <Flex
        direction="column"
        itemAlign="start"
        mt={2}
        gap={2}
        className={cn("oui-text-base-1", animationClasses)}
      >
        {needSwap && (
          <ConvertRate
            sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
            targetSymbol={targetToken?.display_name || targetToken?.symbol}
            precision={targetToken?.precision}
            swapPrice={swapPrice!}
            swapPriceInUSD={swapPriceInUSD}
          />
        )}
        <CollateralRatioWidget value={collateralRatio} />
        <CollateralContribution
          // it need to use USDC precision
          precision={usdcToken?.precision}
          value={collateralContributionQuantity}
        />
        <LtvWidget
          showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
          currentLtv={currentLTV}
          nextLTV={nextLTV}
        />
        {needSwap && (
          <>
            <div onBlur={handleSlippageFieldBlur}>
              <Slippage
                value={slippage}
                onValueChange={onSlippageChange}
                min={0.01}
                max={50}
                validate={slippageValidate}
              />
            </div>
            <MinimumReceived
              value={swapMinReceived!}
              symbol={targetToken?.symbol ?? ""}
              precision={targetToken?.precision}
            />
          </>
        )}

        <Fee {...fee} nativeSymbol={props.nativeSymbol} />
        {onAuditLinkClick && <AuditLink onClick={onAuditLinkClick} />}
      </Flex>
    );
  };

  const web3Content = (
    <>
      <div className="oui-flex-1 oui-min-h-0 oui-overflow-y-auto oui-overflow-x-hidden custom-scrollbar oui-px-5">
        <Box className="oui-mb-6 lg:oui-mb-8">
          <Box className="md:oui-bg-base-8 md:oui-p-4 oui-rounded-[16px]">
            <Flex direction={"column"} itemAlign={"stretch"} gap={3}>
              <Web3Wallet />

              <ChainSelect
                chains={chains}
                value={currentChain!}
                onValueChange={onChainChange}
                wrongNetwork={wrongNetwork}
                loading={settingChain}
                disabled={!props.isLoggedIn}
              />

              <div onBlur={handleQuantityFieldBlur}>
                <QuantityInput
                  classNames={{
                    root: "oui-bg-transparent oui-border oui-border-base-1 oui-rounded-2xl",
                  }}
                  iconSize="md"
                  value={quantity}
                  onValueChange={onQuantityChange}
                  token={sourceToken}
                  tokens={sourceTokens}
                  onTokenChange={onSourceTokenChange}
                  status={inputStatus}
                  hintMessage={hintMessage}
                  // when show deposit cap, hide select caret
                  tokenShowCaret={
                    !showSourceDepositCap && sourceTokens?.length > 1
                  }
                  tokenValueFormatter={
                    showSourceDepositCap ? tokenValueFormatter : undefined
                  }
                  disabled={!props.isLoggedIn}
                  balancesRevalidating={batchBalancesRevalidating}
                  showBalance
                />
              </div>

              <AmountSelector
                maxAmount={maxDepositAmount}
                precision={sourceToken?.precision}
                disabled={!maxDepositAmount || maxDepositAmount === "0"}
                selectedPercentage={selectedPercentage}
                onClick={({ selectedPercentage, selectedValue }) => {
                  setSelectedPercentage(selectedPercentage);
                  onQuantityChange(selectedValue);
                  lastEmittedQuantityRef.current = selectedValue;
                  emit({
                    form: "deposit",
                    name: "quickfill_clicked",
                    percentage:
                      normalizeQuickfillPercentage(selectedPercentage),
                    resulting_amount: selectedValue,
                    max_amount: maxDepositAmount,
                  });
                }}
              />

              <AvailableQuantity
                token={sourceToken}
                quantity={quantity}
                maxQuantity={maxQuantity}
                notional={quantityNotional}
                loading={balanceRevalidating}
              />

              {/* Yield-bearing collateral reminder */}
              <YieldBearingReminder
                symbol={targetToken?.symbol}
                className="oui-mt-3"
              />
            </Flex>
          </Box>

          <ExchangeDivider variant="deposit" />

          <Box className="md:oui-bg-base-8 md:oui-p-4 oui-rounded-[16px]">
            <Flex direction={"column"} itemAlign={"stretch"} gap={4}>
              <BrokerWallet />
              <TradingBalance
                targetQuantity={targetQuantity}
                targetToken={targetToken}
                targetQuantityLoading={targetQuantityLoading}
                showTargetDepositCap={showTargetDepositCap}
                targetHintMessage={targetHintMessage}
                targetInputStatus={targetInputStatus}
              />
              <Divider className="oui-bg-base-6" />
              {renderContent(targetToken?.symbol)}
            </Flex>
          </Box>
        </Box>
      </div>
      <Box className="oui-shrink-0 oui-px-5 oui-pt-3">
        <Notice message={warningMessage} wrongNetwork={wrongNetwork} />
        <ActionButton
          actionType={actionType}
          symbol={sourceToken?.symbol}
          disabled={disabled}
          loading={loading}
          onDeposit={onDeposit}
          onApprove={onApprove}
          onApproveAndDeposit={onApproveAndDeposit}
          networkId={networkId}
        />
      </Box>
    </>
  );

  return (
    <Box
      id="oui-deposit-form"
      className={cn(
        textVariants({ weight: "semibold" }),
        "oui-h-full oui-min-h-0 oui-flex oui-flex-col",
      )}
    >
      {showExclusiveDeposit ? (
        <Tabs
          value={activeSubTab}
          onValueChange={(value) =>
            setActiveSubTab(value as "web3" | "exclusive_deposit")
          }
          variant="contained"
          className="oui-flex oui-flex-col oui-flex-1 oui-min-h-0"
          classNames={{
            tabsListContainer: "oui-shrink-0 oui-px-5",
            tabsList: "oui-w-full !oui-space-x-0",
            tabsContent:
              "data-[state=active]:oui-flex data-[state=active]:oui-flex-col oui-flex-1 oui-min-h-0",
            trigger:
              "oui-flex-1 !oui-rounded-none first:!oui-rounded-l-lg last:!oui-rounded-r-lg oui-h-[40px] oui-text-sm oui-font-normal data-[state=active]:oui-font-normal",
          }}
        >
          <TabPanel
            title={
              isMobile
                ? t(
                    "transfer.deposit.tab.connectedWalletShort",
                    "Connected wallet",
                  )
                : t("transfer.deposit.tab.connectedWallet")
            }
            value="web3"
          >
            <div className="oui-pt-3 oui-flex-1 oui-min-h-0 oui-flex oui-flex-col">
              {web3Content}
            </div>
          </TabPanel>
          <TabPanel
            title={
              isMobile
                ? t(
                    "transfer.deposit.tab.exchangeOrOtherWalletShort",
                    "Exchange / other wallet",
                  )
                : t("transfer.deposit.tab.exchangeOrOtherWallet")
            }
            value="exclusive_deposit"
          >
            <Box className={"oui-overflow-hidden oui-rounded-2xl oui-mx-5"}>
              <ExclusiveDeposit active={activeSubTab === "exclusive_deposit"} />
            </Box>
          </TabPanel>
        </Tabs>
      ) : (
        web3Content
      )}
    </Box>
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

const TradingBalance = ({
  targetQuantityLoading,
  targetQuantity,
  targetToken,
  targetHintMessage,
  targetInputStatus,
  showTargetDepositCap,
}: {
  targetQuantityLoading: boolean;
  targetQuantity?: string;
  targetToken?: API.TokenInfo;
  targetHintMessage?: string;
  targetInputStatus?: InputStatus;
  showTargetDepositCap?: boolean;
}) => {
  const { t } = useTranslation();

  const tipContent = (
    <Flex direction="column" itemAlign="start">
      <Text size="2xs" weight="semibold" intensity={36}>
        {t("transfer.depositCap.tooltip")}
        <Text as="span" size="2xs" weight="semibold" intensity={80}>
          {targetToken?.symbol}.
        </Text>
      </Text>
      <a
        href="https://orderly.network/docs/introduction/trade-on-orderly/multi-collateral#max-deposits-user"
        target="_blank"
        rel="noopener noreferrer"
        className="oui-text-2xs oui-text-primary"
      >
        {t("common.learnMore")}
      </a>
    </Flex>
  );

  return (
    <Flex direction={"column"}>
      <Flex justify={"between"} className="oui-w-full">
        <Text size={"sm"} weight="regular" className="oui-text-base-1">
          {`${t("extend.transfer.tradingBalance")}:`}
        </Text>
        {targetQuantityLoading ? (
          <Spinner size="sm" className="oui-h-[26px]" />
        ) : (
          <Text
            size={"lg"}
            className="oui-text-primary-contrast oui-font-semibold"
          >
            {targetToken ? `${targetQuantity || 0} ${targetToken.symbol}` : "0"}
          </Text>
        )}
      </Flex>
      {showTargetDepositCap && (
        <div
          className={cn(
            "oui-w-full oui-my-2 oui-p-2 oui-rounded-lg oui-bg-base-6",
            animationClasses,
          )}
        >
          <Flex justify={"between"} className="oui-w-full">
            <Flex>
              <Text
                size={"2xs"}
                weight="regular"
                className="oui-text-base-1 oui-mr-1"
              >
                {t("transfer.depositCap", "Deposit cap") + ":"}
              </Text>
              <Tips content={tipContent} title={t("common.tips")} />
            </Flex>
            <Text
              as="span"
              size="2xs"
              intensity={98}
              weight="regular"
              className="oui-leading-[10px]"
            >
              <Text.numeral dp={0}>
                {targetToken?.user_max_qty ?? 0}
              </Text.numeral>{" "}
              {targetToken?.symbol}
            </Text>
          </Flex>
          {targetHintMessage && (
            <Flex mt={1} justify="between" itemAlign="center">
              <Text
                size="2xs"
                className={cn(
                  "oui-font-normal",
                  targetInputStatus === "error" && "oui-text-danger-light",
                  targetInputStatus === "warning" && "oui-text-warning-light",
                )}
              >
                {targetHintMessage}
              </Text>
            </Flex>
          )}
        </div>
      )}
    </Flex>
  );
};
