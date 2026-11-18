# Klexford

Klexford is a React and TypeScript agency website. Its admin and expert workspaces use Supabase Auth, Postgres and Storage. Expert invitations and inquiry intake run on Supabase Edge Functions in production. The Vite development server calls the same handlers locally.

## Run locally

Use Node.js 22 or newer. Install the dependencies, then copy the environment template.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the address printed by Vite. Use `npm run build` to type-check and produce the production site in `dist/`.

Run `npm test` to check the invitation API. The database policy regression suite uses a disposable PostgreSQL instance in PGlite with test Auth and Storage tables.

```sh
npm ci --prefix supabase/tests
npm test --prefix supabase/tests
```

## Connect Supabase

The Klexford project reference is `xkjfggdqswzmbriwaxgk`. The live site at `https://klexford.vercel.app` uses the project URL and public browser key in `config/public-supabase.json`. The hosted Edge Function receives its privileged credentials from Supabase. For local development or a custom deployment, obtain the following settings from **Project Settings → API Keys** and set them in the appropriate environment.

| Variable | Used by | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | `https://xkjfggdqswzmbriwaxgk.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Project publishable key or legacy anon key |
| `SUPABASE_URL` | Server functions | The same project URL |
| `SUPABASE_SECRET_KEY` | Server functions | Project secret key or legacy service-role key |
| `PUBLIC_SITE_ORIGIN` | Invitation redirects and sitemap | Deployed website origin, for example `https://klexford.vercel.app` |

Keep the secret key exclusively in server configuration. Vite embeds variables prefixed with `VITE_` into the client bundle. Restart Vite or rebuild the deployment after changing browser configuration.

From the repository root, sign in with an account that can manage the project and apply the versioned schema.

```sh
npx supabase login
npx supabase link --project-ref xkjfggdqswzmbriwaxgk
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy klexford-workspace --use-api
```

In Supabase **Authentication → URL Configuration**, set the site URL and allow the exact `/account/password` redirect for production and any local development origins you use. Configure Auth email delivery for real recipients. Then provision the first administrator following the account-specific SQL in the [database setup guide](supabase/README.md).

## Use the workspaces

- **Administrators** sign in at `/admin`. Under **Team access**, invite an expert by email, or choose **Create private link** for a new expert and send the one-time link privately to that person. Select the expert, enable workspace access, choose their permissions and save. New accounts start inactive. Administrators can also curate work and testimonials, review inquiries, handle invoices, and edit public contact and payment settings.
- **Experts** sign in at `/expert`. Each expert can draft their own portfolio projects and testimonials when granted access. Separate publishing permissions control whether they can publish, change or withdraw public entries. Invoice access is scoped to their own invoices. Inquiry access grants visibility into submitted briefs across the team.
- **Visitors** see published projects on the homepage and `/work`. Each project has its own shareable page. Published testimonials appear on the homepage. Illustrative projects are labelled separately. To remove a published entry from the website while keeping it in the workspace, save it as a draft.
- **Clients** can open the private share link for an issued invoice. Under **Admin → Settings**, administrators choose which payment methods appear by filling in the bank transfer details, crypto wallet details, or hosted payment link. Bank settings include the receiving currency and routing instructions. Crypto settings identify the coin, network, receiving address, and any memo or transfer instructions. Updating these settings also updates outstanding invoice links. Administrators record confirmed payments in the portal.

Earlier demonstration accounts and browser-local records are separate from Supabase. Create real accounts for the team. The public services, audience pages, sample projects and editorial copy are maintained in `src/data.ts`.

## Inquiry delivery

The server saves submitted project briefs, expert applications and visibility checks in Supabase. Authorized team members can review them under **Inquiries**. Repeated submissions with the same request ID reuse the stored record. If online intake is unavailable the form can prepare an email draft, which the visitor sends in their mail app.

For installations that also forward inquiries to a CRM, configure `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `KLEXFORD_INQUIRY_WEBHOOK` on the server. An optional `KLEXFORD_INQUIRY_WEBHOOK_TOKEN` supplies bearer authentication. The receiver should deduplicate by the Idempotency-Key header. With CRM forwarding enabled, the server acknowledges the request after the receiver accepts it.
