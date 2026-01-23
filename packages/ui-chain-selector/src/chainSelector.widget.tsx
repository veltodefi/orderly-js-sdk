import { registerSimpleDialog, registerSimpleSheet } from "@veltodefi/ui";
import {
  useChainSelectorScript,
  UseChainSelectorScriptOptions,
} from "./chainSelector.script";
import { ChainSelector, ChainSelectorProps } from "./chainSelector.ui";

export type ChainSelectorWidgetProps = UseChainSelectorScriptOptions &
  Pick<ChainSelectorProps, "isWrongNetwork" | "variant" | "className">;

export const ChainSelectorWidget = (props: ChainSelectorWidgetProps) => {
  const state = useChainSelectorScript(props);

  return (
    <ChainSelector
      {...state}
      variant={props.variant}
      isWrongNetwork={props.isWrongNetwork}
    />
  );
};

export const ChainSelectorDialogId = "ChainSelectorDialogId";
export const ChainSelectorSheetId = "ChainSelectorSheetId";

registerSimpleDialog(ChainSelectorDialogId, ChainSelectorWidget, {
  size: "lg",
  variant: "wide",
  isWrongNetwork: true,
});

registerSimpleSheet(ChainSelectorSheetId, ChainSelectorWidget, {
  variant: "compact",
  isWrongNetwork: true,
});
