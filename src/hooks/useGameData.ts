import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface GameSession {
  id: string;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  difficulty: string;
  game_mode: string;
  duration_seconds: number;
  start_time: string;
  end_time: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  score: number;
  accuracy: number;
  difficulty: string;
  game_mode: string;
  created_at: string;
  rank: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  points: number;
  rarity: string;
  is_earned: boolean;
  earned_at: string | null;
  progress: number;
}

export const useGameData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit game session for authenticated users
  const submitGameSession = useCallback(async (sessionData: {
    score: number;
    hits: number;
    misses: number;
    accuracy: number;
    difficulty: string;
    game_mode: string;
    duration_seconds: number;
    start_time: string;
    end_time: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-game-session`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit game session');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback(async (filters: {
    difficulty?: string;
    game_mode?: string;
    timeframe?: string;
    limit?: number;
  } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.game_mode) params.append('game_mode', filters.game_mode);
      if (filters.timeframe) params.append('timeframe', filters.timeframe);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-leaderboard?${params}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch leaderboard');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user history (requires authentication)
  const getUserHistory = useCallback(async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-history?${params}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user history');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user achievements (requires authentication)
  const getUserAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-achievements`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user achievements');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    submitGameSession,
    getLeaderboard,
    getUserHistory,
    getUserAchievements,
  };
};