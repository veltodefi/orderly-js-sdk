import { ReactNode } from "react";
import { AlgoOrderRootType, API, PositionType } from "@veltodefi/types";
import { Box, MainButton, modal } from "@veltodefi/ui";
import type { MainButtonProps } from "@veltodefi/ui";
import { TPSLDialogId } from "./positionTPSL";

export const PositionTPSLPopover = (props: {
  position: API.Position;
  order?: API.AlgoOrder;
  label?: string;
  baseDP?: number;
  quoteDP?: number;
  /**
   * Button props
   */
  buttonProps?: MainButtonProps;
  isEditing?: boolean;
  children?: ReactNode;
}) => {
  const { position, order, baseDP, quoteDP, buttonProps, isEditing } = props;

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  const onEdit = () => {
    modal.show(TPSLDialogId, {
      order: order,
      symbol: position.symbol,
      baseDP: baseDP,
      quoteDP: quoteDP,
      positionType: isPositionTPSL ? PositionType.FULL : PositionType.PARTIAL,
      isEditing: isEditing,
      position,
    });
  };

  return (
    <Box onClick={onEdit} className="oui-cursor-pointer">
      {props.children || (
        <MainButton variant="secondary" size="sm" {...buttonProps}>
          {props.label}
        </MainButton>
      )}
    </Box>
  );
};
