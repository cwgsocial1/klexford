begin;

-- Agency examples have no individual author. The existing write policies
-- therefore admit only active administrators for these rows.
alter table public.portfolio_work
  alter column author_id drop not null,
  add column legacy_slug text unique check (legacy_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add column homepage_position smallint,
  add column cover_asset text,
  add column goal text not null default '' check (char_length(goal) <= 6000),
  add column scope text[] not null default '{}' check (
    case when coalesce(array_ndims(scope), 0) <= 1 then array_position(scope, null) is null else false end and
    char_length(array_to_string(scope, E'\n')) <= 12000
  ),
  add column handover text not null default '' check (char_length(handover) <= 6000),
  add column service_path text not null default '' check (
    char_length(service_path) <= 250 and
    (service_path = '' or service_path ~ '^(/[a-z0-9]+(-[a-z0-9]+)*)+$')
  ),
  add constraint work_has_owner_or_legacy_slug check ((legacy_slug is null) = (author_id is not null)),
  add constraint work_bundled_cover check (
    cover_asset is null or (
      legacy_slug is not null and image_path is null and
      cover_asset ~ '^/images/[[:alnum:]_-]+\.(jpg|jpeg|png|webp|avif)$'
    )
  );

-- The original owner-prefix check still applies to every individual author's
-- project. Validate upload names explicitly for rows with no individual owner.
alter table public.portfolio_work
  add constraint work_agency_upload_path check (
    author_id is not null or image_path is null or
    image_path ~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[[:alnum:]_-]+\.(jpg|jpeg|png|webp|avif)$'
  );

-- The slug is a permanent published URL. Clients may update the copy and
-- cover but cannot assign a legacy slug or alter the author.
grant insert (goal, scope, handover, service_path, cover_asset),
      update (goal, scope, handover, service_path, cover_asset)
  on public.portfolio_work to authenticated;

with originals(position, homepage_position, legacy_slug, title, category, audience, summary, cover_asset, goal, scope, handover, service_path) as (
  values
  (
    1, 1, 'debut-novel-launch-campaign', 'Debut novel launch campaign', 'Book Marketing', 'Authors & Publishers',
    'Positioning review, launch plan, email sequence and promotional assets for a debut novelist.',
    '/images/bookLaunch.jpg',
    'Give a debut novelist a clear introduction to their book and a practical plan for reaching readers around release.',
    array[
      'Identify the book’s genre, comparable titles and the promise on the first page.',
      'Draft a launch email, a sample chapter invitation and a schedule for the author’s existing channels.',
      'Separate the author’s approvals from the studio’s production tasks in a shared calendar.'
    ],
    'Before release, test the sample download and retailer links. After release, review qualified visits and email engagement where the author has access.',
    '/book-author-services/book-marketing'
  ),
  (
    2, 4, 'author-website-newsletter', 'Author website & newsletter', 'Website', 'Authors & Publishers',
    'A fast author site with book pages, newsletter signup and reader journey.',
    '/images/authors_publishers.jpg',
    'Give readers one place to find an author’s books, read a sample and choose whether to receive the next newsletter.',
    array[
      'Map the reader journey from the author bio to a book detail page.',
      'Give each book a synopsis, accessible sample and clearly named purchase destinations.',
      'Connect the signup form to a welcome email and document the handover.'
    ],
    'Try the reader journey on a phone. Use a test subscription to check the welcome message and preference controls.',
    '/website-development'
  ),
  (
    3, 2, 'cleaning-company-booking-crm', 'Cleaning company booking CRM', 'Automation', 'Home-Service Businesses',
    'Estimate requests flow into a GoHighLevel pipeline with automatic follow-up and reminders.',
    '/images/home_services.jpg',
    'Help a cleaning business track estimate requests from the first website visit through booking.',
    array[
      'Collect the service type, preferred date and contact details on one form.',
      'Assign each request to a coordinator and show its current stage in a booking pipeline.',
      'Send a reminder only when a reply is due and stop the sequence once the client responds.'
    ],
    'Walk a sample inquiry through request, estimate, reply and booking. Check for duplicate reminders when the same contact returns.',
    '/crm-automation'
  ),
  (
    4, 5, 'non-fiction-cover-interior', 'Non-fiction cover & interior', 'Book Design', 'Authors & Publishers',
    'Cover design, paperback interior and EPUB conversion for a business book.',
    '/images/book_author_services.jpg',
    'Carry a business author’s visual identity from a print cover to a readable digital edition.',
    array[
      'Agree on trim size, target reader, cover hierarchy and final manuscript.',
      'Develop a cover direction and a sample chapter before laying out the full book.',
      'Prepare a print-ready interior and a reflowable EPUB with chapter navigation.'
    ],
    'Inspect the print proof at actual size, then check navigation and typography on two screen sizes.',
    '/book-author-services'
  ),
  (
    5, 6, 'local-clinic-seo-ads', 'Local clinic SEO & ads', 'Growth Studio', 'Appointment-Based Businesses',
    'Local SEO clean-up and a paid search campaign with monthly reporting.',
    '/images/growth_studio.jpg',
    'Help prospective visitors find the right clinic service and understand how to request an appointment.',
    array[
      'Review service pages for clear location, hours and booking information.',
      'Agree on a search campaign brief, approved copy, geographic focus and spending limit.',
      'Separate booking requests from routine page visits in the reporting plan.'
    ],
    'Test the appointment journey and agree on a reporting period. Review campaign costs alongside confirmed inquiries.',
    '/growth-studio'
  ),
  (
    6, 3, 'coach-brand-identity', 'Coach brand identity', 'Branding', 'Creators & Personal Brands',
    'Logo, colour palette, typography and social templates for a coaching brand.',
    '/images/branding_creative.jpg',
    'Give a coach a recognisable identity across a service page, presentation and social posts.',
    array[
      'Review the coach’s positioning and choose one visual direction.',
      'Develop a wordmark, colour palette and practical type hierarchy.',
      'Apply the identity to a service page mockup and reusable post templates.'
    ],
    'Check legibility at mobile size, test each logo variation on light and dark backgrounds, and package approved source files.',
    '/branding-creative'
  )
), prior as (
  select coalesce(min(created_at), now()) as first_created from public.portfolio_work
)
insert into public.portfolio_work
  (author_id, legacy_slug, homepage_position, title, category, audience, summary, cover_asset,
   goal, scope, handover, service_path, status, created_at)
select null, legacy_slug, homepage_position, title, category, audience, summary, cover_asset,
       goal, scope, handover, service_path, 'published', first_created - position * interval '1 second'
from originals cross join prior;

commit;
