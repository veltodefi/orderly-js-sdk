# version

## Overview

Exposes the package version string and registers it on `window.__ORDERLY_VERSION__["@veltodefi/perp"]` in browser environments.

## Exports

### Default export

- **Type**: `string`
- **Description**: Current package version (e.g. `"4.9.1"`).

### Global augmentation

In browser environments, the version is stored at:

- `window.__ORDERLY_VERSION__["@veltodefi/perp"]`

## Usage example

```typescript
import version from "@veltodefi/perp";

console.log(version); // "4.9.1"
// In browser: window.__ORDERLY_VERSION__?.["@veltodefi/perp"] === "4.9.1"
```
