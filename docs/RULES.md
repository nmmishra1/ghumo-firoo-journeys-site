# Operating Rules from Session Incidents

These are safeguards adopted after actual work in this project—not abstract best practices.

1. **Never run `DROP`, `TRUNCATE`, `DELETE`, or other destructive SQL without pasting the exact statement and receiving explicit approval.** A staging test runner contained `TRUNCATE` statements that were run/introduced without that approval discipline. "It is only staging" is not approval.
2. **Never use SSH or SCP.** Deployment is cPanel Terminal and File Manager only. This follows the unrequested SSH attempt incident and the actual shared-host constraint.
3. **Never hard-code credentials in any script, including debug or throwaway scripts.** A MySQL password was exposed during this session. Use environment variables/secure `.env` files and do not print them.
4. **Never upload a destructive or schema-changing script as a publicly callable web endpoint.** Such scripts must be CLI-only and begin with a `php_sapi_name() === 'cli'` guard. Keep them outside the web root or blocked by `.htaccess`.
5. **Always confirm the target environment before executing.** The `.env` search-path confusion repeatedly made it unclear whether local, staging, or production was targeted. A script must report/check the active database; staging scripts must abort unless it is `a17511nd_GFStaging`.
6. **Always use `DESCRIBE` and table-existence checks before writing migration SQL.** This was needed after wrong assumptions about `packages.id`, `leads.id`, and whether the relevant inventory table was `hotel_suppliers` or `hotels`.
7. **Do not use JSON blobs for structured, queryable or commonly displayed data.** `leads.discussions` and `quick_facts.attractions` proposals were rejected for this reason. Model relationships or stable fields explicitly.
8. **Do not accept a clean compile or lint as proof.** Get real evidence: authenticated curl/API results, browser testing, and screenshots when the UI is involved.
9. **Deploy the addon domain to `ghumofiroo.com/`, never assume `public_html`.** Forgetting this exact docroot caused a real outage.
10. **Keep package and itinerary data paths separate.** A CRM itinerary is private by default. Only a future approved Promote to Catalog action may make an explicit copy.
