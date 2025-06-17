# Netlify Deployment Guide for SH!TSHOT

## Quick Deployment Steps

### 1. Prepare Your Environment Variables

Before deploying, you need to set up environment variables in Netlify:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Create a new site or go to your existing site
3. Go to **Site settings → Environment variables**
4. Add these variables:

```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
```

**⚠️ Important:** Only add the `VITE_` prefixed variables to Netlify. Never add the `SUPABASE_SERVICE_ROLE_KEY` to client-side environment variables!

### 2. Deploy from Git

#### Option A: Connect GitHub Repository
1. Go to Netlify Dashboard
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `18`
6. Click "Deploy site"

#### Option B: Manual Deploy (Drag & Drop)
1. Build locally: `npm run build`
2. Drag the `dist` folder to Netlify deploy area
3. Configure environment variables after deployment

### 3. Configure Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Add custom domain or use the provided `.netlify.app` URL
3. Configure DNS if using custom domain

## Mobile Optimization Features

The deployment includes several mobile-specific optimizations:

### Performance
- **Static asset caching** - Images, JS, CSS cached for 1 year
- **Gzip compression** - Automatic compression for faster loading
- **Resource hints** - Preload critical resources

### Mobile Features
- **Responsive design** - Works on all screen sizes
- **Touch controls** - Optimized touch/tap interactions
- **Viewport optimization** - Proper mobile viewport handling
- **PWA ready** - Can be installed as mobile app

### Security
- **HTTPS only** - Secure connections required
- **Content Security Policy** - Protection against XSS attacks
- **Security headers** - Full security header implementation

## Post-Deployment Testing

After deployment, test these features:

### Core Functionality
1. ✅ Welcome screen loads properly
2. ✅ Free play mode works
3. ✅ Member signup/login works
4. ✅ Game mechanics function correctly
5. ✅ Mobile touch controls work

### Mobile Specific Tests
1. ✅ Touch shooting works on mobile
2. ✅ Crosshair follows touch movement
3. ✅ Mobile controls are responsive
4. ✅ Game performance is smooth on mobile
5. ✅ Orientation changes work properly

### Database Features (Members Only)
1. ✅ Game sessions save to database
2. ✅ Leaderboards load correctly
3. ✅ User profiles update properly
4. ✅ Achievements system works

## Troubleshooting

### Common Deployment Issues

#### Build Fails
```bash
# Local test first
npm run build

# Check for TypeScript errors
npm run lint
```

#### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Restart deployment after adding variables
- Check build logs for environment variable errors

#### Mobile Features Not Working
- Test on actual mobile devices, not just browser dev tools
- Check for touch event conflicts
- Verify viewport meta tag is correct

#### Database Connection Issues
- Verify Supabase URLs are correct in production
- Check CORS settings in Supabase
- Ensure anon key has proper permissions

## Performance Monitoring

After deployment, monitor:

1. **Core Web Vitals** - Use Google PageSpeed Insights
2. **Mobile Performance** - Test on various devices
3. **Database Performance** - Monitor Supabase analytics
4. **Error Tracking** - Check Netlify function logs

## URLs and Links

After deployment, you'll get:
- **Main site URL:** `https://your-site-name.netlify.app`
- **Deploy previews:** For each git push/PR
- **Custom domain:** If configured

The site will be fully functional and optimized for both desktop and mobile gameplay!
</Action>