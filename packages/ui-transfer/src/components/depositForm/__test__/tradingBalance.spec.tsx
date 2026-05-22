/**
 * Regression coverage for the two "insufficient amount" UX fixes on the
 * deposit dialog:
 *
 *  1. `TradingBalance` preview must not echo the typed quantity back when
 *     the source input is in an error state. The label says "Trading
 *     balance: X", which historically read as "this is what your balance
 *     will become" — showing the invalid amount implies the deposit will
 *     succeed. On error, fall back to "0".
 *
 *  2. The "Est. gas fee" row must disappear in the same error state.
 *     Computing/showing fees for an unsubmittable amount is noise.
 *
 * The TradingBalance component and shouldShowEstimatedFee predicate are
 * named-exported from depositForm.ui.tsx for this test. The two `<Fee />`
 * call sites inside `renderContent` both gate on the predicate — testing
 * the predicate covers both.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { API } from "@veltodefi/types";
import {
  TradingBalance,
  shouldShowEstimatedFee,
} from "../components/tradingBalance";

jest.mock("@veltodefi/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@veltodefi/ui", () => {
  const React = require("react");
  const passthrough =
    (tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...rest }: { children?: React.ReactNode }) =>
      React.createElement(tag, rest, children);
  return {
    Box: passthrough("div"),
    Flex: passthrough("div"),
    Text: passthrough("span"),
    Spinner: () => React.createElement("div", { "data-testid": "spinner" }),
    Tips: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
  };
});

const usdc: API.TokenInfo = {
  symbol: "USDC",
  precision: 2,
} as API.TokenInfo;

describe("TradingBalance — invalid-input preview gating", () => {
  it('shows "0" when the source input is in error state (insufficient amount)', () => {
    render(
      <TradingBalance
        targetQuantityLoading={false}
        targetQuantity="9999.99"
        targetToken={usdc}
        sourceInputStatus="error"
      />,
    );
    // Should NOT echo the invalid quantity.
    expect(screen.queryByText(/9999/)).toBeNull();
    // Should fall back to "0 USDC".
    expect(screen.getByText(/^0 USDC$/)).toBeTruthy();
  });

  it("shows the typed quantity when the source input is valid", () => {
    render(
      <TradingBalance
        targetQuantityLoading={false}
        targetQuantity="42.50"
        targetToken={usdc}
        sourceInputStatus="default"
      />,
    );
    expect(screen.getByText("42.50 USDC")).toBeTruthy();
  });

  it("shows the typed quantity when sourceInputStatus is undefined", () => {
    render(
      <TradingBalance
        targetQuantityLoading={false}
        targetQuantity="42.50"
        targetToken={usdc}
      />,
    );
    expect(screen.getByText("42.50 USDC")).toBeTruthy();
  });

  it("shows a spinner instead of the value while target quantity is loading", () => {
    render(
      <TradingBalance
        targetQuantityLoading
        targetQuantity="42.50"
        targetToken={usdc}
        sourceInputStatus="default"
      />,
    );
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(screen.queryByText("42.50 USDC")).toBeNull();
  });
});

describe("shouldShowEstimatedFee — gas-fee gating on input status", () => {
  it("hides the fee when the source input is in error state", () => {
    expect(shouldShowEstimatedFee("error")).toBe(false);
  });

  it("shows the fee for the default state", () => {
    expect(shouldShowEstimatedFee("default")).toBe(true);
  });

  it("shows the fee for warning state (the user can still submit)", () => {
    expect(shouldShowEstimatedFee("warning")).toBe(true);
  });

  it("shows the fee when status is undefined (no validation yet)", () => {
    expect(shouldShowEstimatedFee(undefined)).toBe(true);
  });
});
