import { useTranslation } from "@veltodefi/i18n";
import {
  MarginMode,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@veltodefi/types";
import { MainButton, cn } from "@veltodefi/ui";
import { OrderTypeSelect } from "../orderTypeSelect";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: unknown) => void;
  symbolLeverage?: number;
  marginMode?: MarginMode;
  /** When true, Market order type is disabled (e.g. symbol in POST_ONLY mode). */
  marketOrderDisabled?: boolean;
  /** Tooltip when hovering over the disabled Market button. */
  marketOrderDisabledTooltip?: string;
};

export function OrderEntryHeader(props: OrderEntryHeaderProps) {
  const { side, order_type, setOrderValue } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="oui-w-full">
        <LeverageBadge
          symbol={props.symbol}
          side={props.side}
          symbolLeverage={props.symbolLeverage}
          marginMode={props.marginMode}
        />
      </div>
      <div className="oui-w-full">
        <OrderTypeSelect
          type={order_type!}
          side={side}
          onChange={(type) => {
            setOrderValue("order_type", type);
          }}
          marketOrderDisabled={props.marketOrderDisabled}
          marketOrderDisabledTooltip={props.marketOrderDisabledTooltip}
        />
      </div>
      <div
        className={cn(
          "oui-orderEntry-side",
          "oui-grid oui-w-full oui-flex-1 oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
          "oui-grid-cols-2",
        )}
      >
        <MainButton
          variant="primary"
          onClick={(e) => {
            props.setOrderValue("side", OrderSide.BUY);
            e.currentTarget.blur();
          }}
          size={"md"}
          fullWidth
          data-type={OrderSide.BUY}
          data-active={side === OrderSide.BUY}
          className={cn(
            "oui-orderEntry-side-buy-btn",
            side === OrderSide.BUY
              ? "hover:oui-bg-base-6"
              : "oui-bg-base-7 oui-text-base-contrast-36",
          )}
          data-testid="oui-testid-orderEntry-side-buy-button"
        >
          {t("common.buy")}
        </MainButton>
        <MainButton
          variant="primary"
          onClick={(e) => {
            props.setOrderValue("side", OrderSide.SELL);
            e.currentTarget.blur();
          }}
          fullWidth
          size={"md"}
          data-type={OrderSide.SELL}
          data-active={side === OrderSide.SELL}
          className={cn(
            "oui-orderEntry-side-sell-btn",
            side === OrderSide.SELL
              ? "hover:oui-bg-base-6"
              : "oui-bg-base-7 oui-text-base-contrast-36",
          )}
          data-testid="oui-testid-orderEntry-side-sell-button"
        >
          {t("common.sell")}
        </MainButton>
      </div>
    </>
  );
}
