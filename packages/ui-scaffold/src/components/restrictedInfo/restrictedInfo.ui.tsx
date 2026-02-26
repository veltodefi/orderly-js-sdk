import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Checkbox, cn, Flex, SimpleDialog } from "@veltodefi/ui";
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
    <Flex
      ref={props.container}
      justify={"center"}
      gap={2}
      className={cn(
        "rounded-xl bg-[#0A1A3D] py-4 md:py-2 px-4 md:px-10 items-start",
        props.className,
      )}
    >
      <WarningIcon className="shrink-0 mt-1 oui-min-w-4" />
      <p className="font-normal text-sm leading-5 tracking-[0.1px] oui-max-w-7xl">
        You are accessing velto from a restricted jurisdiction. Under the Terms
        of Use, velto&apos;s services are not available in certain locations,
        including sanctioned and other restricted jurisdictions. For more
        information, please review our{" "}
        <a
          href="https://www.velto.com/policies/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
          className="oui-text-primary oui-underline"
        >
          Terms of Use
        </a>
        .
      </p>
    </Flex>
  );
};
