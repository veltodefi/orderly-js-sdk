import { FC } from "react";
import { cn, Flex, Text } from "@veltodefi/ui";

interface SwapCoinProps {
  className?: string;
  sourceSymbol?: string;
  targetSymbol?: string;
  indexPrice: number | string;
  precision?: number;
}

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { sourceSymbol, targetSymbol, indexPrice, precision = 6 } = props;
  return (
    <Flex
      itemAlign="center"
      gap={1}
      className={cn(props.className, "oui-text-sm")}
    >
      <Text size="sm">1</Text>
      <Text size="sm">{sourceSymbol}</Text>=
      <Text.numeral size="sm" dp={precision} padding={false}>
        {indexPrice}
      </Text.numeral>
      <Text size="sm">{targetSymbol}</Text>
    </Flex>
  );
};
