import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    console.log('Attempting to sign up user:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        // Disable email confirmation for testing - you can enable this later
        emailRedirectTo: undefined,
      },
    });
    
    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signup successful:', data);
    }
    
    return { data, error };
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    console.log('Attempting to sign in user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Signin error:', error);
    } else {
      console.log('Signin successful:', data);
    }
    
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    console.log('Attempting Google sign in');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google signin error:', error);
    }
    
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Signout error:', error);
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    console.log('Sending password reset to:', email);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
    }
    
    return { data, error };
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Get current user session
  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data: data.session, error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data: data.user, error };
  },
};