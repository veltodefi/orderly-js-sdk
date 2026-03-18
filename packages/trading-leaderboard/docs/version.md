# version.ts

## Overview

Registers the package version on `window.__ORDERLY_VERSION__` for the key `@veltodefi/trading-leaderboard` and exports the version string. Used for runtime version reporting.

## Exports

### Default export

- **`default`**: `"2.9.1"` — Current package version string.

### Global augmentation

Extends `Window` with:

```ts
interface Window {
  __ORDERLY_VERSION__?: {
    [key: string]: string;
  };
}
```

When running in a browser, `window.__ORDERLY_VERSION__["@veltodefi/trading-leaderboard"]` is set to the package version.

## Usage example

```typescript
import version from "@veltodefi/trading-leaderboard/version";
// or from source
import version from "./version";

console.log(version); // "2.9.1"
```
