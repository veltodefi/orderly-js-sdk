import { FC, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const WarningIcon: FC<IconProps> = (props) => {
  const { size = 14, color = "#9AECDB", ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 16 16"
      fill="none"
      {...rest}
    >
      <path
        d="M14.1782 13.9987H1.8229C1.58473 13.9987 1.36465 13.8716 1.24556 13.6653C1.12648 13.4591 1.12648 13.2049 1.24557 12.9987L7.4229 2.33199C7.54208 2.12607 7.76197 1.99927 7.9999 1.99927C8.23783 1.99927 8.45772 2.12607 8.5769 2.33199L14.7542 12.9987C14.8733 13.2048 14.8733 13.4588 14.7544 13.665C14.6355 13.8713 14.4156 13.9984 14.1776 13.9987H14.1782ZM8.0009 3.99866L2.98023 12.6653H13.0229L8.0009 3.99866ZM8.66423 9.99933H7.3309V6.66533H8.66423V9.99933Z"
        fill="#9AECDB"
      />
      <path d="M7.33423 10.6667H8.66757V12H7.33423V10.6667Z" fill={color} />
    </svg>
  );
};
