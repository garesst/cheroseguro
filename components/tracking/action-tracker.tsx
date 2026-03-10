'use client';

import React from 'react';
import { useTracking } from '@/hooks/use-tracking';

interface ActionTrackerProps {
  children: React.ReactElement<any>;
  action: string;
  category: string;
  details?: any;
}

export function ActionTracker({ children, action, category, details = {} }: ActionTrackerProps) {
  const { trackInteraction } = useTracking();

  const handleClick = async (originalEvent: any) => {
    // Track the interaction
    await trackInteraction({
      activity_type: 'interaction',
      content_type: 'page',
      content_id: window.location.pathname,
      interaction_type: 'click',
      session_data: {
        action,
        category,
        ...details,
      },
    });
    
    // Call original onClick if it exists
    if (children.props.onClick) {
      children.props.onClick(originalEvent);
    }
  };

  // Clone the child element and add our onClick handler
  return React.cloneElement(children, {
    onClick: handleClick
  });
}