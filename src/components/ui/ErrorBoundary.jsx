import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.decorative) return this.props.fallback || null;
    return (
      <main className="section-shell text-center min-h-screen flex flex-col items-center justify-center gap-5">
        <h1 className="section-title">Let’s reconnect</h1>
        <p style={{ color: 'var(--text-secondary)' }}>The portfolio could not load. Please try refreshing, or get in touch directly.</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Reload portfolio</button>
        <a href="mailto:akashsankarv@gmail.com" className="underline">Email Akash</a>
      </main>
    );
  }
}
