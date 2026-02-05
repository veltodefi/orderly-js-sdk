import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, InfoIcon, Text, Tooltip } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { type UseDepositFeeReturn } from "../depositForm/depositForm.script";

type FeeProps = Partial<UseDepositFeeReturn> & {
  nativeSymbol?: string;
};

const TooltipContent = () => {
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

export const Fee: FC<FeeProps> = (props) => {
  const { dstGasFee, feeQty, feeAmount, dp, nativeSymbol } = props;
  const { t } = useTranslation();

  const showFeeQty = !!dstGasFee && dstGasFee !== "0";

  return (
    <Text
      size="sm"
      weight="regular"
      className="oui-flex oui-w-full oui-justify-between"
    >
      <Flex>
        {t("transfer.deposit.estGasFee")}
        <Tooltip className="oui-p-2" content={<TooltipContent />}>
          <InfoIcon
            size={13}
            className="oui-ml-1 oui-cursor-pointer oui-text-primary"
          />
        </Tooltip>
      </Flex>
      <Text size="sm">
        $
        <Text.numeral size="sm" dp={2} padding={false} rm={Decimal.ROUND_UP}>
          {feeAmount!}
        </Text.numeral>{" "}
        {showFeeQty && (
          <span>
            (
            <Text>
              <Text.numeral
                size="sm"
                dp={dp}
                padding={false}
                rm={Decimal.ROUND_UP}
              >
                {feeQty!}
              </Text.numeral>
              {nativeSymbol}
            </Text>
            )
          </span>
        )}
      </Text>
    </Text>
  );
};
