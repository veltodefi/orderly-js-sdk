import { useBadgeBySymbol } from "@veltodefi/hooks";
import { SymbolBadge as UISymbolBadge } from "@veltodefi/ui";

export const SymbolBadge = ({ symbol }: { symbol: string }) => {
  const { brokerId, brokerName, brokerNameRaw } = useBadgeBySymbol(symbol);
  const badge = brokerName ?? brokerId ?? undefined;
  return <UISymbolBadge badge={badge} fullName={brokerNameRaw} />;
};
