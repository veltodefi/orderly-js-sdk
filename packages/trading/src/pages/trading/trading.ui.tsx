import { FC, useEffect } from "react";
import { useSymbolsInfo } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { toast, useScreen } from "@veltodefi/ui";
import type { TradingState } from "./trading.script";
import { DesktopLayout } from "./trading.ui.desktop";
import { MobileLayout } from "./trading.ui.mobile";

export const Trading: FC<TradingState> = (props) => {
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  // const symbolsInfo = useSymbolsInfo();
  // const symbol = props.symbol;

  // // listen to symbol trading status
  // // if the symbol is delisting, show a toast
  // useEffect(() => {
  //   if (!symbol || !symbolsInfo[symbol]) return;
  //   const status = symbolsInfo[symbol]("status");
  //   if (status === "DELISTING") {
  //     const displaySymbol =
  //       symbolsInfo[symbol]("displayName") ??
  //       symbolsInfo[symbol]("name") ??
  //       symbol;
  //     toast(t("trading.symbolDelisting", { symbol: displaySymbol }), {
  //       id: `symbol-delisting-${symbol}`,
  //     });
  //   }
  // }, [symbol, symbolsInfo, t]);

  if (isMobile) {
    return <MobileLayout {...props} />;
  }

  return (
    <DesktopLayout
      className="oui-h-[calc(100vh_-_48px_-_29px)] oui-bg-base-10"
      {...props}
    />
  );
};
