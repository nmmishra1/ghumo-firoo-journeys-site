import { auditLogger } from '@/services/auditLogger';
import { supabase } from '@/integrations/supabase/client';

export interface CrmApiMeta {
  action: string;
  module?: 'Packages' | 'Hotels' | 'Cabs' | 'Sightseeing' | 'Activities' | 'Leads' | 'System';
  itemName?: string;
  recordId?: string;
  details?: string;
}

/**
 * Standardized CRM API Fetcher
 * - Appends descriptive & verifiable `action` query parameter for DevTools Network tracking
 * - Automatically injects Supabase Bearer Auth token when available
 * - Emits clear, styled DevTools Console logs
 * - Catches HTTP 429 Rate Limiting
 * - Syncs with persistent CRM Audit Log trail
 */
export async function crmFetch(
  url: string,
  options: RequestInit = {},
  meta?: CrmApiMeta
): Promise<Response> {
  const action = meta?.action || (options.method === 'DELETE' ? 'delete_record' : (options.method === 'POST' ? 'create_record' : (options.method === 'PUT' ? 'update_record' : 'fetch_records')));
  
  // Append action query parameter if not present
  let finalUrl = url;
  if (!finalUrl.includes('action=')) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}action=${encodeURIComponent(action)}`;
  }

  const method = (options.method || 'GET').toUpperCase();
  const startTime = performance.now();

  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.set('Authorization', `Bearer ${session.access_token}`);
        }
      } catch (e) {
        // Ignore session retrieval error in offline / local environments
      }
    }

    const finalOptions: RequestInit = {
      ...options,
      headers
    };

    const response = await fetch(finalUrl, finalOptions);
    const duration = Math.round(performance.now() - startTime);

    // Rate limiting check
    if (response.status === 429) {
      console.warn(
        `%c[CRM API RATE LIMIT] %c${action} %c(429 Too Many Requests in ${duration}ms) - Rate limit reached (120 req/min). Please slow down.`,
        'color: #f59e0b; font-weight: 800; background: #78350f20; padding: 2px 6px; border-radius: 4px;',
        'color: #ef4444; font-weight: bold;',
        'color: #f59e0b;'
      );
      return response;
    }

    if (response.ok) {
      console.log(
        `%c[CRM API] %c${action.toUpperCase()} %c(${method} 200 OK in ${duration}ms)${meta?.itemName ? ` -> "${meta.itemName}"` : ''}`,
        'color: #0B1026; font-weight: 800; background: #C9A25A; padding: 2px 6px; border-radius: 4px;',
        'color: #3b82f6; font-weight: bold;',
        'color: #10b981; font-weight: 600;'
      );

      // If this was a modifying action (POST, PUT, DELETE), write to local audit log trail
      if (['POST', 'PUT', 'DELETE'].includes(method) && meta?.module) {
        auditLogger.log({
          action: action.toUpperCase(),
          module: meta.module,
          record_id: meta.recordId,
          target_name: meta.itemName || meta.recordId || action,
          details: meta.details || `Executed ${action} via ${method}`
        }).catch(() => {});
      }
    } else {
      console.error(
        `%c[CRM API ERROR] %c${action.toUpperCase()} %c(${method} ${response.status} in ${duration}ms)`,
        'color: #ffffff; font-weight: 800; background: #ef4444; padding: 2px 6px; border-radius: 4px;',
        'color: #ef4444; font-weight: bold;',
        'color: #f87171;'
      );
    }

    return response;
  } catch (err: any) {
    console.error(
      `%c[CRM API NETWORK FAILURE] %c${action.toUpperCase()}`,
      'color: #ffffff; font-weight: 800; background: #dc2626; padding: 2px 6px; border-radius: 4px;',
      'color: #ef4444; font-weight: bold;',
      err
    );
    throw err;
  }
}
