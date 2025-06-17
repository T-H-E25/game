/*
  # Create achievements system

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text, unique) - achievement name
      - `description` (text) - how to earn it
      - `icon_name` (text) - lucide icon name
      - `criteria` (jsonb) - conditions for earning
      - `points` (integer) - points awarded
      - `rarity` (text) - common, rare, epic, legendary

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `achievement_id` (uuid, foreign key)
      - `earned_at` (timestamp)
      - `progress` (jsonb) - tracking progress toward achievement

  2. Security
    - Enable RLS on both tables
    - Public read access to achievements
    - Users can read their own earned achievements
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'trophy',
  criteria jsonb NOT NULL,
  points integer DEFAULT 10,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  progress jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Public read access to achievements
CREATE POLICY "Public read achievements"
  ON achievements
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can read their own earned achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own achievements (via edge function)
CREATE POLICY "Users can earn achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon_name, criteria, points, rarity) VALUES
('First Shot', 'Hit your first target', 'target', '{"min_hits": 1}', 5, 'common'),
('Sharpshooter', 'Achieve 90% accuracy in a game', 'crosshair', '{"min_accuracy": 90}', 15, 'rare'),
('Century Club', 'Score 100 points in a single game', 'trophy', '{"min_score": 100}', 10, 'common'),
('Speed Demon', 'Complete a hard game in under 30 seconds', 'zap', '{"max_duration": 30, "difficulty": "hard"}', 25, 'epic'),
('Perfect Game', 'Achieve 100% accuracy', 'star', '{"min_accuracy": 100}', 50, 'legendary'),
('Persistent', 'Play 10 games', 'calendar', '{"min_games": 10}', 15, 'common'),
('Dedicated', 'Play 50 games', 'award', '{"min_games": 50}', 30, 'rare'),
('Master', 'Score 500 points in a single game', 'crown', '{"min_score": 500}', 40, 'epic'),
('3D Pioneer', 'Complete your first 3D game', 'box', '{"game_mode": "3d", "min_games": 1}', 10, 'common'),
('Consistency', 'Hit 100 targets total', 'target', '{"min_total_hits": 100}', 20, 'rare')
ON CONFLICT (name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);