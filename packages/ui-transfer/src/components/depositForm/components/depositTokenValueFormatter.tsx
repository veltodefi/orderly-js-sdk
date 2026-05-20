import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import {
  Flex,
  Text,
  TokenIcon,
  Tips,
  ChevronDownVeltoIcon,
} from "@veltodefi/ui";

type DepositTokenValueFormatterProps = {
  value: string;
  userMaxQty?: number | null;
};

export const DepositTokenValueFormatter: FC<
  DepositTokenValueFormatterProps
> = ({ value, userMaxQty }) => {
  const { t } = useTranslation();

  const tipContent = (
    <Flex direction="column" itemAlign="start">
      <Text size="2xs" weight="semibold" intensity={36}>
        {t("transfer.depositCap.tooltip")}
        <Text as="span" size="2xs" weight="semibold" intensity={80}>
          {value}.
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
    <Flex direction="column" itemAlign="end" gapY={1} mr={3}>
      <Flex gapX={1} itemAlign="center">
        <TokenIcon name={value} className="oui-size-[16px]" />
        <Text weight="regular" className="oui-text-secondary">
          {value}
        </Text>
        <ChevronDownVeltoIcon
          size={9}
          className="oui-text-secondary oui-ml-0.5"
          opacity={1}
        />
      </Flex>
      <Flex itemAlign="center" className="oui-gap-[2px]">
        <Text
          size="2xs"
          weight="regular"
          className="oui-leading-[10px] oui-mr-1"
        >
          {t("transfer.depositCap", "Deposit cap")}{" "}
          <Text.numeral
            as="span"
            size="2xs"
            intensity={98}
            weight="regular"
            className="oui-leading-[10px]"
            dp={0}
          >
            {userMaxQty ?? 0}
          </Text.numeral>
        </Text>
        <Tips content={tipContent} title={t("common.tips")} />
      </Flex>
    </Flex>
  );
};
