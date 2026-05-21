import { FC, isValidElement, useEffect, useRef, useState } from "react";
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
import {
  TransferActiveTab,
  TransferAnalyticsEvent,
  TransferAnalyticsProvider,
  TransferDialogCloseReason,
  TransferDialogTrigger,
  TransferSurface,
  useTransferAnalytics,
} from "../../analytics";
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
  /**
   * Receives all dialog/form analytics events. The host maps them to its own
   * tracker (e.g. mixpanel). The SDK imports no tracker itself.
   */
  onAnalyticsEvent?: (event: TransferAnalyticsEvent) => void;
  /**
   * Stamped onto the `opened` event so funnels can discriminate origins
   * (onboarding vs quick-start guide vs deep link, etc.). Defaults to
   * "manual" when omitted.
   */
  analyticsTrigger?: TransferDialogTrigger;
  /**
   * Internal: set to "sheet" by the mobile sheet registrar so the envelope
   * carries the right surface. Hosts shouldn't set this.
   */
  analyticsSurface?: TransferSurface;
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const { veltoWithdrawOnlyMode } = useAppContext();
  const { extraTabs = [] } = props;
  const [activeTab, setActiveTab] = useState<TransferActiveTab>(
    veltoWithdrawOnlyMode
      ? "withdraw"
      : (props.activeTab as TransferActiveTab) || "deposit",
  );

  return (
    <TransferAnalyticsProvider
      onEvent={props.onAnalyticsEvent}
      surface={props.analyticsSurface ?? "dialog"}
      isOnboarding={!!props.isOnboarding}
      activeTab={activeTab}
    >
      <DepositAndWithdrawInner
        {...props}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </TransferAnalyticsProvider>
  );
};

const DepositAndWithdrawInner: FC<
  DepositAndWithdrawProps & {
    activeTab: TransferActiveTab;
    setActiveTab: (tab: TransferActiveTab) => void;
  }
> = (props) => {
  const { veltoWithdrawOnlyMode } = useAppContext();
  const { extraTabs = [], activeTab, setActiveTab } = props;
  const { t } = useTranslation();
  const { emit } = useTransferAnalytics();
  const sortedExtra = [...extraTabs].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100),
  );

  const mountedAt = useRef<number>(Date.now());
  const closeReasonRef = useRef<TransferDialogCloseReason>("unknown");
  const lastActiveTabRef = useRef<TransferActiveTab>(activeTab);

  useEffect(() => {
    lastActiveTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    emit({ name: "opened", trigger: props.analyticsTrigger ?? "manual" });
    const openedAt = mountedAt.current;
    return () => {
      emit({
        name: "closed",
        dwell_ms: Date.now() - openedAt,
        last_active_tab: lastActiveTabRef.current,
        reason: closeReasonRef.current,
      });
    };
    // mount/unmount only — emit is stable via context
  }, []);

  const handleTabChange = (value: string) => {
    if (veltoWithdrawOnlyMode && value === "deposit") return;
    if (value === activeTab) return;
    emit({
      name: "tab_changed",
      from_tab: activeTab,
      to_tab: value as TransferActiveTab,
    });
    setActiveTab(value as TransferActiveTab);
  };

  const isDeposit = activeTab === "deposit";

  const wrappedClose = props.close
    ? () => {
        if (closeReasonRef.current === "unknown") {
          closeReasonRef.current = "x_button";
        }
        props.close?.();
      }
    : undefined;

  const handleSkip = () => {
    closeReasonRef.current = "skip_for_now";
    emit({ name: "skip_clicked" });
    props.close?.();
  };

  const handleAuditLinkClick = props.onAuditLinkClick
    ? () => {
        emit({ name: "audit_link_clicked", from_form: activeTab });
        props.onAuditLinkClick?.();
      }
    : undefined;

  const handleInfoIconClick = props.onInfoIconClick
    ? () => {
        emit({ name: "info_clicked" });
        props.onInfoIconClick?.();
      }
    : undefined;

  const header = props.isOnboarding && (
    <Flex direction="column" itemAlign="stretch" gap={3} className="oui-mb-4">
      <Flex itemAlign="center" gap={2}>
        <Text
          weight="bold"
          className="oui-text-[22px] oui-text-primary-contrast"
        >
          {isDeposit
            ? t("transfer.deposit.dialogTitle", "Set up your trading balance")
            : t("transfer.withdraw.dialogTitle", "Withdraw")}
        </Text>
        {handleInfoIconClick && isDeposit && (
          <button
            type="button"
            onClick={handleInfoIconClick}
            className="oui-cursor-pointer oui-text-primary hover:oui-text-primary-light oui-flex oui-items-center"
            aria-label={t(
              "transfer.deposit.dialogTitle",
              "Set up your trading balance",
            )}
          >
            <InfoIcon size={18} className="oui-text-primary" />
          </button>
        )}
      </Flex>
      <Text size="sm" weight="regular" className="oui-text-base-1">
        {isDeposit
          ? t(
              "transfer.deposit.dialogSubtitle",
              "Your USDC stays on-chain in your name — Velto is non-custodial and never holds your funds. Withdraw anytime.",
            )
          : t(
              "transfer.withdraw.dialogSubtitle",
              "Move funds from your Velto account to your Web3 wallet or another Velto account.",
            )}
      </Text>
    </Flex>
  );

  return (
    <Flex
      direction="column"
      itemAlign="stretch"
      className="oui-w-full oui-h-full oui-min-h-0"
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        variant="contained"
        size="xl"
        className="oui-flex oui-flex-col oui-flex-1 oui-min-h-0"
        classNames={{
          tabsListContainer: "oui-shrink-0 oui-px-5",
          tabsList: "oui-px-0 oui-gap-1",
          trigger: "oui-rounded-lg oui-px-4 oui-h-[40px] oui-text-sm oui-gap-1",
          tabsContent:
            "oui-pt-6 oui-text-white data-[state=active]:oui-flex data-[state=active]:oui-flex-col oui-flex-1 oui-min-h-0",
        }}
      >
        <TabPanel
          title={t("common.deposit")}
          icon={<ArrowDownToLineIcon size={16} />}
          value="deposit"
          disabled={veltoWithdrawOnlyMode}
        >
          {header && <div className="oui-shrink-0 oui-px-5">{header}</div>}
          <div className="oui-flex-1 oui-min-h-0 oui-flex oui-flex-col">
            <DepositSlot
              close={wrappedClose}
              onAuditLinkClick={handleAuditLinkClick}
            />
          </div>
        </TabPanel>
        <TabPanel
          title={t("common.withdraw")}
          icon={<ArrowUpFromLineIcon size={16} />}
          value="withdraw"
        >
          {header && <div className="oui-shrink-0 oui-px-5">{header}</div>}
          <div className="oui-flex-1 oui-min-h-0 oui-flex oui-flex-col">
            <WithdrawSlot
              close={wrappedClose}
              onAuditLinkClick={handleAuditLinkClick}
            />
          </div>
        </TabPanel>
        {sortedExtra.map((tab) => (
          <TabPanel
            key={tab.id}
            title={tab.title}
            icon={isValidElement(tab.icon) ? tab.icon : undefined}
            value={tab.id}
          >
            <tab.component close={wrappedClose} />
          </TabPanel>
        ))}
      </Tabs>

      {isDeposit && props.isOnboarding && props.close && (
        <Flex
          direction="column"
          itemAlign="center"
          gap={1}
          className="oui-flex-shrink-0 oui-pt-3 oui-px-5"
        >
          <button
            type="button"
            onClick={handleSkip}
            className="oui-text-primary hover:oui-text-primary-light oui-text-sm oui-font-semibold oui-cursor-pointer"
          >
            {t("transfer.deposit.skipForNow", "Skip for now")}
          </button>
          <Text size="2xs" weight="regular" className="oui-text-base-1">
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
        "oui-flex oui-flex-col oui-border oui-border-line-6 oui-max-h-[calc(100dvh-40px)] !oui-bg-base-9 !oui-px-0",
      body: "oui-flex-1 oui-min-h-0 oui-flex oui-flex-col oui-overflow-hidden !oui-px-0",
    },
  },
);

const SheetVariant: FC<DepositAndWithdrawProps> = (props) => (
  <InjectableDepositAndWithdraw {...props} analyticsSurface="sheet" />
);

registerSimpleSheet(DepositAndWithdrawWithSheetId, SheetVariant);
