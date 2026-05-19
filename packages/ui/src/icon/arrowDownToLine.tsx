import React from "react";
import { BaseIcon, BaseIconProps } from "./baseIcon";

export const ArrowDownToLineIcon = React.forwardRef<
  SVGSVGElement,
  BaseIconProps
>((props, ref) => {
  return (
    <BaseIcon ref={ref} {...props}>
      <path
        fill="currentColor"
        d="M20 21H4V19H20V21ZM12 17L6 11L7.41 9.59L11 13.17V3H13V13.17L16.59 9.59L18 11L12 17Z"
      />
    </BaseIcon>
  );
});

ArrowDownToLineIcon.displayName = "ArrowDownToLineIcon";
