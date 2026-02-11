import { FC, useMemo } from "react";
import { useConfig } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppConfig } from "@veltodefi/react-app";
import { Flex, Text } from "@veltodefi/ui";

export const BrokerWallet: FC = () => {
  const { t } = useTranslation();
  const { appIcons } = useAppConfig();
  const brokerName = useConfig("brokerName");

  const icon = useMemo(() => {
    const { secondary } = appIcons || {};

    if (!secondary?.img && secondary?.component) return null;

    if (secondary?.img) {
      return <img src={secondary?.img} className="oui-w-6 oui-h-6" />;
    }

    if (secondary?.component) {
      return <>{secondary.component}</>;
    }
  }, [appIcons]);

  return (
    <Flex justify="between">
      <Text size="base" weight="bold">
        {t("transfer.brokerAccount", { brokerName })}
      </Text>
      {icon}
    </Flex>
  );
};
