
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced error boundary with better error handling
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
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>We're sorry, but something went wrong. Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add more detailed console logs for debugging
console.log('Starting React app initialization...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found in DOM');
  }
  
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering React app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Fallback: show a basic error message
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading Error</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
