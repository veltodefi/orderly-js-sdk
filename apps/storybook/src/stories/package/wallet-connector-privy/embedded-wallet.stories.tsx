import { StoryObj } from "@storybook/react-vite";
import { EmbeddedConnector } from "@veltodefi/wallet-connector-privy";
import { WalletConnectorPrivy } from "../../../components/orderlyProvider/walletConnectorPrivy";

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
  argTypes: {},
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const EmbeddedDesktop: Story = {
  render: (arg) => {
    return (
      <WalletConnectorPrivy usePrivy>
        <div className="oui-flex oui-justify-center oui-bg-[#1F1F1F]">
          <div className="oui-flex oui-grow oui-max-w-[800px]">
            <EmbeddedConnector />
          </div>
        </div>
      </WalletConnectorPrivy>
    );
  },
};
