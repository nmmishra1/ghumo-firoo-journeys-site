export interface StoredLead {
  id: string;
  data: any;
  timestamp: string;
  retryCount: number;
}

const STORAGE_KEY = 'pending_leads_backup';

// Simple UUID generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const saveToBackup = (data: any): void => {
  try {
    const currentBackups: StoredLead[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const newLead: StoredLead = {
      id: generateUUID(),
      data: data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    currentBackups.push(newLead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBackups));
    console.log('Lead backed up locally due to transmission failure');
  } catch (error) {
    console.error('Failed to save lead backup locally:', error);
  }
};

export const getBackups = (): StoredLead[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const removeBackup = (id: string): void => {
  try {
    const currentBackups = getBackups();
    const updatedBackups = currentBackups.filter(lead => lead.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBackups));
  } catch (error) {
    console.error('Failed to remove backup:', error);
  }
};

export const updateRetryCount = (id: string): void => {
  try {
    const currentBackups = getBackups();
    const updatedBackups = currentBackups.map(lead => {
      if (lead.id === id) {
        return { ...lead, retryCount: lead.retryCount + 1 };
      }
      return lead;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBackups));
  } catch (error) {
    console.error('Failed to update retry count:', error);
  }
};
