import { renderHook, act } from "@testing-library/react-hooks";
import { AccountStatusEnum, MarginMode } from "@veltodefi/types";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@veltodefi/ui-connector";
import { useMarginModeSwitchScript } from "../marginModeSwitch.script";

const mockUseAccount = jest.fn();
const mockUseMarginModeBySymbol = jest.fn();
const mockUseScreen = jest.fn();
const mockModalShow = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@veltodefi/hooks", () => ({
  useAccount: () => mockUseAccount(),
  useMarginModeBySymbol: (symbol: string) => mockUseMarginModeBySymbol(symbol),
}));

jest.mock("@veltodefi/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@veltodefi/ui", () => ({
  useScreen: () => mockUseScreen(),
  modal: { show: (...args: unknown[]) => mockModalShow(...args) },
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock("@veltodefi/ui-connector", () => ({
  WalletConnectorModalId: "walletConnector",
  WalletConnectorSheetId: "walletConnectorSheet",
}));

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe("useMarginModeSwitchScript.onSelect", () => {
  const close = jest.fn();
  let update: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    update = jest.fn().mockResolvedValue({});
    mockUseMarginModeBySymbol.mockReturnValue({
      marginMode: MarginMode.CROSS,
      update,
      isPermissionlessListing: false,
    });
  });

  describe("pre-connect", () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        state: { status: AccountStatusEnum.NotConnected },
      });
    });

    it("desktop: opens WalletConnectorModalId, does NOT call update", () => {
      mockUseScreen.mockReturnValue({ isMobile: false });

      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      act(() => result.current.onSelect(MarginMode.ISOLATED));

      expect(mockModalShow).toHaveBeenCalledWith(WalletConnectorModalId);
      expect(update).not.toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });

    it("mobile: opens WalletConnectorSheetId, does NOT call update", () => {
      mockUseScreen.mockReturnValue({ isMobile: true });

      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      act(() => result.current.onSelect(MarginMode.ISOLATED));

      expect(mockModalShow).toHaveBeenCalledWith(WalletConnectorSheetId);
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe("connected", () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        state: { status: AccountStatusEnum.EnableTrading },
      });
      mockUseScreen.mockReturnValue({ isMobile: false });
    });

    it("calls update with the selected mode", async () => {
      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      await act(async () => {
        result.current.onSelect(MarginMode.ISOLATED);
        await flush();
      });

      expect(update).toHaveBeenCalledWith(MarginMode.ISOLATED);
      expect(mockModalShow).not.toHaveBeenCalled();
    });

    it("update resolves: toast.success is called with the updatedSuccessfully key", async () => {
      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      await act(async () => {
        result.current.onSelect(MarginMode.ISOLATED);
        await flush();
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        "marginMode.updatedSuccessfully",
      );
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("update rejects with Error: toast.error is called with the error message", async () => {
      update.mockRejectedValueOnce(new Error("server boom"));

      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      await act(async () => {
        result.current.onSelect(MarginMode.ISOLATED);
        await flush();
      });

      expect(mockToastError).toHaveBeenCalledWith("server boom");
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });

    it("update rejects with non-Error: toast.error falls back to the generic message", async () => {
      update.mockRejectedValueOnce("opaque reject");

      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      await act(async () => {
        result.current.onSelect(MarginMode.ISOLATED);
        await flush();
      });

      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to update margin mode",
      );
    });

    it("selecting current mode is a no-op (no update, no modal, close called)", () => {
      const { result } = renderHook(() =>
        useMarginModeSwitchScript({ symbol: "PERP_BTC_USDC", close }),
      );

      act(() => result.current.onSelect(MarginMode.CROSS));

      expect(update).not.toHaveBeenCalled();
      expect(mockModalShow).not.toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });
});
