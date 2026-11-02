-- HANDASAT (HandasatPrompStudio-GH) in Supabase project cultura-GH (ktqmwpbzcnzkhjskqisy). Applied 2026-11-02.
create table if not exists public.hps_learners (
  key_hash text primary key,
  name text not null default '',
  state jsonb not null default '{}'::jsonb,
  works jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_push timestamptz
);
comment on table public.hps_learners is 'HANDASAT (HandasatPrompStudio-GH): progress, notes, studio library and portfolio per learner. Identified by a private sync code (sha256 stored). Access via hps_ functions only.';
alter table public.hps_learners enable row level security;
revoke all on public.hps_learners from anon, authenticated;

create or replace function public.hps_pull(p_key text)
returns json language sql stable security definer set search_path to 'public', 'extensions' as $$
  select json_build_object('name', name, 'state', state, 'works', works, 'updated_at', updated_at)
    from public.hps_learners
   where p_key is not null and char_length(p_key) >= 16
     and key_hash = encode(digest(p_key, 'sha256'), 'hex');
$$;

create or replace function public.hps_push(p_key text, p_name text, p_state jsonb, p_works jsonb default null)
returns json language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare
  v_hash text;
  v_row public.hps_learners%rowtype;
begin
  if p_key is null or char_length(p_key) < 16 or char_length(p_key) > 64 then raise exception 'bad_key'; end if;
  if char_length(coalesce(p_name, '')) > 40 then raise exception 'bad_name'; end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' or pg_column_size(p_state) > 1000000 then raise exception 'bad_state'; end if;
  if p_works is not null and (jsonb_typeof(p_works) <> 'array' or pg_column_size(p_works) > 8000000) then raise exception 'bad_works'; end if;
  v_hash := encode(digest(p_key, 'sha256'), 'hex');
  select * into v_row from public.hps_learners where key_hash = v_hash for update;
  if not found then
    insert into public.hps_learners (key_hash, name, state, works, last_push)
    values (v_hash, btrim(coalesce(p_name, '')), p_state, coalesce(p_works, '[]'::jsonb), now());
  else
    if v_row.last_push > now() - interval '2 seconds' then raise exception 'too_fast'; end if;
    update public.hps_learners
       set name = btrim(coalesce(p_name, name)), state = p_state,
           works = coalesce(p_works, works), updated_at = now(), last_push = now()
     where key_hash = v_hash;
  end if;
  return json_build_object('updated_at', now());
end $$;

revoke all on function public.hps_pull(text) from public;
revoke all on function public.hps_push(text, text, jsonb, jsonb) from public;
grant execute on function public.hps_pull(text) to anon, authenticated;
grant execute on function public.hps_push(text, text, jsonb, jsonb) to anon, authenticated;

create table if not exists public.hps_ai_calls (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ok boolean not null default true
);
comment on table public.hps_ai_calls is 'HANDASAT: log of hps-improve calls (no content), used for the hourly rate limit. Written by the edge function only.';
alter table public.hps_ai_calls enable row level security;
revoke all on public.hps_ai_calls from anon, authenticated;
create index if not exists hps_ai_calls_created on public.hps_ai_calls (created_at);
