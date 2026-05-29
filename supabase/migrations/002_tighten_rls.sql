-- Tighter leaderboard RLS: score caps, level caps, rate limits, name rules.
-- Safe to re-run (drops/recreates policies and function).

-- Normalize lookups for rate limiting
create index if not exists scores_player_recent_idx
  on scores (lower(player_name), created_at desc);

create index if not exists scores_player_mode_recent_idx
  on scores (lower(player_name), game_mode, created_at desc);

-- Drop permissive insert policy
drop policy if exists "public insert scores" on scores;

-- Caps + rate limits enforced for anon/authenticated inserts
create or replace function public.scores_insert_allowed(
  p_player_name text,
  p_game_mode text,
  p_score integer,
  p_level_reached integer
) returns boolean
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  name_norm text;
  recent_all integer;
  recent_mode integer;
  score_cap integer;
  level_cap integer;
begin
  name_norm := lower(trim(p_player_name));

  if char_length(trim(p_player_name)) < 1
     or char_length(trim(p_player_name)) > 24
     or trim(p_player_name) !~ '^[[:alnum:]][[:alnum:] _.''-]{0,23}$'
  then
    return false;
  end if;

  if p_game_mode not in ('train', 'memory', 'reaction', 'echo') then
    return false;
  end if;

  score_cap := case p_game_mode
    when 'reaction' then 250
    when 'memory' then 25000
    when 'train' then 50000
    when 'echo' then 15000
    else 0
  end;

  level_cap := case p_game_mode
    when 'reaction' then 5
    when 'memory' then 200
    when 'train' then 200
    when 'echo' then 50
    else 0
  end;

  if p_score < 0 or p_score > score_cap then
    return false;
  end if;

  if p_level_reached is null
     or p_level_reached < 1
     or p_level_reached > level_cap
  then
    return false;
  end if;

  select count(*)::integer into recent_all
  from scores s
  where lower(trim(s.player_name)) = name_norm
    and s.created_at > now() - interval '1 hour';

  if recent_all >= 15 then
    return false;
  end if;

  select count(*)::integer into recent_mode
  from scores s
  where lower(trim(s.player_name)) = name_norm
    and s.game_mode = p_game_mode
    and s.created_at > now() - interval '1 hour';

  if recent_mode >= 6 then
    return false;
  end if;

  return true;
end;
$$;

create policy "public insert scores" on scores
  for insert
  to anon, authenticated
  with check (
    scores_insert_allowed(player_name, game_mode, score, level_reached)
  );

-- Read stays public; no update/delete for clients
drop policy if exists "public read scores" on scores;
create policy "public read scores" on scores
  for select
  to anon, authenticated
  using (true);

revoke update, delete on scores from anon, authenticated;
