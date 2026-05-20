import { FC, ReactNode } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, Text } from "@veltodefi/ui";
import { ArrowDownIcon } from "../../icons";

type ExchangeDividerProps = {
  icon?: ReactNode;
  variant?: "deposit" | "withdraw";
};

export const ExchangeDivider: FC<ExchangeDividerProps> = ({
  icon,
  variant = "deposit",
}) => {
  const { t } = useTranslation();

  return (
    <Flex className="oui-my-4">
      <Flex height={1} className="oui-flex-1 oui-bg-base-6"></Flex>
      <Flex
        height={32}
        className="oui-border oui-bg-base-8 oui-rounded-full oui-pr-3 oui-pl-2 oui-border-base-6"
      >
        {icon || <ArrowDownIcon className="oui-text-base-1" />}
        <Text weight="regular" size={"2xs"} className="oui-text-base-1">
          {variant === "deposit"
            ? t(
                "transfer.deposit.fundsMoveToTradingBalance",
                "Funds move into your trading balance",
              )
            : t(
                "transfer.withdraw.fundsMoveToWeb3Wallet",
                "Funds move into your trading balance",
              )}
        </Text>
      </Flex>
      <Flex height={1} className="oui-flex-1 oui-bg-base-6"></Flex>
    </Flex>
  );
};
