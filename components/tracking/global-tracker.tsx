'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTracking } from '@/hooks/use-tracking';
import { useAuth } from '@/contexts/auth-context';

export function GlobalTracker() {
  const pathname = usePathname();
  const { trackPageView, isTrackingEnabled } = useTracking();
  const { isAuthenticated } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isTrackingEnabled || !isAuthenticated) return;
    // Evitar trackear la misma ruta dos veces seguidas
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    trackPageView(document.title);
  }, [pathname, isTrackingEnabled, isAuthenticated, trackPageView]);

  return null;
}
