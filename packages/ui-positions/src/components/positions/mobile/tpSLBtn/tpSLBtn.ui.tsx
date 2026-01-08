import { FC } from "react";
import { MainButton } from "@veltodefi/ui";
import { TpSLBtnState } from "./tpSLBtn.script";
import { useTranslation } from "@veltodefi/i18n";

export const TpSLBtn: FC<TpSLBtnState> = (props) => {
  const { t } = useTranslation();

  return (
    <MainButton
      variant="secondary"
      size="sm"
      className="oui-border-base-contrast-36"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.openTP_SL();
      }}
    >
      {t("common.tpsl")}
    </MainButton>
  );
};
