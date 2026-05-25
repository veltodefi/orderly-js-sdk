---
"@veltodefi/ui-transfer": patch
---

Enrich `withdraw:requested` event with payload (`amount`, `token`, `chainId`, `receiver`, `crossChain`). Consumers no longer need to round-trip through `/v1/asset/history` to recover the details of the withdrawal that just fired.
