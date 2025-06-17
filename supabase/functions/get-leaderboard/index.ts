import { createClient } from 'npm:@supabase/supabase-js@2';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'GET') {
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
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const url = new URL(req.url);
    const difficulty = url.searchParams.get('difficulty') || 'all';
    const gameMode = url.searchParams.get('game_mode') || 'all';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
    const timeframe = url.searchParams.get('timeframe') || 'all'; // all, today, week, month

    let query = supabase
      .from('game_sessions')
      .select(`
        user_id,
        score,
        accuracy,
        difficulty,
        game_mode,
        start_time,
        profiles!inner(display_name)
      `)
      .order('score', { ascending: false });

    // Filter by difficulty
    if (difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    // Filter by game mode
    if (gameMode !== 'all') {
      query = query.eq('game_mode', gameMode);
    }

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (timeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      query = query.gte('start_time', startDate.toISOString());
    }

    query = query.limit(limit);

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leaderboard' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format leaderboard entries with rankings
    const leaderboard: LeaderboardEntry[] = (sessions || []).map((session: any, index: number) => ({
      user_id: session.user_id,
      display_name: session.profiles?.display_name || 'Anonymous',
      score: session.score,
      accuracy: session.accuracy,
      difficulty: session.difficulty,
      game_mode: session.game_mode,
      created_at: session.start_time,
      rank: index + 1,
    }));

    return new Response(
      JSON.stringify({
        leaderboard,
        filters: {
          difficulty,
          game_mode: gameMode,
          timeframe,
          limit,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});