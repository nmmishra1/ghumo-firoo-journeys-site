
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const mockDevUser = {
      id: 'dev-user-id',
      email: 'agent@ghumofiroo.com',
      user_metadata: { full_name: 'Dev Agent', role: 'admin' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as any;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? (import.meta.env.DEV ? mockDevUser : null));
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? (import.meta.env.DEV ? mockDevUser : null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Clear all client-side stored variables, state, and credentials
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to auth page and refresh to purge memory state
    window.location.href = '/auth';
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};
