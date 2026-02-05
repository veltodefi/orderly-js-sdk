import { Box, cn, Flex } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";

export type Percentages = 1 | 0.5 | 0.2 | 0.1;

type Props = {
  maxAmount: string;
  selectedPercentage?: Percentages;
  onClick: (props: {
    selectedPercentage: Percentages;
    selectedValue: string;
  }) => void;
};

export const AmountSelector = ({
  maxAmount,
  selectedPercentage,
  onClick,
}: Props) => {
  const getSelectedValue = (percentage: Percentages) => {
    const value = new Decimal(maxAmount).mul(percentage);
    return value?.toString();
  };

  const options: { percentage: Percentages; label: string }[] = [
    {
      percentage: 0.1,
      label: "10%",
    },
    {
      percentage: 0.2,
      label: "20%",
    },
    {
      percentage: 0.5,
      label: "50%",
    },
    {
      percentage: 1,
      label: "MAX",
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
            key={percentage}
            className={cn(
              "oui-border oui-border-base-1 oui-rounded-lg oui-flex-1 oui-px-5 oui-h-10 oui-text-base-1",
              "hover:oui-bg-base-6 hover:oui-border-base-6 hover:oui-text-primary",
              selectedPercentage === percentage &&
                "oui-bg-base-5 oui-text-primary oui-border-base-5",
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
