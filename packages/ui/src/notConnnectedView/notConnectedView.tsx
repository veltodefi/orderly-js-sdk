import { Flex, MainButton, cn, Text, useScreen } from "..";

export const NotConnectedView = ({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: (sendToOnboarding: boolean) => void;
}) => {
  const { isMobile } = useScreen();

  return (
    <Flex
      direction="column"
      className={cn(isMobile && "oui-py-[80px]")}
      justify={"center"}
      itemAlign="center"
      gap={4}
    >
      <Flex direction="column" itemAlign="center">
        <Flex mb={2}>
          <img src="/velto/chart.png" alt={title} width={116} height={92} />
        </Flex>

        <Text className="oui-text-neutral-extra-light oui-text-center oui-text-base oui-font-bold">
          {title}
        </Text>

        <Text className="oui-font-regular oui-text-center oui-text-[12px] oui-text-[#737373]">
          {description}
        </Text>
      </Flex>

      <Flex justify="center" mt={4}>
        <MainButton variant="primary" size="md" onClick={() => onClick(true)}>
          {buttonLabel}
        </MainButton>
      </Flex>
    </Flex>
  );
};
