import { FlagKeys, useFeatureFlag } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { OrderSide } from "@veltodefi/types";
import { MarginMode } from "@veltodefi/types";
import { cn, modal, Text, useScreen } from "@veltodefi/ui";
import {
  SymbolLeverageDialogId,
  SymbolLeverageSheetId,
} from "@veltodefi/ui-leverage";
import { Decimal } from "@veltodefi/utils";
import {
  MarginModeSwitchDialogId,
  MarginModeSwitchSheetId,
} from "../marginModeSwitch";

type LeverageBadgeProps = {
  symbol: string;
  side: OrderSide;
  symbolLeverage?: number;
  marginMode?: MarginMode;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, side, symbolLeverage } = props;
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const { enabled } = useFeatureFlag(FlagKeys.IsolatedMargin);

  const marginMode = props.marginMode;

  const curLeverage = symbolLeverage ?? 1;

  const showLeverageModal = () => {
    const modalId = isMobile ? SymbolLeverageSheetId : SymbolLeverageDialogId;
    modal.show(modalId, {
      symbol,
      side,
      curLeverage,
      marginMode,
    });
  };

  const showMarginModeModal = () => {
    if (!enabled) return;

    const modalId = isMobile
      ? MarginModeSwitchSheetId
      : MarginModeSwitchDialogId;
    modal.show(modalId, {
      symbol,
    });
  };

  return (
    <div
      className={cn(
        "oui-flex oui-w-full oui-items-center oui-rounded-md oui-border oui-border-line-12 oui-bg-base-6",
        "oui-orderEntry-leverage-btn",
        "oui-h-8",
        "oui-select-none",
      )}
      data-testid="oui-testid-orderEntry-margin-leverage"
    >
      <button
        type="button"
        className={cn(
          "oui-flex oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1",
          "oui-px-3 oui-py-1.5",
          "oui-text-xs oui-font-semibold oui-text-base-contrast-54",
          enabled ? "oui-cursor-pointer" : "oui-cursor-not-allowed",
        )}
        data-testid="oui-testid-orderEntry-margin-mode"
        aria-label={t("marginMode.switchMarginMode")}
        disabled={!enabled}
        onClick={showMarginModeModal}
      >
        <Text>
          {marginMode === undefined
            ? "--"
            : marginMode === MarginMode.ISOLATED
              ? t("marginMode.isolated")
              : t("marginMode.cross")}
        </Text>
      </button>
      <div className="oui-h-5 oui-w-px oui-bg-line" aria-hidden="true" />
      <button
        type="button"
        className={cn(
          "oui-flex oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1",
          "oui-px-3 oui-py-1.5",
          "oui-text-xs oui-font-semibold oui-text-base-contrast-54",
          "oui-cursor-pointer",
        )}
        aria-label="Adjust leverage"
        onClick={showLeverageModal}
        data-testid="oui-testid-orderEntry-leverage"
      >
        <Text.numeral
          dp={0}
          rm={Decimal.ROUND_DOWN}
          unit="x"
          unitClassName="oui-ml-0"
        >
          {curLeverage}
        </Text.numeral>
      </button>
    </div>
  );
};
