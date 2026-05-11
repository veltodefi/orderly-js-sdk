import { OrderSide, OrderType } from "@veltodefi/types";
import { tpslCalculateHelper } from "../tp_slUtils";

/**
 * KPT-5552 — Anchor-mode regression tests.
 *
 * These cover the behaviour the user-facing fix depends on:
 *   1. `tpslCalculateHelper` preserves the anchor field verbatim across calls (no drift through
 *      lossy round-trips).
 *   2. The transient-failure branch (formerly "wipe") preserves prior derivatives instead of
 *      zeroing them — this is what kept producing naked submits whenever a single tick had
 *      qty=0 / missing mark / no symbol info.
 *
 * Upstream Orderly may merge an unrelated rewrite of this code path. These tests are the
 * regression net: if upstream introduces a different fix that re-breaks either invariant, the
 * suite fails on merge.
 */

const SYMBOL = { quote_dp: 1 } as const;

const makeBaseInputs = (
  overrides: Partial<Parameters<typeof tpslCalculateHelper>[1]> = {},
) => ({
  key: "tp_offset_percentage",
  value: "0.015",
  entryPrice: 80000,
  qty: 0.001,
  orderSide: OrderSide.BUY,
  markPrice: 80000,
  values: { tp_order_type: OrderType.MARKET } as Partial<
    Parameters<typeof tpslCalculateHelper>[1]["values"]
  >,
  ...overrides,
});

describe("KPT-5552 — anchor-mode invariants", () => {
  describe("percentage anchor — value preserved verbatim across mark-price changes", () => {
    test("tp_offset_percentage with BUY side stays verbatim across 5 simulated ticks", () => {
      const ticks = [80000, 80050, 80100, 80037, 79998];
      for (const mark of ticks) {
        const out = tpslCalculateHelper(
          "tp_offset_percentage",
          makeBaseInputs({ markPrice: mark, entryPrice: mark }),
          { symbol: SYMBOL },
        );
        expect(out.tp_offset_percentage).toBe("0.015");
      }
    });

    test("sl_offset_percentage with SELL side stays verbatim across ticks", () => {
      const ticks = [80000, 80050, 80100];
      for (const mark of ticks) {
        const out = tpslCalculateHelper(
          "sl_offset_percentage",
          makeBaseInputs({
            key: "sl_offset_percentage",
            value: "0.012",
            orderSide: OrderSide.SELL,
            markPrice: mark,
            entryPrice: mark,
            values: { sl_order_type: OrderType.MARKET },
          }),
          { symbol: SYMBOL },
        );
        expect(out.sl_offset_percentage).toBe("0.012");
      }
    });

    test("trigger_price recomputes each tick (it's the derivative, not the anchor)", () => {
      const out80 = tpslCalculateHelper(
        "tp_offset_percentage",
        makeBaseInputs({ markPrice: 80000, entryPrice: 80000 }),
        { symbol: SYMBOL },
      );
      const out81 = tpslCalculateHelper(
        "tp_offset_percentage",
        makeBaseInputs({ markPrice: 81000, entryPrice: 81000 }),
        { symbol: SYMBOL },
      );
      expect(out80.tp_trigger_price).not.toBe(out81.tp_trigger_price);
    });
  });

  describe("transient-failure branch preserves prior derivatives (no naked-submit wipe)", () => {
    // The trigger for the transient-failure branch is `offsetPercentageToPrice` returning
    // undefined, which it does when `percentage` is falsy (0 or ""). In production this
    // happens when the cascade momentarily feeds the helper with a 0/empty anchor value during
    // a recompute storm. Before the fix, this wiped every TP/SL field; the submit path then
    // produced a naked order on the next click.
    test("falsy percentage with prior derivatives preserves them instead of wiping", () => {
      const priorState = {
        tp_order_type: OrderType.MARKET,
        tp_trigger_price: "81200.0",
        tp_offset: "1200",
        tp_offset_percentage: "0.015",
        tp_offset_from_mark: "",
        tp_offset_percentage_from_mark: "",
        tp_pnl: "1.2",
        tp_ROI: "0.015",
      };

      const out = tpslCalculateHelper(
        "tp_offset_percentage",
        makeBaseInputs({
          value: 0,
          markPrice: 80000,
          entryPrice: 80000,
          values: priorState,
        }),
        { symbol: SYMBOL },
      );

      // Anchor reflects current input.
      expect(out.tp_offset_percentage).toBe(0);
      // Derivative preserved from prior state — load-bearing assertion. Submit reads
      // tp_trigger_price; if this had been "" the order would go naked.
      expect(out.tp_trigger_price).toBe("81200.0");
      expect(out.tp_offset).toBe("1200");
      expect(out.tp_pnl).toBe("1.2");
    });

    test("falsy SL percentage with prior derivatives preserves sl_trigger_price", () => {
      const priorState = {
        sl_order_type: OrderType.MARKET,
        sl_trigger_price: "78800.0",
        sl_offset: "1200",
        sl_offset_percentage: "-0.015",
        sl_offset_from_mark: "",
        sl_offset_percentage_from_mark: "",
        sl_pnl: "-1.2",
        sl_ROI: "-0.015",
      };

      const out = tpslCalculateHelper(
        "sl_offset_percentage",
        makeBaseInputs({
          key: "sl_offset_percentage",
          value: 0,
          orderSide: OrderSide.SELL,
          markPrice: 80000,
          entryPrice: 80000,
          values: priorState,
        }),
        { symbol: SYMBOL },
      );

      expect(out.sl_trigger_price).toBe("78800.0");
    });

    test("falsy percentage with NO prior derivatives falls back to empty strings", () => {
      // First-tick edge case: the wipe branch fires before any derivative has ever been
      // computed (e.g. anchor present but mark not yet bound). Output must still be valid
      // strings so downstream consumers don't see undefined.
      const out = tpslCalculateHelper(
        "tp_offset_percentage",
        makeBaseInputs({
          value: 0,
          values: { tp_order_type: OrderType.MARKET },
        }),
        { symbol: SYMBOL },
      );

      expect(out.tp_trigger_price).toBe("");
      expect(out.tp_offset).toBe("");
      expect(out.tp_pnl).toBe("");
    });
  });

  describe("pnl anchor — value preserved verbatim across mark-price changes", () => {
    test("tp_pnl stays verbatim across 3 ticks", () => {
      const ticks = [80000, 80100, 80200];
      for (const mark of ticks) {
        const out = tpslCalculateHelper(
          "tp_pnl",
          makeBaseInputs({
            key: "tp_pnl",
            value: 50,
            markPrice: mark,
            entryPrice: mark,
          }),
          { symbol: SYMBOL },
        );
        expect(out.tp_pnl).toBe(50);
      }
    });
  });
});
