-- The Brain Rot Game — base leaderboard table
-- After this, run supabase/migrations/002_tighten_rls.sql (or npm run db:migrate)

create table if not exists scores (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  game_mode text not null check (game_mode in ('train', 'memory', 'reaction', 'echo')),
  score integer not null check (score >= 0),
  level_reached integer not null default 1 check (level_reached >= 1),
  created_at timestamp with time zone default now()
);

create index if not exists scores_game_mode_score_idx on scores (game_mode, score desc);
