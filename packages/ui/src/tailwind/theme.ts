import plugin from "tailwindcss/plugin";

export const themePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      ":root": {
        "--oui-font-family":
          '"Manrope","PingFang SC", "Noto Sans CJK SC", "Noto Sans", sans-serif',

        /* colors */
        "--oui-color-primary": "176 132 233",
        "--oui-color-primary-light": "213 190 244",
        "--oui-color-primary-darken": "137 76 209",
        "--oui-color-primary-contrast": "255 255 255",

        "--oui-color-link": "189 107 237",
        "--oui-color-link-light": "217 152 250",

        "--oui-color-secondary": "255 255 255",
        "--oui-color-tertiary": "218 218 218",
        "--oui-color-quaternary": "218 218 218",

        "--oui-color-danger": "245 97 139",
        "--oui-color-danger-light": "250 167 188",
        "--oui-color-danger-darken": "237 72 122",
        "--oui-color-danger-contrast": "255 255 255",

        "--oui-color-success": "41 233 169",
        "--oui-color-success-light": "101 240 194",
        "--oui-color-success-darken": "0 161 120",
        "--oui-color-success-contrast": "255 255 255",

        "--oui-color-warning": "255 209 70",
        "--oui-color-warning-light": "255 229 133",
        "--oui-color-warning-darken": "255 152 0",
        "--oui-color-warning-contrast": "255 255 255",

        "--oui-color-fill": "36 32 47",
        "--oui-color-fill-active": "40 46 58",

        "--oui-color-base-1": "93 83 123",
        "--oui-color-base-2": "81 72 107",
        "--oui-color-base-3": "68 61 69",
        "--oui-color-base-4": "57 52 74",
        "--oui-color-base-5": "51 46 66",
        "--oui-color-base-6": "43 38 56",
        "--oui-color-base-7": "36 32 47",
        "--oui-color-base-8": "29 26 38",
        "--oui-color-base-9": "22 20 28",
        "--oui-color-base-10": "14 13 18",

        "--oui-color-base-foreground": "255 255 255",
        "--oui-color-line": "255 255 255",

        "--oui-color-trading-loss": "245 97 139",
        "--oui-color-trading-loss-contrast": "255 255 255",
        "--oui-color-trading-profit": "41 233 169",
        "--oui-color-trading-profit-contrast": "255 255 255",

        "--oui-surface-background-medium-dark": "31 31 31",

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

        /* gradients */
        "--oui-gradient-primary-start": "40 0 97",
        "--oui-gradient-primary-end": "189 107 237",

        "--oui-gradient-secondary-start": "81 42 121",
        "--oui-gradient-secondary-end": "176 132 233",

        "--oui-gradient-success-start": "1 83 68",
        "--oui-gradient-success-end": "41 223 169",

        "--oui-gradient-danger-start": "153 24 76",
        "--oui-gradient-danger-end": "245 97 139",

        "--oui-gradient-brand-start": "231 219 249",
        "--oui-gradient-brand-end": "159 107 225",
        "--oui-gradient-brand-stop-start": "6.62%",
        "--oui-gradient-brand-stop-end": "86.5%",
        "--oui-gradient-brand-angle": "17.44deg",

        "--oui-gradient-warning-start": "152 58 8",
        "--oui-gradient-warning-end": "255 209 70",

        "--oui-gradient-neutral-start": "27 29 24",
        "--oui-gradient-neutral-end": "38 41 46",

        /* rounded */
        "--oui-rounded-sm": "2px",
        "--oui-rounded": "4px",
        "--oui-rounded-md": "6px",
        "--oui-rounded-lg": "8px",
        "--oui-rounded-xl": " 12px",
        "--oui-rounded-2xl": "16px",
        "--oui-rounded-full": "9999px",

        /* spacing */
        "--oui-spacing-xs": "20rem",
        "--oui-spacing-sm": "22.5rem",
        "--oui-spacing-md": "26.25rem",
        "--oui-spacing-lg": "30rem",
        "--oui-spacing-xl": "33.75rem",
      },
    });
  });
