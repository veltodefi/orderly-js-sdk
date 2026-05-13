import { injectable } from "@veltodefi/ui";
import { AccountMenu } from "./menu.ui";
import { useAccountMenu } from "./useWidgetBuilder.script";

/** Default account menu - can be intercepted by plugins via Account.AccountMenu path */
const InjectableAccountMenu = injectable(AccountMenu, "Account.AccountMenu");

export const AccountMenuWidget = ({
  onConnectWallet,
}: {
  onConnectWallet?: (defaultConnectWallet: () => Promise<void>) => void;
}) => {  const state = useAccountMenu();
  return <AccountMenu {...state} onConnectWallet={onConnectWallet} />;
};

/**
 * Extension slot for account menu (connect wallet button). Uses injectable pattern -
 * plugins can register interceptors for 'Account.AccountMenu' via OrderlyPluginProvider.
 */
export const WalletConnectButtonExtension = () => {
  const state = useAccountMenu();
  return <InjectableAccountMenu {...state} />;
};
