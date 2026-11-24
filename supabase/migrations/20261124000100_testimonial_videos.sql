alter table public.testimonials
  add column video_path text check (video_path ~ ('^' || author_id::text || '/[[:alnum:]_-]+\.(mp4|webm)$')),
  drop constraint testimonials_quote_check,
  add constraint testimonials_quote_check check (
    char_length(trim(quote)) <= 3000 and (char_length(trim(quote)) > 0 or video_path is not null)
  );
grant insert (video_path), update (video_path) on public.testimonials to authenticated;
create index testimonial_video_path on public.testimonials(video_path) where video_path is not null;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('testimonial-videos','testimonial-videos',false,52428800,array['video/mp4','video/webm']);
create function klexford_private.video_published(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.testimonials where video_path=object_path and status='published');
$$;
-- A video can be attached to a draft while another editor is cleaning up an
-- earlier revision. Serialize attachment and deletion for this object name.
create function klexford_private.video_unused(object_path text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(object_path,1));
  return not exists(select 1 from public.testimonials where video_path=object_path);
end;
$$;
revoke all on function klexford_private.video_published(text), klexford_private.video_unused(text) from public,anon,authenticated;
grant execute on function klexford_private.video_published(text) to anon,authenticated;
grant execute on function klexford_private.video_unused(text) to authenticated;
create policy klexford_public_videos on storage.objects for select to anon,authenticated
using (bucket_id='testimonial-videos' and klexford_private.video_published(name));
create policy klexford_staff_videos on storage.objects for select to authenticated
using (bucket_id='testimonial-videos' and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('testimonials.manage')))));
create policy klexford_new_videos on storage.objects for insert to authenticated
with check (bucket_id='testimonial-videos' and name ~ '^[0-9a-f-]{36}/[[:alnum:]_-]+\.(mp4|webm)$'
  and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('testimonials.manage')))));
create policy klexford_cleanup_videos on storage.objects for delete to authenticated
using (bucket_id='testimonial-videos' and klexford_private.video_unused(name)
  and ((select klexford_private.is_admin()) or (split_part(name,'/',1)=(select auth.uid())::text and (select klexford_private.can('testimonials.manage')))));
create function klexford_private.check_testimonial_video() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.video_path is not null then
    perform pg_advisory_xact_lock(hashtextextended(new.video_path,1));
    if not exists (select 1 from storage.objects where bucket_id='testimonial-videos' and name=new.video_path) then
      raise exception 'Upload the video before saving.' using errcode='23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function klexford_private.check_testimonial_video() from public,anon,authenticated;
create trigger require_video_object before insert or update of video_path,status on public.testimonials
for each row execute function klexford_private.check_testimonial_video();

