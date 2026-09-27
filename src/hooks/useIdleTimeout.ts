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

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;       // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000;       // Warn 2 minutes before
const CHECK_INTERVAL_MS = 15 * 1000;           // Check every 15 seconds

// Throttle activity updates to once per 5 seconds to avoid performance hits
const ACTIVITY_THROTTLE_MS = 5 * 1000;

type ToastFn = (opts: { title: string; description: string; variant?: string; duration?: number }) => void;

export function useIdleTimeout(toastFn?: ToastFn) {
  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);
  const warningShownRef = useRef<boolean>(false);
  const loggedOutRef = useRef<boolean>(false);

  // Update last activity timestamp (throttled)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      lastThrottleRef.current = now;
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

    // Clear all auth storage
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('ghumofiroo-crm-auth-token');
    sessionStorage.clear();
    invalidateApiCache();

    // Redirect to auth with idle reason
    window.location.href = '/auth?reason=idle';
  }, []);

  useEffect(() => {
    // Don't run on non-browser environments
    if (typeof window === 'undefined') return;

    // Reset on mount
    lastActivityRef.current = Date.now();
    loggedOutRef.current = false;
    warningShownRef.current = false;

    // Listen for user activity events
    const events: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'
    ];

    events.forEach(event => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    // Periodic check — more efficient than resetting timers on every event
    const intervalId = setInterval(() => {
      if (loggedOutRef.current) return;

      const elapsed = Date.now() - lastActivityRef.current;
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
