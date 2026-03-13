# version.ts

## Overview

Registers the package version on `window.__ORDERLY_VERSION__` for runtime checks and exports the version string. Only runs in browser (`typeof window !== "undefined"`).

## Exports

- **Default export**: string `"2.9.1"` (current package version).

## Global augmentation

Extends `Window` with:

```ts
interface Window {
  __ORDERLY_VERSION__?: {
    [key: string]: string;
  };
}
```

Sets `window.__ORDERLY_VERSION__["@veltodefi/ui-connector"] = "2.9.1"`.

## Usage example

```ts
import version from "@veltodefi/ui-connector/version";
// or read from window
const v = window.__ORDERLY_VERSION__?.["@veltodefi/ui-connector"];
```
