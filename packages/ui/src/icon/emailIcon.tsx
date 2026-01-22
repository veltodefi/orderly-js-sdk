import React from "react";
import { BaseIcon, BaseIconProps } from "./baseIcon";

export const EmailIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  (props, ref) => {
    const { opacity = 0.54, ...rest } = props;
    return (
      <BaseIcon ref={ref} viewBox="0 0 32 32" {...rest}>
        <path
          fill="currentcolor"
          fillOpacity={opacity}
          d="M26.668 26.6667H5.33464C3.86188 26.6667 2.66797 25.4728 2.66797 24V7.88404C2.73011 6.45677 3.90601 5.33202 5.33464 5.33338H26.668C28.1407 5.33338 29.3346 6.52728 29.3346 8.00004V24C29.3346 25.4728 28.1407 26.6667 26.668 26.6667ZM5.33464 10.4907V24H26.668V10.4907L16.0013 17.6L5.33464 10.4907ZM6.4013 8.00004L16.0013 14.4L25.6013 8.00004H6.4013Z"
        />
      </BaseIcon>
    );
  },
);

EmailIcon.displayName = "EmailIcon";
