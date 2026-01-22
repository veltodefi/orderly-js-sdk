import React, { useMemo } from "react";
import { useLocalStorage } from "@veltodefi/hooks";
import { Trans } from "@veltodefi/i18n";
import { ConnectorKey } from "@veltodefi/types";
import { useWalletConnectorPrivy } from "../provider";
import { useAbstractWallet } from "../providers/abstractWallet/abstractWalletProvider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { useSolanaWallet } from "../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../providers/wagmi/wagmiWalletProvider";
import { WalletConnectType } from "../types";
import { ConnectWallet } from "./embeddedConnector/index";
import { ProtectedByPrivyIcon } from "./embeddedConnector/svg/protectedByPrivyIcon";
import { RenderNonPrivyWallet } from "./renderNonPrivyWallet";
import { RenderPrivyWallet } from "./renderPrivyWallet";

function MyWallet() {
  const [connectorKey] = useLocalStorage(ConnectorKey, "");

  return (
    <div>
      {connectorKey === "privy" && <RenderPrivyWallet />}
      {connectorKey !== "privy" && <RenderNonPrivyWallet />}
    </div>
  );
}

interface Props {
  currentChainId: string;
}

export function EmbeddedConnector(props: Props) {
  const { isConnected: isConnectedPrivy } = usePrivyWallet();
  const { isConnected: isConnectedEvm } = useWagmiWallet();
  const { isConnected: isConnectedSolana } = useSolanaWallet();
  const { isConnected: isConnectedAbstract } = useAbstractWallet();

  const { termsOfUse } = useWalletConnectorPrivy();
  const [connectorKey] = useLocalStorage(ConnectorKey, "");

  const isConnected = useMemo(() => {
    if (connectorKey === WalletConnectType.PRIVY && isConnectedPrivy) {
      return true;
    }
    if (connectorKey !== WalletConnectType.PRIVY) {
      if (isConnectedEvm) {
        return true;
      }
      if (isConnectedSolana) {
        return true;
      }
      if (isConnectedAbstract) {
        return true;
      }
    }
    return false;
  }, [
    isConnectedPrivy,
    isConnectedEvm,
    isConnectedSolana,
    isConnectedAbstract,
    connectorKey,
  ]);

  return (
    <>
      <div className="oui-relative oui-z-10 oui-flex oui-h-full oui-grow oui-flex-col">
        {isConnected ? (
          <MyWallet />
        ) : (
          <ConnectWallet currentChainId={props.currentChainId} />
        )}
        {!isConnected && (
          <>
            {termsOfUse && (
              <>
                <div className="oui-mb-2 oui-mt-4 oui-flex oui-justify-center oui-text-[#C7C7C7] md:oui-mt-6">
                  <ProtectedByPrivyIcon
                    width={161}
                    color="inherit"
                    opacity={1}
                  />
                </div>
                <div className="oui-flex-none oui-text-center oui-text-sm oui-font-normal oui-text-[#C7C7C7]">
                  {/* @ts-ignore */}
                  <Trans
                    i18nKey="connector.privy.termsOfUse"
                    components={[
                      <a
                        key="termsOfUse"
                        href={termsOfUse}
                        className="oui-cursor-pointer oui-text-primary oui-underline"
                        target="_blank"
                        rel="noreferrer"
                      />,
                    ]}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
