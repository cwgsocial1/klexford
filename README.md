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
