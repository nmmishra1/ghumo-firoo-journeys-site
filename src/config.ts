
/**
 * Global configuration for the application.
 * 
 * This file centralizes all configuration variables, ensuring consistency
 * across the application. It includes error handling for missing or malformed
 * values and supports environment-specific overrides.
 */

interface AppConfig {
  baseUrl: string;
  apiUrl?: string;
}

const getBaseUrl = (): string => {
  // Check for environment variable first (Vite uses import.meta.env)
  const envBaseUrl = (import.meta as any).env?.VITE_SITE_URL;
  
  if (envBaseUrl) {
    // Validate the URL format
    try {
      new URL(envBaseUrl);
      return envBaseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    } catch (e) {
      console.error(`Invalid VITE_SITE_URL environment variable: ${envBaseUrl}. Falling back to default.`);
    }
  }

  // Default production URL
  const defaultUrl = 'https://ghumofiroo.com';
  return defaultUrl;
};

export const config: AppConfig = {
  baseUrl: getBaseUrl(),
};

// Error handling: Ensure baseUrl is defined (it should be due to the default, but good practice)
if (!config.baseUrl) {
  console.error('CRITICAL: baseUrl is not defined in the configuration!');
  // Fallback to a safe default if somehow everything fails, though the getBaseUrl logic prevents this
  config.baseUrl = 'https://ghumofiroo.com'; 
}

export default config;
