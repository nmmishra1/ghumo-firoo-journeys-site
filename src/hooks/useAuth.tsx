
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { invalidateApiCache } from '@/utils/crmCache';

// Module-level persistent cache across route changes
let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let isInitialized = false;
const listeners = new Set<() => void>();

const notifySubscribers = () => {
  listeners.forEach(listener => listener());
};

// Initialize Supabase Auth listener once globally
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    cachedSession = session;
    cachedUser = session?.user ?? null;
    isInitialized = true;
    notifySubscribers();
  }).catch(() => {
    isInitialized = true;
    notifySubscribers();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      invalidateApiCache();
    }
    cachedSession = session;
    cachedUser = session?.user ?? null;
    isInitialized = true;
    notifySubscribers();
  });
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!isInitialized);

  useEffect(() => {
    const handleUpdate = () => {
      setSession(cachedSession);
      setUser(cachedUser);
      setLoading(false);
    };

    listeners.add(handleUpdate);

    // If already initialized, synchronize immediately
    if (isInitialized) {
      setSession(cachedSession);
      setUser(cachedUser);
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        cachedSession = session;
        cachedUser = session?.user ?? null;
        isInitialized = true;
        handleUpdate();
      });
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    cachedSession = null;
    cachedUser = null;
    isInitialized = true;
    notifySubscribers();
    invalidateApiCache();
    
    // Clear auth keys
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('ghumofiroo-crm-auth-token');
    sessionStorage.clear();

    window.location.href = '/auth';
  }, []);

  return {
    user,
    session,
    loading,
    signOut,
  };
};
