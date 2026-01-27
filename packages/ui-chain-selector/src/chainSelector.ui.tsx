import { useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import {
  Box,
  Flex,
  Text,
  ChainIcon,
  Tabs,
  TabPanel,
  cn,
  tv,
  Tooltip,
  InfoIcon,
} from "@veltodefi/ui";
import { UseChainSelectorScriptReturn } from "./chainSelector.script";
import { ChainType, TChainItem } from "./type";

export type ChainSelectorProps = {
  isWrongNetwork?: boolean;
  /**
   * wide: This represents the wide screen (desktop) UI mode
   * compact: This indicates a compact (mobile) UI pattern.
   */
  variant?: "wide" | "compact";
  className?: string;
} & UseChainSelectorScriptReturn;

const chainSelectorVariants = tv({
  slots: {
    icon: "",
    list: "oui-grid oui-grid-cols-1 oui-gap-1",
    mainnetList: '"',
    testnetList: '"',
    recentList: "",
    item: "oui-w-full oui-rounded-md",
    tip: "oui-text-center",
  },
  variants: {
    variant: {
      compact: {
        icon: "oui-w-6 oui-h-6",
        list: "oui-bg-base-9 oui-rounded-lg oui-p-1",
        mainnetList: "oui-grid-cols-2 oui-mt-4",
        testnetList: "oui-grid-cols-1 oui-mt-4",
        recentList: "oui-mt-4 oui-mb-4",
        item: "oui-bg-base-6 hover:oui-bg-base-7",
        tip: "oui-pt-6",
      },
      wide: {
        icon: "oui-w-[18px] oui-h-[18px]",
        mainnetList: "oui-grid-cols-3 oui-mt-3",
        testnetList: "oui-grid-cols-2 oui-mt-3",
        recentList: "oui-mt-4 oui-mb-4",
        item: "oui-bg-base-5 hover:oui-bg-base-6",
        tip: "oui-pt-8",
      },
    },
    selected: {
      true: {
        item: "",
      },
      false: { item: "oui-bg-transparent" },
    },
  },
  compoundVariants: [
    {
      variant: "compact",
      selected: true,
      className: {
        item: "hover:oui-bg-base-6",
      },
    },
    {
      variant: "wide",
      selected: true,
      className: {
        item: "hover:oui-bg-base-5",
      },
    },
  ],
  defaultVariants: {
    variant: "wide",
    selected: false,
  },
});

const LS_TAB_KEY = "orderly.chainSelector.tab";
const LS_MAINNET_SUBTAB_KEY = "orderly.chainSelector.mainnetSubTab";

//------------------ ChainSelector start ------------------
export const ChainSelector = (props: ChainSelectorProps) => {
  const { isWrongNetwork, variant = "wide" } = props;
  const { t } = useTranslation();
  const { list, recentList, mainnetList, testnetList, item, icon, tip } =
    chainSelectorVariants({
      variant,
    });
  const { veltoProps } = useAppContext();
  const mostCommonChainsNames = veltoProps?.mostCommonChains ?? [];

  const [selectedTab, setSelectedTab] = useState<ChainType>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(LS_TAB_KEY);
      if (saved === ChainType.Mainnet || saved === ChainType.Testnet)
        return saved as ChainType;
    }

    return props.selectedTab;
  });

  const [mainnetSubTab, setMainnetSubTab] = useState<
    "mostCommon" | "allNetworks"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(LS_MAINNET_SUBTAB_KEY);
      if (saved === "mostCommon" || saved === "allNetworks") return saved;
    }

    return "mostCommon";
  });

  const mostCommonChains = mostCommonChainsNames
    .map((name) => props.chains.mainnet?.find((chain) => chain.name === name))
    .filter(Boolean);

  const getMainnetItemClass = (selected: boolean) =>
    cn(
      item({ selected }),
      selected
        ? "oui-bg-mainButton oui-text-mainButton-contrast"
        : "hover:oui-bg-mainButton-hover",
      "hover:oui-bg-mainButton-hover",
    );

  return (
    <Box className={cn("oui-font-semibold", props.className)}>
      <Tabs
        value={selectedTab}
        variant="contained"
        size="lg"
        classNames={{
          tabsListContainer: "oui-mb-[24px]",
        }}
        onValueChange={(e) => {
          setSelectedTab(e as ChainType);

          if (typeof window !== "undefined") {
            window.localStorage.setItem(LS_TAB_KEY, e as string);
          }

          props.onTabChange(e as ChainType);
        }}
        tabsListChildren={
          <Tooltip
            content={
              <Box className="oui-flex oui-flex-col oui-gap-y-2">
                <Box className="oui-mb-2 oui-flex oui-flex-col">
                  <Text size="xs" weight="bold">
                    {t("connector.mainnet")}
                  </Text>
                  <Text size="2xs">
                    {t("connector.mainnetDescriptionTooltip")}
                  </Text>
                </Box>
                <Box className="oui-mb-2 oui-flex oui-flex-col">
                  <Text size="xs" weight="bold">
                    {t("connector.testnet")}
                  </Text>
                  <Text size="2xs">
                    {t("connector.testnetDescriptionTooltip")}
                  </Text>
                </Box>
              </Box>
            }
          >
            <InfoIcon className="oui-cursor-pointer oui-text-[#8F8F8F]" />
          </Tooltip>
        }
      >
        <TabPanel value={ChainType.Mainnet} title={t("connector.mainnet")}>
          <Tabs
            value={mainnetSubTab}
            variant="inverted"
            size="sm"
            onValueChange={(e) => {
              setMainnetSubTab(e as "mostCommon" | "allNetworks");

              if (typeof window !== "undefined") {
                window.localStorage.setItem(LS_MAINNET_SUBTAB_KEY, e as string);
              }
            }}
          >
            <Title />

            {!!props.recentChains?.length && (
              <Flex gap={2} className={recentList()}>
                {props.recentChains?.map((item) => {
                  return (
                    <RecentChainItem
                      key={item.id}
                      item={item}
                      onClick={() => props.onChainClick(item)}
                      iconClassName={icon()}
                    />
                  );
                })}
              </Flex>
            )}

            <TabPanel
              value="mostCommon"
              title={
                <Text className="oui-text-[14px]">
                  {t("connector.mostCommon")}
                </Text>
              }
            >
              <Box
                r="2xl"
                className={cn(
                  list(),
                  mainnetList(),
                  "oui-rounded-[12px] oui-bg-[#161616] oui-p-2",
                  "oui-grid-cols-2",
                )}
              >
                <ChainList
                  chains={mostCommonChains}
                  selectedChainId={props.selectChainId}
                  onChainClick={props.onChainClick}
                  itemClassName={getMainnetItemClass}
                />
              </Box>
            </TabPanel>

            <TabPanel
              value="allNetworks"
              title={
                <Text className="oui-text-[14px]">
                  {t("connector.allNetworks")}
                </Text>
              }
            >
              <Box
                r="2xl"
                className={cn(
                  list(),
                  mainnetList(),
                  "oui-rounded-[12px] oui-bg-[#161616] oui-p-2",
                )}
              >
                <ChainList
                  chains={props.chains.mainnet}
                  selectedChainId={props.selectChainId}
                  onChainClick={props.onChainClick}
                  itemClassName={getMainnetItemClass}
                />
              </Box>
            </TabPanel>
          </Tabs>
        </TabPanel>

        {props.showTestnet && (
          <TabPanel value={ChainType.Testnet} title={t("connector.testnet")}>
            <Title className="oui-mb-4" />

            <Box
              r="2xl"
              className={cn(
                list(),
                testnetList(),
                "oui-rounded-[12px] oui-bg-[#161616] oui-p-2",
              )}
            >
              <ChainList
                chains={props.chains.testnet}
                selectedChainId={props.selectChainId}
                onChainClick={props.onChainClick}
                itemClassName={getMainnetItemClass}
              />
            </Box>
          </TabPanel>
        )}
      </Tabs>

      {isWrongNetwork && (
        <Box className={tip()}>
          <Text color="warning" size="xs">
            {t("connector.wrongNetwork.tooltip")}
          </Text>
        </Box>
      )}
    </Box>
  );
};
// ------------------ ChainSelector end ------------------

const Title = ({ className }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <Box className={className ?? ""}>
      <Text className="oui-text-xl oui-font-bold oui-text-[#FFF]">
        {t("connector.switchNetwork")}
      </Text>
    </Box>
  );
};

// ------------------ ChainList start ------------------

const ChainList = ({
  chains,
  selectedChainId,
  onChainClick,
  itemClassName,
}: {
  chains?: TChainItem[];
  selectedChainId?: number | string;
  onChainClick: (chain: TChainItem) => void;
  itemClassName?: (selected: boolean) => any;
}) => (
  <>
    {chains?.map((chain) => {
      const selected = selectedChainId === chain.id;
      return (
        <ChainItem
          key={chain.id}
          selected={selected}
          item={chain}
          onClick={() => onChainClick(chain)}
          className={itemClassName ? itemClassName(selected) : undefined}
        />
      );
    })}
  </>
);

// ------------------ ChainList end ------------------

// ------------------ ChainItem start ------------------
export const ChainItem = (props: {
  selected: boolean;
  item: TChainItem;
  onClick?: () => void;
  className?: string;
}) => {
  const { item } = props;
  return (
    <button className={props.className} onClick={props.onClick}>
      <Flex justify="between" className="oui-py-2.5" px={3}>
        <Flex itemAlign="center" width="100%" className="oui-gap-x-[6px]">
          <ChainIcon chainId={item.id} size="xs" />
          <Text size="2xs">{item.name}</Text>
        </Flex>
      </Flex>
    </button>
  );
};

// ------------------ Recent ChainItem start ------------------
export const RecentChainItem = (props: {
  item: TChainItem;
  onClick?: () => void;
  iconClassName?: string;
}) => {
  return (
    <button
      className="oui-rounded-lg oui-border oui-border-line-12 hover:oui-border-primary-light"
      onClick={props.onClick}
    >
      <Flex itemAlign="center" p={2}>
        <ChainIcon chainId={props.item.id} className={props.iconClassName} />
      </Flex>
    </button>
  );
};
