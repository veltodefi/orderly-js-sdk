import React from "react";
import { BaseIcon, BaseIconProps } from "./../baseIcon";

export const ChevronUpVeltoIcon = React.forwardRef<
  SVGSVGElement,
  BaseIconProps
>((props, ref) => {
  const { opacity = 0.54, ...rest } = props;
  return (
    <BaseIcon ref={ref} viewBox="0 0 13 8" {...rest}>
      <path
        fill="currentcolor"
        fillOpacity={opacity}
        d="M6.01 0L0 6.01L1.414 7.425L6.014 2.825L10.614 7.425L12.021 6.01L6.01 0Z"
      />
    </BaseIcon>
  );
});

ChevronUpVeltoIcon.displayName = "ChevronUpVeltoIcon";
