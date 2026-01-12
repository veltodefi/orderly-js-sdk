import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { MainButton } from "@veltodefi/ui";
import { CancelBtnState } from "./cancelBtn.script";

export const CancelBtn: FC<CancelBtnState> = (props) => {
  const { t } = useTranslation();

  return (
    <MainButton
      variant="secondary"
      fullWidth
      size="sm"
      className="oui-border-base-contrast-36"
      onClick={(e) => props.onCancel(e)}
    >
      {t("common.cancel")}
    </MainButton>
  );
};
