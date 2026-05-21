import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import {
  Box,
  Checkbox,
  cn,
  Flex,
  Text,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
} from "@veltodefi/ui";
import { InputStatus } from "../../types";
import type { AccountInfo } from "../withdrawForm/hooks/useWithdrawAccountId";

export type TextAreaInputProps = {
  value: string;
  onChange: (value: string) => void;
  status?: InputStatus;
  hintMessage?: string;
  placeholder?: string;
  className?: string;
  label: string;
  disabled?: boolean;
  enableAccountLookup?: boolean;
  accountInfo?: AccountInfo | null;
  accountDropdownOpen?: boolean;
  setAccountDropdownOpen?: (open: boolean) => void;
};

export const TextAreaInput = (props: TextAreaInputProps) => {
  const { t } = useTranslation();
  const {
    value,
    onChange,
    status,
    hintMessage,
    placeholder,
    label,
    enableAccountLookup,
    accountInfo,
    accountDropdownOpen,
    setAccountDropdownOpen,
  } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(
    null,
  );

  const displayStatus: InputStatus | undefined = status;
  const displayHint = hintMessage;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    if (selectedAccount) {
      setSelectedAccount(null);
    }
    onChange?.(nextValue);

    // auto adjust height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, selectedAccount?.address]);

  const prefix = (
    <div className="oui-absolute oui-left-4 oui-top-1 oui-z-[1]">
      <Text size="2xs" weight="regular" className="oui-text-base-1">
        {label}
      </Text>
    </div>
  );

  const message = (
    <Flex mb={1} gapX={1} px={1}>
      <Box
        width={4}
        height={4}
        r="full"
        className={cn(
          displayStatus === "error" && "oui-bg-danger-light",
          displayStatus === "warning" && "oui-bg-warning-light",
        )}
      ></Box>
      <Text
        size="2xs"
        className={cn(
          displayStatus === "error" && "oui-text-danger-light",
          displayStatus === "warning" && "oui-text-warning-light",
        )}
      >
        {displayHint}
      </Text>
    </Flex>
  );

  const textareaNode = (
    <div className="oui-relative">
      {prefix}
      <div
        className={cn(
          "oui-w-full oui-rounded-lg oui-border oui-border-base-1 oui-mb-1",
          "oui-bg-base-5 oui-text-sm oui-text-base-contrast",
          "focus-within:oui-border-primary-light",
          displayStatus === "error" &&
            "oui-border-danger-light focus-within:oui-border-danger-light",
          displayStatus === "warning" &&
            "oui-border-warning-light focus-within:oui-border-warning-light",
          "disabled:oui-cursor-not-allowed",
          "oui-rounded-[11.5px]",
        )}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          className={cn(
            // hide resize height control and scrollbar
            "oui-resize-none oui-overflow-y-hidden",
            "oui-block oui-w-full oui-bg-base-8",
            "oui-px-4 oui-pt-7",
            selectedAccount?.address ? "oui-pb-2" : "oui-pb-2",
            "oui-text-sm oui-text-base-contrast",
            "oui-outline-none oui-rounded-[11.5px]",
            "placeholder:oui-text-base-contrast-20 placeholder:oui-font-normal",
            props.className,
          )}
          rows={1}
          value={value}
          onChange={handleChange}
          onFocus={() => {
            if (accountInfo) {
              setAccountDropdownOpen?.(true);
            }
          }}
          disabled={props.disabled}
        />
        {selectedAccount?.address && (
          <div className="oui-flex oui-items-center oui-justify-between oui-px-3 oui-pb-2 oui-pt-2">
            <Text
              size="2xs"
              intensity={54}
              weight="regular"
              className="oui-truncate oui-leading-[15px]"
            >
              ({t("common.address")}:{" "}
              <Text.formatted as="span" rule="address" range={[6, 4]}>
                {selectedAccount.address}
              </Text.formatted>
              )
            </Text>
          </div>
        )}
      </div>
    </div>
  );

  if (!enableAccountLookup) {
    return (
      <div className="oui-relative">
        {textareaNode}
        {displayHint && message}
      </div>
    );
  }

  return (
    <DropdownMenuRoot
      open={!!(accountInfo && accountDropdownOpen)}
      onOpenChange={(open) => {
        if (!open) {
          setAccountDropdownOpen?.(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <div>{textareaNode}</div>
      </DropdownMenuTrigger>
      {displayHint && message}
      {accountInfo && accountDropdownOpen && (
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
            className={cn(
              "oui-bg-base-8",
              "oui-rounded-2xl oui-shadow-lg",
              "oui--mt-1 oui-p-1",
            )}
            {...({
              onOpenAutoFocus: (event: any) => event.preventDefault(),
            } as any)}
          >
            <AccountResultItem
              item={accountInfo}
              disabled={props.disabled}
              selected={
                !!selectedAccount &&
                selectedAccount.accountId === accountInfo.accountId
              }
              onSelect={(account) => {
                onChange?.(account.accountId);
                setSelectedAccount(account);
                setAccountDropdownOpen?.(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      )}
    </DropdownMenuRoot>
  );
};

type AccountResultItemProps = {
  item: AccountInfo;
  disabled?: boolean;
  selected?: boolean;
  onSelect: (account: AccountInfo) => void;
};

const AccountResultItem = ({
  item,
  disabled,
  selected,
  onSelect,
}: AccountResultItemProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "oui-flex oui-w-full oui-items-center oui-justify-between",
        "oui-gap-1.5 oui-rounded-[4px] oui-px-2 oui-py-1.5",
        "oui-cursor-pointer hover:oui-bg-base-5",
        disabled && "oui-cursor-not-allowed oui-opacity-50",
      )}
      onClick={() => !disabled && onSelect(item)}
    >
      <div className="oui-flex oui-flex-col oui-items-start oui-gap-0.5">
        <Text
          size="sm"
          intensity={54}
          weight="semibold"
          className="oui-tracking-wide"
        >
          {t("common.accountId")}:{" "}
          <Text.formatted
            rule="address"
            range={[6, 4]}
            as="span"
            className="oui-text-primary-light"
          >
            {item.accountId}
          </Text.formatted>
        </Text>
        <Text size="2xs" intensity={36}>
          ({item.address})
        </Text>
      </div>
      <Checkbox checked={!!selected} />
    </div>
  );
};
