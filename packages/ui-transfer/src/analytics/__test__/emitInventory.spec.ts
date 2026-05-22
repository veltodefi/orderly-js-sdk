/**
 * Static inventory of every `emit({...})` call site in the deposit/withdraw
 * transfer surface. The expected list below IS the analytics contract — if a
 * merge silently drops an `emit(...)` call (or adds one without doc updates),
 * this test fails and a human has to look at it.
 *
 * The webapp-facing reference doc
 * (`docs/deposit-withdraw-analytics-events.md` in velto-webapp) is derived
 * from this list. When you change either side, update both.
 *
 * Scope is derived from the file path the `emit(...)` lives in, not from a
 * `form:` literal in the call — many emits use `...analyticsBase` spreads
 * where `form` is set elsewhere, and parsing those would just couple this
 * spec to internal variable names.
 *
 *   packages/ui-transfer/src/components/depositAndWithdraw/** → "dialog"
 *   packages/ui-transfer/src/components/depositForm/**        → "deposit"
 *   packages/ui-transfer/src/components/withdrawForm/**       → "withdraw"
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const SCOPES: { dir: string; scope: "dialog" | "deposit" | "withdraw" }[] = [
  { dir: "components/depositAndWithdraw", scope: "dialog" },
  { dir: "components/depositForm", scope: "deposit" },
  { dir: "components/withdrawForm", scope: "withdraw" },
];

const SRC_ROOT = resolve(__dirname, "../../");

// Sorted ((scope, name)). Keep alphabetical so diffs are minimal.
const EXPECTED: Array<[string, string]> = [
  ["deposit", "action_clicked"],
  ["deposit", "action_failed"],
  ["deposit", "action_submitted"],
  ["deposit", "chain_changed"],
  ["deposit", "error_surfaced"],
  ["deposit", "quantity_entered"],
  ["deposit", "quickfill_clicked"],
  ["deposit", "slippage_changed"],
  ["deposit", "source_token_changed"],
  ["deposit", "subtab_changed"],
  ["dialog", "audit_link_clicked"],
  ["dialog", "closed"],
  ["dialog", "info_clicked"],
  ["dialog", "opened"],
  ["dialog", "skip_clicked"],
  ["dialog", "tab_changed"],
  ["withdraw", "account_id_entered"],
  ["withdraw", "action_clicked"],
  ["withdraw", "action_failed"],
  ["withdraw", "action_submitted"],
  ["withdraw", "add_wallet_opened"],
  ["withdraw", "add_wallet_submitted"],
  ["withdraw", "chain_changed"],
  ["withdraw", "error_surfaced"],
  ["withdraw", "quantity_entered"],
  ["withdraw", "quickfill_clicked"],
  ["withdraw", "settle_pnl_clicked"],
  ["withdraw", "source_token_changed"],
  ["withdraw", "subtab_changed"],
  ["withdraw", "switch_network_clicked"],
  ["withdraw", "wallet_selected"],
  ["withdraw", "warning_shown"],
];

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else if (
      (full.endsWith(".ts") || full.endsWith(".tsx")) &&
      !full.includes(".spec.") &&
      !full.includes(".test.") &&
      !full.includes("__test__") &&
      !full.includes("__tests__")
    ) {
      out.push(full);
    }
  }
  return out;
};

// Match the *outer* `emit({ ... })`. The body capture is non-greedy and
// excludes nested braces so we don't accidentally grab through unrelated
// object literals later in the file.
const EMIT_RE = /emit\s*\(\s*\{([^{}]*?)\}\s*\)/gs;
const NAME_RE = /name\s*:\s*"([^"]+)"/;

const extractEmits = (): Array<[string, string]> => {
  const tuples = new Set<string>();
  for (const { dir, scope } of SCOPES) {
    const root = join(SRC_ROOT, dir);
    for (const file of walk(root)) {
      const src = readFileSync(file, "utf8");
      let m: RegExpExecArray | null;
      while ((m = EMIT_RE.exec(src)) !== null) {
        const body = m[1];
        const nm = NAME_RE.exec(body);
        if (nm) tuples.add(`${scope}|${nm[1]}`);
      }
    }
  }
  return Array.from(tuples)
    .map((s) => s.split("|") as [string, string])
    .sort((a, b) =>
      a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]),
    );
};

describe("Transfer analytics — emit() inventory", () => {
  const found = extractEmits();

  it("matches the expected catalog (32 events: 6 dialog + 10 deposit + 16 withdraw)", () => {
    const fmt = (rows: Array<[string, string]>) =>
      rows.map(([s, n]) => `${s}.${n}`).join("\n");

    // Use a string comparison instead of toEqual so the failure diff reads
    // as a plain "what's added / what's missing" list — much easier than a
    // nested-array diff when someone drops an emit during a merge.
    expect(fmt(found)).toBe(fmt(EXPECTED));
  });

  // Spot-checks so a copy-paste typo (e.g. `name: "tab_chnaged"`) is loud.
  it("includes the dialog-frame events used in funnels", () => {
    const flat = new Set(found.map(([s, n]) => `${s}.${n}`));
    for (const k of [
      "dialog.opened",
      "dialog.closed",
      "dialog.tab_changed",
      "dialog.skip_clicked",
    ]) {
      expect(flat).toContain(k);
    }
  });

  it("includes the deposit action lifecycle (clicked → submitted → failed)", () => {
    const flat = new Set(found.map(([s, n]) => `${s}.${n}`));
    for (const k of [
      "deposit.action_clicked",
      "deposit.action_submitted",
      "deposit.action_failed",
    ]) {
      expect(flat).toContain(k);
    }
  });

  it("includes the withdraw action lifecycle (clicked → submitted → failed)", () => {
    const flat = new Set(found.map(([s, n]) => `${s}.${n}`));
    for (const k of [
      "withdraw.action_clicked",
      "withdraw.action_submitted",
      "withdraw.action_failed",
    ]) {
      expect(flat).toContain(k);
    }
  });
});
