import { FC, useEffect, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import {
  Box,
  Flex,
  InfoIcon,
  textVariants,
  Text,
  TokenIcon,
  ChevronDownVeltoIcon,
  Tooltip,
  modal,
  useScreen,
  cn,
  Spinner,
  Divider,
} from "@veltodefi/ui";
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
import { Fee } from "../fee";
import { MinimumReceived } from "../minimumReceived";
import { QuantityInput } from "../quantityInput";
import { Slippage } from "../slippage";
import { Notice } from "../swap/components/notice";
import { SwapFee } from "../swap/components/swapFee";
import { SwapCoin } from "../swapCoin";
import { SwapIndicator } from "../swapIndicator";
import { Web3Wallet } from "../web3Wallet";
import { YieldBearingReminder } from "../yieldBearingReminder";
import {
  SWAP_USDC_PRECISION,
  type DepositFormScriptReturn,
} from "./depositForm.script";

type Props = { layout?: "onboarding" } & DepositFormScriptReturn;

export const DepositForm: FC<Props> = (props) => {
  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,
    amount,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    maxDepositAmount,
    onQuantityChange,
    hintMessage,
    inputStatus,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    onApproveAndDeposit,
    fetchBalance,
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
    minimumReceived,
    needSwap,
    needCrossSwap,
    swapPrice,
    swapFee,
    warningMessage,
    usdcToken,
    targetQuantity,
    targetQuantityLoading,
    layout,
  } = props;

  const { t } = useTranslation();
  const [selectedPercentage, setSelectedPercentage] = useState<Percentages>();
  const { isMobile } = useScreen();

  const showRegularTokenRenderer =
    sourceToken?.user_max_qty !== undefined && sourceToken?.user_max_qty === -1;

  useEffect(() => {
    setSelectedPercentage(undefined);
  }, [targetToken?.symbol]);

  const renderDepositCapTooltipContent = (tokenLabel: string) => (
    <Flex direction="column" itemAlign="start">
      <Text size="2xs" weight="regular">
        {t("transfer.depositCap.tooltip")}
        <Text as="span" size="2xs" weight="semibold">
          {tokenLabel}.
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

  const tokenValueFormatter = (value: string) => (
    <Flex direction="column" itemAlign="end" gapY={1}>
      <Flex gapX={1} itemAlign="center">
        <TokenIcon name={value} className="oui-size-[16px]" />
        <Text weight="regular" className="oui-text-secondary">
          {value}
        </Text>
        <ChevronDownVeltoIcon
          size={12}
          className="oui-text-secondary oui-ml-0.5"
          opacity={1}
        />
      </Flex>
      <Flex itemAlign="center" className="oui-gap-[2px]">
        <Text size="2xs" weight="regular" className="oui-leading-[10px]">
          {t("transfer.depositCap", "Deposit cap")}:{" "}
          <Text.numeral
            as="span"
            size="2xs"
            intensity={80}
            weight="regular"
            className="oui-leading-[10px]"
            dp={0}
          >
            {sourceToken?.user_max_qty?.toString() || "0"}
          </Text.numeral>
        </Text>
        {isMobile ? (
          <button
            type="button"
            className="oui-flex oui-items-center"
            onClick={(event) => {
              event.stopPropagation();
              modal.alert({
                title: t("common.tips"),
                message: <Box>{renderDepositCapTooltipContent(value)}</Box>,
              });
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <InfoIcon
              className="oui-size-3 oui-shrink-0 oui-cursor-pointer"
              opacity={0.36}
            />
          </button>
        ) : (
          <Tooltip
            content={
              <Box
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {renderDepositCapTooltipContent(value)}
              </Box>
            }
          >
            <InfoIcon className="oui-ml-0.5 oui-size-3 oui-shrink-0 oui-cursor-pointer oui-text-primary oui-opacity-100 oui-filter-none" />
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );

  const renderContent = (token?: string) => {
    // Common animation classes for reusability
    const animationClasses =
      "oui-animate-in oui-fade-in oui-slide-in-from-bottom-2 oui-duration-500 oui-ease-in-out";

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
          className={cn("oui-text-[#C7C7C7]", animationClasses)}
          itemAlign="start"
          gap={2}
        >
          <Fee {...fee} nativeSymbol={props.nativeSymbol} />
        </Flex>
      );
    }

    if (needSwap || needCrossSwap) {
      return (
        <Flex
          key="swap-content"
          direction="column"
          className={cn("oui-text-[#C7C7C7]", animationClasses)}
          itemAlign="start"
          gap={2}
        >
          <Flex width={"100%"} itemAlign="center" justify="between">
            <Text size="sm" weight="regular">
              {t("transfer.deposit.convertRate")}
            </Text>
            <SwapCoin
              sourceSymbol={sourceToken?.display_name || sourceToken?.symbol}
              targetSymbol={targetToken?.display_name || targetToken?.symbol}
              precision={SWAP_USDC_PRECISION}
              indexPrice={swapPrice}
            />
          </Flex>
          <Slippage value={slippage} onValueChange={onSlippageChange} />
          <MinimumReceived
            value={minimumReceived}
            symbol={targetToken?.symbol ?? ""}
            precision={SWAP_USDC_PRECISION}
          />
          <SwapFee {...swapFee} />
        </Flex>
      );
    }

    return (
      <Flex
        key="default-content"
        direction="column"
        className={cn("oui-text-[#C7C7C7]", animationClasses)}
        itemAlign="start"
        gap={2}
      >
        <CollateralRatioWidget value={collateralRatio} />
        <CollateralContribution
          // it need to use USDC precision
          precision={usdcToken?.precision ?? 6}
          value={collateralContributionQuantity}
        />
        <LtvWidget
          showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
          currentLtv={currentLTV}
          nextLTV={nextLTV}
        />
        <Fee {...fee} nativeSymbol={props.nativeSymbol} />
      </Flex>
    );
  };

  return (
    <Box
      id="oui-deposit-form"
      className={cn(
        textVariants({ weight: "semibold" }),
        "oui-h-full oui-flex oui-flex-col oui-justify-between",
      )}
    >
      <div>
        <Box className="oui-mb-6 lg:oui-mb-8">
          <Box
            className="oui-bg-base-8"
            p={layout === "onboarding" ? 4 : 0}
            r="2xl"
          >
            <Flex direction={"column"} itemAlign={"stretch"} gap={2}>
              <Web3Wallet />

              {layout === "onboarding" && (
                <Text size="sm" weight="regular" className="oui-text-[#5B8FFF]">
                  {/* @ts-ignore */}
                  {t("transfer.ourTraders")}
                </Text>
              )}

              <ChainSelect
                chains={chains}
                value={currentChain!}
                onValueChange={onChainChange}
                wrongNetwork={wrongNetwork}
                loading={settingChain}
                disabled={!props.isLoggedIn}
              />

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
                highlightOnHover={!!sourceTokens.length}
                fetchBalance={fetchBalance}
                tokenBalances={props.tokenBalances}
                tokenShowCaret={showRegularTokenRenderer}
                tokenValueFormatter={
                  showRegularTokenRenderer ? undefined : tokenValueFormatter
                }
                data-testId="oui-testid-deposit-dialog-quantity-input"
                disabled={!props.isLoggedIn}
              />

              <AmountSelector
                maxAmount={maxDepositAmount}
                disabled={!maxDepositAmount || maxDepositAmount === "0"}
                selectedPercentage={selectedPercentage}
                onClick={({ selectedPercentage, selectedValue }) => {
                  setSelectedPercentage(selectedPercentage);
                  onQuantityChange(selectedValue);
                }}
              />

              <AvailableQuantity
                token={sourceToken}
                amount={amount}
                maxQuantity={maxQuantity}
                loading={balanceRevalidating}
              />

              {/* Yield-bearing collateral reminder */}
              <YieldBearingReminder
                symbol={targetToken?.symbol}
                className="oui-mt-3"
              />
            </Flex>
          </Box>

          <ExchangeDivider layout={layout} />

          <Box
            className="oui-bg-base-8"
            p={layout === "onboarding" ? 4 : 0}
            r="2xl"
          >
            <Flex direction={"column"} itemAlign={"stretch"} gap={4}>
              <BrokerWallet />

              <TradingBalance
                targetQuantity={targetQuantity}
                targetToken={targetToken}
                targetQuantityLoading={targetQuantityLoading}
              />

              <Divider className="oui-bg-base-6" />

              {renderContent(targetToken?.symbol)}
            </Flex>
          </Box>
        </Box>

        <SwapIndicator
          sourceToken={sourceToken?.symbol}
          targetToken={targetToken?.symbol}
          className="oui-mb-3"
        />
      </div>
      <Box>
        <Notice
          message={warningMessage}
          needSwap={needSwap}
          needCrossSwap={needCrossSwap}
          wrongNetwork={wrongNetwork}
          networkId={networkId}
        />
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
    </Box>
  );
};

const TradingBalance = ({
  targetQuantityLoading,
  targetQuantity,
  targetToken,
}: {
  targetQuantityLoading: boolean;
  targetQuantity?: string;
  targetToken?: API.TokenInfo;
}) => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"}>
      <Text size={"sm"} weight="regular" className="oui-text-[#C7C7C7]">
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
  );
};
