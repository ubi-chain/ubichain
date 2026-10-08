# kabu API read-only preparation

This is a local fixture UI at `/kabu-preview`, not an account connection.
No credentials are collected, no requests made, and no trading/transfer controls exist.
Do not expose kabu Station localhost ports to the internet.

Official specification: https://kabucom.github.io/kabusapi/reference/index.html
Usage rules: https://kabu.com/pdf/Gmkpdf/service/kabustationapiuserpolicy.pdf

Before real integration:
- Obtain confirmation that this particular third-party/web-app arrangement is permitted.
- Confirm data display/storage/redistribution restrictions and user-PC architecture.
- Keep secrets on an approved protected system, never GitHub or browser storage.
- Limit any future approved connector to positions, orders and buying-power reads.
- Explicitly disallow order submission/cancellation, withdrawals and bank transfers.

There is no public bank-transfer or on-chain conversion endpoint in the reviewed specification.
Production deployment is not part of this preparation. Main still has the previously identified
TanStack Start dependency issue; resolve before any later deployment.
