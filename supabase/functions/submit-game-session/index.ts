import { createClient } from 'npm:@supabase/supabase-js@2';

interface RequestPayload {
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  difficulty: 'easy' | 'medium' | 'hard';
  game_mode: '2d' | '3d';
  duration_seconds: number;
  start_time: string;
  end_time: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payload: RequestPayload = await req.json();

    // Validate payload
    if (!payload.score && payload.score !== 0) {
      return new Response(
        JSON.stringify({ error: 'Score is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        score: payload.score,
        hits: payload.hits,
        misses: payload.misses,
        accuracy: payload.accuracy,
        difficulty: payload.difficulty,
        game_mode: payload.game_mode,
        duration_seconds: payload.duration_seconds,
        start_time: payload.start_time,
        end_time: payload.end_time,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session insert error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save game session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update user profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_games, highest_score, total_hits, total_misses, best_accuracy')
      .eq('id', user.id)
      .single();

    if (profile) {
      const newTotalGames = profile.total_games + 1;
      const newHighestScore = Math.max(profile.highest_score, payload.score);
      const newTotalHits = profile.total_hits + payload.hits;
      const newTotalMisses = profile.total_misses + payload.misses;
      const newBestAccuracy = Math.max(profile.best_accuracy, payload.accuracy);

      await supabase
        .from('profiles')
        .update({
          total_games: newTotalGames,
          highest_score: newHighestScore,
          total_hits: newTotalHits,
          total_misses: newTotalMisses,
          best_accuracy: newBestAccuracy,
        })
        .eq('id', user.id);

      // Check for achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const earnedAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const newAchievements = [];

      for (const achievement of achievements || []) {
        if (earnedAchievementIds.has(achievement.id)) continue;

        const criteria = achievement.criteria;
        let earned = false;

        // Check various achievement criteria
        if (criteria.min_hits && newTotalHits >= criteria.min_hits) earned = true;
        if (criteria.min_accuracy && payload.accuracy >= criteria.min_accuracy) earned = true;
        if (criteria.min_score && payload.score >= criteria.min_score) earned = true;
        if (criteria.min_total_hits && newTotalHits >= criteria.min_total_hits) earned = true;
        if (criteria.min_games && newTotalGames >= criteria.min_games) earned = true;
        if (criteria.max_duration && payload.duration_seconds <= criteria.max_duration && 
            criteria.difficulty === payload.difficulty) earned = true;
        if (criteria.game_mode && criteria.game_mode === payload.game_mode && 
            criteria.min_games && newTotalGames >= criteria.min_games) earned = true;

        if (earned) {
          newAchievements.push({
            user_id: user.id,
            achievement_id: achievement.id,
          });
        }
      }

      // Insert new achievements
      if (newAchievements.length > 0) {
        await supabase
          .from('user_achievements')
          .insert(newAchievements);
      }

      return new Response(
        JSON.stringify({
          success: true,
          session_id: session.id,
          new_achievements: newAchievements.length,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, session_id: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Submit game session error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});