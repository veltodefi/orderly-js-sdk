import { FC, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  registerSimpleDialog,
  registerSimpleSheet,
  TabPanel,
  Tabs,
} from "@veltodefi/ui";
import { DepositSlot } from "./depositSlot";
import { WithdrawSlot } from "./withdrawSlot";

export const DepositAndWithdrawWithDialogId = "DepositAndWithdrawWithDialogId";
export const DepositAndWithdrawWithSheetId = "DepositAndWithdrawWithSheetId";

export type DepositAndWithdrawProps = {
  activeTab?: "deposit" | "withdraw";
  close?: () => void;
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const { withdrawOnlyMode } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>(
    withdrawOnlyMode ? "withdraw" : props.activeTab || "deposit",
  );
  const { t } = useTranslation();

  const handleTabChange = (value: string) => {
    if (withdrawOnlyMode && value === "deposit") return;
    setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      variant="contained"
      size="xl"
      classNames={{
        tabsList: "oui-px-0",
        tabsContent:
          activeTab === "deposit"
            ? "md:oui-h-[630px] oui-pt-5 oui-text-white oui-animate-in oui-slide-in-from-right oui-duration-300"
            : "md:oui-h-[630px] oui-pt-5 oui-text-white oui-animate-in oui-slide-in-from-left oui-duration-300",
      }}
    >
      <TabPanel
        title={t("common.deposit")}
        icon={<ArrowDownSquareFillIcon />}
        value="deposit"
        disabled={withdrawOnlyMode}
      >
        <DepositSlot close={props.close} />
      </TabPanel>
      <TabPanel
        title={t("common.withdraw")}
        icon={<ArrowUpSquareFillIcon />}
        value="withdraw"
      >
        <WithdrawSlot close={props.close} />
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(DepositAndWithdrawWithDialogId, DepositAndWithdraw, {
  size: "md",
  classNames: {
    content: "oui-border oui-border-line-6",
  },
});

registerSimpleSheet(DepositAndWithdrawWithSheetId, DepositAndWithdraw);
