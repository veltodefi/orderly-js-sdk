import React, { PropsWithChildren, useMemo } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { parseAngleProps } from "../helpers/parse-props";
import { SizeType } from "../helpers/sizeType";
import { Spinner } from "../spinner/spinner";
import { BaseButton, BaseButtonProps } from "./base";

const mainButtonVariants = tv(
  {
    base: [
      "oui-button",
      "oui-inline-flex",
      "oui-items-center",
      "oui-justify-center",
      "oui-whitespace-nowrap",
      "oui-font-medium",
      "oui-transition-colors",
      "[&_svg]:oui-text-current",
      "disabled:oui-cursor-not-allowed",
    ],
    variants: {
      variant: {
        primary: [
          "oui-bg-mainButton",
          "oui-text-mainButton-contrast",
          "oui-border-0",
          "hover:oui-bg-mainButton-hover",
          "hover:oui-text-mainButton-hoverContrast",
          "active:oui-bg-mainButton-pressed",
          "active:oui-text-mainButton-pressedContrast",
          "focus:oui-bg-mainButton-focus",
          "focus:oui-text-mainButton-focusContrast",
          "disabled:oui-bg-mainButton-disabled",
          "disabled:oui-text-mainButton-disabledContrast",
          "disabled:oui-border-0",
          "data-[loading=true]:oui-bg-mainButton-loading",
          "data-[loading=true]:oui-text-mainButton-loadingContrast",
          "data-[loading=true]:[&_.oui-spinner]:oui-text-mainButton-loadingSpinner",
        ],
        secondary: [
          "oui-border",
          "oui-border-mainButton",
          "oui-text-mainButton",
          "oui-bg-transparent",
          "hover:oui-bg-mainButton-hover",
          "hover:oui-text-mainButton-hoverContrast",
          "hover:oui-border-mainButton-hover",
          "active:oui-bg-mainButton-pressed",
          "active:oui-text-mainButton-pressedContrast",
          "active:oui-border-mainButton-pressed",
          "focus:oui-bg-mainButton-focus",
          "focus:oui-text-mainButton-focusContrast",
          "focus:oui-border-mainButton-focus",
          "disabled:oui-bg-transparent",
          "disabled:oui-text-mainButton-disabledBorder",
          "disabled:oui-border-mainButton-disabledBorder",
          "data-[loading=true]:oui-bg-mainButton-loading",
          "data-[loading=true]:oui-text-mainButton-loadingContrast",
          "data-[loading=true]:oui-border-mainButton-loading",
          "data-[loading=true]:[&_.oui-spinner]:oui-text-mainButton-loadingSpinner",
        ],
        tertiary: [
          "oui-bg-transparent",
          "oui-text-mainButton",
          "oui-border-0",
          "hover:oui-bg-mainButton-hover",
          "hover:oui-text-mainButton-hoverContrast",
          "active:oui-bg-mainButton-pressed",
          "active:oui-text-mainButton-pressedContrast",
          "focus:oui-bg-mainButton-focus",
          "focus:oui-text-mainButton-focusContrast",
          "disabled:oui-bg-transparent",
          "disabled:oui-text-mainButton-disabledBorder",
          "disabled:oui-border-0",
          "data-[loading=true]:oui-bg-mainButton-loading",
          "data-[loading=true]:oui-text-mainButton-loadingContrast",
          "data-[loading=true]:[&_.oui-spinner]:oui-text-mainButton-loadingSpinner",
        ],
        invertedPrimary: [
          "oui-bg-mainButton-inverted",
          "oui-text-mainButton-invertedContrast",
          "oui-border-0",
          "hover:oui-bg-mainButton-invertedHover",
          "hover:oui-text-mainButton-invertedHoverContrast",
          "active:oui-bg-mainButton-invertedPressed",
          "active:oui-text-mainButton-invertedPressedContrast",
          "focus:oui-bg-mainButton-invertedFocus",
          "focus:oui-text-mainButton-invertedFocusContrast",
          "disabled:oui-bg-mainButton-invertedDisabled",
          "disabled:oui-text-mainButton-invertedDisabledContrast",
          "disabled:oui-border-0",
          "data-[loading=true]:oui-bg-mainButton-invertedLoading",
          "data-[loading=true]:oui-text-mainButton-invertedLoadingContrast",
          "data-[loading=true]:[&_.oui-spinner]:oui-text-mainButton-invertedLoadingSpinner",
        ],
      },
      "data-type": {
        BUY: [
          "data-[active=true]:oui-bg-trade-profit data-[active=true]:oui-text-trade-profit-contrast",
          "data-[active=true]:hover:oui-bg-trade-profit/80 data-[active=true]:active:oui-bg-trade-profit/70",
        ],
        SELL: [
          "data-[active=true]:oui-bg-trade-loss data-[active=true]:oui-text-trade-loss-contrast",
          "data-[active=true]:hover:oui-bg-trade-loss/80 data-[active=true]:active:oui-bg-trade-loss/70",
        ],
      },
      size: {
        xs: ["oui-px-2", "oui-rounded", "oui-h-6", "oui-text-2xs"], //24px
        sm: ["oui-px-3", "oui-rounded", "oui-h-7", "oui-text-2xs"], //28px
        md: ["oui-px-3", "oui-rounded-md", "oui-h-8", "oui-text-sm"], //32px
        lg: ["oui-px-3", "oui-rounded-md", "oui-h-12", "oui-text-base"], //48px
        xl: ["oui-px-4", "oui-rounded-lg", "oui-h-13", "oui-text-lg"], //54px
      },
      fullWidth: {
        true: "oui-w-full",
      },
    },
    defaultVariants: {
      size: "lg",
      variant: "primary",
    },
  },
  {
    responsiveVariants: ["md", "lg"],
  },
);

interface MainButtonProps
  extends
    Omit<BaseButtonProps, "size">,
    VariantProps<typeof mainButtonVariants> {
  angle?: number;
  "data-testid"?: string;
}

const MainButton = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<MainButtonProps>
>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      angle,
      style,
      loading,
      trailing,
      children,
      ...props
    },
    ref,
  ) => {
    const angleStyle = parseAngleProps({ angle });

    const spinnerSize = useMemo(() => {
      switch (size) {
        case "xl":
        case "lg":
          return "md";
        case "md":
          return "sm";
        case "sm":
        case "xs":
          return "xs";
        default:
          return "md";
      }
    }, [size]);

    const trailingElement = useMemo(() => {
      if (loading) {
        const spinnerClass =
          variant === "invertedPrimary"
            ? "oui-spinner !oui-text-mainButton-invertedLoadingSpinnerRing !oui-fill-mainButton-invertedLoadingSpinnerFill"
            : "oui-spinner !oui-text-mainButton-loadingSpinnerRing !oui-fill-mainButton-loadingSpinnerFill";
        return <Spinner size={spinnerSize} className={spinnerClass} />;
      }
      return trailing;
    }, [loading, trailing, spinnerSize, variant]);

    return (
      <BaseButton
        className={mainButtonVariants({
          variant,
          size,
          className,
          fullWidth,
          "data-type": props["data-type"],
        })}
        size={size as SizeType}
        ref={ref}
        style={{ ...style, ...angleStyle }}
        data-loading={loading}
        loading={false}
        trailing={trailingElement}
        disabled={props.disabled || loading}
        {...props}
      >
        {children}
      </BaseButton>
    );
  },
);
MainButton.displayName = "MainButton";

export { MainButton, mainButtonVariants };

export type { MainButtonProps };
