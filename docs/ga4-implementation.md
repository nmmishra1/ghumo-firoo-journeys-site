# GA4 Tracking Implementation

This document summarizes the GA4 setup implemented across the site and CRM.

## Conversions

- `enquiry_submit`: Fired on successful enquiry form submission.
- `whatsapp_click`: Fired on WhatsApp button/icon clicks across pages.
- `brochure_download`: Fired when users download package brochures (PDF/HTML).

Configure these as conversions in GA4 Admin > Configure > Conversions.

## Custom Dimensions (Event-scoped)

Register the following event parameters in GA4 Admin > Configure > Custom definitions:

- `query`: Populated from `?query=` or `?q=` URL params when present.
- `package_slug`: Derived from the path `/packages/:slug` when present.
- `page_type`: Derived from route; values include `home`, `packages_list`, `package_detail`, `guide`, `enquiry`, `enquiry_success`, `page`.

These parameters are added automatically to all events via the analytics utility.

## Event Naming & Parameters

Event names are normalized for consistency:

- `enquire_whatsapp_click` → `whatsapp_click`
- `enquire_submit` → `enquiry_submit`

Common parameters attached to events:

- `page_type`, `package_slug`, `query`, `page_location`, `page_path`, `page_title` (auto-context)
- Event-specific:
  - `enquiry_submit`: `source`, `package_type`, `destination`
  - `whatsapp_click`: `source` plus contextual fields where available
  - `brochure_download`: `format`, `destination`, `package_title`

## Files Updated

- `src/lib/analytics.ts`: Default context + event name normalization.
- `src/pages/EnquireNow.tsx`: WhatsApp click event renamed to `whatsapp_click`.
- `src/components/contact/ContactInfo.tsx`: Added `whatsapp_click` tracking.
- `src/pages/Contact.tsx`: WhatsApp FAB now tracked with `whatsapp_click`.
- `src/pages/CustomTourPackages.tsx`: WhatsApp submission tracked with `whatsapp_click`.
- `src/components/packages/EnhancedBrochureDownload.tsx`: `brochure_download` for PDF/HTML.
- `src/components/packages/BrochureDownload.tsx`: `brochure_download` for PDF/HTML fallback.

## QA Checklist

1. Enable GA4 DebugView (use `?debug_mode=true` or Tag Assistant) and verify:
   - Route changes trigger `page_view` with correct `page_*` context.
   - `enquiry_submit` fires on API success with expected params.
   - `whatsapp_click` fires from Enquire page, Contact page, ContactInfo widget, and Custom Tour form.
   - `brochure_download` fires for both PDF and HTML downloads.
2. Validate custom dimensions receive values in DebugView event payloads.
3. Test in staging; then mark conversions in GA4 Admin.
4. Monitor data accuracy for 7 days post-deploy; compare counts with UI interactions.

## Notes

- All events include consistent auto-context parameters to support analysis.
- Event-specific parameter names follow a snake_case convention.
- No PII is sent in events.