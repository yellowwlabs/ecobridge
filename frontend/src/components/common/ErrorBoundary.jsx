import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-neutral, #F4F6F9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div className="card glass-card fade-in-up" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '32px 24px',
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--signal-red, #EF4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--text-primary, #111827)',
              marginBottom: '8px'
            }}>
              ⚠️ Something Went Wrong / कुछ गड़बड़ हुई
            </h2>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted, #6B7280)',
              marginBottom: '20px',
              lineHeight: 1.4
            }}>
              The application encountered a display error. Tap below to reload cleanly.
              <br />
              ऐप लोड करने में समस्या आई। स्क्रीन रीलोड करने के लिए बटन दबाएं।
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: 'var(--bg-neutral, #F3F4F6)',
                border: '1px solid var(--border-subtle, #E5E7EB)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: 'var(--signal-red, #EF4444)',
                fontFamily: 'monospace',
                marginBottom: '20px',
                maxHeight: '100px',
                overflowY: 'auto',
                textAlign: 'left'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReset}
                className="btn-press"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--primary-accent, #3B82F6)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={18} /> Retry / रीलोड करें
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
