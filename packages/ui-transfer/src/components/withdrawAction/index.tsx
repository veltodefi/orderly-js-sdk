import { useMemo } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { AccountStatusEnum, NetworkId } from "@veltodefi/types";
import { Box, modal, MainButton, cn } from "@veltodefi/ui";
import { AuthGuard } from "@veltodefi/ui-connector";
import { Decimal } from "@veltodefi/utils";
import { WithdrawTo } from "../../types";
import { CrossWithdrawConfirm } from "../crossWithdrawConfirm";
import SwitchChainButton from "./SwitchChainButton";

interface IProps {
  disabled?: boolean;
  loading?: boolean;
  onWithdraw: () => Promise<void>;
  networkId?: NetworkId;
  crossChainWithdraw: boolean;
  address?: string;
  currentChain?: any;
  quantity: string;
  fee: number;
  checkIsBridgeless: boolean;
  withdrawTo: WithdrawTo;
  onTransfer: () => void;
  className?: string;
}

export const WithdrawAction = (props: IProps) => {
  const {
    disabled,
    loading,
    onWithdraw,
    networkId,
    crossChainWithdraw,
    address,
    currentChain,
    quantity,
    fee,
    checkIsBridgeless,
    onTransfer,
    className,
  } = props;
  const { t } = useTranslation();

  const amount = useMemo(() => {
    if (!quantity) {
      return 0;
    }
    return new Decimal(quantity).minus(fee ?? 0).toNumber();
  }, [quantity, fee]);

  const preWithdraw = () => {
    if (crossChainWithdraw) {
      modal.confirm({
        title: t("transfer.withdraw.crossChain.confirmWithdraw"),
        content: (
          <CrossWithdrawConfirm
            address={address!}
            amount={amount}
            currentChain={currentChain}
          />
        ),
        classNames: {
          content: "oui-font-semibold",
          body: "!oui-pb-0",
          footer: "!oui-pt-0",
        },

        onOk: async () => {
          onWithdraw();
        },
      });
      return;
    }
    onWithdraw();
  };

  const buttonSize = { initial: "lg", lg: "lg" } as const;

  const renderButton = () => {
    if (props.withdrawTo === WithdrawTo.Account) {
      return (
        <MainButton
          fullWidth
          variant="primary"
          disabled={disabled}
          loading={loading}
          onClick={onTransfer}
          size={buttonSize}
        >
          {t("common.withdraw")}
        </MainButton>
      );
    }

    if (checkIsBridgeless) {
      return (
        <MainButton
          data-testid="oui-testid-withdraw-dialog-withdraw-btn"
          fullWidth
          variant="primary"
          disabled={disabled}
          loading={loading}
          onClick={preWithdraw}
          size={buttonSize}
        >
          {t("common.withdraw")}
        </MainButton>
      );
    }
    return <SwitchChainButton networkId={networkId} size={buttonSize} />;
  };

  return (
    <Box
      className={cn("oui-w-full lg:oui-w-auto lg:oui-min-w-[184px]", className)}
    >
      <AuthGuard
        status={AccountStatusEnum.EnableTrading}
        networkId={networkId}
        bridgeLessOnly
        buttonProps={{ fullWidth: true, size: buttonSize }}
      >
        {renderButton()}
      </AuthGuard>
    </Box>
  );
};
