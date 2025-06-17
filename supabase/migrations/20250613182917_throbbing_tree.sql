/*
  # Create user profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - links to auth.users
      - `display_name` (text) - user's chosen display name
      - `avatar_url` (text, optional) - profile picture URL
      - `total_games` (integer) - count of games played
      - `highest_score` (integer) - user's best score
      - `total_hits` (integer) - lifetime hits
      - `total_misses` (integer) - lifetime misses
      - `best_accuracy` (numeric) - best accuracy percentage
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read/update their own profile
    - Add policy for public read access to display names and stats
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  total_games integer DEFAULT 0,
  highest_score integer DEFAULT 0,
  total_hits integer DEFAULT 0,
  total_misses integer DEFAULT 0,
  best_accuracy numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public read access for leaderboards (display names and stats only)
CREATE POLICY "Public read access for leaderboards"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();