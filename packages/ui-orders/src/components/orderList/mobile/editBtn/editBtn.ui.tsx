import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { MainButton } from "@veltodefi/ui";
import { EditBtnState } from "./editBtn.script";

export const EditBtn: FC<EditBtnState> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <MainButton
        variant="secondary"
        fullWidth
        size="sm"
        className="oui-border-base-contrast-36"
        onClick={() => {
          props.onShowEditSheet();
        }}
      >
        {t("common.edit")}
      </MainButton>
    </>
  );
};
