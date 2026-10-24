-- Run this once in the Supabase SQL editor.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  client_run_id text not null unique,
  score integer not null check (score >= 0),
  finished_at timestamptz not null default now()
);

create or replace view public.leaderboard
with (security_invoker = false) as
select
  btrim(p.name) as name,
  s.score,
  s.finished_at as played_at
from public.game_sessions s
join public.players p on p.id = s.player_id
order by s.score desc, s.finished_at asc;

alter table public.players enable row level security;
alter table public.game_sessions enable row level security;

revoke all on table public.players from anon, authenticated;
revoke all on table public.game_sessions from anon, authenticated;
grant select on table public.leaderboard to anon, authenticated;

create or replace function public.submit_score(
  player_name text,
  player_email text,
  player_phone text,
  player_score integer,
  run_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rider_id uuid;
begin
  insert into public.players (name, email, phone)
  values (btrim(player_name), nullif(btrim(player_email), ''), btrim(player_phone))
  returning id into rider_id;

  insert into public.game_sessions (player_id, client_run_id, score)
  values (rider_id, run_id, player_score);
exception
  when unique_violation then
    return;
end;
$$;

grant execute on function public.submit_score(text, text, text, integer, text) to anon, authenticated;
