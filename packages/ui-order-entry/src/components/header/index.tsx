import { useTranslation } from "@veltodefi/i18n";
import {
  MarginMode,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@veltodefi/types";
import { MainButton, Button, cn } from "@veltodefi/ui";
import { OrderTypeSelect } from "../orderTypeSelect";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  canTrade: boolean;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: unknown) => void;
  symbolLeverage?: number;
  marginMode?: MarginMode;
};

export function OrderEntryHeader(props: OrderEntryHeaderProps) {
  const { canTrade, side, order_type, setOrderValue } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="oui-w-full">
        <LeverageBadge
          symbol={props.symbol}
          side={props.side}
          symbolLeverage={props.symbolLeverage}
          marginMode={props.marginMode}
          disabled={!props.canTrade}
        />
      </div>
      <div className="oui-w-full">
        <OrderTypeSelect
          type={order_type!}
          side={side}
          canTrade={canTrade}
          onChange={(type) => {
            setOrderValue("order_type", type);
          }}
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
          disabled={!canTrade}
          data-active={side === OrderSide.BUY && canTrade}
          className={cn(
            "oui-orderEntry-side-buy-btn",
            side !== OrderSide.BUY &&
              `oui-bg-base-7 oui-text-base-contrast-36 disabled:oui-bg-base-7 disabled:oui-text-base-contrast-36`,
            side === OrderSide.BUY &&
              !canTrade &&
              `disabled:oui-bg-success disabled:oui-text-success-contrast`,
            side === OrderSide.BUY && canTrade && `hover:oui-bg-base-6`,
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
          disabled={!canTrade}
          data-active={side === OrderSide.SELL && canTrade}
          className={cn(
            "oui-orderEntry-side-sell-btn",
            side !== OrderSide.SELL &&
              `oui-bg-base-7 oui-text-base-contrast-36 disabled:oui-bg-base-7 disabled:oui-text-base-contrast-36`,
            side === OrderSide.SELL &&
              !canTrade &&
              `disabled:oui-bg-danger disabled:oui-text-danger-contrast`,
            side === OrderSide.SELL && canTrade && `hover:oui-bg-base-6`,
          )}
          data-testid="oui-testid-orderEntry-side-sell-button"
        >
          {t("common.sell")}
        </MainButton>
      </div>
    </>
  );
}
