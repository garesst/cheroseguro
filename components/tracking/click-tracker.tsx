'use client';

import React from 'react';
import { useTracking } from '@/hooks/use-tracking';

interface ClickTrackerProps {
  children: React.ReactNode;
  elementId: string;
  context?: Record<string, any>;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export function ClickTracker({ 
  children, 
  elementId, 
  context,
  className,
  onClick 
}: ClickTrackerProps) {
  const { trackClick, isTrackingEnabled } = useTracking();

  const handleClick = async (event: React.MouseEvent) => {
    // Ejecutar el onClick original si existe
    if (onClick) {
      onClick(event);
    }

    // Trackear el clic si está habilitado
    if (isTrackingEnabled) {
      await trackClick(elementId, context);
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}

// Componente específico para trackear navegación
export function NavigationTracker({ 
  children, 
  destination,
  source,
  ...props 
}: {
  children: React.ReactNode;
  destination: string;
  source?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { trackClick, isTrackingEnabled } = useTracking();

  const handleNavigationClick = async () => {
    if (isTrackingEnabled) {
      await trackClick('navigation', {
        destination,
        source: source || 'unknown',
        action: 'navigate',
      });
    }
  };

  return (
    <div {...props} onClick={handleNavigationClick}>
      {children}
    </div>
  );
}

// Componente para trackear acciones específicas
export function ActionTracker({ 
  children, 
  action, 
  category,
  value,
  ...props 
}: {
  children: React.ReactNode;
  action: string;
  category?: string;
  value?: string | number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { trackClick, isTrackingEnabled } = useTracking();

  const handleActionClick = async () => {
    if (isTrackingEnabled) {
      await trackClick('action', {
        action,
        category: category || 'general',
        value,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div {...props} onClick={handleActionClick}>
      {children}
    </div>
  );
}