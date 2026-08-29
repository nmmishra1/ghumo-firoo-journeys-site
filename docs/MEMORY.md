# Decision Log

This log records settled project decisions so future work does not re-litigate them.

| Date | Decision | Rationale / consequence |
| --- | --- | --- |
| 2026-07-14 | Public packages and CRM itineraries remain permanently separate at the data layer. | Public: `packages` + `package_template_items`; private: itinerary tables. No cross-reads/writes. |
| 2026-07-14 | **Promote to Catalog** is deferred but planned. | It will be an authorised manual clone/map from a successful private itinerary into the public catalogue, never shared tables. |
| 2026-07-14 | CharDham uses the dynamic package template with a legacy fallback. | Existing public URL/content survives while dynamic catalogue data is introduced. |
| 2026-07-14 | MySQL is the only business database; Supabase is Auth only. | Shared hosting includes MySQL; PHP verifies Supabase ES256 access tokens. |
| 2026-07-14 | Production deployment is static Vite build plus PHP endpoints on cPanel. | No always-on Node process, SSH, SCP or git deployment. Use cPanel Terminal/File Manager. |
| 2026-07-14 | `ghumofiroo.com/` is the addon-domain document root. | It is not `public_html`; confusion already caused an outage. |
| 2026-07-14 | Razorpay stays in test mode until explicit approval. | Staging test order and SMTP delivery succeeded; that is not authorisation for live charges. |
| 2026-07-14 | Legacy Node/Supabase-data code stays temporarily as rollback safety net. | Phase 4 decommission is deferred until the PHP production path is stable for two weeks with backups. |
| 2026-07-14 | Structured operational data must be relational, not JSON blobs. | This rejects `leads.discussions` and `quick_facts.attractions` blob designs. |
| 2026-07-14 | Destructive SQL and schema scripts require explicit review and CLI-only execution. | Session incidents established this as a non-negotiable safety rule. |

When a later decision supersedes one of these entries, add a new dated row; do not silently rewrite history.
