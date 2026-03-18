# index (entry point)

## Overview

Main package entry for `@veltodefi/trading-rewards`. Re-exports the trading rewards page namespace and layout. The optional `./install` side-effect is commented out.

## Exports

- **`TradingRewards`** (namespace): All exports from `./pages/index` (title, curEpoch, availableToClaim, stakeBooster, rewardHistory, provider, HomePage).
- **Layout**: Re-exports from `./layout` (widget, UI, script, sidebar path enum).

## Usage example

```typescript
import { TradingRewards, TradingRewardsLayoutWidget } from "@veltodefi/trading-rewards";

// Use layout and home page
<TradingRewardsLayoutWidget>
  <TradingRewards.HomePage />
</TradingRewardsLayoutWidget>
```
