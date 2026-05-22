import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { cn, Flex, InfoIcon, Text, Tooltip } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";

const TooltipContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className="oui-w-72 oui-max-w-72 oui-text-primary-contrast"
    >
      <Text size="sm" weight="semibold">
        {t("transfer.deposit.collateralContribution")}
      </Text>
      <Text size="2xs" weight="regular">
        {t("transfer.deposit.collateralContribution.explain")}
      </Text>
    </Flex>
  );
};

export const CollateralContribution: React.FC<{
  value: number;
  precision?: number;
}> = (props) => {
  const { t } = useTranslation();
  const { value, precision = 6 } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex itemAlign="center" justify="start">
        <Text size="sm" weight="regular">
          {t("transfer.deposit.collateralContribution")}
        </Text>
        <Tooltip className="oui-p-2" content={<TooltipContent />}>
          <InfoIcon
            size={13}
            className="oui-ml-1 oui-cursor-pointer oui-text-base-1"
          />
        </Tooltip>
      </Flex>
      <Flex itemAlign="center" justify="end" gap={1}>
        <Text.numeral
          dp={precision}
          size="sm"
          rm={Decimal.ROUND_DOWN}
          className={cn("oui-font-semibold")}
          padding={false}
        >
          {value}
        </Text.numeral>
        <Text size="sm" className="oui-select-none">
          USDC
        </Text>
      </Flex>
    </Flex>
  );
};
