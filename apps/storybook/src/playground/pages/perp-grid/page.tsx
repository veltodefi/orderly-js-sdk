import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generatePath } from "@veltodefi/i18n";
import { registerLayoutGridPlugin } from "@veltodefi/layout-grid";
import { TradingPage, TradingPageProps } from "@veltodefi/trading-next";
import { API } from "@veltodefi/types";
import { OrderlyPluginProvider } from "@veltodefi/ui";
import { tradingPageConfig } from "../../../orderlyConfig";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { updateSymbol } from "../../storage";

export type PerpGridViewProps = Pick<TradingPageProps, "symbol">;

/**
 * Perp trading page using grid layout (registerLayoutGridPlugin).
 * Mirrors perp page behavior with symbol in URL and same config; only layout plugin differs.
 */
export default function PerpGridPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const navigate = useNavigate();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      navigate(generatePath({ path: `${PathEnum.PerpGrid}/${symbol}` }));
    },
    [navigate],
  );

  useEffect(() => {
    if (params.symbol && params.symbol !== symbol) {
      setSymbol(params.symbol);
    }
  }, [params.symbol]);

  return (
    <BaseLayout>
      <OrderlyPluginProvider plugins={[registerLayoutGridPlugin()]}>
        <TradingPage
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          tradingViewConfig={tradingPageConfig.tradingViewConfig}
          sharePnLConfig={tradingPageConfig.sharePnLConfig}
        />
      </OrderlyPluginProvider>
    </BaseLayout>
  );
}
