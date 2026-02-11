import { FC, ReactNode } from "react";
import { Flex, Text, Box } from "@veltodefi/ui";
import { ArrowDownIcon } from "../../icons";

type ExchangeDividerProps = {
  icon?: ReactNode;
  layout?: "onboarding";
};

export const ExchangeDivider: FC<ExchangeDividerProps> = ({ icon, layout }) => {
  return (
    <>
      {layout === "onboarding" ? (
        <Flex height={56}>
          <Flex
            height={1}
            className="oui-flex-1 oui-bg-base-contrast-12"
          ></Flex>
          <Flex className="oui-border oui-rounded-full oui-pr-1.5 oui-pl-0.5 oui-border-base-6">
            {icon || <ArrowDownIcon className="oui-text-primary" />}
            <Text weight="regular" size={"3xs"} className="oui-text-[#C7C7C7]">
              Funds move into your trading balance
            </Text>
          </Flex>
          <Flex
            height={1}
            className="oui-flex-1 oui-bg-base-contrast-12"
          ></Flex>
        </Flex>
      ) : (
        <Flex height={40} gapX={3}>
          <Flex
            height={1}
            className="oui-flex-1 oui-bg-base-contrast-12"
          ></Flex>
          {icon || <ArrowDownIcon className="oui-text-primary" />}
          <Flex
            height={1}
            className="oui-flex-1 oui-bg-base-contrast-12"
          ></Flex>
        </Flex>
      )}
    </>
  );
};
