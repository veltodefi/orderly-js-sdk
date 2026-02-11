import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, Text, Tooltip, InfoIcon } from "@veltodefi/ui";
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
        {t("portfolio.overview.column.collateralRatio")}
      </Text>
      <Text size="2xs" weight="regular">
        {t("portfolio.overview.column.collateralRatio.explain")}
      </Text>
    </Flex>
  );
};

export const CollateralRatioUI: React.FC<{ value: number }> = (props) => {
  const { t } = useTranslation();
  const { value } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex justify="start" itemAlign="center">
        <Text size="sm" weight={"regular"}>
          {t("portfolio.overview.column.collateralRatio")}
        </Text>
        <Tooltip className="oui-p-2" content={<TooltipContent />}>
          <InfoIcon
            size={13}
            className="oui-ml-1 oui-cursor-pointer oui-text-primary"
          />
        </Tooltip>
      </Flex>
      <Text.numeral
        dp={2}
        rm={Decimal.ROUND_DOWN}
        size="sm"
        coloring
        className="oui-font-semibold"
        rule="percentages"
      >
        {value}
      </Text.numeral>
    </Flex>
  );
};
