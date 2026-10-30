'use client';

import { useEffect } from 'react';

/** Last-resort boundary: replaces the root layout, so it must render <html> and <body>. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          margin: 0,
          background: '#f6f7fb',
          color: '#1b1f3b',
        }}
      >
        <main style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>ShopNest is having trouble loading</h1>
          <p style={{ color: '#4a5183' }}>Reload the page to try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              borderRadius: 999,
              border: 0,
              background: '#1b1f3b',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
