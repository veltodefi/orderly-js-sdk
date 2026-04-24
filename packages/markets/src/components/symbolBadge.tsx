import { type FC } from "react";
import { useBadgeBySymbol } from "@veltodefi/hooks";
import { SymbolBadge as UISymbolBadge } from "@veltodefi/ui";

export const BrokerIdBadge: FC<{ symbol: string }> = (props) => {
  const { brokerId, brokerName, brokerNameRaw } = useBadgeBySymbol(
    props.symbol,
  );
  const badge = brokerName ?? brokerId ?? undefined;
  return <UISymbolBadge badge={badge} fullName={brokerNameRaw} />;
};

export const SymbolBadge = BrokerIdBadge;
