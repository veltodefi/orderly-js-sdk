import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import { Flex, Text } from "@veltodefi/ui";
import { AuthGuard, useAuthGuard } from "@veltodefi/ui-connector";
import { FeeTierLabel } from "../../feeTierLabel";

export const RegularFeesUI: React.FC<{ taker: string; maker: string }> = (
  props,
) => {
  const { t } = useTranslation();
  const { taker, maker } = props;
  const { veltoProps } = useAppContext();
  const isAuthenticated = useAuthGuard();

  const originalTrailingFees = (
    <Flex
      itemAlign="center"
      justify="between"
      width={"100%"}
      gap={1}
      className="oui-orderEntry-fees"
    >
      <Flex width={"100%"} itemAlign="center" justify={"between"}>
        <Text className="oui-fees-label oui-truncate" size="2xs">
          {t("common.fees")}
          {isAuthenticated && veltoProps?.feeTier && (
            <>
              {": "}
              <FeeTierLabel
                currentLevel={veltoProps.feeTier?.currentLevel ?? 0}
                nextLevel={veltoProps.feeTier?.nextLevel ?? 0}
                amountToNextLevel={veltoProps.feeTier?.amountToNextLevel ?? ""}
                vipTiersUrl={veltoProps.feeTier?.vipTiersUrl ?? ""}
                onGoToVipTiers={
                  veltoProps.feeTier?.onGoToVipTiers ?? (() => {})
                }
              />
            </>
          )}
        </Text>

        <AuthGuard
          fallback={() => {
            const fallbackTaker = veltoProps?.feeTier?.takerFee ?? "0.02%";
            const fallbackMaker = veltoProps?.feeTier?.makerFee ?? "0%";
            return (
              <Text className="oui-truncate" size="2xs">
                {t("dmm.taker")}: {fallbackTaker} / {t("dmm.maker")}:{" "}
                {fallbackMaker}
              </Text>
            );
          }}
        >
          <Flex gap={1} className="oui-fees-value-container">
            <Text className="oui-truncate" size="2xs">
              {t("dmm.taker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {taker}
            </Text>
            <Text size="2xs">/</Text>
            <Text className="oui-truncate" size="2xs">
              {t("dmm.maker")}:
            </Text>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {maker}
            </Text>
          </Flex>
        </AuthGuard>
      </Flex>
    </Flex>
  );

  return originalTrailingFees;
};
