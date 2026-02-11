import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { cn, Flex, Tooltip, Text, Box, InfoIcon } from "@veltodefi/ui";
import type { LtvScriptReturns } from "./ltv.script";

const calculateTextColor = (val: number): string => {
  if (val >= 0 && val < 50) {
    return "oui-text-success";
  } else if (val >= 50 && val < 80) {
    return "oui-text-warning";
  } else if (val >= 80) {
    return "oui-text-danger";
  } else {
    return "";
  }
};

const calculateDataAccentColor = (val: number): string => {
  if (val >= 0 && val < 50) {
    return "profit";
  } else if (val >= 50 && val < 80) {
    return "neutral";
  } else if (val >= 80) {
    return "loss";
  } else {
    return "";
  }
};

const TooltipContent: React.FC<{
  isLoading: boolean;
  ltv_threshold: string;
}> = (props) => {
  const { isLoading, ltv_threshold } = props;
  const { t } = useTranslation();
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className="oui-w-72 oui-max-w-72 oui-text-primary-contrast"
    >
      <Text size="sm" weight="semibold">
        {t("transfer.LTV")}
      </Text>
      <Text size="2xs" weight="regular">
        {t("transfer.LTV.description", {
          threshold: isLoading ? "-" : ltv_threshold,
        })}
      </Text>
    </Flex>
  );
};

export const LtvUI: React.FC<
  Readonly<
    LtvScriptReturns & {
      currentLtv: number;
      nextLTV: number;
      showDiff?: boolean;
    }
  >
> = (props) => {
  const { t } = useTranslation();
  const { currentLtv, nextLTV, showDiff, ltv_threshold, isLoading } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex justify="start" itemAlign="center">
        <Text size="sm" weight="regular">
          {t("transfer.LTV")}
        </Text>
        <Tooltip
          className="oui-p-2"
          content={
            <TooltipContent
              isLoading={isLoading}
              ltv_threshold={ltv_threshold}
            />
          }
        >
          <InfoIcon
            size={13}
            className="oui-ml-1 oui-cursor-pointer oui-text-primary"
          />
        </Tooltip>
      </Flex>
      {showDiff ? (
        <Flex itemAlign="center" justify="between" gap={1}>
          <Text
            data-accent-color={calculateDataAccentColor(currentLtv)}
            size="sm"
            className={cn("oui-font-semibold", calculateTextColor(currentLtv))}
          >
            {currentLtv}%
          </Text>
          →
          <Text
            data-accent-color={calculateDataAccentColor(nextLTV)}
            size="sm"
            className={cn("oui-font-semibold", calculateTextColor(nextLTV))}
          >
            {nextLTV}%
          </Text>
        </Flex>
      ) : (
        <Text
          data-accent-color={calculateDataAccentColor(currentLtv)}
          size="sm"
          className={cn("oui-font-semibold", calculateTextColor(currentLtv))}
        >
          {currentLtv}%
        </Text>
      )}
    </Flex>
  );
};
