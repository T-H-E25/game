# Netlify Deployment Guide for SH!TSHOT

## Pre-Deployment Checklist ✅

### 1. Verify Your .env File is Working Locally
Before deploying, make sure:
- Your `.env` file has correct Supabase credentials
- You can sign up/sign in locally without errors
- The game functions properly in local development

### 2. Test Your Build Locally
```bash
npm run build
npm run preview
```
This ensures your build process works before deploying.

## Step-by-Step Deployment 🚀

### Step 1: Deploy to Netlify

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Deploy via Netlify Dashboard**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your repository
   - Build settings should auto-detect from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: `20`
   - Click "Deploy site"

### Step 2: Configure Environment Variables

**CRITICAL**: After deployment, you MUST add your environment variables:

1. Go to your Netlify site dashboard
2. Click "Site settings" → "Environment variables"
3. Add these variables:

```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
```

**⚠️ DO NOT add SUPABASE_SERVICE_ROLE_KEY to Netlify** - it's only for Supabase edge functions.

### Step 3: Redeploy After Adding Environment Variables

1. Go to "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

## Step 4: Test Your Deployment

1. Click on your site URL (will be something like `https://amazing-name-123456.netlify.app`)
2. Test the welcome screen loads
3. Try signing up as a member
4. Play the game to ensure everything works

## Step 5: Claim Your Site (Optional)

1. In your Netlify dashboard, click "Site settings"
2. Click "Change site name" to give it a custom name
3. Or connect a custom domain if you have one

## Troubleshooting Common Issues 🔧

### Issue: "Site not found" or blank page
**Solution**: Check if build completed successfully
- Go to "Deploys" tab and check for build errors
- Verify `dist` folder is being generated

### Issue: "Failed to fetch" errors in production
**Solutions**:
1. Verify environment variables are set correctly in Netlify
2. Check that your Supabase URL doesn't have a trailing slash
3. Ensure your Supabase project allows requests from your Netlify domain

### Issue: Authentication not working
**Solutions**:
1. Add your Netlify URL to Supabase allowed origins:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Netlify URL to "Site URL" and "Redirect URLs"

### Issue: Game features not working
**Note**: Some features require Supabase edge functions which only work on Supabase hosting. For full functionality, consider these alternatives:
1. Use Supabase database directly for simpler features
2. Move complex logic to client-side where possible
3. For leaderboards, use direct database queries instead of edge functions

## Mobile Optimization 📱

Your deployed site will work on mobile devices. For best mobile experience:

1. **Test on actual devices**: Use your phone to test the game
2. **Performance**: The game should run smoothly on modern mobile browsers
3. **Touch controls**: Mobile controls are already implemented in the code
4. **PWA Features**: Consider adding a manifest.json for app-like experience

## Configuration Included ⚙️

Your `netlify.toml` file includes:
- ✅ SPA routing support (all routes redirect to index.html)
- ✅ Security headers
- ✅ Asset caching for performance
- ✅ Modern Node.js version (20)
- ✅ Production optimizations

## Next Steps After Deployment

1. **Share the URL**: Your game will be accessible at the Netlify URL
2. **Test Mobile**: Open the URL on your phone to test mobile gameplay
3. **Monitor Performance**: Use Netlify Analytics to see how your game performs
4. **Custom Domain**: Add a custom domain if desired

## Example URLs

After deployment, your URLs will look like:
- Staging: `https://deploy-preview-123--your-site.netlify.app`
- Production: `https://your-site-name.netlify.app`
- Custom: `https://yourdomain.com` (if configured)

The game will be fully functional and ready for mobile testing! 🎯