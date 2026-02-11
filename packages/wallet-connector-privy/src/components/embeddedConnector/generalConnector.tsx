import React from "react";
import { WalletAdapter, WalletReadyState } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { cn } from "@veltodefi/ui";
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
        className={`oui-grid oui-gap-1 oui-animate-in oui-slide-in-from-top`}
      >
        {!isSolana &&
          evmConnectors.map((item, key) => (
            <Item
              key={`evm-${key}`}
              onClick={() => connect(item)}
              name={item.name}
              connector={item}
            />
          ))}
        {isSolana &&
          readySolAdapters.map((item, key) => (
            <Item
              key={`sol-${key}`}
              onClick={() => connect(item.adapter)}
              name={item.adapter?.name}
              connector={item.adapter}
            />
          ))}
      </div>
    </div>
  );
}

const Item = ({
  onClick,
  connector,
  name,
}: {
  onClick: () => void;
  connector: Connector | WalletAdapter;
  name: string;
}) => {
  return (
    <div
      className={cn(
        "oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5",
        "hover:oui-bg-[#575757] active:oui-bg-base-6",
      )}
      onClick={onClick}
    >
      <RenderWalletIcon connector={connector} />
      <div className="oui-text-sm oui-text-base-contrast">{name}</div>
    </div>
  );
};
