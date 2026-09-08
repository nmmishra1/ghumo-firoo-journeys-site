
import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { installApiCacheInterceptor } from '@/utils/crmCache';

// Activate universal in-memory API caching, request deduplication, and auto-invalidation
installApiCacheInterceptor();

// Ultra-robust error boundary with better error isolation
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '16px' }}>Oops! Something went wrong</h1>
          <p style={{ marginBottom: '24px', color: '#6c757d' }}>
            We're sorry, but there was an error loading the application.
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced global error handlers with better isolation
window.addEventListener('error', function(event) {
  const message = event.message || 'Unknown runtime error';
  const filename = event.filename || '';
  const lineno = event.lineno || 0;
  const colno = event.colno || 0;
  const errorObj = event.error;

  // Mask details for standard cross-origin script / postMessage targetOrigin errors
  if ((message === 'Script error.' && !filename) || message.includes('postMessage') || message.includes('target origin')) {
    console.warn('Cross-origin/iframe postMessage error intercepted (suppressed details)');
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  // Check if it's from a known external script, extension, or third-party tracking script
  const isExtension = filename.startsWith('chrome-extension://') || filename.startsWith('moz-extension://');
  const isExternal = filename.includes('googletagmanager.com') || 
                     filename.includes('facebook.net') || 
                     filename.includes('google-analytics.com') ||
                     filename.includes('b2bta-production') || 
                     filename.includes('s3.ap-south-1.amazonaws.com');

  if (isExtension || isExternal) {
    console.warn('External script/extension error intercepted (prevented app crash):', {
      message,
      filename,
      lineno,
      colno
    });
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  // Otherwise, log it in detail so it's debuggable in development
  console.error('Global error intercepted:', {
    message,
    filename,
    lineno,
    colno,
    error: errorObj ? (errorObj.stack || errorObj.message || errorObj) : null
  });
});

window.addEventListener('unhandledrejection', function(event) {
  const reason = event.reason;
  const reasonString = reason?.toString?.() || String(reason);
  
  // Suppress extensions, adblockers, and analytics errors
  if (
    reasonString.includes('b2bta') ||
    reasonString.includes('message channel closed') ||
    reasonString.includes('listener indicated') ||
    reasonString.includes('async response') ||
    reasonString.includes('chrome-extension') ||
    reasonString.includes('Google') ||
    reasonString.includes('Analytics')
  ) {
    console.warn('External script or extension unhandled promise rejection intercepted:', reasonString);
    event.preventDefault();
    return;
  }
  
  console.error('Unhandled promise rejection intercepted:', reason);
});

// Handle runtime errors from extensions/content scripts
window.addEventListener('message', (event) => {
  // Allow safe cross-origin communication
  if (event.origin !== window.location.origin) {
    return;
  }
  // Just log, don't crash
}, { passive: true });

// Initialize React application
try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  );
  
} catch (error) {
  console.error('❌ Critical error during React initialization:', error);
  
  // Enhanced fallback rendering
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f8f9fa;">
        <h1 style="color: #dc3545; margin-bottom: 16px;">Application Loading Error</h1>
        <p style="margin-bottom: 24px; color: #6c757d;">The application failed to initialize. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Refresh Page
        </button>
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; max-width: 500px;">
          <strong>Error Details:</strong> ${error.message || 'Unknown error'}
        </div>
      </div>
    `;
  }
}
