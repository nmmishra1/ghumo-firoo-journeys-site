# Architectural Decision Record (ADR) — Package and Itinerary Separation

## Status
Approved

## Context
In Ghumo Firoo Journeys, there are two distinct paths for managing tour designs:
1.  **Public Tour Packages**: The self-service catalog containing standard itineraries with live pricing calculations shown to all visitors on the public website (read from `packages`, `package_template_items`, and mapped rate tables).
2.  **CRM Custom Itineraries**: Private itineraries tailored for specific leads by agents (saved in `itineraries`, `itinerary_days`, `itinerary_hotels`, `itinerary_transport`, `itinerary_excursions`).

We must ensure there is no leak of custom/private quotes onto the public site, nor any unintentional cross-writes between these two tracks.

## Decision
The data models and code paths for public Packages and CRM Itineraries shall remain completely independent. 
- No code path will write from itinerary tables into package tables, or vice versa.
- Public page queries will never touch `itineraries` or any associated custom itinerary tables.
- A **"Promote to Catalog"** feature is planned but not yet built. This feature will live inside the CRM and allow an authorized user (manager or admin) to clone a successful private custom itinerary into the public `packages` catalog. 
- Promotion will be a deliberate, manual copying/mapping operation, ensuring a clean schema separation is maintained.

## Consequences
- Clean separation of public catalog and private lead data.
- Zero risk of a private custom itinerary or quote being exposed to the public.
- The "Promote to Catalog" feature, when implemented, will copy/transform the data explicitly rather than sharing tables.
