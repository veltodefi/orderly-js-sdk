# MarginMode — Architecture & Business Rules

> Introduced via `release/isolated_margin` branch, merged into `v2.11.1`.
> Adds per-symbol **Isolated Margin** alongside the pre-existing **Cross Margin** mode.

---

## 1. Enum Definition

```ts
// packages/types/src/order.ts:31
export enum MarginMode {
  ISOLATED = "ISOLATED",
  CROSS = "CROSS",
}
```

Every API surface that previously assumed a single margin mode now carries an optional `margin_mode` field.
When absent, the system **defaults to `MarginMode.CROSS`** everywhere.

---

## 2. Conceptual Difference

|                              | Cross Margin                       | Isolated Margin                                        |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
| **Collateral scope**         | Shared across all positions        | Independent per position                               |
| **PnL scope**                | Shared                             | Per-position                                           |
| **Liquidation blast radius** | All positions may be liquidated    | Only the affected position                             |
| **Collateral asset**         | Multi-asset (full collateral pool) | **USDC only** (`freeCollateralUSDCOnly`)               |
| **Leverage storage**         | `{symbol}_{CROSS}` key             | `{symbol}_{ISOLATED}` key (separate leverage per mode) |

> i18n key `transfer.LTV.isolatedModeUsdcOnly`: _"Only USDC can be used as margin in Isolated Mode."_

---

## 3. Data Flow

### 3.1 API Layer

| Endpoint                      | Method  | Purpose                                                           |
| ----------------------------- | ------- | ----------------------------------------------------------------- |
| `GET /v1/client/margin_modes` | Private | Fetch per-symbol default margin mode map                          |
| `POST /v1/client/margin_mode` | Private | Set margin mode for one or more symbols                           |
| `GET /v1/client/leverages`    | Private | Fetch leverage list (each entry keyed by `{symbol, margin_mode}`) |
| `PUT /v1/client/leverage`     | Private | Update leverage (includes optional `margin_mode` field)           |
| `POST /v1/position_margin`    | Private | Add/reduce margin for an isolated position                        |
| `POST /v1/order`              | Private | Create order (includes `margin_mode`, defaults to CROSS)          |
| `POST /v1/algo/order`         | Private | Create algo order (includes `margin_mode`)                        |
| `PUT /v1/algo/order`          | Private | Update algo order (preserves `margin_mode` if present)            |
| `POST /v1/batch-order`        | Private | Batch/scaled orders (each includes `margin_mode`)                 |

### 3.2 Type Integration

The `margin_mode` field appears on the following API types in `packages/types/src/types/api.ts`:

| Type                 | Field                                | Notes                            |
| -------------------- | ------------------------------------ | -------------------------------- |
| `API.Order`          | `margin_mode?: MarginMode`           | Sent when placing orders         |
| `API.AlgoOrder`      | `margin_mode?: MarginMode`           | TP/SL and trailing stop orders   |
| `API.Position`       | `margin_mode?: MarginMode`           | Positions from WS/REST           |
| `API.ClosedPosition` | `margin_mode?: MarginMode \| 1 \| 0` | Legacy numeric encoding possible |
| `API.LeverageInfo`   | `margin_mode?: MarginMode`           | Leverage per symbol per mode     |

### 3.3 State Management

```
useMarginModes()                  ← fetches GET /v1/client/margin_modes
  └→ marginModes: Record<symbol, MarginMode>
  └→ updateMarginMode(payload)    ← calls POST /v1/client/margin_mode

useMarginModeBySymbol(symbol)     ← reads from useMarginModes() map
  └→ marginMode                   ← single symbol's mode (defaults to CROSS)
  └→ update(mode)                 ← shorthand to set mode for this symbol

useSymbolLeverageMap()            ← fetches GET /v1/client/leverages
  └→ leverages: Record<`${symbol}_${marginMode}`, number>
  └→ getSymbolLeverage(symbol, marginMode)

useLeverageBySymbol(symbol, marginMode?)
  └→ delegates to useSymbolLeverageMap().getSymbolLeverage()
```

**Key insight**: Leverage is stored as a **composite key** `{symbol}_{marginMode}`. The same symbol can have different leverage settings for Cross vs Isolated mode. The key builder:

```ts
// packages/hooks/src/orderly/useSymbolLeverageMap.ts:5
const buildKey = (symbol: string, marginMode?: MarginMode) =>
  `${symbol}_${marginMode ?? MarginMode.CROSS}`;
```

### 3.4 Order Entry Store (Zustand)

```ts
// packages/hooks/src/next/useOrderEntry/orderEntry.store.ts
initOrder(symbol, options?) {
  // options.margin_mode defaults to MarginMode.CROSS
  margin_mode: options?.margin_mode ?? MarginMode.CROSS,
}
```

The order entry script syncs margin mode changes into the store:

```ts
// packages/ui-order-entry/src/orderEntry.script.ts:427
useEffect(() => {
  setOrderValue("margin_mode", marginMode);
}, [marginMode]);
```

### 3.5 WebSocket / Real-Time Updates

**Case convention**: WebSocket messages use **camelCase** (`marginMode`), REST API and internal state use **snake_case** (`margin_mode`). Transformation is done by `object2underscore()` in `packages/hooks/src/utils/ws.ts`.

**WS types** in `packages/types/src/types/api.ts` (WSMessage namespace):

- `WSMessage.Position.marginMode?: MarginMode` (line 795)
- `WSMessage.Order.marginMode?: MarginMode` (line 848)
- `WSMessage.AlgoOrder.marginMode?: MarginMode` (line 896)

**Topics handled** in `usePrivateDataObserver`:

| WS Topic                   | Handler       | Margin Mode Usage                                      |
| -------------------------- | ------------- | ------------------------------------------------------ |
| `position`                 | Lines 362-428 | Matches positions by `symbol + marginMode`             |
| `executionreport`          | Lines 234-249 | Transforms `marginMode` → `margin_mode`                |
| `algoexecutionreport`      | Lines 251-262 | Transforms `marginMode` → `margin_mode`                |
| `account` (symbolLeverage) | Lines 264-359 | Updates leverage cache keyed by `symbol + margin_mode` |

The leverage merge logic matches entries by **both** `symbol` AND `margin_mode`:

```ts
// packages/hooks/src/orderly/usePrivateDataObserver.ts:328
const index = prev.findIndex(
  (item) =>
    item.symbol === symbol &&
    (item.margin_mode ?? MarginMode.CROSS) === (marginMode ?? MarginMode.CROSS),
);
```

If no matching entry exists, a new one is appended. This means a symbol's leverage cache can hold **two entries** — one for Cross, one for Isolated.

---

## 4. Business Rules

### 4.1 Max Quantity Calculation

The `useMaxQty` hook branches on margin mode at `packages/hooks/src/orderly/useMaxQty.ts:173`:

**Cross margin** (`maxQty`):

- Uses `totalCollateral` (multi-asset)
- Considers `otherIMs` — initial margins from ALL other positions
- Standard formula from `account.maxQty()`

**Isolated margin** (`maxQtyForIsolatedMargin`):

- Uses `freeCollateralUSDCOnly` — **USDC balance only**
- Does **not** consider other positions' initial margins
- Computes frozen margin per order: `order_notional / leverage`
- Applies a max notional cap: `min((1 / leverage / imr_factor)^(5/4), symbol_max_notional)`
- For **reverse-position scenarios** (buying with short position, selling with long position): uses a **binary search algorithm** (max 30 iterations) to find the largest quantity that keeps `frozen_margin <= available_balance` and `open_notional <= max_notional`

### 4.2 Free Collateral Display

```ts
// packages/hooks/src/next/useOrderEntry/useOrderEntry.ts:789
freeCollateral:
  effectiveMarginMode === MarginMode.ISOLATED
    ? freeCollateralUSDCOnly
    : freeCollateral,
```

The order entry form shows **USDC-only** free collateral when in Isolated mode, and **full multi-asset** collateral when in Cross mode.

### 4.3 Position Filtering

Positions are filtered by margin mode throughout the system. The same symbol can have **two simultaneous positions** — one Cross, one Isolated:

```ts
// useMaxQty.ts:122
const positionsArray = positions.filter(
  (position) => position.margin_mode === finalMarginMode,
);
```

### 4.4 TP/SL Order Matching

TP/SL orders are matched to positions by **both symbol AND margin_mode**:

```ts
// packages/hooks/src/orderly/usePositionStream/utils.ts:94
order.symbol === symbol &&
  order.margin_mode === marginMode &&
  order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL;
```

This prevents a Cross-mode TP/SL from accidentally attaching to an Isolated-mode position of the same symbol.

### 4.5 Estimated Liquidation Price

```ts
// packages/hooks/src/next/tpsl/useEstLiqPriceBySymbol.ts
const position = data?.rows?.find(
  (row) => row.symbol === symbol && row.margin_mode === marginMode,
);
return position?.est_liq_price;
```

Liquidation price is fetched from the matching position row (by symbol + margin mode).

### 4.6 Order Confirmation

The order confirmation dialog matches the active position by margin mode to show the correct position quantity:

```ts
// packages/ui-order-entry/src/components/dialog/confirm.ui.tsx:45
orderMarginMode != null
  ? positions?.find(
      (row) => row.symbol === symbol && row.margin_mode === orderMarginMode,
    )
  : positions?.[0]; // fallback for legacy orders without margin_mode
```

### 4.7 Margin Adjustment (Isolated Only)

The `adjustMargin` feature (`POST /v1/position_margin`) lets users add or reduce margin on isolated positions:

- UI at `packages/ui-positions/src/components/positions/adjustMargin/`
- Operations: `ADD` or `REDUCE`
- Validates input against `maxAmount` before submitting
- Shows updated liquidation price and effective leverage in real-time

**maxAdd formula** (`packages/perp/src/account/maxAddReduce.ts`):

```
max(0, min(USDC_balance, free_collateral - max(total_cross_unsettled_pnl, 0)))
```

**maxReduce formula**:

```
max(0, isolated_margin - position_notional * IMR + min(0, unsettled_pnl))
```

Cross-margin unrealized profit reduces the amount available for adding isolated margin.

### 4.8 Initial Margin Calculation — Excludes Isolated

```ts
// packages/perp/src/account/initialMargin.ts:126
const crossPositions = positions.filter(
  (p) => p.margin_mode !== MarginMode.ISOLATED,
);
const crossOrders = orders.filter((o) => o.margin_mode !== MarginMode.ISOLATED);
```

Isolated-margin positions and orders are **excluded** from the account-wide initial margin calculation. They have their own independent margin pool.

### 4.9 Free Collateral — Cross Only

Free collateral (`packages/perp/src/account/freeCollateral.ts`) only considers cross-margin positions:

```
Free Collateral = total_collateral_value - total_initial_margin_with_orders
```

Where `total_collateral_value` includes **only** cross-margin unsettled PnL (isolated is excluded).

### 4.10 Portfolio Collateral Calculation

```ts
// packages/hooks/src/orderly/calculator/positions.ts:263
const totalCollateral =
  item.margin_mode === MarginMode.ISOLATED
    ? new Decimal(item.margin ?? 0).add(item.unsettlement_pnl ?? 0).toNumber()
    : crossMarginCollateral.toNumber();
```

- **Isolated**: `isolated_margin + unsettled_pnl` (per-position only)
- **Cross**: account-wide `crossMarginCollateral`

### 4.11 Liquidation Price — Different Formulas Per Mode

```ts
// packages/hooks/src/next/useOrderEntry/helper.ts:170
if (order.margin_mode === MarginMode.CROSS) {
  liqPrice = orderUtils.estLiqPrice({...})     // uses total collateral + all positions
} else {
  liqPrice = orderUtils.estLiqPriceIsolated({...}) // uses isolated position margin only
}
```

The isolated formula (`packages/perp/src/positions/liquidationPriceIsolated.ts`) considers 4 scenarios: `NO_ORDER`, `OPEN_ADD`, `REDUCE`, `FLIP`.

### 4.12 Order Editing — Preserves Margin Mode

When editing any order property (price, quantity, trigger), the original `margin_mode` is always included:

```ts
// packages/ui-orders/src/components/orderList/desktop/components/priceCell.tsx:96
if (order.margin_mode !== undefined) {
  data.margin_mode = order.margin_mode;
}
```

This pattern repeats in: `activedPriceCell.tsx`, `trailingCallbackCell.tsx`, `triggerPriceCell.tsx`, `quantityCell.tsx`.

### 4.13 Position Close — Inherits Margin Mode

```ts
// packages/hooks/src/next/positions/usePositionClose.ts:62
margin_mode: position.margin_mode || MarginMode.CROSS,
```

Close orders always use the position's original margin mode.

### 4.14 Reverse Position — Preserves Margin Mode

```ts
// packages/ui-positions/src/components/reversePosition/reversePosition.script.tsx:160
margin_mode: position.margin_mode || MarginMode.CROSS,
```

### 4.15 Position History — Numeric Encoding Normalization

```ts
// packages/ui-positions/src/components/positionHistory/positionHistory.script.tsx:77
// Normalizes: 1 = ISOLATED, else = CROSS
```

### 4.16 Feature Flag — `isolated-margin`

The isolated margin UI is gated behind a feature flag (`FlagKeys.IsolatedMargin = "isolated-margin"`).

**Gate location**: `packages/ui-order-entry/src/components/header/LeverageBadge.tsx:48`

```ts
const { enabled } = useFeatureFlag(FlagKeys.IsolatedMargin);

const showMarginModeModal = () => {
  if (isDisabled || !enabled) {
    // ← silently exits if flag is off
    return;
  }
  modal.show(modalId, { symbol });
};
```

**How the flag resolves** (`packages/hooks/src/feature-flag/useFeatureFlag.ts`):

The hook calls two endpoints:

| Endpoint                       | Scope                   | Purpose                                          |
| ------------------------------ | ----------------------- | ------------------------------------------------ |
| `GET /v1/public/feature_flags` | Public (no auth)        | Lists all gated features                         |
| `GET /v1/feature_flags`        | Private (auth required) | Lists features enabled for the connected account |

Decision matrix:

| In public list? | In private list? | Result                                          |
| --------------- | ---------------- | ----------------------------------------------- |
| No              | —                | `enabled: true` (not gated, visible by default) |
| Yes             | Yes              | `enabled: true` (gated and explicitly enabled)  |
| Yes             | No / not authed  | `enabled: false` (gated, not opted in)          |
| Loading...      | —                | `enabled: false` (hidden while loading)         |

**Observed behavior** (verified via Chrome DevTools on `bld-foggy-harbor.velto.com`, 2026-03-23):

- `GET /v1/public/feature_flags` returns:

  ```json
  {
    "rows": [
      { "key": "isolated-margin", "description": "Isolated Margin Feature" }
    ]
  }
  ```

  The `"isolated-margin"` key **is present** in the public list → the feature is **gated**.

- `GET /v1/feature_flags` (private) — when a wallet is connected, returns:
  ```json
  { "rows": [], "timestamp": 1774275109839 }
  ```
  The private list is **empty** — `"isolated-margin"` is not enabled for the connected account.

**Result**: Clicking the "Cross" button in the order entry header does nothing — `showMarginModeModal()` returns early at the `!enabled` check. There is no visual feedback (no cursor change, no tooltip) to indicate the button is inactive.

**To enable isolated margin**, one of the following is required:

1. **Backend**: Add `"isolated-margin"` to the account's private feature flags (so it appears in `GET /v1/feature_flags`)
2. **SDK bypass**: Remove the `!enabled` guard in `LeverageBadge.tsx:48` to make the feature always available

---

## 5. UI Components

### 5.1 Margin Mode Switch (Per-Symbol)

**Location**: `packages/ui-order-entry/src/components/marginModeSwitch/`

A dialog/sheet that lets the user toggle between Cross and Isolated for the **current symbol**. Calls `useMarginModeBySymbol(symbol).update(mode)`.

- Shows both options with "Current" badge on the active mode
- Closes and toasts on success
- Available from the order entry header via `LeverageBadge`

### 5.2 Margin Mode Settings (Bulk)

**Location**: `packages/ui-order-entry/src/components/marginModeSettings/`

A modal for bulk-managing margin modes across **all symbols**:

- Lists all perpetual futures markets
- Searchable, with select-all
- Shows current mode per symbol
- "Set as Cross" / "Set as Isolated" buttons
- Buttons are disabled when all selected items are already in that mode
- Sends a single API call with `symbol_list` array

### 5.3 Position List — Leverage Badge

**Location**: `packages/ui-positions/src/components/positions/desktop/components.tsx`

Displays the margin mode label next to each position:

```tsx
resolvedMarginMode === MarginMode.ISOLATED
  ? t("marginMode.isolated") // "Isolated"
  : t("marginMode.cross"); // "Cross"
```

### 5.4 TradingView Chart Lines

**Location**: `packages/ui-tradingview/src/tradingviewAdapter/renderer/`

When a symbol has **multiple positions** (one Cross + one Isolated), the chart draws margin mode labels on position and order lines:

```ts
const needDrawMarginMode = positions.length > 1;
```

### 5.5 LTV Risk Tooltip

**Location**: `packages/ui-order-entry/src/components/LTVRiskTooltip/`

Receives the current `marginMode` to conditionally display the USDC-only warning for Isolated mode.

---

## 6. Corner Cases & Edge Conditions

### 6.1 Default Fallback

Every hook that reads margin mode defaults to `MarginMode.CROSS` when the API returns `undefined` or the symbol has no explicit setting:

```ts
// useMarginModeBySymbol
const marginMode = marginModes[symbol] ?? fallback; // fallback = MarginMode.CROSS
```

### 6.2 Same Symbol, Two Positions

Because positions are keyed by `{symbol, margin_mode}`, a user can hold:

- A **Cross** BTC-PERP position at 10x leverage
- An **Isolated** BTC-PERP position at 25x leverage

These are **independent**. TP/SL orders, leverage settings, and liquidation prices are all tracked separately.

### 6.3 Leverage Cache Staleness

The `useSymbolLeverage` hook updates the SWR cache optimistically on WS events. If a margin mode entry doesn't exist yet (`index === -1`), it appends a new entry rather than overwriting. This prevents Cross leverage from being overwritten by an Isolated leverage update.

### 6.4 Legacy `ClosedPosition.margin_mode` Encoding

```ts
// packages/types/src/types/api.ts:627
margin_mode?: MarginMode | 1 | 0;
```

Historical closed positions may use numeric encoding (`1` / `0`) instead of string enum values. Consumers should handle both.

### 6.5 TPSL Default When Editing

When opening the TP/SL editor from an existing position, the margin mode cascades:

```
options.position.margin_mode → symbolMarginMode (from API) → MarginMode.CROSS
```

The TPSL script finds the matching position by checking `item.margin_mode === (options.position?.margin_mode ?? symbolMarginMode)`.

### 6.6 Binary Search Precision (Isolated Max Qty)

The `maxQtyForIsolatedMargin` binary search uses:

- **Max 30 iterations**
- **Epsilon = 1** (default) — stops when `available_balance - frozen_margin <= 1`
- This means the result can be off by up to ~$1 of margin equivalent

### 6.7 Order Entry — Effective Margin Mode Resolution

```ts
// packages/hooks/src/next/useOrderEntry/useOrderEntry.ts:213
const effectiveMarginMode =
  options?.initialOrder?.margin_mode ?? entry?.margin_mode ?? MarginMode.CROSS;
```

Priority: explicit order override > stored order entry state > Cross default.

### 6.8 Margin Mode Switch Race Condition

The `marginModeSwitch.script.tsx` closes the modal **before** the API call resolves (`close()` then `applyMarginMode()`). If the API call fails, the user sees a toast error but the modal is already gone. The state is still consistent because `useMarginModeBySymbol` re-fetches on mutation completion.

---

## 7. Package Dependency Map

```
@veltodefi/types        → MarginMode enum definition
    ↓
@veltodefi/perp         → maxQtyForIsolatedMargin calculation
    ↓
@veltodefi/hooks        → useMarginModes, useMarginModeBySymbol,
                           useSymbolLeverageMap, useLeverageBySymbol,
                           useMaxQty, usePositionStream, useEstLiqPriceBySymbol
    ↓
@veltodefi/ui-order-entry → MarginModeSwitch, MarginModeSettings,
                             LTVRiskTooltip, OrderConfirmDialog
@veltodefi/ui-positions   → LeverageBadge, AdjustMargin, position display
@veltodefi/ui-tpsl        → TP/SL editor (margin_mode matching)
@veltodefi/ui-tradingview → Chart position/order lines
@veltodefi/i18n           → marginMode.* translation keys
```

---

## 8. i18n Keys

| Key                                    | English Value                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `marginMode.switchMarginMode`          | Switch Margin Mode                                                                                             |
| `marginMode.cross`                     | Cross                                                                                                          |
| `marginMode.isolated`                  | Isolated                                                                                                       |
| `marginMode.crossMargin`               | Cross Margin                                                                                                   |
| `marginMode.isolatedMargin`            | Isolated Margin                                                                                                |
| `marginMode.crossMarginDescription`    | Margin and PnL are shared across positions. You may lose all positions if liquidation occurs.                  |
| `marginMode.isolatedMarginDescription` | Margin and PnL are independent for each position. You'll only lose the current position if liquidation occurs. |
| `marginMode.current`                   | Current                                                                                                        |
| `marginMode.marginModeSettings`        | Margin mode settings                                                                                           |
| `marginMode.updatedSuccessfully`       | Updated successfully                                                                                           |
| `marginMode.perpetualFutures`          | Perpetual futures                                                                                              |
| `marginMode.searchPlaceholder`         | Search                                                                                                         |
| `marginMode.selectAll`                 | Select all                                                                                                     |
| `marginMode.setAs`                     | Set as                                                                                                         |
| `transfer.LTV.isolatedModeUsdcOnly`    | Only USDC can be used as margin in Isolated Mode.                                                              |
