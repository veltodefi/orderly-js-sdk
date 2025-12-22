import { FC } from "react";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@veltodefi/ui";
import { AccountMenu, AccountMenuProps } from "./menu.ui";
import { useAccountMenu } from "./useWidgetBuilder.script";

export const AccountMenuWidget = ({
  onConnectWallet,
}: {
  onConnectWallet?: (defaultConnectWallet: () => Promise<void>) => void;
}) => {
  const state = useAccountMenu();
  return <AccountMenu {...state} onConnectWallet={onConnectWallet} />;
};

installExtension<AccountMenuProps>({
  name: "account-menu",
  scope: ["*"],
  positions: [ExtensionPositionEnum.AccountMenu],
  builder: useAccountMenu,
  __isInternal: true,
})((props: AccountMenuProps) => {
  return <AccountMenu {...props} />;
});

export const WalletConnectButtonExtension = () => {
  return <ExtensionSlot position={ExtensionPositionEnum.AccountMenu} />;
};
