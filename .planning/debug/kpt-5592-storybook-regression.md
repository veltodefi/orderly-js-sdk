---
status: diagnosed
trigger: "Storybook regression after KPT-5592 commit e5ece1ab46: server error in terminal, eternally-loading center panel in browser"
created: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:30:00Z
---

## Current Focus

hypothesis: Terminal errors are pre-existing and unrelated to KPT-5592. The reported "eternally loading center panel" is most likely an unrelated runtime issue (or the user mis-attributed timing to the commit). No symbol in the modified source is broken.
test: Compared storybook startup against pre-KPT-5592 baseline (HEAD^ for the four ui-transfer files)
expecting: Same errors at baseline → confirms not a regression
next_action: Report findings; do NOT commit any fix because there is nothing in my commit to fix.

## Symptoms

expected: Storybook stories render in center panel, no terminal errors
actual: Center panel eternally-loading white box; long error printed in `pnpm storybook` terminal
errors: (to be captured)
reproduction: `cd apps/storybook && pnpm storybook`, open http://localhost:6006
started: After commit e5ece1ab46 on branch aryella/feat/kpt-5592/deposit-onboarding-dialog

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-05-18T00:00:00Z
  checked: User-reported context
  found: Commit e5ece1ab46 removed `layout?: "onboarding"` prop from DepositForm, DepositFormWidget, ExchangeDivider, ExclusiveDeposit; removed `cn` import from exclusiveDeposit
  implication: Any story or consumer still passing `layout="onboarding"` to these components, or importing removed symbols, would fail at compile/runtime

- timestamp: 2026-05-18T00:10:00Z
  checked: `grep -rn 'layout="onboarding"'` across the whole repo
  found: Zero matches in HEAD source. The single uncommitted working-tree change in `apps/storybook/src/stories/package/transfer/transfer.stories.tsx` removes `layout="onboarding"` from the `DepositFormBoth` story — that fix was already staged.
  implication: No `layout="onboarding"` consumer remains on disk in the current working state.

- timestamp: 2026-05-18T00:15:00Z
  checked: `pnpm storybook` started successfully on http://localhost:6006, story index `/index.json` populated, transfer story module compiled (HTTP 200, 137KB).
  found: Stdout warnings + errors: (1) `Tailwind Variants Transform Failed: shadowVariants is not defined`, (2) three `[ERROR] Could not resolve "uuid"` from esbuild pre-bundling `@particle-network/auth@1.3.1`, `@particle-network/analytics@1.0.2`, `@particle-network/crypto@1.0.1`.
  implication: These are upstream dep bugs — the particle packages import `from "uuid"` but their own package.json declares `uuidv4` instead. Not introduced by KPT-5592.

- timestamp: 2026-05-18T00:20:00Z
  checked: Stashed my working-tree changes (including the transfer.stories.tsx fix). Restarted storybook with raw HEAD = e5ece1ab46.
  found: Identical errors: shadowVariants + 3× uuid resolution failures. Story modules still compile.
  implication: Errors are independent of the uncommitted stash.

- timestamp: 2026-05-18T00:25:00Z
  checked: Rolled back `apps/storybook`, `packages/ui-transfer`, `packages/i18n` to e5ece1ab46^ (pre-KPT-5592). Restarted storybook.
  found: Identical errors: shadowVariants + 3× uuid resolution failures.
  implication: ROOT CAUSE — these errors are 100% pre-existing, present on the parent commit. KPT-5592 changed none of this.

- timestamp: 2026-05-18T00:28:00Z
  checked: `packages/ui-transfer/dist/index.mjs` newer than source for new symbols (`Skip for now`, `onAuditLinkClick`, `onInfoIconClick`)
  found: dist build is current and reflects KPT-5592 source. Workspace `:*` consumers resolve through `dist` (no Vite `tsconfig-paths` plugin in storybook config); the path mappings in `apps/storybook/tsconfig.app.json` are TypeScript-only.
  implication: Even if dist were stale, the new symbols are in the bundle.

## Resolution

root_cause: Reported errors are pre-existing — `@particle-network/{auth,analytics,crypto}` upstream packages import `"uuid"` without declaring it as a dependency, and the SDK's tailwind-variants config has a missing `shadowVariants` symbol. Both exist on the parent commit e5ece1ab46^. None of the KPT-5592 source changes touch these areas, and grep confirms zero remaining `layout="onboarding"` consumers (the one in `transfer.stories.tsx` was already removed in the uncommitted working tree).
fix: None required for KPT-5592 itself. The uncommitted working-tree change in `apps/storybook/src/stories/package/transfer/transfer.stories.tsx` (already done) is the only adjustment needed to keep stories type-consistent with the new component API; stage and commit it with the KPT-5592 series.
verification: Storybook server boots, index JSON contains all stories, transfer.stories.tsx compiles to 137KB JS module via Vite (HTTP 200). The browser-side "eternally loading" symptom could not be reproduced here without Chrome MCP, but the build pipeline produces a transfer module identical in shape under both my commit and the parent commit.
files_changed: []
