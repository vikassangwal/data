'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if we have a pathname and we're not on an admin route
    if (pathname && !pathname.startsWith('/admin')) {
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: pathname }),
      }).catch(err => console.error('Failed to log page view:', err));
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
