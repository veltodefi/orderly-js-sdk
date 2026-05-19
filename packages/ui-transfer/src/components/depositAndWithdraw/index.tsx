import { FC, isValidElement, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { injectable } from "@veltodefi/plugin-core";
import { useAppContext } from "@veltodefi/react-app";
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  Flex,
  InfoIcon,
  registerSimpleDialog,
  registerSimpleSheet,
  TabPanel,
  Tabs,
  Text,
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
  /**
   * Opens an explanatory dialog ("Why do I need to lock collateral?"). When
   * provided, an info icon renders next to the deposit-tab title. The host app
   * owns the dialog contents.
   */
  onInfoIconClick?: () => void;
  /**
   * Opens an audit-report surface (e.g. the webapp's Security & Transparency
   * dialog). When provided, the deposit form renders an "Audited protocol ↗"
   * link near the gas-fee row.
   */
  onAuditLinkClick?: () => void;
  /**
   * Renders the onboarding-only chrome: a dialog title, a non-custodial
   * subtitle, and a "Skip for now" footer with reassurance copy. Defaults to
   * false (account-level dialog has no title/subtitle/footer per the
   * design prototype).
   */
  isOnboarding?: boolean;
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

  const isDeposit = activeTab === "deposit";

  return (
    <Flex direction="column" itemAlign="stretch" className="oui-w-full">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        variant="contained"
        size="xl"
        classNames={{
          tabsList: "oui-px-0",
          trigger: "oui-rounded-lg oui-px-4",
          tabsContent: "oui-pt-5 oui-text-white",
        }}
      >
        <TabPanel
          title={t("common.deposit")}
          icon={<ArrowDownToLineIcon size={16} />}
          value="deposit"
          disabled={veltoWithdrawOnlyMode}
        >
          {props.isOnboarding && (
            <Flex
              direction="column"
              itemAlign="stretch"
              gap={3}
              className="oui-mb-4"
            >
              <Flex itemAlign="center" gap={2}>
                <Text
                  size="xl"
                  weight="semibold"
                  className="oui-text-primary-contrast"
                >
                  {t(
                    "transfer.deposit.dialogTitle",
                    "Set up your trading balance",
                  )}
                </Text>
                {props.onInfoIconClick && (
                  <button
                    type="button"
                    onClick={props.onInfoIconClick}
                    className="oui-cursor-pointer oui-text-primary hover:oui-text-primary-light oui-flex oui-items-center"
                    aria-label={t(
                      "transfer.deposit.dialogTitle",
                      "Set up your trading balance",
                    )}
                  >
                    <InfoIcon size={20} />
                  </button>
                )}
              </Flex>
              <Text size="sm" weight="regular" className="oui-text-[#C7C7C7]">
                {t(
                  "transfer.deposit.dialogSubtitle",
                  "Your USDC stays on-chain in your name — Velto is non-custodial and never holds your funds. Withdraw anytime.",
                )}
              </Text>
            </Flex>
          )}
          <DepositSlot
            close={props.close}
            onAuditLinkClick={props.onAuditLinkClick}
          />
        </TabPanel>
        <TabPanel
          title={t("common.withdraw")}
          icon={<ArrowUpFromLineIcon size={16} />}
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

      {isDeposit && props.isOnboarding && props.close && (
        <Flex
          direction="column"
          itemAlign="center"
          gap={1}
          className="oui-flex-shrink-0 oui-pt-3"
        >
          <button
            type="button"
            onClick={props.close}
            className="oui-text-primary hover:oui-text-primary-light oui-text-sm oui-font-semibold oui-cursor-pointer"
          >
            {t("transfer.deposit.skipForNow", "Skip for now")}
          </button>
          <Text size="2xs" weight="regular" className="oui-text-[#C7C7C7]">
            {t(
              "transfer.deposit.skipReassurance",
              "You can deposit any time from your account",
            )}
          </Text>
        </Flex>
      )}
    </Flex>
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
    size: "lg",
    classNames: {
      content:
        "oui-border oui-border-line-6 oui-max-h-[calc(100dvh-40px)] !oui-bg-base-9",
      body: "oui-overflow-y-auto",
    },
  },
);

registerSimpleSheet(
  DepositAndWithdrawWithSheetId,
  InjectableDepositAndWithdraw,
);
