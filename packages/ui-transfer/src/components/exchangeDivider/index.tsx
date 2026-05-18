import { FC, ReactNode } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, Text } from "@veltodefi/ui";
import { ArrowDownIcon } from "../../icons";

type ExchangeDividerProps = {
  icon?: ReactNode;
};

export const ExchangeDivider: FC<ExchangeDividerProps> = ({ icon }) => {
  const { t } = useTranslation();

  return (
    <Flex height={56}>
      <Flex height={1} className="oui-flex-1 oui-bg-base-contrast-12"></Flex>
      <Flex className="oui-border oui-rounded-full oui-pr-1.5 oui-pl-0.5 oui-border-base-6">
        {icon || <ArrowDownIcon className="oui-text-primary" />}
        <Text weight="regular" size={"3xs"} className="oui-text-[#C7C7C7]">
          {t(
            "transfer.deposit.fundsMoveToTradingBalance",
            "Funds move into your trading balance",
          )}
        </Text>
      </Flex>
      <Flex height={1} className="oui-flex-1 oui-bg-base-contrast-12"></Flex>
    </Flex>
  );
};
