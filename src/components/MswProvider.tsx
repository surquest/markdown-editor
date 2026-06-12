'use client';

import { useEffect, useState } from 'react';

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function enableMocking() {
      if (typeof window !== 'undefined') {
        const { worker } = await import('../mocks/browser');
        // `worker.start()` returns a Promise that resolves
        // once the Service Worker is up and ready to intercept requests.
        try {
          await worker.start({
            serviceWorker: {
              url: '/markdown-editor/mockServiceWorker.js'
            },
            onUnhandledRequest: 'bypass',
          });
        } catch (error) {
          console.error('Failed to start MSW:', error);
        }
        
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    enableMocking();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    // Alternatively return children if we don't want to block rendering
    return null;
  }

  return <>{children}</>;
}