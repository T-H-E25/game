# Environment Setup Guide

## Quick Setup

1. Copy the `.env` file I created and paste your actual Supabase credentials
2. Get your credentials from [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

## Required Environment Variables

### Client-Side Variables (prefixed with VITE_)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key (safe for client-side)

### Server-Side Variables (for Edge Functions)
- `SUPABASE_URL`: Same as VITE_SUPABASE_URL (for edge functions)
- `SUPABASE_ANON_KEY`: Same as VITE_SUPABASE_ANON_KEY (for edge functions)
- `SUPABASE_SERVICE_ROLE_KEY`: **⚠️ SENSITIVE** - Service role key with elevated permissions

## Security Best Practices

✅ **Safe for client-side:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

❌ **NEVER expose client-side:**
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Where to Find Your Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - **URL**: Use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public**: Use for `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
   - **service_role**: Use for `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Local Development

For local development with Supabase CLI, you can create a `.env.local` file with your local Supabase instance URLs.

## File Structure

- `.env` - Your actual environment variables (ignored by git)
- `.env.example` - Template showing required variables
- `.env.local` - Local development overrides (ignored by git)
- `.env.local.example` - Template for local development

## Verification

After setting up your `.env` file, run:
```bash
npm run dev
```

The app should start without Supabase connection errors.