/**
 * Module augmentation: maps TradingView interceptor target paths to props types.
 * Import from @veltodefi/ui-tradingview to enable typed props in
 * createInterceptor("TradingView.DisplayControl.DesktopMenuList", ...).
 */
/// <reference types="@veltodefi/plugin-core" />
import type { DesktopDisplayControlMenuListProps } from "./components/displayControl/common";

declare module "@veltodefi/plugin-core" {
  interface InterceptorTargetPropsMap {
    "TradingView.DisplayControl.DesktopMenuList": DesktopDisplayControlMenuListProps;
  }
}
