import { FC } from "react";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@veltodefi/ui";
import { AccountMenu, AccountMenuProps } from "./menu.ui";
import { useAccountMenu } from "./useWidgetBuilder.script";

export const AccountMenuWidget = ({
  onConnectWalletClick,
}: {
  onConnectWalletClick?: () => void;
}) => {
  const state = useAccountMenu();
  return <AccountMenu {...state} onConnectWalletClick={onConnectWalletClick} />;
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
