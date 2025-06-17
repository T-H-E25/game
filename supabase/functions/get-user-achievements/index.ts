import { createClient } from 'npm:@supabase/supabase-js@2';

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

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: true })
      .order('points', { ascending: false });

    if (achievementsError) {
      console.error('Achievements query error:', achievementsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch achievements' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        earned_at,
        progress,
        achievements!inner(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (userAchievementsError) {
      console.error('User achievements query error:', userAchievementsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user achievements' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user profile for progress calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const earnedAchievementIds = new Set(
      userAchievements?.map(ua => ua.achievement_id) || []
    );

    // Calculate progress for unearned achievements
    const achievementsWithProgress = (allAchievements || []).map(achievement => {
      const isEarned = earnedAchievementIds.has(achievement.id);
      const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
      
      let progress = 0;
      if (isEarned) {
        progress = 100;
      } else if (profile) {
        // Calculate progress based on criteria
        const criteria = achievement.criteria;
        
        if (criteria.min_hits) {
          progress = Math.min(100, (profile.total_hits / criteria.min_hits) * 100);
        } else if (criteria.min_total_hits) {
          progress = Math.min(100, (profile.total_hits / criteria.min_total_hits) * 100);
        } else if (criteria.min_games) {
          progress = Math.min(100, (profile.total_games / criteria.min_games) * 100);
        } else if (criteria.min_score) {
          progress = Math.min(100, (profile.highest_score / criteria.min_score) * 100);
        } else if (criteria.min_accuracy) {
          progress = Math.min(100, (profile.best_accuracy / criteria.min_accuracy) * 100);
        }
      }

      return {
        ...achievement,
        is_earned: isEarned,
        earned_at: userAchievement?.earned_at || null,
        progress: Math.round(progress),
      };
    });

    // Group achievements by rarity
    const groupedAchievements = {
      common: achievementsWithProgress.filter(a => a.rarity === 'common'),
      rare: achievementsWithProgress.filter(a => a.rarity === 'rare'),
      epic: achievementsWithProgress.filter(a => a.rarity === 'epic'),
      legendary: achievementsWithProgress.filter(a => a.rarity === 'legendary'),
    };

    // Calculate total points earned
    const totalPointsEarned = achievementsWithProgress
      .filter(a => a.is_earned)
      .reduce((sum, a) => sum + a.points, 0);

    const totalPointsAvailable = achievementsWithProgress
      .reduce((sum, a) => sum + a.points, 0);

    return new Response(
      JSON.stringify({
        achievements: achievementsWithProgress,
        grouped_achievements: groupedAchievements,
        stats: {
          earned: achievementsWithProgress.filter(a => a.is_earned).length,
          total: achievementsWithProgress.length,
          points_earned: totalPointsEarned,
          points_available: totalPointsAvailable,
          completion_percentage: Math.round(
            (achievementsWithProgress.filter(a => a.is_earned).length / achievementsWithProgress.length) * 100
          ),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get user achievements error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});