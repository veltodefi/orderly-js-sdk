import React from "react";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connector } from "wagmi";
import { ChainNamespace } from "@veltodefi/types";
import { useScreen } from "@veltodefi/ui";
import { useWallet } from "../../hooks/useWallet";
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

export function GeneralConnectArea({
  connect,
}: {
  connect: (type: Connector | WalletAdapter) => void;
}) {
  const { namespace } = useWallet();
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

  return (
    <div>
      <div className="oui-grid oui-gap-1">
        {evmWallets.map((item, key) => (
          <div
            key={key}
            className={
              "oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5"
            }
            onClick={() => onConnect(item)}
          >
            <item.Icon />
            <div className="oui-text-sm oui-text-base-contrast">
              {item.name}
            </div>
          </div>
        ))}
        {namespace === ChainNamespace.solana &&
          solWallets.map((item, key) => (
            <div
              key={key}
              className={
                "oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-3 oui-rounded-lg oui-p-3 oui-bg-base-5"
              }
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
  );
}
