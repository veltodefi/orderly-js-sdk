import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import { Box, cn, Flex, Spinner, Text, Tips } from "@veltodefi/ui";

// Re-declared locally so this file (and its tests) stay independent of
// `../../../types` — which pulls in @veltodefi/hooks → Solana adapter.
type InputStatus = "error" | "warning" | "success" | "default";

/**
 * Hide the gas-fee row when the source-side input fails validation
 * (e.g. "Insufficient amount"). The fee isn't actionable in that state and
 * showing it implies the user can submit. Keep both `<Fee />` call sites in
 * `depositForm.ui.tsx#renderContent` gated on this predicate.
 */
export const shouldShowEstimatedFee = (inputStatus?: InputStatus): boolean =>
  inputStatus !== "error";

const animationClasses =
  "oui-animate-in oui-fade-in oui-slide-in-from-bottom-2 oui-duration-500 oui-ease-in-out";

export type TradingBalanceProps = {
  targetQuantityLoading: boolean;
  targetQuantity?: string;
  targetToken?: API.TokenInfo;
  targetHintMessage?: string;
  targetInputStatus?: InputStatus;
  showTargetDepositCap?: boolean;
  sourceInputStatus?: InputStatus;
};

export const TradingBalance = ({
  targetQuantityLoading,
  targetQuantity,
  targetToken,
  targetHintMessage,
  targetInputStatus,
  showTargetDepositCap,
  sourceInputStatus,
}: TradingBalanceProps) => {
  // When the source input fails validation (e.g. insufficient wallet
  // balance), suppress the preview so we don't imply the typed amount will
  // land in the trading balance. Show "0" — matching the empty-input state.
  const displayQuantity =
    sourceInputStatus === "error" ? undefined : targetQuantity;
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
            {targetToken
              ? `${displayQuantity || 0} ${targetToken.symbol}`
              : "0"}
          </Text>
        )}
      </Flex>
      {showTargetDepositCap && (
        <Box
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
        </Box>
      )}
    </Flex>
  );
};
