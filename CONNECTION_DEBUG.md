# Connection Troubleshooting Guide

## The "Failed to fetch" Error

This error means your app cannot connect to Supabase. Here's how to fix it:

### Step 1: Check Your .env File

Make sure your `.env` file exists in the root directory (same level as package.json) and contains:

```bash
# Replace these with your ACTUAL Supabase values
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
```

### Step 2: Get Your Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **URL** → use for `VITE_SUPABASE_URL`
   - **anon public** → use for `VITE_SUPABASE_ANON_KEY`
   - **service_role** → use for `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Restart Development Server

After updating .env:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Connection

1. Open browser console (F12)
2. Try to sign up again
3. Look for detailed error messages

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Your .env file is not being loaded. Check:
- File is named exactly `.env` (not `.env.txt`)
- File is in root directory (same as package.json)
- No spaces around the = sign
- Restart dev server after changes

### Issue: "Cannot connect to Supabase (401)"
**Solution:** Your anon key is incorrect
- Double-check you copied the **anon public** key (not service_role)
- Remove any extra spaces or line breaks

### Issue: "Cannot connect to Supabase (404)"
**Solution:** Your URL is incorrect
- Make sure URL format is: `https://abcdefgh.supabase.co`
- No trailing slash
- Check project reference ID is correct

### Issue: Still getting "Failed to fetch"
**Solutions:**
1. Check your internet connection
2. Try opening your Supabase URL in browser
3. Check if your Supabase project is paused/inactive
4. Verify no corporate firewall is blocking Supabase

## Quick Test

To test if your credentials work:
1. Open: `https://your-project-ref.supabase.co/rest/v1/`
2. You should see a JSON response (not an error page)

If this doesn't work, your URL is wrong.

## Need Help?

Share these details:
1. What you see in browser console when trying to sign up
2. Whether your Supabase URL works when opened directly in browser
3. Whether you can see your project in Supabase dashboard

## Example Working .env

```bash
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjUwNDQ5NCwiZXhwIjoxOTQ4MDgwNDk0fQ.example-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMyNTA0NDk0LCJleHAiOjE5NDgwODA0OTR9.example-service-role-key
```

The app will now show you exactly what's wrong with your connection!