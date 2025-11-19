import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to sync Supabase Auth state with custom auth store
 * Enables Google OAuth and other social login providers
 */
export const useSupabaseAuth = () => {
  const { setAuth, logout } = useAuth();

  useEffect(() => {
    console.log("[useSupabaseAuth] Setting up auth listener");

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[useSupabaseAuth] Auth state changed:", event);

        if (event === 'SIGNED_IN' && session) {
          console.log("[useSupabaseAuth] User signed in:", session.user.email);
          
          // Sync with custom auth store
          setAuth({
            user: {
              id: session.user.id,
              email: session.user.email!,
              email_verified: session.user.email_confirmed_at !== null,
            },
            token: session.access_token,
          });
        } else if (event === 'SIGNED_OUT') {
          console.log("[useSupabaseAuth] User signed out");
          logout();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("[useSupabaseAuth] Token refreshed");
          
          setAuth({
            user: {
              id: session.user.id,
              email: session.user.email!,
              email_verified: session.user.email_confirmed_at !== null,
            },
            token: session.access_token,
          });
        }
      }
    );

    return () => {
      console.log("[useSupabaseAuth] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [setAuth, logout]);
};
