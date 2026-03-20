import { useTranslation } from "@veltodefi/i18n";
import { MainButton } from "@veltodefi/ui";
import { FaucetState } from "./faucet.script";

export function FaucetUi(props: FaucetState) {
  const { t } = useTranslation();

  if (!props.showFaucet) {
    return null;
  }

  return (
    <MainButton
      variant="secondary"
      fullWidth
      size="md"
      onClick={props.getFaucet}
      loading={props.loading}
      className="oui-faucet-btn oui-rounded oui-border-primary-light oui-text-primary-light"
      data-testid="oui-testid-assetView-getFaucet-button"
    >
      {t("trading.faucet.getTestUSDC")}
    </MainButton>
  );
}
