import React from "react";
import { useLocalStorage } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { TabPanel, Tabs } from "@veltodefi/ui";
import { useCommunityTabs } from "../../hooks/useCommunityTabs";

export type CommunityBrokerTabsProps = {
  storageKey: string;
  className?: string;
  classNames?: Record<string, string>;
  variant?: any;
  size?: any;
  showScrollIndicator?: boolean;
  allTitle?: React.ReactNode;
  renderPanel: (selectedId: string) => React.ReactNode;
};

export const CommunityBrokerTabs: React.FC<CommunityBrokerTabsProps> = (
  props,
) => {
  const {
    storageKey,
    className,
    classNames,
    variant = "contained",
    size = "sm",
    showScrollIndicator,
    allTitle,
    renderPanel,
  } = props;

  const { t } = useTranslation();
  const [communitySubTab, setCommunitySubTab] = useLocalStorage<string>(
    storageKey,
    "all",
  );
  const communityBrokerTabs = useCommunityTabs();

  return (
    <Tabs
      variant={variant}
      size={size}
      value={communitySubTab}
      onValueChange={setCommunitySubTab}
      classNames={classNames as any}
      className={className}
      showScrollIndicator={showScrollIndicator}
    >
      <TabPanel title={allTitle ?? t("common.all")} value="all">
        {renderPanel("all")}
      </TabPanel>
      {communityBrokerTabs.map((b) => (
        <TabPanel key={b.id} title={b.label} value={b.id}>
          {renderPanel(b.id)}
        </TabPanel>
      ))}
    </Tabs>
  );
};
