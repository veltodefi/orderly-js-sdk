import { FeeTierLabel } from "@veltodefi/ui-order-entry";

export default {
  title: "Components/FeeTierLabel",
  component: FeeTierLabel,
};

export const Default = () => (
  <FeeTierLabel
    currentLevel={3}
    nextLevel={2}
    vipTiersUrl=""
    amountToNextLevel="79,546.71 USDC"
  />
);

export const CustomClass = () => (
  <FeeTierLabel
    currentLevel={5}
    nextLevel={4}
    amountToNextLevel="10,000.00 USDC"
    vipTiersUrl="/vip-tiers"
    className="oui-ml-2"
  />
);
