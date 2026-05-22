import React from "react";
import { useAccount } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { AccountStatusEnum } from "@veltodefi/types";

interface WarningMessageProps {
  crossChainTrans: boolean;
  checkIsBridgeless: boolean;
  qtyGreaterThanMaxAmount: boolean;
  message?: string;
}

export const WithdrawWarningMessage: React.FC<WarningMessageProps> = (
  props,
) => {
  const { crossChainTrans, qtyGreaterThanMaxAmount } = props;
  const { t } = useTranslation();
  const { state } = useAccount();

  const renderContent = () => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return null;
    }
    if (crossChainTrans) {
      return t("transfer.withdraw.crossChain.process");
    }
    if (qtyGreaterThanMaxAmount) {
      return t("transfer.insufficientBalance");
    }

    return props.message;
  };

  const content = renderContent();

  if (!content) {
    return null;
  }

  return (
    <div className="oui-my-4 oui-w-full oui-text-center oui-text-xs oui-font-normal oui-text-warning-darken">
      {content}
    </div>
  );
};
