# Backend Migration Rules

- `database/schema.sql` and `MIGRATION_PLAN.md` are the source of truth. Do not invent new tables or rename columns without flagging it first.
- Before writing code for any phase, report which files you will touch, which existing Supabase calls stay untouched, and which get replaced.
- Never claim a build/lint succeeded without pasting the actual terminal output in your response.
- Work one phase of `MIGRATION_PLAN.md` at a time. Do not start the next phase until explicitly approved.
- Do not delete `server/razorpay-server.ts` or any Supabase table until Phase 4 is explicitly approved.

- NEVER run DROP TABLE, TRUNCATE, ALTER TABLE ... DROP COLUMN, or any statement that deletes data or schema against the live production database, under any circumstances, even if it appears to be the only way to resolve a conflict. If a change requires something destructive, STOP and present the conflict as a question, with options, and wait for explicit written approval naming the exact statement before running it. This applies even if a prior instruction seemed to imply permission to 'proceed' or 'fix' something.

  From now on, all schema changes must first be run against a local or staging copy of the database, never directly against production. If no staging copy exists, create one (e.g. a second cPanel MySQL database, or a local MySQL install) before making any further schema changes.

