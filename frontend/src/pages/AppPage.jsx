import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

import App from '../App';
import ThreeBackground from '../components/ThreeBackground';
import './AppPage.css';

function AppPage() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Run after paint as well to beat browser restore timing on refresh.
    const raf = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="app-page-shell">
      <ThreeBackground className="app-bg-canvas" />
      <div className="app-bg-overlay" />
      <div className="app-content-layer">
        <div className="app-topbar">
          <Link to="/" className="app-back-button" aria-label="Back to landing page">
            ← Back
          </Link>
        </div>
        <App />
      </div>
    </div>
  );
}

export default AppPage;
