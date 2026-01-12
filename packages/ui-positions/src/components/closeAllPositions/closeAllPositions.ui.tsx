import React, { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { MainButton, cn } from "@veltodefi/ui";
import type { CloseAllPositionsState } from "./closeAllPositions.script";

export type CloseAllPositionsProps = CloseAllPositionsState & {
  className?: string;
  style?: React.CSSProperties;
};

export const CloseAllPositions: FC<CloseAllPositionsProps> = (props) => {
  const { onCloseAll, hasOpenPositions, isClosing, className, style, symbol } =
    props;
  const { t } = useTranslation();
  if (symbol !== undefined) {
    return <></>;
  }
  return (
    <MainButton
      onClick={onCloseAll}
      disabled={!hasOpenPositions || isClosing}
      loading={isClosing}
      variant="secondary"
      size="xs"
      className={cn("disabled:oui-bg-transport", className)}
      style={style}
    >
      {t("positions.closeAll")}
    </MainButton>
  );
};
