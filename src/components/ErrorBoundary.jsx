import React from 'react';

/*
 * Error boundary.
 *
 * Before this existed, a single throw anywhere in the tree — or a lazy chunk
 * that failed to arrive, which Suspense re-throws — unmounted the entire app
 * and left a blank white page. The preloader has already removed itself by
 * then, so there was nothing on screen and nothing to click.
 *
 * Each section gets its own boundary (see App.jsx), so a failure in, say, the
 * contact form costs the visitor that one panel instead of the whole site.
 *
 * `resetKey` lets the retry button remount the subtree: React keeps a boundary
 * in its error state until it is told the cause may have gone away, and a
 * failed chunk import is exactly the kind of thing a retry can fix.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Kept as a console error rather than swallowed: without it a section that
    // silently renders its fallback gives no clue what actually broke.
    console.error('Section failed to render:', error, info?.componentStack);

    /*
     * The preloader is dismissed from an effect inside App. If the throw
     * happened before that ran — which is exactly what a broken shell looks
     * like — the preloader is still covering the viewport at z-index 99999 and
     * this message would render underneath it, leaving the visitor watching a
     * loading animation for a page that has already given up.
     */
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.remove();
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    const { error, resetKey } = this.state;
    const { children, label = 'This section', minHeight = '40vh' } = this.props;

    if (!error) return <React.Fragment key={resetKey}>{children}</React.Fragment>;

    /*
     * Chrome (navbar, footer) passes `fallback` — usually null. A decorative
     * shell that fails should quietly disappear; replacing it with a
     * full-width "something went wrong" panel would be a louder failure than
     * the thing that broke.
     */
    if ('fallback' in this.props) return this.props.fallback;

    return (
      <div
        className="section-shell max-w-2xl flex items-center justify-center"
        style={{ minHeight }}
        role="alert"
      >
        <div className="glass-card p-8 text-center w-full">
          <p className="section-eyebrow">Something went wrong</p>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            {label} could not be loaded
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            This is usually a dropped connection while the page was still loading.
            The rest of the site is unaffected.
          </p>
          <button type="button" className="btn-outline" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}
