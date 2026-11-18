# Klexford Website

Multi-page agency website + Admin and Expert portals with invoicing.
Built with React, TypeScript, Tailwind CSS and React Router.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build in /dist

## Pages
Home, Services (+5 department pages), Book Marketing, Who We Help (+6 audience pages),
Our Work, Team & Experts, Become an Expert, Resources, Tools, Free Visibility Check,
About, Start a Project, Privacy, Terms, 404.

## Portals
- Login: /login
- Admin: /admin  -> overview, all invoices, create invoice, experts/accounts, inquiries, payment settings
- Expert: /expert -> overview, own invoices, create invoice
- Public invoice & payment page: /invoice/:id (share this link with clients)

Demo accounts:
- admin@klexford.com / admin123
- expert@klexford.com / expert123

## Editing content
- Text, services, audiences, team, work, images: src/data.ts
- Photography is served from public/images. Update src/data.ts to change page images and src/pages/Home.tsx to change the rotating homepage feature. Fonts and their licenses are in public/fonts.

## IMPORTANT before going live
Data is currently stored in the browser (localStorage) in src/lib/store.ts — fine for demos,
NOT for real use (each browser sees its own data, and passwords aren't secure).
To go live:
1. Replace store.ts functions with a real backend (e.g. Supabase or Firebase) with proper auth.
2. Connect a payment gateway (Paystack, Flutterwave or Stripe) in InvoiceView -> payCard()
   in src/dashboard/Dashboard.tsx, and verify payments on the server before marking invoices paid.
   Until then, "Pay with card" is a demo (or opens the payment link set in Admin > Payment Settings).

## Project, collaboration and visibility inquiries

On a static host or in Vite, forms prepare an email draft and save a copy in the current browser. The sender completes delivery in their mail app. The admin portal shows browser-local demonstration data.

For online intake on Vercel, set the following **server-side** environment variables and redeploy:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — a private Upstash Redis database with write access.
- `KLEXFORD_INQUIRY_WEBHOOK` — your HTTPS CRM intake endpoint. Optionally set `KLEXFORD_INQUIRY_WEBHOOK_TOKEN` for bearer authentication.

The receiver should upsert the contact by email or contactId, deduplicate events using the Idempotency-Key header, assign the role in data.owner to your actual team member, and return a successful HTTP status only after accepting the inquiry. Records persist under klexford:inquiry:<requestId>. The function validates and rate limits requests, stores the brief before forwarding it, and acknowledges delivery only after the receiver accepts it. An interrupted handoff leaves a pending record; a retry with the same request ID resumes it. Configure database backups, access and retention with the hosting account before collecting live information.
