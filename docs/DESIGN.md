# Design System

## Brand language

The public product is a luxury-travel interface anchored by deep navy `#0B1026` and warm gold `#C9A25A`, with midnight blue `#1A2342` as the secondary dark surface. The intended feeling is spacious, composed and premium—not default SaaS blue.

## Typography

- `font-display`: Montserrat for uppercase kickers, labels and compact display treatments.
- `font-sans`: Inter/Poppins for body text, forms and actions.
- `font-serif` / Playfair Display: refined editorial headings and premium callouts where present.

Use a clear hierarchy: display/kicker, one page H1, then supporting headings. The Phase 7 audit found no duplicate H1 violations. It also recorded a mismatch between the documented serif rule and the audited implementation (“No font-serif or Playfair Display found”); do not claim serif is applied unless the page actually uses it.

## Component variants

- **Card:** `luxury` (subtle gold border/elevation) and `glass` (translucent blur surface).
- **Badge:** `luxury` (gold/navy), `luxuryOutline`, and `luxuryNavy`.
- **Button:** `luxury` (gold premium treatment) and `luxuryOutline` (gold border, solid hover).

Use `SectionHeading`, `ScrollReveal`, `NavbarShell`, `FooterShell`, `FAQAccordion`, `StickyCTA`, and `LazyImage` as the established shared primitives rather than recreating nearby versions.

## Audit-grounded guidance

On-brand work uses the navy/gold tokens, luxury button variants, consistent dark hero overlays (`rgba(11, 16, 38, 0.65)`), explicit image aspect ratios and generous spacing. The Phase 7 audit marked those areas as passing.

Off-brand remnants exist and should be corrected when touching them: the `App.tsx` loader/error boundary uses blue/purple/red/orange gradients and generic blue controls, which conflicts with the navy/gold luxury system. Avoid expanding that visual language; bring it into the design system when it is next revised.
