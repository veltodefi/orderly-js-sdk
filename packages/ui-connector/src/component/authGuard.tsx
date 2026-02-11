import React, { ReactElement, useMemo } from "react";
import { useAccount, useMediaQuery } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { AccountStatusEnum, MEDIA_TABLET, NetworkId } from "@veltodefi/types";
import {
  MainButton,
  Either,
  modal,
  Text,
  toast,
  useScreen,
  type MainButtonProps,
} from "@veltodefi/ui";
import { Flex } from "@veltodefi/ui";
import { Box } from "@veltodefi/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
} from "@veltodefi/ui-chain-selector";
import Chart from "./chart.png";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "./walletConnector";

export type alertMessages = {
  connectWallet?: string;
  switchChain?: string;
  enableTrading?: string;
  signin?: string;
};

export type AuthGuardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fallback?: (props: {
    validating: boolean;
    status: AccountStatusEnum;
    wrongNetwork: boolean;
  }) => ReactElement;
  /**
   * Required state to be satisfied
   * @default AccountStatusEnum.EnableTrading
   */
  status?: AccountStatusEnum;

  bridgeLessOnly?: boolean;

  buttonProps?: MainButtonProps;

  descriptions?: alertMessages;

  labels?: alertMessages;

  classNames?: {
    root?: string;
    description?: string;
  };

  networkId?: NetworkId;
  isEmptyView?: boolean;
};

export const AuthGuard: React.FC<React.PropsWithChildren<AuthGuardProps>> = (
  props,
) => {
  const {
    status,
    buttonProps,
    fallback,
    descriptions,
    isEmptyView,
    id,
    bridgeLessOnly,
  } = props;
  const { t } = useTranslation();
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();

  const _status = useMemo(() => {
    if (status === undefined) {
      return state.status === AccountStatusEnum.EnableTradingWithoutConnected
        ? AccountStatusEnum.EnableTradingWithoutConnected
        : AccountStatusEnum.EnableTrading;
    }
    return status;
  }, [status, state.status]);

  const labels = {
    connectWallet: t("connector.connectWallet"),
    switchChain: t("connector.wrongNetwork"),
    enableTrading: t("connector.enableTrading"),
    signin: t("connector.createAccount"),
    ...props.labels,
  };

  const Left = useMemo<ReactElement>(() => {
    if (typeof fallback !== "undefined") {
      return fallback({
        validating: state.validating,
        status: state.status,
        wrongNetwork,
      });
    }

    if (state.validating && !disabledConnect) {
      return (
        <StatusInfo
          angle={45}
          disabled
          variant="primary"
          loading
          description={descriptions?.connectWallet}
          id={id}
          type="button"
          {...buttonProps}
        >
          {labels.connectWallet}
        </StatusInfo>
      );
    }

    return (
      <DefaultFallback
        bridgeLessOnly={bridgeLessOnly}
        status={state.status}
        isEmptyView={isEmptyView}
        buttonProps={{ ...buttonProps, id, type: "button" }}
        wrongNetwork={wrongNetwork}
        networkId={props.networkId}
        labels={labels}
        descriptions={descriptions}
        disabledConnect={disabledConnect}
      />
    );
  }, [state.status, state.validating, buttonProps, wrongNetwork]);

  /**
   * **Important: The chldren component will be rendered only if the status is equal to the required status and the network is correct.**
   */

  return (
    <Either
      value={state.status >= _status && !wrongNetwork && !disabledConnect}
      left={Left}
    >
      {props.children}
    </Either>
  );
};

const ModalTitle: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAccount();
  if (state.status < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }
  if (state.status < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }
  return <Text>{t("connector.connectWallet")}</Text>;
};

const DefaultFallback: React.FC<{
  status: AccountStatusEnum;
  wrongNetwork: boolean;
  buttonProps?: MainButtonProps;
  networkId?: NetworkId;
  labels: alertMessages;
  bridgeLessOnly?: boolean;
  descriptions?: alertMessages;
  disabledConnect?: boolean;
  isEmptyView?: boolean;
}> = (props) => {
  const { buttonProps, labels, descriptions, isEmptyView } = props;
  const { t } = useTranslation();
  const { connectWallet, veltoProps } = useAppContext();
  const { account } = useAccount();
  const { isMobile } = useScreen();
  const matches = useMediaQuery(MEDIA_TABLET);

  const onConnectOrderly = () => {
    modal
      .show(matches ? WalletConnectorSheetId : WalletConnectorModalId, {
        title: <ModalTitle />,
      })
      .then(
        (r) => console.log(r),
        (error) => console.log(error),
      );
  };

  const onConnectWallet = async (sendToOnboarding?: boolean) => {
    const defaultConnectWallet = async () => {
      const res = await connectWallet();

      if (!res) {
        return;
      }

      if (res.wrongNetwork) {
        switchChain();
      } else {
        if (
          (res?.status ?? AccountStatusEnum.NotConnected) <
          AccountStatusEnum.EnableTrading
        ) {
          onConnectOrderly();
        }
      }
    };

    if (veltoProps?.onConnectWallet) {
      veltoProps?.onConnectWallet(defaultConnectWallet, sendToOnboarding);
      return;
    }
  };

  const switchChain = () => {
    account.once("validate:end", (status) => {
      if (status < AccountStatusEnum.EnableTrading) {
        onConnectOrderly();
      } else {
        toast.success(t("connector.walletConnected"));
      }
    });

    modal
      .show<{ wrongNetwork: boolean }>(
        isMobile ? ChainSelectorSheetId : ChainSelectorDialogId,
        {
          networkId: props.networkId,
          bridgeLessOnly: props.bridgeLessOnly,
        },
      )
      .then(
        (r) => {
          if (!r.wrongNetwork) {
            if (props.status >= AccountStatusEnum.Connected) {
              if (props.status < AccountStatusEnum.EnableTrading) {
                onConnectOrderly();
              } else {
                toast.success(t("connector.walletConnected"));
              }
            }
          }
        },
        (error) => console.log("[switchChain error]", error),
      );
  };

  if (props.wrongNetwork && !props.disabledConnect) {
    return (
      <StatusInfo
        variant="primary"
        onClick={() => {
          switchChain();
        }}
        description={descriptions?.switchChain}
        {...buttonProps}
      >
        {labels.switchChain}
      </StatusInfo>
    );
  }

  if (props.status <= AccountStatusEnum.NotConnected || props.disabledConnect) {
    if (isEmptyView) {
      return <EmptyView onClick={onConnectWallet} />;
    }

    return (
      <StatusInfo
        size="lg"
        variant="primary"
        onClick={() => {
          onConnectWallet();
        }}
        angle={45}
        description={descriptions?.connectWallet}
        disabled={props.disabledConnect}
        {...buttonProps}
      >
        {labels.connectWallet}
      </StatusInfo>
    );
  }

  if (props.status <= AccountStatusEnum.NotSignedIn) {
    return (
      <StatusInfo
        size="lg"
        variant="primary"
        onClick={() => {
          onConnectOrderly();
        }}
        // fullWidth
        angle={45}
        description={descriptions?.signin}
        {...buttonProps}
      >
        {labels.signin}
      </StatusInfo>
    );
  }

  return (
    <StatusInfo
      size="lg"
      variant="primary"
      description={descriptions?.enableTrading}
      {...buttonProps}
      onClick={() => onConnectOrderly()}
    >
      {labels.enableTrading}
    </StatusInfo>
  );
};

AuthGuard.displayName = "AuthGuard";

const StatusInfo: React.FC<MainButtonProps & { description?: string }> = (
  props,
) => {
  const { description, ...buttonProps } = props;
  return (
    <Flex direction={"column"}>
      <MainButton {...buttonProps}></MainButton>
      {!!description && (
        <Box mt={4} className="oui-leading-none" style={{ lineHeight: 0 }}>
          <Text size="2xs" intensity={36}>
            {description}
          </Text>
        </Box>
      )}
    </Flex>
  );
};

const EmptyView = ({
  onClick,
}: {
  onClick: (sendToOnboarding: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      itemAlign="center"
      gap={4}
      className="oui-mt-[68px]"
    >
      <Flex direction="column" itemAlign="center">
        <Flex mb={2}>
          <img
            src="/velto/chart.png"
            alt={t("connector.connectWallet")}
            width={116}
            height={92}
          />
        </Flex>

        <Text className="oui-text-neutral-extra-light oui-text-center oui-text-base oui-font-bold">
          {t("connector.getStarted")}
        </Text>

        <Text className="oui-font-regular oui-text-center oui-text-[12px] oui-text-[#737373]">
          {t("connector.beginYourSetupToUnlock")}
        </Text>
      </Flex>

      <Flex justify="center" mt={4}>
        <MainButton variant="primary" size="md" onClick={() => onClick(true)}>
          {t("connector.connectWallet")}
        </MainButton>
      </Flex>
    </Flex>
  );
};
