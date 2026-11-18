-- Run as the database owner. GoTrue owns authentication; these rows control workspace access.
begin;
create schema if not exists klexford_private;
revoke all on schema klexford_private from public;
grant usage on schema klexford_private to anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 160),
  role text not null default 'expert' check (role in ('admin', 'expert')),
  active boolean not null default false,
  permissions text[] not null default '{}' check (
    permissions <@ array['work.manage','work.publish','testimonials.manage','testimonials.publish','invoices.manage','inquiries.manage']::text[]
  )
);
create function klexford_private.sync_auth_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (id,email,display_name)
    values (new.id,coalesce(new.email,''),left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),nullif(split_part(new.email,'@',1),''),'Team member'),160))
    on conflict (id) do nothing;
  else
    update public.profiles set email=coalesce(new.email,'') where id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function klexford_private.sync_auth_profile() from public,anon,authenticated;
create trigger klexford_auth_created after insert on auth.users
for each row execute function klexford_private.sync_auth_profile();
create trigger klexford_auth_email after update of email on auth.users
for each row execute function klexford_private.sync_auth_profile();
insert into public.profiles (id,email,display_name)
select id,coalesce(email,''),left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),nullif(split_part(email,'@',1),''),'Team member'),160)
from auth.users on conflict (id) do nothing;

-- Role and grant values are never accepted from JWT user_metadata or from a signup form.
create function klexford_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and active and role='admin');
$$;
create function klexford_private.can(capability text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and active and (role='admin' or capability=any(permissions)));
$$;
revoke all on function klexford_private.is_admin(), klexford_private.can(text) from public,anon,authenticated;
grant execute on function klexford_private.is_admin(), klexford_private.can(text) to authenticated;
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,active,permissions) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated
using (id=(select auth.uid()) or (select klexford_private.is_admin()));
-- Admin rows are deliberately immutable through the client API.
create policy manage_experts on public.profiles for update to authenticated
using (role='expert' and (select klexford_private.is_admin()))
with check (role='expert' and (select klexford_private.is_admin()));

create function klexford_private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at=now(); return new; end;
$$;
revoke all on function klexford_private.touch_updated_at() from public,anon,authenticated;

create table public.portfolio_work (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 180),
  summary text not null check (char_length(trim(summary)) between 1 and 6000),
  category text not null default '' check (char_length(category)<=120),
  audience text not null default '' check (char_length(audience)<=120),
  image_path text check (image_path ~ ('^' || author_id::text || '/[[:alnum:]_-]+\.(jpg|jpeg|png|webp|avif)$')),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  quote text not null check (char_length(trim(quote)) between 1 and 3000),
  client_name text not null check (char_length(trim(client_name)) between 1 and 160),
  client_title text not null default '' check (char_length(client_title)<=250),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index work_publication on public.portfolio_work(status,created_at desc);
create index work_author on public.portfolio_work(author_id);
create index work_image on public.portfolio_work(image_path) where image_path is not null;
create index testimonial_publication on public.testimonials(status,created_at desc);
create index testimonial_author on public.testimonials(author_id);

-- Both USING and WITH CHECK use the status on their respective versions of the row.
-- This covers edits to published copy, unpublishing, and deletion as well as publication.
do $$
declare target text; capability text; rule text;
begin
  foreach target in array array['portfolio_work','testimonials'] loop
    capability := case when target='portfolio_work' then 'work' else 'testimonials' end;
    rule := format('((select klexford_private.is_admin()) or (author_id=(select auth.uid()) and (select klexford_private.can(%L)) and (status=''draft'' or (select klexford_private.can(%L)))))', capability||'.manage', capability||'.publish');
    execute format('alter table public.%I enable row level security',target);
    execute format('revoke all on public.%I from public,anon,authenticated',target);
    execute format('grant select on public.%I to anon,authenticated',target);
    execute format('grant delete on public.%I to authenticated',target);
    execute format('create policy published_content on public.%I for select to anon,authenticated using (status=''published'')',target);
    execute format('create policy workspace_content on public.%I for select to authenticated using ((select klexford_private.is_admin()) or (author_id=(select auth.uid()) and (select klexford_private.can(%L))))',target,capability||'.manage');
    execute format('create policy create_content on public.%I for insert to authenticated with check (%s)',target,rule);
    execute format('create policy edit_content on public.%I for update to authenticated using (%s) with check (%s)',target,rule,rule);
    execute format('create policy remove_content on public.%I for delete to authenticated using (%s)',target,rule);
    execute format('create trigger touch_updated before update on public.%I for each row execute function klexford_private.touch_updated_at()',target);
  end loop;
end;
$$;
grant insert (id,author_id,title,summary,category,audience,image_path,status), update(title,summary,category,audience,image_path,status) on public.portfolio_work to authenticated;
grant insert (id,author_id,quote,client_name,client_title,status), update(quote,client_name,client_title,status) on public.testimonials to authenticated;

-- Immutable object names prevent replacing approved public media through a draft upload.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',false,8388608,array['image/jpeg','image/png','image/webp','image/avif']);
create function klexford_private.media_published(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.portfolio_work where image_path=object_path and status='published');
$$;
-- A cover can be attached to a draft while another editor is cleaning up an
-- earlier revision. Serialize attachment and deletion for this object name.
create function klexford_private.media_unused(object_path text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(object_path,1));
  return not exists(select 1 from public.portfolio_work where image_path=object_path);
end;
$$;
revoke all on function klexford_private.media_published(text), klexford_private.media_unused(text) from public,anon,authenticated;
grant execute on function klexford_private.media_published(text) to anon,authenticated;
grant execute on function klexford_private.media_unused(text) to authenticated;
create policy klexford_public_images on storage.objects for select to anon,authenticated
using (bucket_id='portfolio-media' and klexford_private.media_published(name));
create policy klexford_staff_images on storage.objects for select to authenticated
using (bucket_id='portfolio-media' and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('work.manage')))));
create policy klexford_new_images on storage.objects for insert to authenticated
with check (bucket_id='portfolio-media' and name ~ '^[0-9a-f-]{36}/[[:alnum:]_-]+\.(jpg|jpeg|png|webp|avif)$'
  and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('work.manage')))));
create policy klexford_cleanup_images on storage.objects for delete to authenticated
using (bucket_id='portfolio-media' and klexford_private.media_unused(name)
  and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('work.manage')))));
create function klexford_private.check_portfolio_image() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.image_path is not null then
    perform pg_advisory_xact_lock(hashtextextended(new.image_path,1));
    if not exists (select 1 from storage.objects where bucket_id='portfolio-media' and name=new.image_path) then
      raise exception 'Upload the cover before saving.' using errcode='23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function klexford_private.check_portfolio_image() from public,anon,authenticated;
create trigger require_cover_object before insert or update of image_path,status on public.portfolio_work
for each row execute function klexford_private.check_portfolio_image();

create table public.site_settings (
  id boolean primary key default true check (id),
  agency_name text not null default 'Klexford' check (char_length(trim(agency_name)) between 1 and 100),
  contact_email text not null default 'hello@klexford.com' check (contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  updated_at timestamptz not null default now()
);
insert into public.site_settings default values;
alter table public.site_settings enable row level security;
revoke all on public.site_settings from public,anon,authenticated;
grant select on public.site_settings to anon,authenticated;
grant update(agency_name,contact_email) on public.site_settings to authenticated;
create policy public_site_settings on public.site_settings for select to anon,authenticated using (true);
create policy edit_site_settings on public.site_settings for update to authenticated using ((select klexford_private.is_admin())) with check ((select klexford_private.is_admin()));
create trigger touch_updated before update on public.site_settings for each row execute function klexford_private.touch_updated_at();

create table public.payment_settings (
  id integer primary key default 1 check (id=1),
  bank_name text not null default '', account_name text not null default '', account_number text not null default '',
  payment_url text not null default '' check (payment_url='' or payment_url ~ '^https://[^[:space:]]+$'),
  updated_at timestamptz not null default now()
);
insert into public.payment_settings default values;
alter table public.payment_settings enable row level security;
revoke all on public.payment_settings from public,anon,authenticated;
grant select on public.payment_settings to authenticated;
grant update(bank_name,account_name,account_number,payment_url) on public.payment_settings to authenticated;
create policy payment_admin_read on public.payment_settings for select to authenticated using ((select klexford_private.is_admin()));
create policy payment_admin_update on public.payment_settings for update to authenticated using ((select klexford_private.is_admin())) with check ((select klexford_private.is_admin()));
create trigger touch_updated before update on public.payment_settings for each row execute function klexford_private.touch_updated_at();

create sequence klexford_private.invoice_numbers start 1001;
grant usage on sequence klexford_private.invoice_numbers to authenticated;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  owner_name text not null,
  number text not null unique default ('KLX-'||nextval('klexford_private.invoice_numbers')::text),
  share_token uuid not null unique default gen_random_uuid(),
  client_name text not null check(char_length(trim(client_name)) between 1 and 200),
  client_email text not null check (char_length(client_email)<=254 and client_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  service text not null default '', currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  items jsonb not null check (jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 250),
  discount numeric(15,2) not null default 0 check (discount>=0),
  tax_rate numeric(8,3) not null default 0 check (tax_rate between 0 and 100),
  notes text not null default '' check (char_length(notes)<=12000),
  issue_date date not null default current_date, due_date date not null check (due_date>=issue_date),
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index invoice_owner on public.invoices(owner_id);
create function klexford_private.check_invoice() returns trigger
language plpgsql security definer set search_path='' as $$
declare item jsonb;
begin
  if tg_op='INSERT' then
    select display_name into new.owner_name from public.profiles where id=new.owner_id;
  end if;
  if tg_op='UPDATE' and old.status='paid' then
    raise exception 'A paid invoice cannot be changed.' using errcode='23514';
  end if;
  if new.status='paid' then
    if not klexford_private.is_admin() then
      raise exception 'Only an administrator may confirm payment.' using errcode='42501';
    end if;
    new.paid_at=now();
  else
    new.paid_at=null;
  end if;
  for item in select value from jsonb_array_elements(new.items) loop
    if jsonb_typeof(item->'description') is distinct from 'string'
      or char_length(trim(item->>'description')) not between 1 and 1000
      or jsonb_typeof(item->'qty') is distinct from 'number'
      or jsonb_typeof(item->'rate') is distinct from 'number'
      or (item->>'qty')::numeric <= 0 or (item->>'rate')::numeric < 0 then
      raise exception 'Each line needs a description, positive quantity and nonnegative rate.' using errcode='23514';
    end if;
  end loop;
  new.updated_at=now();
  return new;
end;
$$;
revoke all on function klexford_private.check_invoice() from public,anon,authenticated;
create trigger prepare_invoice before insert or update on public.invoices for each row execute function klexford_private.check_invoice();
alter table public.invoices enable row level security;
revoke all on public.invoices from public,anon,authenticated;
grant select,delete on public.invoices to authenticated;
grant insert(id,owner_id,client_name,client_email,service,currency,items,discount,tax_rate,notes,issue_date,due_date,status,paid_at),
      update(client_name,client_email,service,currency,items,discount,tax_rate,notes,issue_date,due_date,status,paid_at) on public.invoices to authenticated;
create policy invoice_read on public.invoices for select to authenticated
using ((select klexford_private.is_admin()) or (owner_id=(select auth.uid()) and (select klexford_private.can('invoices.manage'))));
create policy invoice_create on public.invoices for insert to authenticated
with check ((select klexford_private.is_admin()) or (owner_id=(select auth.uid()) and (select klexford_private.can('invoices.manage'))));
create policy invoice_change on public.invoices for update to authenticated
using (status<>'paid' and ((select klexford_private.is_admin()) or (owner_id=(select auth.uid()) and (select klexford_private.can('invoices.manage')))))
with check ((select klexford_private.is_admin()) or (owner_id=(select auth.uid()) and (select klexford_private.can('invoices.manage'))));
create policy invoice_remove on public.invoices for delete to authenticated
using (status<>'paid' and ((select klexford_private.is_admin()) or (status='draft' and owner_id=(select auth.uid()) and (select klexford_private.can('invoices.manage')))));

-- Invoker privileges preserve invoice ownership and access revocation for totals.
create function public.get_invoice_balances()
returns table(currency text, paid numeric, outstanding numeric, overdue numeric)
language sql stable security invoker set search_path='' as $$
  with amounts as (
    select i.currency,
      case when i.status='paid' then 'paid'
           when i.status='overdue' or i.due_date<current_date then 'overdue'
           else 'outstanding' end as category,
      round(greatest(lines.subtotal-i.discount,0)*(1+i.tax_rate/100),2) as total
    from public.invoices i
    cross join lateral (
      select sum((item->>'qty')::numeric*(item->>'rate')::numeric) as subtotal
      from jsonb_array_elements(i.items) as item
    ) lines
    where i.status in ('paid','sent','overdue')
  )
  select a.currency,
    coalesce(sum(a.total) filter(where a.category='paid'),0),
    coalesce(sum(a.total) filter(where a.category='outstanding'),0),
    coalesce(sum(a.total) filter(where a.category='overdue'),0)
  from amounts a group by a.currency order by a.currency;
$$;
revoke all on function public.get_invoice_balances() from public,anon,authenticated,service_role;
grant execute on function public.get_invoice_balances() to authenticated;

-- A dedicated high-entropy share token grants access to one issued invoice.
-- Neither anonymous SELECT nor a lookup by sequential invoice number is granted.
create function public.get_shared_invoice(token uuid) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'invoice',to_jsonb(i) - array['owner_id','share_token'],
    'settings',jsonb_build_object('bank_name',s.bank_name,'account_name',s.account_name,'account_number',s.account_number,'payment_url',s.payment_url)
  )
  from public.invoices i cross join public.payment_settings s
  where i.share_token=token and i.status in ('sent','paid','overdue') and s.id=1;
$$;
revoke all on function public.get_shared_invoice(uuid) from public,anon,authenticated;
grant execute on function public.get_shared_invoice(uuid) to anon,authenticated;

create table public.inquiries (
  id uuid primary key, kind text not null check(kind in ('project','visibility','expert')),
  name text not null check (char_length(trim(name)) between 1 and 150),
  email text not null check (char_length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  data jsonb not null check (jsonb_typeof(data)='object'),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
create index inquiry_date on public.inquiries(created_at desc);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from public,anon,authenticated;
grant select,update(status) on public.inquiries to authenticated;
create policy inquiry_read on public.inquiries for select to authenticated using ((select klexford_private.can('inquiries.manage')));
create policy inquiry_triage on public.inquiries for update to authenticated using ((select klexford_private.can('inquiries.manage'))) with check ((select klexford_private.can('inquiries.manage')));

create table klexford_private.intake_limits (
  source_hash text primary key, since timestamptz not null, used integer not null
);
create index intake_expiration on klexford_private.intake_limits(since);
revoke all on klexford_private.intake_limits from public,anon,authenticated;
create function public.record_inquiry(request_id uuid, inquiry_kind text, contact_name text, contact_email text, details jsonb, source_hash text) returns text
language plpgsql security definer set search_path='' as $$
declare existing public.inquiries%rowtype; use_count integer;
begin
  if source_hash is null or char_length(source_hash) not between 1 and 128 then raise exception 'Missing rate limit key.' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
  select * into existing from public.inquiries where id=request_id;
  if found then
    if (existing.kind,existing.name,existing.email,existing.data) is not distinct from (inquiry_kind,contact_name,contact_email,details) then
      return 'duplicate';
    end if;
    return 'conflict';
  end if;
  delete from klexford_private.intake_limits r where r.since<=now()-interval '1 hour';
  insert into klexford_private.intake_limits as r values (source_hash,now(),1)
    on conflict on constraint intake_limits_pkey do update set used=r.used+1 where r.used<12 returning used into use_count;
  if use_count is null then return 'limited'; end if;
  insert into public.inquiries (id,kind,name,email,data) values (request_id,inquiry_kind,contact_name,contact_email,details);
  return 'created';
end;
$$;
revoke all on function public.record_inquiry(uuid,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.record_inquiry(uuid,text,text,text,jsonb,text) to service_role;

-- The server uses the service key only after separately verifying the caller's admin identity.
grant select,update(display_name,permissions,active) on public.profiles to service_role;
commit;
