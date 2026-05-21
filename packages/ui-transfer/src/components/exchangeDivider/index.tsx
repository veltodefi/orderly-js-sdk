import { FC, ReactNode } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Flex, Text } from "@veltodefi/ui";
import { ArrowDownIcon } from "../../icons";
import { WithdrawTo } from "../../types";

type ExchangeDividerProps = {
  icon?: ReactNode;
  variant?: "deposit" | "withdraw";
  withdrawTo?: WithdrawTo;
};

export const ExchangeDivider: FC<ExchangeDividerProps> = ({
  icon,
  variant = "deposit",
  withdrawTo = WithdrawTo.Wallet,
}) => {
  const { t } = useTranslation();

  const label =
    variant === "deposit"
      ? t(
          "transfer.deposit.fundsMoveToTradingBalance",
          "Funds move into your trading balance",
        )
      : withdrawTo === WithdrawTo.Account
        ? t(
            "transfer.withdraw.fundsMoveToVeltoAccount",
            "Funds move to another Velto account",
          )
        : t(
            "transfer.withdraw.fundsMoveToWeb3Wallet",
            "Funds move to your Web3 wallet",
          );

  return (
    <Flex className="oui-my-4">
      <Flex height={1} className="oui-flex-1 oui-bg-base-6"></Flex>
      <Flex
        height={32}
        className="oui-hidden md:oui-flex oui-border oui-bg-base-8 oui-rounded-full oui-pr-3 oui-pl-2 oui-border-base-6"
      >
        {icon || <ArrowDownIcon className="oui-text-base-1" />}
        <Text weight="regular" size={"2xs"} className="oui-text-base-1">
          {label}
        </Text>
      </Flex>

      <Flex height={32} className="md:oui-hidden oui-px-2">
        {icon || <ArrowDownIcon className="oui-text-base-1" />}
      </Flex>
      <Flex height={1} className="oui-flex-1 oui-bg-base-6"></Flex>
    </Flex>
  );
};
