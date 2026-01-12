import { FC, useEffect, useMemo, useState } from "react";
import { MainButton, MainButtonProps, ThrottledButton } from "../button";
import { DialogFooter } from "./dialog";

export type DialogAction<T = any> = {
  label: string;
  onClick: (event: any) => Promise<T> | T;
} & Pick<
  MainButtonProps,
  | "size"
  | "disabled"
  | "className"
  | "fullWidth"
  | "data-testid"
  | "loading"
  | "variant"
>;

export type SimpleDialogFooterProps = {
  actions?: {
    primary?: DialogAction;
    secondary?: DialogAction;
  };
  className?: string;
};

export const SimpleDialogFooter: FC<SimpleDialogFooterProps> = (props) => {
  const { actions } = props;
  const [primaryLoading, setPrimaryLoading] = useState(
    actions?.primary?.loading ?? false,
  );

  useEffect(() => {
    if (actions?.primary?.loading) {
      setPrimaryLoading(actions?.primary?.loading);
    }

    return () => {
      setPrimaryLoading(false);
    };
  }, [actions?.primary?.loading]);

  if (!actions) return null;

  const buttons = useMemo(() => {
    const buttons = [];

    if (actions.secondary && typeof actions.secondary.onClick === "function") {
      const { fullWidth = true, label, ...rest } = actions.secondary;

      buttons.push(
        <MainButton
          key="secondary"
          variant="secondary"
          {...rest}
          data-testid={actions.secondary?.["data-testid"]}
          fullWidth={fullWidth}
        >
          {label}
        </MainButton>,
      );
    }

    if (actions.primary && typeof actions.primary.onClick === "function") {
      const {
        fullWidth = true,
        disabled,
        label,
        onClick,
        ...rest
      } = actions.primary;

      buttons.push(
        <ThrottledButton
          key="primary"
          {...rest}
          data-testid={actions.primary?.["data-testid"]}
          onClick={async (event) => {
            if (primaryLoading) return;
            try {
              setPrimaryLoading(true);
              await onClick(event);
            } catch (e) {
            } finally {
              setPrimaryLoading(false);
            }
          }}
          disabled={disabled || primaryLoading}
          loading={primaryLoading}
          fullWidth={fullWidth}
          variant="primary"
        >
          {label}
        </ThrottledButton>,
      );
    }

    return buttons;
  }, [actions, primaryLoading]);

  return <DialogFooter className={props.className}>{buttons}</DialogFooter>;
};
