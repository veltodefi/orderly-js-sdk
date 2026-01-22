import React from "react";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { useScreen } from "@veltodefi/ui";
import { useWalletConnectorPrivy } from "../../provider";
import { useSolanaWallet } from "../../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../../providers/wagmi/wagmiWalletProvider";
import { getWalletIcon } from "../../util";
import { MetaMaskIcon } from "./svg/metaMaskIcon";
import { PhantomIcon } from "./svg/phantomIcon";
import { SolflareIcon } from "./svg/solflareIcon";
import { WalletConnectIcon } from "./svg/walletConnectIcon";

export function RenderWalletIcon({
  connector,
}: {
  connector: Connector | WalletAdapter;
}) {
  const icon = connector.icon
    ? connector.icon
    : getWalletIcon((connector as Connector).type);

  return (
    <div className="oui-w-[32px] oui-h-[32px] oui-flex oui-items-center oui-justify-center oui-bg-black oui-rounded-full">
      <img
        className={"oui-w-[18px] oui-h-[18px]"}
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
  const { connectors } = useWagmiWallet();
  const { wallets } = useSolanaWallet();
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

  const walletConnect = connectors.find((item) => item.id === "walletConnect")!;
  const metamaskWallet = connectors.find((item) => item.id === "io.metamask")!;
  const phantomWallet = connectors.find((item) => item.id === "app.phantom")!;

  const evmWallets = [
    { ...walletConnect, Icon: WalletConnectIcon },
    { ...metamaskWallet, Icon: MetaMaskIcon },
    { ...phantomWallet, Icon: PhantomIcon },
  ];

  const ledgerWallet = wallets.find(({ adapter }) => adapter.name === "Ledger");
  const solflareWallet = wallets.find(
    ({ adapter }) => adapter.name === "Solflare",
  );

  const solWallets = [
    { ...solflareWallet, Icon: SolflareIcon },
    { ...ledgerWallet },
  ];

  // 900900900 is Solana's chain ID, not defined by us or Orderly
  const currentChainIsSolana = currentChainId.toString() === "900900900";

  return (
    <div>
      <div className="oui-grid oui-gap-1">
        {evmWallets.map((item, key) => (
          <div
            key={`evm-${key}`}
            className="oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5"
            onClick={() => onConnect(item)}
          >
            <item.Icon />
            <div className="oui-text-sm oui-text-base-contrast">
              {item.name}
            </div>
          </div>
        ))}

        <div
          className={`oui-overflow-hidden oui-transition-all oui-duration-200 ${
            currentChainIsSolana
              ? "oui-animate-collapsible-down oui-h-[120px]"
              : "oui-animate-collapsible-up oui-h-0"
          }`}
          style={
            {
              "--radix-collapsible-content-height": "120px",
            } as React.CSSProperties
          }
        >
          {solWallets.map((item, key) => (
            <div
              key={`sol-${key}`}
              className="oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5 oui-mb-1"
              onClick={() => connect(item.adapter)}
            >
              {item.Icon ? (
                <item.Icon />
              ) : (
                <RenderWalletIcon connector={item.adapter} />
              )}
              <div className="oui-text-sm oui-text-base-contrast">
                {item.adapter.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
