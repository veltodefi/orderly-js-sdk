import React, { useMemo } from "react";
import { useAccount, useWalletConnector } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { ABSTRACT_CHAIN_ID_MAP, AccountStatusEnum } from "@veltodefi/types";
import {
  MainButton,
  cn,
  Flex,
  formatAddress,
  Text,
  useScreen,
} from "@veltodefi/ui";
import { AuthGuard } from "@veltodefi/ui-connector";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { RenderPrivyTypeIcon } from "./common";
import { LinkDeviceMobile } from "./linkDevice";

export function UserCenter(props: any) {
  const { accountState: state } = props;
  return (
    <RenderUserCenter state={state} disabledConnect={props.disabledConnect} />
  );
}

export const MwebUserCenter = (props: any) => {
  const { state } = props;

  return (
    <RenderUserCenter state={state} disabledConnect={props.disabledConnect} />
  );
};

const RenderUserCenter = (props: any) => {
  const { state } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const { connect, wallet } = useWalletConnector();
  const { linkedAccount } = usePrivyWallet();
  const { state: accountState, account } = useAccount();
  const { connectedChain } = useWalletConnector();
  const { veltoProps, veltoWithdrawOnlyMode } = useAppContext();

  const disabled = state.validating || props.disabledConnect;

  const userAddress = useMemo(() => {
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain?.id as string))
    ) {
      return account.getAdditionalInfo()?.AGWAddress;
    }
    return account.address;
  }, [account, connectedChain, accountState]);

  // if (accountStatus.status <= ) {}
  if (state.status === AccountStatusEnum.EnableTradingWithoutConnected) {
    return (
      <Flex className="oui-gap-[6px] oui-rounded-[6px] oui-bg-base-5 oui-px-[7px]">
        <LinkDeviceMobile>
          <Text.formatted
            rule="address"
            className="oui-text-xs oui-text-base-contrast"
          >
            {formatAddress(userAddress!)}
          </Text.formatted>
        </LinkDeviceMobile>
      </Flex>
    );
  }
  if (state.status <= AccountStatusEnum.NotConnected || disabled) {
    return (
      <MainButton
        data-testid="oui-testid-nav-bar-connectWallet-btn"
        size="md"
        variant="primary"
        angle={45}
        className={cn(
          "wallet-connect-button",
          isMobile && "oui-px-2 oui-font-semibold",
        )}
        loading={state.validating}
        disabled={disabled}
        onClick={() => {
          connect()
            .then((r: any) => {
              console.log("*****", r);
            })
            .catch((e: any) => console.error(e));
        }}
      >
        {isMobile ? t("connector.connect") : t("connector.connectWallet")}
      </MainButton>
    );
  }

  if (!wallet) {
    return;
  }
  if (isMobile) {
    return (
      <AuthGuard
        buttonProps={{
          size: "md",
        }}
      >
        <div onClick={() => connect()}>
          <MainButton
            size="md"
            variant="primary"
            angle={45}
            data-testid="oui-testid-nav-bar-address-btn"
            className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-px-2"
          >
            {linkedAccount && (
              <RenderPrivyTypeIcon
                type={linkedAccount.type}
                size={14}
                black={true}
              />
            )}
            <Text.formatted rule="address">
              {formatAddress(userAddress!)}
            </Text.formatted>
          </MainButton>
        </div>
      </AuthGuard>
    );
  }
  return (
    <div onClick={() => connect()}>
      <MainButton
        size="md"
        variant="primary"
        angle={45}
        data-testid="oui-testid-nav-bar-address-btn"
        className="oui-flex oui-items-center oui-justify-center oui-gap-2"
      >
        {linkedAccount && (
          <RenderPrivyTypeIcon
            type={linkedAccount.type}
            size={18}
            black={true}
          />
        )}
        <Text.formatted rule="address">
          {formatAddress(userAddress!)}
        </Text.formatted>
      </MainButton>
    </div>
  );
};
