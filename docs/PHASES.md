# Delivery Phases and Verification Record

This is a chronological record of the actual migration/delivery stream. “Complete” means delivered in the stated environment; it does not erase deferred rollback work.

| Phase | Status | Delivered and verified |
| --- | --- | --- |
| 0 — PHP backend and auth | Complete / verified | Flat PHP backend, PDO connection loader, Supabase JWT auth middleware and profile-role gate were added. Endpoint access was exercised with authenticated HTTP tests; PHP syntax checks were also run. |
| 1 — Leads and communications | Complete / staging verified | Lead creation/listing, inbound webhook and lead communications moved to PHP/MySQL. The staging runner created a lead through HTTP, queried the stored MySQL row, then created/verified call and note records. The runner’s destructive setup is now governed by RULES.md. |
| 2 — Inventory and CRM itineraries | Complete / verified | Hotel contracting/rates, cab contracting/rates, activities and city-filtered inventory were implemented. The CRM itinerary builder persists the private itinerary model and uses contracted inventory. Schema checks were required after discovered ID/table-name mismatches. |
| 3 — Quotes and payments | Complete / staging verified | PHP quote/PDF/email and Razorpay PHP payment work was tested locally and on staging. The migration plan records a real `rzp_test_` order (`order_TB4KDBZWNsWRve`) and successful SMTP email delivery. Payments remain test-mode pending explicit production approval. |
| 4 — Decommission/cleanup | Deferred | Node Razorpay and redundant Supabase-data paths remain as rollback safety net. Do not remove them until the PHP route has proven stable in live production for at least two weeks and a backup exists. |
| 5 — Dynamic public packages | Complete / verified | Dynamic package data/template flow was introduced with legacy-page fallback routing in `App.tsx`. CharDham was moved onto the dynamic template during this session while retaining its fallback. |
| 6 — CRM expansion | Complete / verified in delivered UI/API work | CRM gained package, destination, hotel, cab, supplier, activity, sightseeing, visa, blog, review and payment areas, plus lead-scoped itinerary work. The codebase includes their route coverage under `/crm`. |
| 7 — SEO/performance/cross-hub QA | Complete / audited | `PHASE_7_QA_LOG.md` records one-H1, internal linking, schema, lazy-loading/code-splitting, font loading, mobile and visual-consistency audits as pass. It also records remaining bundle-size and integration follow-ups. |
| Current — CRM reports, vouchers and invoices | In progress / reports endpoint verified | `reports.php` provides authenticated hotel/cab/activity rate reporting. Voucher/invoice work is the current CRM stream and is not recorded as production-verified until it has curl/browser evidence and generated-document review. |

The row statuses deliberately distinguish staging/API verification from production acceptance. Never promote “built” to “verified” without observable evidence.
