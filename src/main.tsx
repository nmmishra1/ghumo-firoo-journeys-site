
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
  console.error('Global error intercepted:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // Prevent external script errors from breaking React app
  if (event.filename && (
    event.filename.includes('b2bta-production') || 
    event.filename.includes('s3.ap-south-1.amazonaws.com')
  )) {
    console.warn('External script error detected - preventing app crash');
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection intercepted:', event.reason);
  
  // Check if rejection is from external script
  if (event.reason && event.reason.toString && event.reason.toString().includes('b2bta')) {
    console.warn('External script promise rejection - preventing app crash');
    event.preventDefault();
    return;
  }
});

console.log('🚀 Initializing React application...');

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('✅ Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('✅ Rendering application...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('✅ React application rendered successfully');
  
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
