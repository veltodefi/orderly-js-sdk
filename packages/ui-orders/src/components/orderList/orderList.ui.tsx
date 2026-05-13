import { FC } from "react";
import { useAccount } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { AccountStatusEnum } from "@veltodefi/types";
import {
  Flex,
  ListView,
  Grid,
  Picker,
  DataFilter,
  MainButton,
  cn,
  TableFeatures,
  NotConnectedView,
} from "@veltodefi/ui";
import { AuthGuardDataTable } from "@veltodefi/ui-connector";
import { formatSymbol } from "@veltodefi/utils";
import { grayCell } from "../../utils/util";
import { TabType } from "../orders.widget";
import { SymbolProvider } from "../provider/symbolProvider";
import { useOrderColumn } from "./desktop/useColumn";
import { OrderCellWidget } from "./mobile";
import { OrdersBuilderState } from "./orderList.script";
import { OrderListProvider } from "./orderListProvider";
import { TPSLOrderRowProvider } from "./tpslOrderRowContext";

export const DesktopOrderList: FC<
  OrdersBuilderState & { testIds?: { tableBody?: string } }
> = (props) => {
  const { sharePnLConfig, ...rest } = props;
  const columns = useOrderColumn({
    _type: props.type,
    onSymbolChange: props.onSymbolChange,
    pnlNotionalDecimalPrecision: props.pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbolsInfo: props.symbolsInfo,
  });

  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction="column" width="100%" height="100%" itemAlign="start">
        {props.filterItems.length > 0 && (
          <DataFilter
            items={props.filterItems}
            onFilter={(value: any) => {
              props.onFilter(value);
            }}
            trailing={
              [TabType.pending, TabType.tp_sl].includes(props.type) && (
                <CancelAll {...props} />
              )
            }
          />
        )}
        <AuthGuardDataTable
          columns={columns}
          loading={props.isLoading}
          dataSource={props.dataSource}
          bordered
          ignoreLoadingCheck={true}
          veltoCurrentView={`orders_${props.type}`}
          testIds={{
            body: props.testIds?.tableBody,
          }}
          classNames={{
            header: "oui-h-[38px]",
            root: "oui-items-start !oui-h-[calc(100%_-_49px)]",
            scroll: !props.dataSource?.length
              ? "oui-hide-scrollbar oui-overflow-hidden"
              : "",
          }}
          onRow={(record, index) => {
            return {
              className: cn(
                "oui-h-[48px]",
                grayCell(record)
                  ? "oui-text-base-contrast-20"
                  : "oui-text-base-contrast-80",
              ),
            };
          }}
          generatedRowKey={(record, index) =>
            `${props.type}${index}${
              record.order_id || record.algo_order_id
            }_index${index}`
          }
          renderRowContainer={(record: any, index, children) => {
            if (
              props.type === TabType.tp_sl ||
              props.type === TabType.pending
            ) {
              children = (
                <TPSLOrderRowProvider order={record}>
                  {children}
                </TPSLOrderRowProvider>
              );
            }

            return (
              <SymbolProvider symbol={record.symbol}>{children}</SymbolProvider>
            );
          }}
          pagination={props.pagination}
          manualPagination={props.manualPagination}
          features={[TableFeatures.DownloadFeature]}
          getTableInstance={(table) => {
            props.tableInstance.current = table;
          }}
        />
      </Flex>
    </OrderListProvider>
  );
};

export const MobileOrderList: FC<
  OrdersBuilderState & {
    classNames?: { root?: string; cell?: string; content?: string };
    showFilter?: boolean;
  }
> = (props) => {
  const { t } = useTranslation();
  const { veltoProps } = useAppContext();
  const { state } = useAccount();

  const isNotConnected = state.status <= AccountStatusEnum.NotConnected;

  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Grid
        cols={1}
        rows={isNotConnected ? 1 : 2}
        className={
          isNotConnected ? "oui-w-full " : "oui-w-full oui-grid-rows-[auto,1fr]"
        }
        gap={2}
      >
        {/* <Filter
          items={props.filterItems}
          onFilter={(value: any) => {
            props.onFilter(value);
          }}
          className="oui-px-3"
          
        /> */}

        {props.showFilter ? (
          <Flex gap={2} p={2} className="oui-rounded-b-xl oui-bg-base-9">
            {props.filterItems.map((item) => {
              // not support range type
              if (item.type !== "select") {
                return null;
              }
              return (
                <Picker
                  key={`item-${item.name}`}
                  options={item.options}
                  size={"sm"}
                  value={item.value}
                  className="oui-text-2xs oui-text-base-contrast-54 "
                  placeholder={
                    item.name === "side"
                      ? t("common.side.all")
                      : item.name === "status"
                        ? t("common.status.all")
                        : ""
                  }
                  onValueChange={(value) => {
                    //
                    props.onFilter?.({ name: item.name, value: value });
                  }}
                />
              );
            })}
          </Flex>
        ) : (
          <div></div>
        )}
        <ListView
          className={props.classNames?.root}
          contentClassName={props.classNames?.content}
          dataSource={props.dataSource || []}
          loadMore={props.loadMore}
          isLoading={props.isLoading}
          emptyView={
            isNotConnected ? (
              <NotConnectedView
                disabled={veltoProps?.isRestrictedRegion}
                title={t("connector.getStarted")}
                description={t("connector.beginYourSetupToUnlock")}
                buttonLabel={t("connector.connectWallet")}
                onClick={(sendToOnboarding) =>
                  veltoProps?.onConnectWallet?.(undefined, sendToOnboarding, {
                    from: "orders",
                    state: "wallet_not_connected",
                  })
                }
              />
            ) : undefined
          }
          renderItem={(item, index) => {
            let children = (
              <OrderCellWidget
                item={item}
                index={index}
                className={props.classNames?.cell}
                type={props.type}
                onSymbolChange={props.onSymbolChange}
                sharePnLConfig={props.sharePnLConfig}
              />
            );
            if ([TabType.tp_sl, TabType.pending].includes(props.type)) {
              children = (
                <TPSLOrderRowProvider order={item}>
                  {children}
                </TPSLOrderRowProvider>
              );
            }
            return (
              <SymbolProvider symbol={item.symbol}>{children}</SymbolProvider>
            );
          }}
        />
      </Grid>
    </OrderListProvider>
  );
};

const CancelAll: FC<OrdersBuilderState> = (props) => {
  const { t } = useTranslation();
  const { symbol } = props;

  const formattedSymbol = symbol ? formatSymbol(symbol, "base") : symbol;

  return (
    <MainButton
      variant="secondary"
      size="xs"
      disabled={(props.dataSource?.length ?? 0) == 0}
      className="disabled:oui-bg-transport"
      onClick={(e) => props.onCancelAll()}
      data-testid={`oui-testid-dataList-${props.type.toLowerCase()}-cancelAll-button`}
    >
      {symbol
        ? t("orders.cancelAll.ofSymbol", { symbol: formattedSymbol })
        : t("orders.cancelAll")}
    </MainButton>
  );
};
