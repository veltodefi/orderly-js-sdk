# version.ts

## version.ts responsibility

Exposes the portfolio package version and attaches it to `window.__ORDERLY_VERSION__["@veltodefi/portfolio"]` for runtime version reporting.

## version.ts exports

| Name          | Type   | Role           | Description                                                                     |
| ------------- | ------ | -------------- | ------------------------------------------------------------------------------- |
| default       | string | Version string | `"2.10.2"`                                                                      |
| (side effect) | -      | Global         | Sets `window.__ORDERLY_VERSION__["@veltodefi/portfolio"]` when in browser |

## Version value and global

- **Default export**: `"2.10.2"`.
- **Global**: On `typeof window !== "undefined"`, assigns `window.__ORDERLY_VERSION__["@veltodefi/portfolio"]` (initializes `__ORDERLY_VERSION__` if missing).

## version.ts dependency and usage

- **Dependency**: None (no imports).
- **Usage**: Host app or tooling can read version from `window.__ORDERLY_VERSION__?.["@veltodefi/portfolio"]` or from the default export.

## version.ts Example

```typescript
import version from "@veltodefi/portfolio/version";

// version === "2.10.2"

// In browser:
// window.__ORDERLY_VERSION__["@veltodefi/portfolio"] === "2.10.2"
```
