import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import {
  Input,
  Select,
  InputProps,
  cn,
  Box,
  Text,
  Flex,
  inputFormatter,
  Spinner,
  InputFormatter,
  AvatarSizeType,
} from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { InputStatus } from "../../types";
import { TokenOption } from "./tokenOption";

export type QuantityInputProps = {
  token?: API.TokenInfo;
  tokens?: API.TokenInfo[];
  label?: string;
  status?: InputStatus;
  hintMessage?: string;
  hintSuffix?: ReactNode;
  onValueChange?: (value: string) => void;
  onTokenChange?: (token: any) => void;
  loading?: boolean;
  testId?: string;
  formatters?: InputFormatter[];
  // TOOD: remove this prop
  vaultBalanceList?: API.VaultBalance[];
  displayType?: "balance" | "vaultBalance";
  tokenValueFormatter?: (value: string) => ReactNode;
  tokenShowCaret?: boolean;
  highlightOnHover?: boolean;
  iconSize?: AvatarSizeType;
  balancesRevalidating?: boolean;
  showBalance?: boolean;
} & Omit<InputProps, "onClear" | "suffix" | "onValueChange">;

export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const {
    token,
    tokens = [],
    classNames,
    label,
    status,
    hintMessage,
    hintSuffix,
    value,
    onValueChange,
    onTokenChange,
    loading,
    placeholder,
    formatters,
    vaultBalanceList,
    displayType,
    tokenValueFormatter,
    tokenShowCaret,
    highlightOnHover = false,
    balancesRevalidating,
    showBalance,
    ...rest
  } = props;

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  const tokenOptions = useMemo(() => {
    return tokens.map((token) => {
      const currentToken = vaultBalanceList?.find(
        (item) => item.token === token.symbol,
      );
      const insufficientBalance = currentToken
        ? new Decimal(currentToken.balance ?? 0).lt(value ? Number(value) : 0)
        : false;
      return {
        ...token,
        name: token.display_name || token.symbol!,
        insufficientBalance,
      };
    });
  }, [tokens, value, vaultBalanceList]);

  useEffect(() => {
    const rect = inputRef?.current?.getBoundingClientRect();
    setWidth(rect?.width || 0);
  }, [inputRef]);

  const _onTokenChange = (value: string) => {
    const find = tokens.find((item) => item.symbol === value);
    if (find) {
      onTokenChange?.(find);
    }
  };

  const selectable = tokens.length > 1;
  const selectOpen = selectable ? open : false;

  const optionRenderer = (item: any) => {
    const isActive = item.symbol === token?.symbol;
    return (
      <TokenOption
        token={item}
        isActive={isActive}
        displayType={displayType}
        onTokenChange={(item) => {
          onTokenChange?.(item);
          setOpen(false);
        }}
        open={selectOpen}
        highlightOnHover={props.highlightOnHover}
        isLoading={balancesRevalidating}
        showBalance={showBalance}
      />
    );
  };

  const prefix = (
    <Box>
      <Box className="oui-absolute oui-top-1">
        <Text size="2xs" weight="regular" className="oui-text-base-1">
          {label || t("common.quantity")}
        </Text>
      </Box>
      {loading && (
        <Box className="oui-absolute oui-bottom-1">
          <Spinner size="sm" />
        </Box>
      )}
    </Box>
  );

  const suffix = (
    <div
      className={`oui-absolute oui-right-${props.highlightOnHover ? "3" : "0"}`}
    >
      <Select.tokens
        open={selectOpen}
        onOpenChange={setOpen}
        disabled={rest.disabled}
        variant={props.highlightOnHover ? "contained" : "text"}
        tokens={tokenOptions}
        value={token?.display_name || token?.symbol}
        size={rest.size}
        iconSize={rest.iconSize}
        onValueChange={_onTokenChange}
        showIcon
        valueFormatter={tokenValueFormatter}
        showCaret={tokenShowCaret}
        optionRenderer={optionRenderer}
        classNames={{
          trigger: cn(
            "oui-bg-transparent",
            tokenValueFormatter && "oui-px-0 oui-mr-1 oui-ml-3",
            tokenShowCaret && "oui-px-0 oui-mr-1 oui-ml-1 oui-pr-5",
          ),
        }}
        contentProps={{
          onCloseAutoFocus: (event) => {
            event.preventDefault();
            inputRef.current?.focus();
          },
          onClick: (event) => {
            event.preventDefault();
            inputRef.current?.focus();
          },
          style: { width },
          align: "end",
          sideOffset: 5,
          className: props.highlightOnHover
            ? "oui-bg-[#3B3B3B]"
            : "oui-border oui-border-line-6",
        }}
      />
    </div>
  );

  const message = (
    <Flex mt={1} gapX={1} px={3} justify="between" itemAlign="center">
      <Flex gapX={1} itemAlign="center">
        <Text
          size="2xs"
          className={cn(
            "oui-font-normal",
            status === "error" && "oui-text-danger-light",
            status === "warning" && "oui-text-warning-light",
          )}
        >
          {hintMessage}
        </Text>
      </Flex>
      {hintSuffix && (
        <Box className="oui-flex oui-items-center oui-gap-1">{hintSuffix}</Box>
      )}
    </Flex>
  );

  const _placeholder = placeholder ?? (loading ? "" : "0");

  return (
    <div>
      <Input
        ref={inputRef}
        autoComplete="off"
        placeholder={_placeholder}
        prefix={prefix}
        suffix={suffix}
        value={value}
        onValueChange={(value) => {
          onValueChange?.(value);
        }}
        formatters={
          formatters || [
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(token?.precision ?? 2),
            inputFormatter.currencyFormatter,
          ]
        }
        {...rest}
        classNames={{
          ...classNames,
          root: cn(
            "oui-relative oui-h-[58px] oui-px-4",
            "oui-rounded-lg oui-border oui-border-line",
            "placeholder:oui-font-normal",
            status === "error" &&
              "oui-outline-danger-light focus-within:oui-outline-danger-light",
            status === "warning" &&
              "oui-outline-warning-light focus-within:oui-outline-warning-light",
            props.readOnly
              ? "oui-border-none oui-bg-base-6 focus-within:oui-outline-0"
              : "oui-bg-base-5",
            classNames?.root,
          ),
          input: cn("oui-absolute oui-bottom-[-1px]", classNames?.input),
        }}
      />
      {hintMessage && message}
    </div>
  );
};
