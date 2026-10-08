# Grok build handoff

Import this PR branch `vercel-agent/stop-financial-simulation`, not older main.
Financial state is reset to zero, old local balances cleared on hydration,
random economy ticks and balance-changing actions disabled. Financial route
screens are replaced by a shutdown notice. Non-financial geography, orbital,
and medical demonstration pages are retained.

This deletes local fictional financial balances/history, not actual bank funds.
No bank connection or financial transaction is added. No Vercel production
promotion is requested for this handoff. Review the app in Grok before publishing.
Funding terms remain a legal-review draft, not an active financial contract.
