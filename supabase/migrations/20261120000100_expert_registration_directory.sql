begin;

-- These values are deliberately separate from the applicant's self-reported details.
alter table public.profiles
  add column expert_registration boolean not null default false,
  add column email_verified boolean not null default false,
  add column has_directory_name boolean not null default false,
  add column specialty text not null default '' check (char_length(specialty) <= 160),
  add column bio text not null default '' check (char_length(bio) <= 600),
  add column portfolio_url text not null default '',
  add column availability text not null default '' check (char_length(availability) <= 160),
  add column time_zone text not null default '' check (char_length(time_zone) <= 80);

create function klexford_private.registration_text(metadata jsonb, field_name text, max_chars integer)
returns text language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(metadata -> field_name) = 'string'
    then left(btrim(metadata ->> field_name), max_chars) else '' end;
$$;
revoke all on function klexford_private.registration_text(jsonb,text,integer) from public,anon,authenticated;

create function klexford_private.valid_portfolio_url(url text)
returns boolean language sql immutable set search_path = '' as $$
  select url = '' or (
    char_length(url) <= 2048 and url ~ '^https://[^/?#@[:space:]]+([/?#].*)?$'
    and url !~ '[[:cntrl:][:space:]]' and strpos(url, chr(92)) = 0
  );
$$;
revoke all on function klexford_private.valid_portfolio_url(text) from public,anon,authenticated;
grant execute on function klexford_private.valid_portfolio_url(text) to authenticated,service_role;
alter table public.profiles add constraint expert_portfolio_https
  check (klexford_private.valid_portfolio_url(portfolio_url));

-- Freeze application details when the Auth account is created. Later, user-editable
-- metadata changes cannot republish a profile or revise an administrator's approval.
create or replace function klexford_private.sync_auth_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  applying boolean := metadata @> '{"expert_registration": true}';
  full_name text := klexford_private.registration_text(metadata,'display_name',160);
  portfolio text := klexford_private.registration_text(metadata,'portfolio_url',2049);
begin
  if tg_op = 'INSERT' then
    insert into public.profiles (
      id,email,display_name,expert_registration,email_verified,has_directory_name,
      specialty,bio,portfolio_url,availability,time_zone
    ) values (
      new.id, coalesce(new.email,''), coalesce(nullif(full_name,''),nullif(left(split_part(new.email,'@',1),160),''),'Team member'),
      applying, new.email_confirmed_at is not null, full_name <> '',
      case when applying then klexford_private.registration_text(metadata,'specialty',160) else '' end,
      case when applying then klexford_private.registration_text(metadata,'bio',600) else '' end,
      case when applying and klexford_private.valid_portfolio_url(portfolio) then portfolio else '' end,
      case when applying then klexford_private.registration_text(metadata,'availability',160) else '' end,
      case when applying then klexford_private.registration_text(metadata,'time_zone',80) else '' end
    ) on conflict (id) do nothing;
  else
    update public.profiles set email=coalesce(new.email,''), email_verified=(new.email_confirmed_at is not null)
    where id=new.id;
  end if;
  return new;
end;
$$;
drop trigger klexford_auth_email on auth.users;
create trigger klexford_auth_email after update of email,email_confirmed_at on auth.users
for each row execute function klexford_private.sync_auth_profile();

-- Invited/legacy experts keep their workspace status. A private, email-derived
-- display label does not become a public directory name as a side effect of upgrading.
update public.profiles p
set email_verified = u.email_confirmed_at is not null,
    has_directory_name = klexford_private.registration_text(u.raw_user_meta_data,'display_name',160) <> ''
from auth.users u where p.id=u.id;

create function klexford_private.mark_directory_name() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.display_name is distinct from old.display_name then
    new.has_directory_name := btrim(new.display_name) <> '';
  end if;
  return new;
end;
$$;
revoke all on function klexford_private.mark_directory_name() from public,anon,authenticated;
create trigger expert_display_name before update of display_name on public.profiles
for each row execute function klexford_private.mark_directory_name();

grant update(specialty,bio,portfolio_url) on public.profiles to authenticated;

-- The directory exposes a projection rather than permitting public profile-table
-- reads. The UUID tie-breaker makes indexed pages stable for identical names.
create index expert_directory_names on public.profiles(lower(display_name), id)
  where role='expert' and active and email_verified and has_directory_name;
create function public.list_team_experts()
returns table(display_name text, specialty text, bio text, portfolio_url text)
language sql stable security definer set search_path = '' as $$
  select p.display_name, p.specialty, p.bio, p.portfolio_url
  from public.profiles p
  where p.role='expert' and p.active and p.email_verified and p.has_directory_name
    and btrim(p.display_name) <> '' and btrim(p.display_name) !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  order by lower(p.display_name), p.id;
$$;
revoke all on function public.list_team_experts() from public,anon,authenticated,service_role;
grant execute on function public.list_team_experts() to anon,authenticated;

-- Registration requests awaiting an invitation contain applicant-only details.
-- This condition applies in addition to the regular inquiry read/triage grants.
alter table public.inquiries
  drop constraint inquiries_name_check,
  add constraint inquiries_name_check check (
    char_length(btrim(name)) between 1 and
      case when kind='expert' and data->>'expertRegistration'='true' then 160 else 150 end
  );
grant select, update(status) on public.inquiries to service_role;
create policy admin_expert_applications on public.inquiries as restrictive
for all to authenticated using (
  kind <> 'expert' or (data->>'expertRegistration') is distinct from 'true' or (select klexford_private.is_admin())
);

commit;
