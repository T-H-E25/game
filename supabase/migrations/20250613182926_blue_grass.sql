/*
  # Create game sessions table

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `difficulty` (text) - easy, medium, hard
      - `game_mode` (text) - 2d, 3d
      - `score` (integer) - final score
      - `hits` (integer) - targets hit
      - `misses` (integer) - shots missed
      - `accuracy` (numeric) - accuracy percentage
      - `duration_seconds` (integer) - game duration

  2. Security
    - Enable RLS on `game_sessions` table
    - Add policy for users to read their own sessions
    - Add policy for authenticated users to insert sessions
    - Add policy for public read access for leaderboards
*/

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  game_mode text NOT NULL CHECK (game_mode IN ('2d', '3d')),
  score integer DEFAULT 0,
  hits integer DEFAULT 0,
  misses integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  duration_seconds integer DEFAULT 0
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own game sessions
CREATE POLICY "Users can read own sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own game sessions
CREATE POLICY "Users can insert own sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public read access for leaderboards (anonymized)
CREATE POLICY "Public read for leaderboards"
  ON game_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty ON game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time DESC);