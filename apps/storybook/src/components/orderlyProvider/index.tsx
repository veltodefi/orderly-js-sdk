import { FC, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";
import { LocaleProvider } from "./localeProvider";
import { OrderlyAppRootProvider } from "./orderlyAppProvider";
import { RouteProvider } from "./rounteProvider";
import { WalletConnectorProvider } from "./walletConnectorProvider";

export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <MemoryRouter>
      <RouteProvider onRouteChange={onStorybookRounteChange}>
        <LocaleProvider>
          <WalletConnectorProvider>
            <OrderlyAppRootProvider>{props.children}</OrderlyAppRootProvider>
          </WalletConnectorProvider>
        </LocaleProvider>
      </RouteProvider>
    </MemoryRouter>
  );
};
