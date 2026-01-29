import React from "react";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { ScrollArea } from "@veltodefi/ui";
import { useWallet } from "../../hooks/useWallet";
import { useWalletConnectorPrivy } from "../../provider";
import { WalletConnectType } from "../../types";
import { ConnectProps } from "../../types";
import { AbstractConnectArea } from "./abstractConnector";
import { GeneralConnectArea } from "./generalConnector";
import { PrivyConnectArea } from "./privyConnector";

interface Props {
  currentChainId: string;
}

export function ConnectWallet(props: Props) {
  const { connect } = useWallet();
  const { setOpenConnectDrawer } = useWalletConnectorPrivy();

  const handleConnect = (params: ConnectProps) => {
    connect(params);
    if (params.walletType === WalletConnectType.PRIVY) {
      setOpenConnectDrawer(false);
    }
  };

  // Abstract mainnet and devnet chains
  const isAbstract =
    `${props.currentChainId}` === "2741" ||
    `${props.currentChainId}` === "11124";

  return (
    <ScrollArea className="oui-flex oui-custom-scrollbar">
      <div className={"oui-flex oui-flex-col"}>
        {!isAbstract && (
          <>
            <GeneralConnectArea
              currentChainId={props.currentChainId}
              connect={(data) => {
                // If this object contains an ID, it is a connector
                if ("id" in data) {
                  return handleConnect({
                    walletType: WalletConnectType.EVM,
                    connector: data as unknown as Connector,
                  });
                }

                // If not, it is a wallet adapter instead
                handleConnect({
                  walletType: WalletConnectType.SOL,
                  walletAdapter: data as unknown as WalletAdapter,
                });
              }}
            />
            <div className="oui-my-4 md:oui-my-6 oui-h-px oui-w-full oui-bg-base-6" />
            <PrivyConnectArea
              connect={(type) =>
                handleConnect({
                  walletType: WalletConnectType.PRIVY,
                  extraType: type,
                })
              }
            />
          </>
        )}
        {isAbstract && (
          <AbstractConnectArea
            connect={() =>
              handleConnect({ walletType: WalletConnectType.ABSTRACT })
            }
          />
        )}
      </div>
    </ScrollArea>
  );
}
