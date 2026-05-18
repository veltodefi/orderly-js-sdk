import React, { ReactElement, useMemo } from "react";
import { useAccount } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { AccountStatusEnum, NetworkId } from "@veltodefi/types";
import {
  MainButton,
  Either,
  modal,
  Text,
  toast,
  useScreen,
  type MainButtonProps,
  NotConnectedView,
} from "@veltodefi/ui";
import { Flex } from "@veltodefi/ui";
import { Box } from "@veltodefi/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
} from "@veltodefi/ui-chain-selector";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "./walletConnector";

type ChainProps = {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
};

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
  veltoCurrentView?: string;

  buttonProps?: MainButtonProps;

  descriptions?: alertMessages;

  labels?: alertMessages;

  classNames?: {
    root?: string;
    description?: string;
  };

  networkId?: NetworkId;
  veltoIsEmptyView?: boolean;
};

export const AuthGuard: React.FC<React.PropsWithChildren<AuthGuardProps>> = (
  props,
) => {
  const {
    status,
    buttonProps,
    fallback,
    descriptions,
    veltoIsEmptyView,
    classNames,
    networkId,
    id,
    bridgeLessOnly,
    // ...rest
  } = props;
  const { t } = useTranslation();
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect, veltoProps } = useAppContext();

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
          // variant={"gradient"}
          angle={45}
          // fullWidth
          disabled
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
        veltoIsEmptyView={veltoIsEmptyView}
        buttonProps={{ ...buttonProps, id, type: "button" }}
        wrongNetwork={wrongNetwork}
        networkId={props.networkId}
        labels={labels}
        veltoCurrentView={props.veltoCurrentView}
        descriptions={descriptions}
        disabledConnect={disabledConnect}
      />
    );
  }, [
    state.status,
    state.validating,
    buttonProps,
    wrongNetwork,
    labels,
    descriptions,
  ]);

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
  veltoCurrentView?: string;
  disabledConnect?: boolean;
  veltoIsEmptyView?: boolean;
  
}> = (props) => {
  const { buttonProps, labels, descriptions, veltoIsEmptyView } = props;
  const { t } = useTranslation();
  const { connectWallet, veltoProps, veltoWithdrawOnlyMode } = useAppContext();
  const { account } = useAccount();
  const { isMobile } = useScreen();

  const onConnectOrderly = () => {
    modal
      .show(isMobile ? WalletConnectorSheetId : WalletConnectorModalId, {
        title: <ModalTitle />,
      })
      .then(
        (r) => console.log(r),
        (error) => console.log(error),
      );
  };

  const onConnectWallet = async () => {
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
        // size="md"
        // fullWidth
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
    if (veltoIsEmptyView) {
      return (
        <NotConnectedView
          disabled={!veltoWithdrawOnlyMode && veltoProps?.isRestrictedRegion}
          title={t("connector.getStarted")}
          description={t("connector.beginYourSetupToUnlock")}
          buttonLabel={t("connector.connectWallet")}
          onClick={() =>
            veltoProps?.onConnectWallet?.(undefined, true, {
              currentView: props.veltoCurrentView,
              state: "wallet_not_connected",
            })
          }
        />
      );
    }

    return (
      <StatusInfo
        size="lg"
        variant="primary"
        onClick={() => {
          onConnectWallet();
        }}
        // fullWidth
        angle={45}
        description={descriptions?.connectWallet}
        disabled={
          !veltoWithdrawOnlyMode &&
          (props.disabledConnect || veltoProps?.isRestrictedRegion)
        }
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
      // fullWidth
      description={descriptions?.enableTrading}
      {...buttonProps}
      onClick={() => onConnectOrderly()}
    >
      {labels.enableTrading}
    </StatusInfo>
  );

  // return (
  //   <Match
  //     value={props.status}
  //     case={(value: AccountStatusEnum) => {
  //       if (value <= AccountStatusEnum.NotConnected || props.disabledConnect) {
  //         return (
  //           <StatusInfo
  //             size="lg"
  //             onClick={() => {
  //               onConnectWallet();
  //             }}
  //             // fullWidth
  //             variant={props.disabledConnect ? undefined : "gradient"}
  //             angle={45}
  //             description={descriptions?.connectWallet}
  //             disabled={props.disabledConnect}
  //             {...buttonProps}
  //           >
  //             {labels.connectWallet}
  //           </StatusInfo>
  //         );
  //       }
  //       if (value <= AccountStatusEnum.NotSignedIn) {
  //         return (
  //           <StatusInfo
  //             size="lg"
  //             onClick={() => {
  //               onConnectOrderly();
  //             }}
  //             // fullWidth
  //             angle={45}
  //             description={descriptions?.signin}
  //             {...buttonProps}
  //           >
  //             {labels.signin}
  //           </StatusInfo>
  //         );
  //       }
  //     }}
  //     default={
  //       <StatusInfo
  //         size="lg"
  //         // fullWidth
  //         description={descriptions?.enableTrading}
  //         {...buttonProps}
  //         onClick={() => onConnectOrderly()}
  //       >
  //         {labels.enableTrading}
  //       </StatusInfo>
  //     }
  //   />
  // );
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
