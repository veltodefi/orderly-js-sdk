import React from "react";
import { WalletAdapter, WalletReadyState } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { useScreen } from "@veltodefi/ui";
import { useWalletConnectorPrivy } from "../../provider";
import { useSolanaWallet } from "../../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../../providers/wagmi/wagmiWalletProvider";
import { getWalletIcon } from "../../util";

export function RenderWalletIcon({
  connector,
}: {
  connector: Connector | WalletAdapter;
}) {
  const icon = connector.icon
    ? connector.icon
    : getWalletIcon((connector as Connector).type);

  return (
    <div className="oui-w-[24px] oui-h-[24px] oui-flex oui-items-center oui-justify-center oui-rounded-full">
      <img
        className={"oui-w-[24px] oui-h-[24px]"}
        src={icon}
        alt={connector.name}
      />
    </div>
  );
}

interface Props {
  currentChainId: string;
  connect: (type: Connector | WalletAdapter) => void;
}

export function GeneralConnectArea({ currentChainId, connect }: Props) {
  const { connectors: evmConnectors } = useWagmiWallet();
  const { wallets: solAdapters } = useSolanaWallet();
  const { setOpenConnectDrawer } = useWalletConnectorPrivy();
  const { isMobile } = useScreen();

  const onConnect = (item: Connector) => {
    if (isMobile) {
      if (item.id === "walletConnect") {
        setOpenConnectDrawer(false);
      }
    }
    connect(item);
  };

  // These are Solana's chain IDs (mainnet and devnet) in Orderly's ecosystem
  const isSolana =
    `${currentChainId}` === "900900900" || `${currentChainId}` === "901901901";

  const readySolAdapters = solAdapters.filter(
    (adapters) =>
      adapters.readyState !== WalletReadyState.NotDetected &&
      adapters.readyState !== WalletReadyState.Unsupported,
  );

  return (
    <div>
      <div
        key={isSolana ? "solana-list" : "evm-list"}
        className={`oui-grid oui-gap-1 oui-animate-in oui-slide-in-from-right`}
      >
        {!isSolana &&
          evmConnectors.map((item, key) => (
            <div
              key={`evm-${key}`}
              className="oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5"
              onClick={() => onConnect(item)}
            >
              <RenderWalletIcon connector={item} />
              <div className="oui-text-sm oui-text-base-contrast">
                {item.name}
              </div>
            </div>
          ))}
        {isSolana &&
          readySolAdapters.map((item, key) => (
            <div
              key={`sol-${key}`}
              className="oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5"
              onClick={() => connect(item.adapter)}
            >
              <RenderWalletIcon connector={item.adapter} />
              <div className="oui-text-sm oui-text-base-contrast">
                {item.adapter?.name}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
