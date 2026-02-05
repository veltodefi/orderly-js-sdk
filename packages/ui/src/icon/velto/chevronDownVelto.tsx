import React from "react";
import { BaseIcon, BaseIconProps } from "./../baseIcon";

export const ChevronDownVeltoIcon = React.forwardRef<
  SVGSVGElement,
  BaseIconProps
>((props, ref) => {
  const { opacity = 0.54, ...rest } = props;
  return (
    <BaseIcon ref={ref} viewBox="0 0 13 8" {...rest}>
      <path
        fill="currentcolor"
        fillOpacity={opacity}
        d="M6.01 7.425L12.02 1.415L10.607 0L6.01 4.6L1.414 0L0 1.414L6.01 7.425Z"
      />
    </BaseIcon>
  );
});

ChevronDownVeltoIcon.displayName = "ChevronDownVeltoIcon";
