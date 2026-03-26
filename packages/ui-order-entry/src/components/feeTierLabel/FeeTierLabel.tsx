import React from "react";
import { useTranslation } from "@veltodefi/i18n";
import { ArrowRightShortIcon, Tooltip } from "@veltodefi/ui";

const labelStyle: React.CSSProperties = {
  color: "var(--Text-Primary-Default, #9AECDB)",
  fontSize: "var(--Desktop-Medium-Size-6, 12px)",
  fontWeight: 700,
  lineHeight: "18px",
  letterSpacing: "0.1px",
  textDecorationLine: "underline",
  textDecorationStyle: "dotted",
  textDecorationSkipInk: "auto",
  textDecorationThickness: "auto",
  textUnderlineOffset: "auto",
  textUnderlinePosition: "from-font",
  cursor: "pointer",
  display: "inline-block",
  fontStyle: "normal",
};

export interface FeeTierLabelProps {
  currentLevel: number;
  nextLevel: number;
  amountToNextLevel: string;
  vipTiersUrl: string;
  className?: string;
  showLabelPrefix?: boolean;
}

export const FeeTierLabel: React.FC<FeeTierLabelProps> = ({
  currentLevel,
  nextLevel,
  amountToNextLevel,
  vipTiersUrl,
  className,
  showLabelPrefix = true,
}) => {
  const { t } = useTranslation();

  if (!showLabelPrefix) {
    return null;
  }

  return (
    <Tooltip
      content={
        <div style={{ minWidth: 200, maxWidth: 250 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {t("feetier.title", { level: currentLevel })}
          </div>
          <div style={{ marginBottom: 12 }}>
            {t("feetier.description", {
              amount: (
                <span
                  style={{
                    color: "#FFF",
                    fontSize: "var(--Desktop-Medium-Size-6, 12px)",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "18px",
                    letterSpacing: "0.1px",
                  }}
                >
                  {amountToNextLevel}
                </span>
              ),
              nextLevel,
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <a
              href={vipTiersUrl}
              style={{
                color: "var(--Text-Primary-Default, #9AECDB)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textAlign: "center",
                fontSize: "var(--Desktop-Medium-Size-4, 14px)",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "20px",
                letterSpacing: "0.1px",
              }}
              target="_self"
              rel="noopener noreferrer"
            >
              {t("feetier.cta")}
              <ArrowRightShortIcon
                style={{
                  marginLeft: 4,
                  fontSize: 16,
                  color: "var(--Text-Primary-Default, #9AECDB)",
                }}
              />
            </a>
          </div>
        </div>
      }
    >
      <span
        style={labelStyle}
        tabIndex={0}
        aria-label={t("feetier.title", { level: currentLevel })}
        className={className}
      >
        {t("feetier.title", { level: currentLevel })}
      </span>
    </Tooltip>
  );
};
