import { injectable } from "@veltodefi/ui";
import { DesktopLayout } from "./trading.ui.desktop";

export const InjectableDesktopLayout = injectable(
  DesktopLayout,
  "Trading.Layout.Desktop",
);
