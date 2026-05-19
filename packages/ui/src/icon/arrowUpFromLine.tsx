import React from "react";
import { BaseIcon, BaseIconProps } from "./baseIcon";

export const ArrowUpFromLineIcon = React.forwardRef<
  SVGSVGElement,
  BaseIconProps
>((props, ref) => {
  return (
    <BaseIcon ref={ref} {...props}>
      <path
        fill="currentColor"
        d="M12 3L18 9L16.59 10.41L13 6.83L13 17L11 17L11 6.83L7.41 10.41L6 9L12 3Z"
      />
      <path fill="currentColor" d="M4 21H20V19H4V21Z" />
    </BaseIcon>
  );
});

ArrowUpFromLineIcon.displayName = "ArrowUpFromLineIcon";
