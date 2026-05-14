import { renderHook, act } from "@testing-library/react-hooks";
import { AccountStatusEnum, MarginMode } from "@veltodefi/types";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@veltodefi/ui-connector";
import { useSymbolLeverageScript } from "../symbolLeverage.script";

const mockUseAccount = jest.fn();
const mockUseSymbolLeverage = jest.fn();
const mockUseScreen = jest.fn();
const mockUseAccountInfo = jest.fn();
const mockUseMarkPricesStream = jest.fn();
const mockUsePortfolio = jest.fn();
const mockUsePositionStream = jest.fn();
const mockUseSymbolsInfo = jest.fn();
const mockUseLocalStorage = jest.fn();

const mockModalShow = jest.fn();
const mockModalConfirm = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

const mockPerpFreeCollateral = jest.fn();
const mockPerpTotalInitialMarginWithQty = jest.fn();
const mockPerpMaxPositionLeverage = jest.fn();
const mockPerpMaxPositionNotional = jest.fn();

jest.mock("@veltodefi/hooks", () => ({
  useAccount: () => mockUseAccount(),
  useSymbolLeverage: (symbol: string) => mockUseSymbolLeverage(symbol),
  useAccountInfo: () => mockUseAccountInfo(),
  useMarkPricesStream: () => mockUseMarkPricesStream(),
  usePortfolio: () => mockUsePortfolio(),
  usePositionStream: (...args: unknown[]) => mockUsePositionStream(...args),
  useSymbolsInfo: () => mockUseSymbolsInfo(),
  useLocalStorage: (key: string, initial: unknown) =>
    mockUseLocalStorage(key, initial),
}));

jest.mock("@veltodefi/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@veltodefi/ui", () => ({
  useScreen: () => mockUseScreen(),
  modal: {
    show: (...args: unknown[]) => mockModalShow(...args),
    confirm: (...args: unknown[]) => mockModalConfirm(...args),
  },
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
  Text: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@veltodefi/perp", () => ({
  account: {
    freeCollateral: (...args: unknown[]) => mockPerpFreeCollateral(...args),
    totalInitialMarginWithQty: (...args: unknown[]) =>
      mockPerpTotalInitialMarginWithQty(...args),
  },
  positions: {
    maxPositionLeverage: (...args: unknown[]) =>
      mockPerpMaxPositionLeverage(...args),
    maxPositionNotional: (...args: unknown[]) =>
      mockPerpMaxPositionNotional(...args),
  },
}));

jest.mock("@veltodefi/ui-connector", () => ({
  WalletConnectorModalId: "walletConnector",
  WalletConnectorSheetId: "walletConnectorSheet",
}));

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

const positiveFreeCollateral = { eq: () => false, isNegative: () => false };
const zeroFreeCollateral = { eq: () => true, isNegative: () => false };

const setupConnectedHappyState = () => {
  mockUseAccount.mockReturnValue({
    state: { status: AccountStatusEnum.EnableTrading },
  });
  mockUseScreen.mockReturnValue({ isMobile: false });
  mockUseAccountInfo.mockReturnValue({
    data: { imr_factor: { PERP_BTC_USDC: 0.1 } },
  });
  mockUseMarkPricesStream.mockReturnValue({
    data: { PERP_BTC_USDC: 50000 },
  });
  mockUsePortfolio.mockReturnValue({ totalCollateral: 1000 });
  mockUseSymbolsInfo.mockReturnValue({});
  mockUsePositionStream.mockReturnValue([{ rows: [] }]);
  mockUseLocalStorage.mockReturnValue(["markPrice", jest.fn()]);
  mockPerpFreeCollateral.mockReturnValue(positiveFreeCollateral);
  mockPerpTotalInitialMarginWithQty.mockReturnValue(0);
};

const setupDisconnectedState = () => {
  mockUseAccount.mockReturnValue({
    state: { status: AccountStatusEnum.NotConnected },
  });
  mockUseScreen.mockReturnValue({ isMobile: false });
  mockUseAccountInfo.mockReturnValue({ data: undefined });
  mockUseMarkPricesStream.mockReturnValue({ data: undefined });
  mockUsePortfolio.mockReturnValue({ totalCollateral: undefined });
  mockUseSymbolsInfo.mockReturnValue(undefined);
  mockUsePositionStream.mockReturnValue([{ rows: [] }]);
  mockUseLocalStorage.mockReturnValue(["markPrice", jest.fn()]);
};

describe("useSymbolLeverageScript", () => {
  let update: jest.Mock;
  const close = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    update = jest.fn().mockResolvedValue({ success: true });
    mockUseSymbolLeverage.mockReturnValue({
      maxLeverage: 10,
      update,
      isLoading: false,
    });
  });

  describe("onSave", () => {
    describe("pre-connect", () => {
      beforeEach(setupDisconnectedState);

      it("desktop: opens WalletConnectorModalId, does NOT call update", async () => {
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });

        expect(mockModalShow).toHaveBeenCalledWith(WalletConnectorModalId);
        expect(update).not.toHaveBeenCalled();
        expect(mockModalConfirm).not.toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
      });

      it("mobile: opens WalletConnectorSheetId", async () => {
        mockUseScreen.mockReturnValue({ isMobile: true });

        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });

        expect(mockModalShow).toHaveBeenCalledWith(WalletConnectorSheetId);
        expect(update).not.toHaveBeenCalled();
      });
    });

    describe("connected", () => {
      beforeEach(setupConnectedHappyState);

      it("opens modal.confirm and does NOT call modal.show", async () => {
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });

        expect(mockModalConfirm).toHaveBeenCalledTimes(1);
        expect(mockModalShow).not.toHaveBeenCalled();
      });

      it("onOk calls update with { leverage, symbol, margin_mode }", async () => {
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });

        const onOk = mockModalConfirm.mock.calls[0][0].onOk;
        await act(async () => {
          await onOk();
          await flush();
        });

        expect(update).toHaveBeenCalledWith({
          leverage: 5,
          symbol: "PERP_BTC_USDC",
          margin_mode: MarginMode.CROSS,
        });
      });

      it("onOk success: closes and fires toast.success", async () => {
        update.mockResolvedValueOnce({ success: true });
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });
        const onOk = mockModalConfirm.mock.calls[0][0].onOk;
        await act(async () => {
          await onOk();
          await flush();
        });

        expect(close).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith("leverage.updated");
        expect(mockToastError).not.toHaveBeenCalled();
      });

      it("onOk soft-failure (success: false): fires toast.error with the message", async () => {
        update.mockResolvedValueOnce({ success: false, message: "denied" });
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });
        const onOk = mockModalConfirm.mock.calls[0][0].onOk;
        await act(async () => {
          await onOk();
          await flush();
        });

        expect(mockToastError).toHaveBeenCalledWith("denied");
        expect(mockToastSuccess).not.toHaveBeenCalled();
      });

      it("onOk rejection: fires toast.error with the rejection message", async () => {
        update.mockRejectedValueOnce(new Error("network boom"));
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
            close,
          }),
        );

        await act(async () => {
          await result.current.onSave();
        });
        const onOk = mockModalConfirm.mock.calls[0][0].onOk;
        await act(async () => {
          await onOk();
          await flush();
        });

        expect(mockToastError).toHaveBeenCalledWith("network boom");
      });
    });
  });

  describe("disabled flag", () => {
    describe("pre-connect", () => {
      beforeEach(setupDisconnectedState);

      it("false when leverage is in [1, maxLeverage]", () => {
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
          }),
        );
        expect(result.current.disabled).toBe(false);
      });

      it("true when leverage exceeds maxLeverage", () => {
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 99,
            marginMode: MarginMode.CROSS,
          }),
        );
        expect(result.current.disabled).toBe(true);
      });
    });

    describe("connected", () => {
      it("false on happy path: positive free collateral + leverage in range + no position", () => {
        setupConnectedHappyState();
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
          }),
        );
        expect(result.current.disabled).toBe(false);
      });

      it("true when free collateral is zero (overRequiredMargin)", () => {
        setupConnectedHappyState();
        mockPerpFreeCollateral.mockReturnValue(zeroFreeCollateral);
        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
          }),
        );
        expect(result.current.disabled).toBe(true);
      });

      it("true when leverage exceeds maxPositionLeverage (overMaxPositionLeverage)", () => {
        setupConnectedHappyState();
        mockUsePositionStream.mockReturnValue([
          {
            rows: [
              {
                symbol: "PERP_BTC_USDC",
                margin_mode: MarginMode.CROSS,
                notional: 1000,
                leverage: 5,
              },
            ],
          },
        ]);
        mockPerpMaxPositionLeverage.mockReturnValue(3);

        const { result } = renderHook(() =>
          useSymbolLeverageScript({
            symbol: "PERP_BTC_USDC",
            curLeverage: 5,
            marginMode: MarginMode.CROSS,
          }),
        );
        expect(result.current.disabled).toBe(true);
      });
    });
  });
});
