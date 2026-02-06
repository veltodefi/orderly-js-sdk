import { FC, useMemo } from "react";
import { useAccount, useWalletConnector } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { ABSTRACT_CHAIN_ID_MAP } from "@veltodefi/types";
import { Flex, Text } from "@veltodefi/ui";

export const Web3Wallet: FC = () => {
  const { t } = useTranslation();
  const { wallet, connectedChain } = useWalletConnector();
  const { state: accountState, account } = useAccount();

  const address = useMemo(() => {
    let address = accountState.address;
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain?.id as string))
    ) {
      address = account.getAdditionalInfo()?.AGWAddress;
    }

    return address;
  }, [wallet, accountState, account, connectedChain]);

  return (
    <Flex justify="between">
      <Text size="base" className="oui-text-primary-contrast">
        {t("transfer.web3Wallet.your")}
      </Text>

      <Flex gapX={1}>
        <Text.formatted size="sm" rule="address" className="oui-text-base-1">
          {address}
        </Text.formatted>
      </Flex>
    </Flex>
  );
};
