import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MainButton,
  Flex,
  ArrowUpSquareFillIcon,
  ArrowDownSquareFillIcon,
} from "@veltodefi/ui";

const meta: Meta<typeof MainButton> = {
  title: "Base/Button/MainButton",
  component: MainButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "secondary", "tertiary", "invertedPrimary"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    loading: {
      control: {
        type: "boolean",
      },
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    fullWidth: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    size: "lg",
    variant: "primary",
    children: "Main Button",
    disabled: false,
    fullWidth: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithIcons: Story = {
  render: (args) => {
    return (
      <Flex gap={3} direction="column" width="300px">
        <MainButton
          {...args}
          variant="primary"
          leading={<ArrowUpSquareFillIcon />}
        >
          With Leading Icon
        </MainButton>
        <MainButton
          {...args}
          variant="secondary"
          trailing={<ArrowDownSquareFillIcon />}
        >
          With Trailing Icon
        </MainButton>
        <MainButton
          {...args}
          variant="tertiary"
          leading={<ArrowUpSquareFillIcon />}
          trailing={<ArrowDownSquareFillIcon />}
        >
          With Both Icons
        </MainButton>
        <MainButton
          {...args}
          variant="primary"
          icon={<ArrowUpSquareFillIcon />}
        />
      </Flex>
    );
  },
};
