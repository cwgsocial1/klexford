# Klexford workspace setup

Apply the SQL file in `migrations` to the project's Supabase SQL Editor, or link the Supabase CLI to the correct project and run `supabase db push`. This migration expects Supabase Auth and Storage. It provisions a private image bucket, public publishing tables, staff tables and access policies.

## Create the first administrator

Create or invite a **real account that you control** in Supabase Authentication → Users. Copy its user UUID from Supabase. In the SQL Editor, replace the example UUID below and run the statement as the database owner.

```sql
update public.profiles
set role='admin', active=true
where id='00000000-0000-0000-0000-000000000000'::uuid
returning id,email,role,active;
```

Confirm that the returned UUID and email belong to your account. Sign in at `/admin`. Additional Auth users start as inactive experts with no grants. An administrator can activate an expert and assign grants. Once activated, experts can sign in at `/expert`. Profile roles cannot be promoted or modified by the browser. Set the Auth site URL and permitted password/invitation redirect URLs to the site's own origins.

## Publishing behavior

An expert can create or edit their own drafts with the corresponding management grant. The independent publication grant is also required to publish, edit, unpublish or remove already published entries. Admins can work across authors. Disabling an account or changing a grant takes effect at the next authorized request. Published entries remain visible until unpublished or removed. Previously issued signed image URLs can work until their short expiry.

Upload JPEG, PNG, WebP or AVIF covers up to 8 MiB under the work author's UUID folder. Files are immutable, so replace a cover by uploading a new unique filename, updating the portfolio row, then deleting the old file. PostgREST cannot list invoices or inquiries for visitors. Recipients can view sent, overdue and paid invoices through a unique share token. Inquiry intake runs through the server-only RPC and is idempotent for retries with the same request ID.


## Run database authorization tests

From the repository root, run the following commands.

```sh
npm --prefix supabase/tests ci
npm --prefix supabase/tests test
```

The suite runs the migrations in an in-memory PostgreSQL database with fixtures for the Supabase-managed Auth and Storage tables. It checks access as anonymous visitors, active and disabled experts, administrators and the service role. A hosted project is needed to exercise email delivery and the Storage HTTP API.
