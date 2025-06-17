# Supabase Setup Guide for SH!TSHOT

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your existing project OR create a new one
3. Go to **Settings → API**
4. Copy these values:
   - **URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiI...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiI...`)

## Step 2: Update Your .env File

Replace the placeholder values in your `.env` file with your actual Supabase credentials.

## Step 3: Database Setup

Your project needs these database tables and functions. If you're using an existing project, ensure these are set up:

### Required Tables:
- `profiles` - User profiles and stats
- `game_sessions` - Game history and scores  
- `achievements` - Available achievements
- `user_achievements` - User's earned achievements

### Required Edge Functions:
- `submit-game-session` - Save game results
- `get-leaderboard` - Fetch leaderboards
- `get-user-history` - Get user's game history
- `get-user-achievements` - Get user's achievements

## Step 4: Authentication Setup

In your Supabase dashboard:

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Enable **Google** provider (optional, for Google sign-in)
   - Add your Google OAuth credentials if using Google sign-in

## Step 5: Test Connection

After updating your `.env` file:

```bash
npm run dev
```

The app should start without connection errors. Test by:
1. Opening the welcome screen
2. Trying to sign up/sign in
3. Playing a game as a member to test database functionality

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your anon key in `.env`
   - Ensure no extra spaces or characters

2. **Authentication not working**
   - Verify email provider is enabled in Supabase
   - Check if you need email confirmation disabled

3. **Database errors**
   - Ensure all tables exist with proper RLS policies
   - Check if migrations were run successfully

4. **Edge functions not working**
   - Verify all 4 edge functions are deployed
   - Check function logs in Supabase dashboard

### Need to Set Up Fresh Database?

If your Supabase project doesn't have the required schema, you'll need to:

1. Run the migration files (they're in `supabase/migrations/`)
2. Deploy the edge functions (they're in `supabase/functions/`)

Let me know if you need help with any of these steps!