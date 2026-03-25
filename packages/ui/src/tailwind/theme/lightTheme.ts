import plugin from "tailwindcss/plugin";

export const LIGHT_THEME_CSS_VARS = {
  "--oui-font-family":
    '"Manrope", "PingFang SC", "Noto Sans CJK SC", "Noto Sans", sans-serif',

  /* colors */
  "--oui-color-primary": "240 185 11",
  "--oui-color-primary-light": "240 185 11",
  "--oui-color-primary-darken": "240 185 11",
  "--oui-color-primary-contrast": "12 14 18",

  "--oui-color-link": "230 175 0",
  "--oui-color-link-light": "252 213 53",

  "--oui-color-secondary": "255 255 255",
  "--oui-color-tertiary": "234 236 239",
  "--oui-color-quaternary": "218 218 218",

  "--oui-color-danger": "246 70 93",
  "--oui-color-danger-light": "255 120 140",
  "--oui-color-danger-darken": "220 50 75",
  "--oui-color-danger-contrast": "0 0 0",

  "--oui-color-success": "14 203 129",
  "--oui-color-success-light": "50 220 160",
  "--oui-color-success-darken": "46 189 133",
  "--oui-color-success-contrast": "0 0 0",

  "--oui-color-warning": "255 182 93",
  "--oui-color-warning-light": "255 207 139",
  "--oui-color-warning-darken": "255 125 0",
  "--oui-color-warning-contrast": "0 0 0",

  "--oui-color-fill": "245 245 245",
  "--oui-color-fill-active": "238 238 238",

  "--oui-color-base-1": "160 160 160",
  "--oui-color-base-2": "210 210 210",
  "--oui-color-base-3": "180 180 180",
  "--oui-color-base-4": "200 202 205",
  "--oui-color-base-5": "230 230 230",
  "--oui-color-base-6": "245 245 245",
  "--oui-color-base-7": "234 236 239",
  "--oui-color-base-8": "255 255 255",
  "--oui-color-base-9": "255 255 255",
  "--oui-color-base-10": "245 245 245",

  "--oui-color-base-foreground": "0 0 0",
  "--oui-color-line": "0 0 0",

  "--oui-color-base-static": "255 255 255",
  "--oui-color-base-static-contrast": "0 0 0",

  "--oui-color-trading-loss": "246 70 93",
  "--oui-color-trading-loss-contrast": "255 255 255",
  "--oui-color-trading-profit": "14 203 129",
  "--oui-color-trading-profit-contrast": "255 255 255",

  /* gradients */
  "--oui-gradient-primary-start": "240 185 11",
  "--oui-gradient-primary-end": "240 185 11",

  "--oui-gradient-secondary-start": "252 213 53",
  "--oui-gradient-secondary-end": "210 160 0",

  "--oui-gradient-success-start": "14 203 129",
  "--oui-gradient-success-end": "14 203 129",

  "--oui-gradient-danger-start": "2246 70 93",
  "--oui-gradient-danger-end": "246 70 93",

  "--oui-gradient-warning-start": "255 182 93",
  "--oui-gradient-warning-end": "255 182 93",

  "--oui-gradient-neutral-start": "245 245 245",
  "--oui-gradient-neutral-end": "245 245 245",

  "--oui-gradient-brand-stop-start": "6.62%",
  "--oui-gradient-brand-stop-end": "86.5%",
  "--oui-gradient-brand-angle": "17.44deg",

  "--oui-gradient-brand-start": "240 185 11",
  "--oui-gradient-brand-end": "240 185 11",

  /* rounded */
  "--oui-rounded-sm": "2px",
  "--oui-rounded": "4px",
  "--oui-rounded-md": "6px",
  "--oui-rounded-lg": "8px",
  "--oui-rounded-xl": "12px",
  "--oui-rounded-2xl": "16px",
  "--oui-rounded-full": "9999px",

  /* spacing */
  "--oui-spacing-xs": "20rem",
  "--oui-spacing-sm": "22.5rem",
  "--oui-spacing-md": "26.25rem",
  "--oui-spacing-lg": "30rem",
  "--oui-spacing-xl": "33.75rem",

  /* main button colors */
  "--oui-color-main-button": "154 236 219",
  "--oui-color-main-button-contrast": "3 3 3",
  "--oui-color-main-button-hover": "115 115 115",
  "--oui-color-main-button-hover-contrast": "154 236 219",
  "--oui-color-main-button-pressed": "143 143 143",
  "--oui-color-main-button-pressed-contrast": "154 236 219",
  "--oui-color-main-button-focus": "87 87 87",
  "--oui-color-main-button-focus-contrast": "154 236 219",
  "--oui-color-main-button-disabled": "32 79 69",
  "--oui-color-main-button-disabled-contrast": "3 3 3",
  "--oui-color-main-button-disabled-border": "32 79 69",
  "--oui-color-main-button-loading": "115 115 115",
  "--oui-color-main-button-loading-contrast": "154 236 219",
  "--oui-color-main-button-loading-spinner-ring": "59 59 59",
  "--oui-color-main-button-loading-spinner-fill": "143 143 143",
  "--oui-color-main-button-inverted": "45 45 45",
  "--oui-color-main-button-inverted-contrast": "115 115 115",
  "--oui-color-main-button-inverted-hover": "59 59 59",
  "--oui-color-main-button-inverted-hover-contrast": "115 115 115",
  "--oui-color-main-button-inverted-pressed": "59 59 59",
  "--oui-color-main-button-inverted-pressed-contrast": "154 236 219",
  "--oui-color-main-button-inverted-focus": "87 87 87",
  "--oui-color-main-button-inverted-focus-contrast": "115 115 115",
  "--oui-color-main-button-inverted-disabled": "45 45 45",
  "--oui-color-main-button-inverted-disabled-contrast": "87 87 87",
  "--oui-color-main-button-inverted-loading": "45 45 45",
  "--oui-color-main-button-inverted-loading-contrast": "115 115 115",
  "--oui-color-main-button-inverted-loading-spinner-ring": "22 22 22",
  "--oui-color-main-button-inverted-loading-spinner-fill": "154 236 219",

  /* brand primary pressed */
  "--oui-color-brand-primary-pressed": "214 255 246",
};

export const lightThemePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      '[data-oui-theme="light"]': LIGHT_THEME_CSS_VARS,
    });
  });
