
-- Create RPC functions for the leaderboard and tournament data

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  id uuid, 
  username text, 
  avatar_url text, 
  games_played bigint, 
  games_won bigint, 
  total_winnings numeric, 
  biggest_win bigint, 
  win_rate numeric,
  balance bigint
) 
LANGUAGE sql
SECURITY definer
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    COALESCE(COUNT(gr.id), 0)::bigint as games_played,
    COALESCE(COUNT(gr.id) FILTER (WHERE gr.is_win = true), 0)::bigint as games_won,
    COALESCE(SUM(gr.win_amount), 0)::numeric as total_winnings,
    COALESCE(MAX(gr.win_amount), 0)::bigint as biggest_win,
    CASE 
      WHEN COUNT(gr.id) = 0 THEN 0
      ELSE ROUND((COUNT(gr.id) FILTER (WHERE gr.is_win = true)::numeric / COUNT(gr.id)) * 100, 2)
    END as win_rate,
    p.balance
  FROM profiles p
  LEFT JOIN game_results gr ON p.id = gr.user_id
  GROUP BY p.id, p.username, p.avatar_url, p.balance
  ORDER BY total_winnings DESC
$$;

-- Function to get tournament leaderboard
CREATE OR REPLACE FUNCTION public.get_tournament_leaderboard(tournament_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid,
  username text, 
  avatar_url text, 
  score integer,
  rank integer
) 
LANGUAGE sql
SECURITY definer
SET search_path = 'public'
AS $$
  SELECT 
    te.id,
    te.user_id,
    p.username,
    p.avatar_url,
    te.score,
    ROW_NUMBER() OVER (ORDER BY te.score DESC)::integer as rank
  FROM tournament_entries te
  JOIN profiles p ON te.user_id = p.id
  WHERE te.tournament_id = tournament_id
  ORDER BY te.score DESC
$$;

-- Function to get tournament details
CREATE OR REPLACE FUNCTION public.get_tournament_details(tournament_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  prize_pool integer,
  game_type text,
  tournament_type text,
  status text,
  is_active boolean,
  participant_count bigint
) 
LANGUAGE sql
SECURITY definer
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.start_time,
    t.end_time,
    t.prize_pool,
    t.game_type::text,
    t.tournament_type::text,
    t.status::text,
    t.is_active,
    COUNT(te.id)::bigint as participant_count
  FROM tournaments t
  LEFT JOIN tournament_entries te ON t.id = te.tournament_id
  WHERE t.id = tournament_id
  GROUP BY t.id, t.title, t.description, t.start_time, t.end_time, 
    t.prize_pool, t.game_type, t.tournament_type, t.status, t.is_active
$$;

-- Function to get user's rank in leaderboard
CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id uuid, time_period text DEFAULT 'all-time'::text)
RETURNS TABLE(
  rank bigint, 
  games_played bigint, 
  total_winnings numeric
) 
LANGUAGE sql
SECURITY definer
SET search_path = 'public'
AS $$
  WITH user_stats AS (
    SELECT 
      p.id,
      COUNT(gr.id)::BIGINT as games_played,
      COALESCE(SUM(gr.win_amount), 0)::NUMERIC as total_winnings
    FROM profiles p
    LEFT JOIN game_results gr ON p.id = gr.user_id
    WHERE 
      CASE 
        WHEN time_period = 'today' THEN gr.created_at >= CURRENT_DATE
        WHEN time_period = 'this-week' THEN gr.created_at >= DATE_TRUNC('week', CURRENT_DATE)
        ELSE TRUE
      END
    GROUP BY p.id
  ),
  rankings AS (
    SELECT 
      id,
      games_played,
      total_winnings,
      ROW_NUMBER() OVER(ORDER BY total_winnings DESC) as rank
    FROM user_stats
  )
  SELECT 
    rank,
    games_played,
    total_winnings
  FROM rankings
  WHERE id = target_user_id
$$;

-- Function to get user's tournament standing
CREATE OR REPLACE FUNCTION public.get_user_tournament_standing(tournament_id uuid, user_id uuid)
RETURNS TABLE(
  rank integer,
  score integer
) 
LANGUAGE sql
SECURITY definer
SET search_path = 'public'
AS $$
  WITH rankings AS (
    SELECT 
      te.user_id,
      te.score,
      ROW_NUMBER() OVER (ORDER BY te.score DESC)::INTEGER as rank
    FROM tournament_entries te
    WHERE te.tournament_id = tournament_id
  )
  SELECT 
    rank,
    score
  FROM rankings
  WHERE user_id = get_user_tournament_standing.user_id
$$;
