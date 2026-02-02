import { StoryObj } from "@storybook/react-vite";
import { EmbeddedConnector } from "@veltodefi/wallet-connector-privy";
import { WalletConnectorPrivy } from "../../../components/orderlyProvider/walletConnectorPrivy";

const CHAIN_LABELS: Record<number, string> = {
  // Mainnets
  42161: "Arbitrum One",
  10: "Optimism",
  8453: "Base",
  5000: "Mantle",
  1: "Ethereum",
  56: "BNB Smart Chain",
  1329: "Sei Network",
  43114: "Avalanche C-Chain",
  900900900: "Solana",
  2818: "Morph",
  146: "Sonic",
  80094: "Berachain",
  1514: "Story",
  34443: "Mode",
  98866: "Plume",
  2741: "Abstract",
  // Testnets
  421614: "Arbitrum Sepolia (Test)",
  97: "BSC Testnet",
  10143: "Monad Testnet",
  11124: "Abstract Testnet",
  901901901: "Orderly Testnet",
};

const ALL_CHAIN_IDS = Object.keys(CHAIN_LABELS).map(Number);

const meta = {
  title: "Package/wallet-connector-privy",
  component: EmbeddedConnector,
  decorators: [
    (Story: any) => {
      return <Story />;
    },
  ],
  parameters: {
    layout: "fullscreen",
    walletConnectorType: "privy",
  },
  argTypes: {
    currentChainId: {
      name: "Network Selection",
      description: "Select the Orderly supported chain",
      options: ALL_CHAIN_IDS,
      control: {
        type: "select",
        labels: CHAIN_LABELS, // Storybook maps the ID to the Name here
      },
    },
  },
  args: {
    currentChainId: 42161, // Default to Arbitrum
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Embedded: Story = {
  render: (arg) => {
    return (
      <WalletConnectorPrivy usePrivy>
        <div className="oui-flex oui-justify-center oui-bg-[#1F1F1F]">
          <div className="oui-flex oui-grow oui-max-w-[700px]">
            <EmbeddedConnector currentChainId={arg.currentChainId} />
          </div>
        </div>
      </WalletConnectorPrivy>
    );
  },
};
