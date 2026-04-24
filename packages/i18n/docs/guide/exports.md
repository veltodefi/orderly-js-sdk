# Package exports

| Export                       | Description                                                                                                                                                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@veltodefi/i18n`            | Main entry: `LocaleProvider`, `ExternalLocaleProvider`, `LanguageProvider`, `registerDefaultResource`, `registerResources`, `Backend`, `importLocaleJsonModule`, `i18n`, `createI18nInstance`, hooks, `en` (baseline messages), re-exports from `react-i18next` / `i18next` (`createInstance`), and types |
| `@veltodefi/i18n/locales/`\* | Built-in locale JSON files                                                                                                                                                                                                                                                                                |
| `@veltodefi/i18n/constant`   | Constants (e.g. `LocaleEnum`, `defaultLanguages`, `defaultNS`)                                                                                                                                                                                                                                            |
| `@veltodefi/i18n/utils`      | Utility functions (see [Utils](./utils.md))                                                                                                                                                                                                                                                               |

**Hooks:** `useTranslation`, `useLocaleCode`, and `useRegisterExternalResources` are exported from the main entry; use them like react-i18next. **`useLanguageContext`** exposes the language list and `onLanguageBeforeChanged` / `onLanguageChanged` from the language context.

The default i18n namespace is **`translation`** (`defaultNS`).

See also: [Integration guide](./integration.md) · [Examples](./examples.md)
