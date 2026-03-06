'use client';

import { useEffect } from 'react';
import { useTracking } from '@/hooks/use-tracking';
import { useAuth } from '@/contexts/auth-context';

interface PageTrackerProps {
  children: React.ReactNode;
  pageTitle?: string;
  contentId?: string;
  trackTimeSpent?: boolean;
}

export function PageTracker({ 
  children, 
  pageTitle, 
  contentId,
  trackTimeSpent = true 
}: PageTrackerProps) {
  const { trackPageView, trackTimeOnPage, isTrackingEnabled } = useTracking();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isTrackingEnabled || !isAuthenticated) return;

    // Trackear vista de página
    trackPageView(pageTitle);

    // Configurar tracking de tiempo si está habilitado
    let cleanup: (() => void) | undefined;
    if (trackTimeSpent) {
      cleanup = trackTimeOnPage();
    }

    // Cleanup al desmontar el componente
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [trackPageView, trackTimeOnPage, pageTitle, isTrackingEnabled, isAuthenticated, trackTimeSpent]);

  return <>{children}</>;
}

// HOC para envolver páginas automáticamente
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    pageTitle?: string;
    contentId?: string;
    trackTimeSpent?: boolean;
  }
) {
  const WrappedComponent = (props: P) => (
    <PageTracker {...options}>
      <Component {...props} />
    </PageTracker>
  );

  WrappedComponent.displayName = `withPageTracking(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}