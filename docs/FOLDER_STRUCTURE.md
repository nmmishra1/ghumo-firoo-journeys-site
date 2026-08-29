# Current Folder Structure

This is the meaningful current layout, not a generic Vite tree.

```text
php-backend/
  auth_middleware.php      Supabase JWT verification and MySQL role gate
  db.php                   shared PDO/MySQL configuration loader
  leads_*.php              lead creation/list/webhook endpoints
  communications.php       lead communication endpoint
  hotels.php, hotel-rates.php, activities.php, inventory_by_city.php
  packages.php, payments.zip, quotes.zip, reports.php
  test_cli_runner.php      staging test runner; CLI-only

src/
  pages/crm/               CRM screens: itinerary, contracting, masters, blogs
  pages/packages/          56 legacy/static package and hub pages plus DynamicPackageDetail.tsx
  components/              shared public-site and CRM components
  services/, hooks/, lib/  browser-facing API/data helpers

docs/                      architecture records and operational documentation
public/                    static site assets and deploy-facing public files
database/                  MySQL schema/history assets
```

## Package-routing fallback pattern

`src/App.tsx` deliberately routes known legacy slugs through:

```tsx
<DynamicPackageDetail fallback={<LegacyPackagePage />} />
```

The dynamic page first attempts to load the published package data. If the dynamic record is absent or unsuitable, the named legacy page renders so existing URLs keep working during migration. The final route, `/packages/:slug`, uses `DynamicPackageDetail` without a legacy fallback for newly catalogued packages.

This is transitional compatibility, not permission to maintain a second package data model indefinitely. `CharDham` was migrated to the dynamic-template path in the current session while preserving its fallback.
