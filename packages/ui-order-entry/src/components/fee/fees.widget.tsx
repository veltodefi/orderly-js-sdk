import React from "react";
import { useFeeState, useRwaSymbolsInfoStore } from "@veltodefi/hooks";
import { useAppContext } from "@veltodefi/react-app";
import { RegularFeesWidget } from "./regularFee";

export const FeesWidget: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { takerFee, makerFee, rwaTakerFee, rwaMakerFee } = useFeeState();
  const { veltoProps } = useAppContext();
  const info = useRwaSymbolsInfoStore();
  const isRwa = info?.[symbol] !== undefined;

  const resolvedTaker =
    (isRwa
      ? veltoProps?.feeTier?.rwaTakerFee
      : veltoProps?.feeTier?.takerFee) ?? (isRwa ? rwaTakerFee : takerFee);
  const resolvedMaker =
    (isRwa
      ? veltoProps?.feeTier?.rwaMakerFee
      : veltoProps?.feeTier?.makerFee) ?? (isRwa ? rwaMakerFee : makerFee);

  return <RegularFeesWidget taker={resolvedTaker} maker={resolvedMaker} />;
};
