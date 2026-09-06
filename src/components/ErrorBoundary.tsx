// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo } from 'react';
import App from 'src/App';

export class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>❌ خطایی رخ داده است</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>🔄 تلاش مجدد</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// استفاده در App.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>