import { useMemo } from "react";
import { i18n, useTranslation } from "@veltodefi/i18n";
import {
  TradingActiveIcon,
  TradingInactiveIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  EarnActiveIcon,
  EarnInactiveIcon,
  BattleActiveIcon,
  BattleInactiveIcon,
} from "@veltodefi/ui";
import type { BottomNavProps } from "@veltodefi/ui-scaffold";
import { PathEnum } from "../playground/constant";

const getBottomNavProp = (): BottomNavProps => {
  return {
    mainMenus: [
      {
        name: i18n.t("common.markets"),
        href: "/markets",
        activeIcon: <MarketsActiveIcon />,
        inactiveIcon: <MarketsInactiveIcon />,
      },
      {
        name: i18n.t("common.spot"),
        href: PathEnum.Swap,
        activeIcon: <EarnActiveIcon />,
        inactiveIcon: <EarnInactiveIcon />,
      },
      {
        name: i18n.t("common.trading"),
        href: "/",
        activeIcon: <TradingActiveIcon />,
        inactiveIcon: <TradingInactiveIcon />,
      },
      {
        name: i18n.t("tradingLeaderboard.arena"),
        href: "/leaderboard",
        activeIcon: <BattleActiveIcon />,
        inactiveIcon: <BattleInactiveIcon />,
      },
      {
        name: i18n.t("common.portfolio"),
        href: "/portfolio",
        activeIcon: <PortfolioActiveIcon />,
        inactiveIcon: <PortfolioInactiveIcon />,
      },
    ],
  };
};

export const useBottomNav = () => {
  const { t } = useTranslation();
  return useMemo(() => getBottomNavProp(), [t]);
};
