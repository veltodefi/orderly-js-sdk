import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useAccount } from "@veltodefi/hooks";
import { OrderlyAppProvider } from "@veltodefi/react-app";
import {
  Box,
  Flex,
  Button,
  modal,
  toast,
  ExtensionPositionEnum,
} from "@veltodefi/ui";
import { Scaffold } from "@veltodefi/ui-scaffold";
import {
  DepositFormWidget,
  WithdrawFormWidget,
  DepositAndWithdrawWithDialogId,
  DepositAndWithdrawWithSheetId,
  TransferFormWidget,
  TransferDialogId,
  TransferSheetId,
} from "@veltodefi/ui-transfer";
import { WalletConnectorProvider } from "@veltodefi/wallet-connector";

const meta: Meta<typeof DepositFormWidget> = {
  title: "Package/ui-transfer",
  component: DepositFormWidget,
  subcomponents: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DepositFormBoth: Story = {
  decorators: [
    () => (
      <Scaffold>
        <Flex justify="center" itemAlign={"start"} gap={6}>
          <Box width={420} r="lg">
            <DepositFormWidget layout="onboarding" />
          </Box>

          <Box width={420} p={2} r="lg" className="oui-bg-base-8">
            <DepositFormWidget />
          </Box>
        </Flex>
      </Scaffold>
    ),
  ],
};

export const DepositFormOnboarding: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" mt={10}>
        <Box width={420} p={5} r="lg">
          <Story />
        </Box>
      </Flex>
    ),
  ],
};

export const DepositForm: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" mt={10}>
        <Box width={420} p={2} r="lg" className="oui-bg-base-8">
          <Story />
        </Box>
      </Flex>
    ),
  ],
};

export const WithdrawForm: Story = {
  render: () => {
    return (
      <Flex justify="center" mt={10}>
        <Box width={420} intensity={800} p={5} r="lg">
          <WithdrawFormWidget />
        </Box>
      </Flex>
    );
  },
};

export const TransferForm: Story = {
  render: () => {
    return (
      <Flex justify="center" mt={10}>
        <Box width={420} intensity={800} p={5} r="lg">
          <TransferFormWidget />
        </Box>
      </Flex>
    );
  },
};

export const DepositDialog: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithDialogId, {
              activeTab: "deposit",
            });
          }}
        >
          Show Deposit Dialog
        </Button>
      </Flex>
    ),
  ],
};

export const DepositSheet: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheetId, { activeTab: "deposit" });
          }}
        >
          Show Deposit Sheet
        </Button>
      </Flex>
    ),
  ],
};

export const WithdrawDialog: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithDialogId, {
              activeTab: "withdraw",
            });
          }}
        >
          Show Withdraw Dialog
        </Button>
      </Flex>
    ),
  ],
};

export const WithdrawSheet: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheetId, {
              activeTab: "withdraw",
            });
          }}
        >
          Show Withdraw Sheet
        </Button>
      </Flex>
    ),
  ],
};

export const TransferDialog: Story = {
  decorators: [
    (Story) => {
      const { state, switchAccount } = useAccount();

      const onSwitchAccount = (id?: string) => {
        console.log("onSwitchAccount", id);
        switchAccount(id!).then(() => {
          toast.success(`Switch Account Success: ${id}`);
        });
      };

      return (
        <Flex
          justify="center"
          itemAlign="center"
          height="100vh"
          gapY={2}
          direction="column"
        >
          <Button
            onClick={() => {
              modal.show(TransferDialogId);
            }}
          >
            Show Transfer Dialog
          </Button>

          <Button
            onClick={() => {
              onSwitchAccount(state.mainAccountId);
            }}
          >
            Switch to Main Account
          </Button>

          {state.subAccounts?.map((item) => (
            <Button
              key={item.id}
              onClick={() => {
                onSwitchAccount(item.id);
              }}
            >
              Switch to {item.id}
            </Button>
          ))}
        </Flex>
      );
    },
  ],
};

export const TransferSheet: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(TransferSheetId);
          }}
        >
          Show Transfer Sheet
        </Button>
      </Flex>
    ),
  ],
};
