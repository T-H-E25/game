import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: session, error } = await authHelpers.getCurrentSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            isAuthenticated: !!session?.user,
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            isAuthenticated: !!session?.user,
          });

          // Handle different auth events
          switch (event) {
            case 'SIGNED_IN':
              console.log('User signed in:', session?.user?.email);
              break;
            case 'SIGNED_OUT':
              console.log('User signed out');
              break;
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed');
              break;
            case 'USER_UPDATED':
              console.log('User updated');
              break;
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth actions
  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await authHelpers.signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const { data, error } = await authHelpers.signInWithEmail(email, password);
      if (error) throw error;
      return data;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const { data, error } = await authHelpers.signUpWithEmail(email, password, displayName);
      if (error) throw error;
      return data;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authHelpers.resetPassword(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
  };
};