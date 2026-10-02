/**
 * useIdleTimeout — Strict 30-minute inactivity auto-logout
 *
 * Tracks: mousemove, mousedown, keydown, scroll, touchstart, click
 * Warning: Toast at 2 minutes before expiry
 * Action:  Signs out via Supabase, clears storage, redirects to /auth?reason=idle
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { invalidateApiCache } from '@/utils/crmCache';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;       // 30 minutes
export const WARNING_BEFORE_MS = 2 * 60 * 1000;      // Warn 2 minutes before
export const CHECK_INTERVAL_MS = 15 * 1000;          // Check every 15 seconds
export const ACTIVITY_THROTTLE_MS = 5 * 1000;        // Throttle activity updates to once per 5 seconds
export const LAST_ACTIVITY_KEY = 'gf_crm_last_activity';

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('ghumofiroo-crm-auth-token');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
}

export function isSessionExpired(session?: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (stored) {
      const lastActive = Number(stored);
      if (!isNaN(lastActive) && Date.now() - lastActive > IDLE_TIMEOUT_MS) {
        return true;
      }
      return false;
    }

    // Fallback: If no activity timestamp has been recorded yet (e.g. existing session before this update)
    if (session?.user?.last_sign_in_at) {
      const lastSignIn = new Date(session.user.last_sign_in_at).getTime();
      if (!isNaN(lastSignIn) && Date.now() - lastSignIn > IDLE_TIMEOUT_MS) {
        return true;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return false;
}

type ToastFn = (opts: { title: string; description: string; variant?: string; duration?: number }) => void;

export function useIdleTimeout(toastFn?: ToastFn) {
  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);
  const warningShownRef = useRef<boolean>(false);
  const loggedOutRef = useRef<boolean>(false);

  // Update last activity timestamp (throttled & synced to localStorage)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      } catch {}
      // Reset warning flag when user becomes active again
      warningShownRef.current = false;
    }
  }, []);

  // Perform logout
  const performIdleLogout = useCallback(async () => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[IdleTimeout] Sign-out error:', e);
    }

    // Clear all auth storage & cache
    clearAuthStorage();
    invalidateApiCache();

    // Redirect to auth with idle reason
    window.location.href = '/auth?reason=idle';
  }, []);

  useEffect(() => {
    // Don't run on non-browser environments
    if (typeof window === 'undefined') return;

    // Check if session has already expired while the tab was closed or user was away
    const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (stored && Date.now() - stored > IDLE_TIMEOUT_MS) {
      performIdleLogout();
      return;
    }

    // Reset on mount
    const now = Date.now();
    lastActivityRef.current = stored && (now - stored <= IDLE_TIMEOUT_MS) ? stored : now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, lastActivityRef.current.toString());
    } catch {}

    loggedOutRef.current = false;
    warningShownRef.current = false;

    // Listen for user activity events
    const events: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'
    ];

    events.forEach(event => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    // Periodic check — checks localStorage timestamp to sync across multiple open tabs
    const intervalId = setInterval(() => {
      if (loggedOutRef.current) return;

      const storedVal = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
      const effectiveLastActive = !isNaN(storedVal) && storedVal > 0 ? storedVal : lastActivityRef.current;
      const elapsed = Date.now() - effectiveLastActive;
      const remaining = IDLE_TIMEOUT_MS - elapsed;

      // Time's up — logout
      if (remaining <= 0) {
        performIdleLogout();
        return;
      }

      // Warning zone — show toast once
      if (remaining <= WARNING_BEFORE_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        const mins = Math.ceil(remaining / 60000);
        if (toastFn) {
          toastFn({
            title: '⏰ Session Expiring Soon',
            description: `You'll be logged out in ${mins} minute${mins !== 1 ? 's' : ''} due to inactivity. Move your mouse or press a key to stay signed in.`,
            variant: 'destructive',
            duration: 15000,
          });
        }
      }
    }, CHECK_INTERVAL_MS);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      clearInterval(intervalId);
    };
  }, [recordActivity, performIdleLogout, toastFn]);
}
