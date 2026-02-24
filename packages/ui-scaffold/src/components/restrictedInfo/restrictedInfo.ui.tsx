import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Checkbox, cn, Flex, SimpleDialog, Box } from "@veltodefi/ui";
import { WarningIcon } from "./icons";
import type { UseRestrictedInfoScriptReturn } from "./restrictedInfo.script";

export type RestrictedInfoProps = UseRestrictedInfoScriptReturn & {
  className?: string;
};

export const RestrictedInfo: FC<RestrictedInfoProps> = (props) => {
  const { agree, setAgree } = props;
  const { restrictedOpen, canUnblock, accessRestricted, setAccessRestricted } =
    props.restrictedInfo || {};
  const { t } = useTranslation();

  // if user region is in the canUnblock regions and accessRestricted is not set, show the dialog
  if (restrictedOpen && canUnblock && accessRestricted === undefined) {
    return (
      <SimpleDialog
        open={canUnblock}
        title={t("restrictedInfo.accessRestricted")}
        size="sm"
        closable={false}
        actions={{
          secondary: {
            label: t("common.cancel"),
            onClick: () => {
              setAccessRestricted(true);
            },
            size: "md",
          },
          primary: {
            label: t("common.confirm"),
            onClick: async () => {
              setAccessRestricted(false);
            },
            size: "md",
            disabled: !agree,
          },
        }}
      >
        {t("restrictedInfo.accessRestricted.description")}

        <Flex gapX={1} pt={2}>
          <Checkbox
            id="orderConfirm"
            color={"white"}
            checked={agree}
            onCheckedChange={(checked) => {
              setAgree(!!checked);
            }}
          />
          <label htmlFor="orderConfirm" className="oui-cursor-pointer">
            {t("restrictedInfo.accessRestricted.agree")}
          </label>
        </Flex>
      </SimpleDialog>
    );
  }

  if (!restrictedOpen) {
    return;
  }

  return (
    <Box className="p-1 md:pt-2 md:px-3 md:pb-0 xl:px-2">
      <Flex
        ref={props.container}
        justify={"center"}
        gap={2}
        className={cn(
          "rounded-xl bg-[#0A1A3D] py-4 md:py-2 px-4 md:px-10 items-start md:items-center",
          props.className,
        )}
      >
        <WarningIcon className="shrink-0 mt-1 md:mt-0" />
        <p className="font-normal text-sm leading-5 tracking-[0.1px]">
          We are not available in your current location. Access to this
          interface is restricted in certain regions for compliance purposes.
        </p>
      </Flex>
    </Box>
  );
};
