import React from "react";
import { useAssetViewScript } from "./assetView.script";
import { AssetView } from "./assetView.ui";

type AssetViewWidgetProps = {
  isFirstTimeDeposit?: boolean;
  onConnectWalletClick?: () => void;
};

export const AssetViewWidget: React.FC<AssetViewWidgetProps> = (props) => {
  const state = useAssetViewScript();
  return (
    <AssetView
      {...state}
      isFirstTimeDeposit={props.isFirstTimeDeposit}
      onConnectWalletClick={props.onConnectWalletClick}
    />
  );
};
