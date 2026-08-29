# Technology Stack

## Chosen stack

- React 18, Vite and TypeScript for the static SPA.
- Tailwind CSS and shadcn/ui/Radix primitives for UI.
- PHP 8.2 flat endpoint files with PDO; no backend framework.
- MySQL for all business data.
- Supabase for Auth only; its tokens are verified by PHP using ES256.
- Razorpay for payments. Use test mode only until an explicit go-ahead authorises live payments.
- PHPMailer for server-side mail.

## Deliberately not used

- **Postgres/Supabase as business storage:** rejected because the target architecture is one MySQL business database on included shared hosting.
- **Redis:** unnecessary at this scale and unavailable as a justified operational dependency.
- **Microservices:** wrong operational fit for a flat PHP shared-hosting deployment.
- **GDS/Amadeus:** considered but rejected as the wrong scale for the current contracted-inventory workflow.
- **Always-on Express/Node in production:** unsuitable for the shared host; retained legacy code is rollback history, not the deployment architecture.
