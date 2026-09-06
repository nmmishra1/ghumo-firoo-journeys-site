import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  user_email: string;
  user_name?: string;
  action: string;
  module: 'Packages' | 'Hotels' | 'Cabs' | 'Sightseeing' | 'Activities' | 'Leads' | 'Blogs' | 'System';
  record_id?: string;
  target_name: string;
  old_value?: string | null;
  new_value?: string | null;
  details?: string;
  timestamp?: string;
}

const LOCAL_LOGS_KEY = 'ghumo_firoo_crm_audit_logs';

// Initial sample baseline audit logs for preview
const INITIAL_BASELINE_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user_email: 'admin@ghumofiroo.com',
    user_name: 'Admin User',
    action: 'UPDATE_PACKAGE_HOTEL',
    module: 'Packages',
    record_id: 'char-dham-yatra-from-delhi',
    target_name: 'Char Dham Yatra from Delhi (12D/11N)',
    old_value: 'Barkot Himalayan Resort',
    new_value: 'Camp Nirwana Barkot (Luxury Cottage)',
    details: 'Package hotel updated for Day 2 Barkot stay'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user_email: 'operations@ghumofiroo.com',
    user_name: 'Operations Manager',
    action: 'UPDATE_CAB_RATE',
    module: 'Cabs',
    record_id: 'rate-kerala-innova-01',
    target_name: 'Innova Crysta - Cochin to Munnar Circuit',
    old_value: 'Block Cost: ₹14,500',
    new_value: 'Block Cost: ₹16,000 (3N/4D)',
    details: 'Rate model set to Block Circuit 3N/4D'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user_email: 'admin@ghumofiroo.com',
    user_name: 'Admin User',
    action: 'BULK_IMPORT',
    module: 'Sightseeing',
    record_id: 'bulk-import-003',
    target_name: 'White Rann & Kerala Sightseeing Master',
    old_value: '0 Records',
    new_value: '3 Records Bulk Imported',
    details: 'Bulk imported White Rann Sunrise Walk, Mattupetty Dam, Badrinath Temple'
  }
];

const mapDbRecordTypeToModule = (recordType?: string): AuditLogEntry['module'] => {
  const lower = (recordType || '').toLowerCase();
  if (lower.includes('hotel')) return 'Hotels';
  if (lower.includes('cab')) return 'Cabs';
  if (lower.includes('sightseeing')) return 'Sightseeing';
  if (lower.includes('activit')) return 'Activities';
  if (lower.includes('package')) return 'Packages';
  if (lower.includes('lead')) return 'Leads';
  if (lower.includes('blog')) return 'Blogs';
  return 'System';
};

export const auditLogger = {
  // Get all audit logs (from live MySQL database audit_logs table, merged with cached local trail)
  getLogs: async (): Promise<AuditLogEntry[]> => {
    let localLogs: AuditLogEntry[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_LOGS_KEY);
      if (stored) {
        localLogs = JSON.parse(stored);
      } else {
        localLogs = INITIAL_BASELINE_LOGS;
      }
    } catch {
      localLogs = INITIAL_BASELINE_LOGS;
    }

    // Attempt to query real MySQL database audit logs
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch('/php-backend/audit_logs.php?action=list_audit_logs&limit=200', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.audit_logs)) {
          const dbLogs: AuditLogEntry[] = json.audit_logs.map((row: any) => ({
            id: row.id || `db-${row.created_at}`,
            timestamp: row.created_at || new Date().toISOString(),
            user_email: row.user_email || 'staff@ghumofiroo.com',
            user_name: row.user_name || 'Staff User',
            action: row.action || 'DATABASE_OP',
            module: mapDbRecordTypeToModule(row.record_type),
            record_id: row.record_id || String(row.lead_id || ''),
            target_name: row.new_value || row.record_type || 'Database Record',
            old_value: row.old_value,
            new_value: row.new_value,
            details: `MySQL DB Audit [${row.action}] on ${row.record_type || 'record'} ${row.record_id || ''}`
          }));

          // Merge dbLogs and localLogs, deduplicating by ID
          const seenIds = new Set<string>();
          const merged: AuditLogEntry[] = [];
          for (const item of [...dbLogs, ...localLogs]) {
            if (item.id && seenIds.has(item.id)) continue;
            if (item.id) seenIds.add(item.id);
            merged.push(item);
          }
          return merged.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        }
      }
    } catch (err) {
      console.warn('[auditLogger] Failed to fetch server database audit logs, using local fallback:', err);
    }

    return localLogs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  },

  // Record a new Audit Log entry
  log: async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> => {
    const timestamp = new Date().toISOString();
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: AuditLogEntry = { id, timestamp, ...entry };

    // Save to localStorage
    try {
      const stored = localStorage.getItem(LOCAL_LOGS_KEY);
      const logs: AuditLogEntry[] = stored ? JSON.parse(stored) : INITIAL_BASELINE_LOGS;
      logs.unshift(fullEntry);
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs.slice(0, 500))); // keep latest 500 logs
    } catch (e) {
      console.error('Error saving local audit log:', e);
    }

    return fullEntry;
  },

  // Clear audit logs
  clearLogs: (): void => {
    localStorage.removeItem(LOCAL_LOGS_KEY);
  }
};
