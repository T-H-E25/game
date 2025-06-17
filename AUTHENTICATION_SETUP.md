# Authentication Setup Instructions

## Quick Fix Steps

### 1. Update Your .env File
Replace the placeholder values in your `.env` file with your actual Supabase credentials:

```bash
# Get these from: https://app.supabase.com → Your Project → Settings → API

VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-service-role-key
```

### 2. Disable Email Confirmation (For Testing)

In your Supabase dashboard:
1. Go to **Authentication → Settings**
2. **Disable** "Enable email confirmations"
3. Click "Save"

This allows users to sign up and immediately sign in without email verification.

### 3. Test the Signup Flow

1. Run `npm run dev`
2. Click "Join as Member"
3. Switch to "Sign Up" tab
4. Fill out the form with:
   - Email: `test@example.com`
   - Display Name: `Test User`
   - Password: `testpassword123`
   - Confirm Password: `testpassword123`
5. Click "Create Account"

### 4. Verify in Database

After successful signup, check your Supabase dashboard:
1. Go to **Table Editor**
2. Check the `auth.users` table - should see your new user
3. Check the `profiles` table - should see the profile created automatically

## What I Fixed

### Enhanced Error Handling
- Added detailed error messages for common signup issues
- Added console logging to help debug authentication flow
- Better handling of Supabase-specific error messages

### Improved Signup Flow
- Clearer success messages
- Automatic mode switching after successful signup
- Better feedback for email confirmation requirements

### Environment Variable Validation
- Added checks for missing environment variables
- Clear error messages if .env is not configured properly

## Troubleshooting

### Issue: "Create Account" button doesn't work
**Solutions:**
1. Check browser console for errors
2. Verify .env file has correct Supabase credentials
3. Ensure email confirmations are disabled in Supabase settings

### Issue: User created but no profile in database
**Solutions:**
1. Check if the `handle_new_user()` trigger function exists
2. Verify RLS policies allow profile creation
3. Check Supabase logs for trigger errors

### Issue: "Invalid login credentials" after signup
**Solutions:**
1. If email confirmation is enabled, user must verify email first
2. Check if user exists in auth.users table
3. Try signing in with the same credentials used for signup

## Next Steps

1. Update your `.env` file with real credentials
2. Test the signup flow
3. Enable email confirmation later (optional)
4. Configure Google OAuth if needed

The authentication should now work properly!