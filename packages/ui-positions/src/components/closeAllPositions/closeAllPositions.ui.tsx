import React, { FC, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import {
  MainButton,
  Checkbox,
  CloseIcon,
  cn,
  Flex,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  SimpleSheet,
  Text,
  useScreen,
} from "@veltodefi/ui";
import type { CloseAllPositionsState } from "./closeAllPositions.script";
import { CloseType } from "./closeAllPositions.script";

export type CloseAllPositionsProps = CloseAllPositionsState & {
  className?: string;
  style?: React.CSSProperties;
};

export const CloseAllPositions: FC<CloseAllPositionsProps> = (props) => {
  const {
    confirmAndCloseAll,
    hasOpenPositions,
    isClosing,
    className,
    style,
    symbol,
  } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const [open, setOpen] = useState(false);
  const [selectedCloseType, setSelectedCloseType] = useState<CloseType>(
    CloseType.ALL,
  );

  const radioRow = (label: string, value: CloseType) => {
    return (
      <Flex
        justify={"start"}
        itemAlign="center"
        gap={2}
        className="oui-w-full oui-cursor-pointer"
        onClick={() => setSelectedCloseType(value)}
      >
        <Checkbox
          variant="radio"
          color="white"
          checked={selectedCloseType === value}
        />
        <Text size={isMobile ? "xs" : "2xs"} weight="semibold" className="">
          {label}
        </Text>
      </Flex>
    );
  };

  if (symbol !== undefined) {
    return <></>;
  }

  const handleConfirm = async () => {
    const ok = await confirmAndCloseAll(selectedCloseType);
    if (ok) setOpen(false);
  };

  const bodyContent = (
    <Flex direction="column" gap={2} className="oui-w-full">
      <Text size={isMobile ? "xs" : "2xs"} intensity={54}>
        {t("positions.closeAll.popover.desc")}
      </Text>
      <Flex direction="column" gap={1} className="oui-w-full">
        {radioRow(t("positions.closeAll.optionAll"), CloseType.ALL)}
        {radioRow(t("positions.closeAll.optionProfit"), CloseType.PROFIT)}
        {radioRow(t("positions.closeAll.optionLoss"), CloseType.LOSS)}
      </Flex>
      <Flex gap={2} className="oui-justify-end oui-mt-1 oui-w-full">
        <MainButton
          variant="secondary"
          size={isMobile ? "lg" : "md"}
          onClick={() => setOpen(false)}
          fullWidth
        >
          {t("common.cancel")}
        </MainButton>
        <MainButton
          variant="primary"
          size={isMobile ? "lg" : "md"}
          loading={isClosing}
          onClick={handleConfirm}
          fullWidth
        >
          {t("common.confirm")}
        </MainButton>
      </Flex>
    </Flex>
  );

  const triggerButton = (
    <MainButton
      disabled={!hasOpenPositions || isClosing}
      loading={isClosing}
      variant="secondary"
      size="xs"
      className={cn("disabled:oui-bg-transport", className)}
      style={style}
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      {t("positions.closeAll")}
    </MainButton>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <SimpleSheet
          open={open}
          onOpenChange={setOpen}
          title={t("positions.closeAll")}
        >
          {bodyContent}
        </SimpleSheet>
      </>
    );
  }

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="oui-w-[280px] oui-p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Flex direction="column" gap={2} className="oui-w-full">
          <Flex itemAlign="center" justify="between" className="oui-w-full">
            <Text size="sm" weight="semibold">
              {t("positions.closeAll")}
            </Text>
            <button
              onClick={() => setOpen(false)}
              className="oui-text-base-contrast-54 hover:oui-text-base-contrast transition-colors oui-cursor-pointer"
            >
              <CloseIcon size={16} color="inherit" opacity={1} />
            </button>
          </Flex>
          {bodyContent}
        </Flex>
      </PopoverContent>
    </PopoverRoot>
  );
};
