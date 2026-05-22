/**
 * Regression coverage for the Velto onboarding handoff in DefaultFallback.
 *
 * The inner `onConnectWallet` must delegate to `veltoProps.onConnectWallet`
 * (which the Velto webapp wires to `redirectToOnboarding`) when one is
 * provided, instead of opening the Orderly wallet modal directly.
 *
 * This wiring was silently dropped during the 3.0 upstream sync and only
 * surfaced when a designer noticed the "Get started" CTA stopped routing
 * users into the onboarding flow — exactly the kind of regression a unit
 * test catches cheaply.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccountStatusEnum } from "@veltodefi/types";
import { AuthGuard } from "../authGuard";

const mockUseAccount = jest.fn();
const mockUseAppContext = jest.fn();
const mockUseScreen = jest.fn();
const mockModalShow = jest.fn().mockReturnValue(Promise.resolve({}));

jest.mock("@veltodefi/hooks", () => ({
  useAccount: () => mockUseAccount(),
}));

jest.mock("@veltodefi/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@veltodefi/react-app", () => ({
  useAppContext: () => mockUseAppContext(),
}));

jest.mock("@veltodefi/ui", () => {
  // Lightweight stand-ins — we only need the parts AuthGuard actually
  // renders. MainButton becomes a plain <button> so fireEvent.click works
  // without dragging in the real component's styling and refs.
  const React = require("react");
  const passthrough =
    (tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...rest }: { children?: React.ReactNode }) =>
      React.createElement(tag, rest, children);
  return {
    MainButton: ({
      children,
      onClick,
      disabled,
      ...rest
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) =>
      React.createElement(
        "button",
        { type: "button", onClick, disabled, ...rest },
        children,
      ),
    Either: ({
      value,
      left,
      children,
    }: {
      value: boolean;
      left: React.ReactNode;
      children: React.ReactNode;
    }) => (value ? children : left),
    modal: { show: (...args: unknown[]) => mockModalShow(...args) },
    Text: passthrough("span"),
    toast: { success: jest.fn(), error: jest.fn() },
    useScreen: () => mockUseScreen(),
    NotConnectedView: ({
      buttonLabel,
      onClick,
    }: {
      buttonLabel: string;
      onClick: (sendToOnboarding: boolean) => void;
    }) =>
      React.createElement(
        "button",
        { type: "button", onClick: () => onClick(true) },
        buttonLabel,
      ),
    Flex: passthrough("div"),
    Box: passthrough("div"),
  };
});

jest.mock("@veltodefi/ui-chain-selector", () => ({
  ChainSelectorDialogId: "chainSelector",
  ChainSelectorSheetId: "chainSelectorSheet",
}));

jest.mock("../walletConnector", () => ({
  WalletConnectorModalId: "walletConnector",
  WalletConnectorSheetId: "walletConnectorSheet",
}));

describe("AuthGuard — veltoProps.onConnectWallet handoff", () => {
  const setUp = ({ onConnectWallet }: { onConnectWallet?: jest.Mock }) => {
    const connectWallet = jest.fn().mockResolvedValue({
      status: AccountStatusEnum.Connected,
      wrongNetwork: false,
    });

    mockUseAccount.mockReturnValue({
      state: {
        status: AccountStatusEnum.NotConnected,
        validating: false,
      },
      account: { once: jest.fn() },
    });
    mockUseAppContext.mockReturnValue({
      connectWallet,
      veltoProps: onConnectWallet ? { onConnectWallet } : undefined,
      wrongNetwork: false,
      disabledConnect: false,
    });
    mockUseScreen.mockReturnValue({ isMobile: false });

    return { connectWallet };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default after `jest.clearAllMocks()` strips the implementation.
    mockModalShow.mockReturnValue(Promise.resolve({}));
  });

  it("invokes veltoProps.onConnectWallet instead of the default connect flow when provided", async () => {
    const onConnectWallet = jest.fn();
    const { connectWallet } = setUp({ onConnectWallet });

    render(<AuthGuard status={AccountStatusEnum.EnableTrading} />);

    // The fallback renders the connectWallet button when status is below the
    // required threshold. The label resolves through our t() stub to the
    // raw key.
    const button = screen.getByRole("button", {
      name: "connector.connectWallet",
    });
    fireEvent.click(button);

    expect(onConnectWallet).toHaveBeenCalledTimes(1);
    // First arg: a defaultConnectWallet function the consumer can call to
    // run the original Orderly flow. Second arg: sendToOnboarding flag
    // (undefined for the inline CTA — the data-table empty-state path is
    // the one that passes true).
    expect(typeof onConnectWallet.mock.calls[0][0]).toBe("function");
    expect(onConnectWallet.mock.calls[0][1]).toBeUndefined();

    // Crucially, we must NOT have opened the Orderly wallet modal directly.
    expect(connectWallet).not.toHaveBeenCalled();
    expect(mockModalShow).not.toHaveBeenCalled();
  });

  it("falls back to the default connectWallet flow when veltoProps.onConnectWallet is absent", async () => {
    const { connectWallet } = setUp({});

    render(<AuthGuard status={AccountStatusEnum.EnableTrading} />);

    const button = screen.getByRole("button", {
      name: "connector.connectWallet",
    });
    fireEvent.click(button);

    // Microtask flush — onConnectWallet awaits connectWallet().
    await Promise.resolve();

    expect(connectWallet).toHaveBeenCalledTimes(1);
  });

  it("exposes the default connect flow as the first arg so consumers can opt in", async () => {
    const onConnectWallet = jest.fn();
    const { connectWallet } = setUp({ onConnectWallet });

    render(<AuthGuard status={AccountStatusEnum.EnableTrading} />);

    fireEvent.click(
      screen.getByRole("button", { name: "connector.connectWallet" }),
    );

    expect(onConnectWallet).toHaveBeenCalledTimes(1);
    const defaultConnect = onConnectWallet.mock
      .calls[0][0] as () => Promise<void>;

    // Until the consumer calls the supplied function, the underlying
    // Orderly flow stays untouched.
    expect(connectWallet).not.toHaveBeenCalled();

    await defaultConnect();

    expect(connectWallet).toHaveBeenCalledTimes(1);
  });
});
