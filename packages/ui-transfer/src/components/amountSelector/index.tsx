import { Box, cn, Flex } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";

export type Percentages = 1 | 0.5 | 0.25 | 0.1;

type Props = {
  maxAmount: string;
  /**
   * Display precision of the source token (e.g. 2 for USDC). Quick-fill
   * output is truncated to this many decimals so it matches what the typed
   * input would produce for the same logical value — see the note on
   * `getSelectedValue` below.
   */
  precision?: number;
  selectedPercentage?: Percentages;
  disabled?: boolean;
  onClick: (props: {
    selectedPercentage: Percentages;
    selectedValue: string;
  }) => void;
};

export const AmountSelector = ({
  maxAmount,
  precision,
  selectedPercentage,
  disabled,
  onClick,
}: Props) => {
  // Match the typed-input formatter (`inputFormatter.dpFormatter(precision)`)
  // which truncates to the token's display precision. Without this, quick-fill
  // produces raw multiplication output (e.g. 10.222273 for 10% of 102.22273),
  // which diverges from the typed path and can cause the downstream fee quote
  // to behave differently for what the user perceives as "the same amount".
  const getSelectedValue = (percentage: Percentages) => {
    const value = new Decimal(maxAmount).mul(percentage);
    return value.todp(precision ?? 2, Decimal.ROUND_DOWN).toString();
  };

  const options: { percentage: Percentages; label: string }[] = [
    {
      percentage: 0.1,
      label: "10%",
    },
    {
      percentage: 0.25,
      label: "25%",
    },
    {
      percentage: 0.5,
      label: "50%",
    },
    {
      percentage: 1,
      label: "Max",
    },
  ];

  return (
    <Flex
      justify={"between"}
      gap={2}
      className=""
      data-testid={"percentage-selector"}
    >
      {options.map(({ percentage, label }) => {
        return (
          <button
            data-testid={`select-${percentage}`}
            disabled={disabled}
            key={percentage}
            className={cn(
              "oui-border oui-border-base-1 oui-rounded-lg oui-flex-1 oui-h-10 oui-text-base-1",
              "hover:oui-bg-base-6 hover:oui-border-base-6 hover:oui-text-primary",
              selectedPercentage === percentage &&
                "oui-bg-base-5 oui-text-primary oui-border-base-5",
              disabled &&
                "oui-cursor-not-allowed hover:oui-bg-transparent hover:oui-border-base-1 hover:oui-text-base-1",
            )}
            onClick={() =>
              onClick({
                selectedPercentage: percentage,
                selectedValue: getSelectedValue(percentage),
              })
            }
          >
            <span>{label}</span>
          </button>
        );
      })}
    </Flex>
  );
};
