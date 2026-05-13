import { FC, isValidElement, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { injectable } from "@veltodefi/plugin-core";
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

export interface DepositTabExtension {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ close?: () => void }>;
  order?: number;
}

export type DepositAndWithdrawProps = {
  activeTab?: string;
  close?: () => void;
  extraTabs?: DepositTabExtension[];
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const { veltoWithdrawOnlyMode } = useAppContext();
  const { extraTabs = [] } = props;
  const [activeTab, setActiveTab] = useState<string>(
    veltoWithdrawOnlyMode ? "withdraw" : props.activeTab || "deposit",
  );
  const { t } = useTranslation();
  const sortedExtra = [...extraTabs].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100),
  );

  const handleTabChange = (value: string) => {
    if (veltoWithdrawOnlyMode && value === "deposit") return;
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
        disabled={veltoWithdrawOnlyMode}
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
      {sortedExtra.map((tab) => (
        <TabPanel
          key={tab.id}
          title={tab.title}
          icon={isValidElement(tab.icon) ? tab.icon : undefined}
          value={tab.id}
        >
          <tab.component close={props.close} />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export const InjectableDepositAndWithdraw = injectable(
  DepositAndWithdraw,
  "Transfer.DepositAndWithdraw",
);

registerSimpleDialog(
  DepositAndWithdrawWithDialogId,
  InjectableDepositAndWithdraw,
  {
    size: "md",
    classNames: {
      content: "oui-border oui-border-line-6",
    },
  },
);

registerSimpleSheet(
  DepositAndWithdrawWithSheetId,
  InjectableDepositAndWithdraw,
);
