import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { useAppContext } from "@veltodefi/react-app";
import {
  ArrowDownSquareFillIcon,
  ArrowLeftRightIcon,
  ArrowUpSquareFillIcon,
  CardTitle,
  Flex,
  MainButton,
} from "@veltodefi/ui";

type Props = {
  disabled: boolean;
  onWithdraw?: () => void;
  onDeposit?: () => void;
  onTransfer?: () => void;
  isMainAccount?: boolean;
  hasSubAccount?: boolean;
};

export const AssetsHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { withdrawOnlyMode } = useAppContext();

  return (
    <Flex justify={"between"}>
      <CardTitle>{t("common.overview")}</CardTitle>
      <Flex gap={3}>
        {props.isMainAccount && (
          <MainButton
            disabled={props.disabled || withdrawOnlyMode}
            size="md"
            variant="primary"
            onClick={() => props.onDeposit?.()}
            icon={
              <ArrowDownSquareFillIcon className="oui-text-primary-contrast" />
            }
            data-testid="oui-testid-portfolio-assets-deposit-btn"
          >
            {t("common.deposit")}
          </MainButton>
        )}
        {props.hasSubAccount && (
          <MainButton
            disabled={props.disabled}
            size="md"
            variant="secondary"
            onClick={() => props.onTransfer?.()}
            icon={<ArrowLeftRightIcon className="oui-text-base-contrast" />}
          >
            {t("common.transfer")}
          </MainButton>
        )}
        {props.isMainAccount && (
          <MainButton
            disabled={props.disabled}
            size="md"
            variant="secondary"
            onClick={() => props.onWithdraw?.()}
            icon={<ArrowUpSquareFillIcon className="oui-text-base-contrast" />}
            data-testid="oui-testid-portfolio-assets-withdraw-btn"
          >
            {t("common.withdraw")}
          </MainButton>
        )}
      </Flex>
    </Flex>
  );
};
