import { useTranslation } from "@veltodefi/i18n";
import { OrderlyOrder, OrderSide, OrderType } from "@veltodefi/types";
import { MainButton, cn } from "@veltodefi/ui";
import { OrderTypeSelect } from "../orderTypeSelect";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  canTrade: boolean;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: any) => void;
  symbolLeverage?: number;
};

export function OrderEntryHeader(props: OrderEntryHeaderProps) {
  const { canTrade, side, order_type, setOrderValue } = props;
  const { t } = useTranslation();

  return (
    <>
      <div
        className={cn(
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
            side === OrderSide.BUY && canTrade
              ? ""
              : `oui-bg-base-7 oui-text-base-contrast-36 
                hover:oui-bg-base-6 active:oui-bg-base-6 
                disabled:oui-bg-base-7 disabled:oui-text-base-contrast-36`,
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
            side === OrderSide.SELL && canTrade
              ? ""
              : `oui-bg-base-7 oui-text-base-contrast-36 
                hover:oui-bg-base-6 active:oui-bg-base-6
                disabled:oui-bg-base-7 disabled:oui-text-base-contrast-36 
              `,
          )}
          data-testid="oui-testid-orderEntry-side-sell-button"
        >
          {t("common.sell")}
        </MainButton>
      </div>
      <div
        className={cn(
          "oui-grid oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
          "oui-grid-cols-2",
        )}
      >
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
        <div className="oui-w-full">
          <LeverageBadge
            symbol={props.symbol}
            side={props.side}
            symbolLeverage={props.symbolLeverage}
          />
        </div>
      </div>
    </>
  );
}
