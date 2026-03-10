'use client';

import { useAuth } from '@/contexts/auth-context';
import { useCallback } from 'react';

export interface TrackingEvent {
  activity_type: 'learn' | 'practice' | 'play' | 'certification' | 'interaction' | 'navigation';
  content_id?: string;
  content_title?: string;
  score?: number;
  time_spent_minutes?: number;
  session_data?: Record<string, any>;
  interaction_type?: 'view' | 'click' | 'time_spent' | 'share' | 'bookmark' | 'download';
  content_type?: 'page' | 'exercise' | 'lesson' | 'certification' | 'external_link';
}

export function useTracking() {
  const { isAuthenticated, user } = useAuth();

  // Función para registrar una actividad de aprendizaje
  const trackLearningActivity = useCallback(async (event: TrackingEvent) => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await fetch('/api/tracking/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          activity_type: event.activity_type,
          content_id: event.content_id || null,
          content_title: event.content_title || null,
          score: event.score || null,
          time_spent_minutes: event.time_spent_minutes || 0,
          session_data: {
            ...event.session_data,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('trackLearningActivity failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error tracking learning activity:', error);
    }
  }, [isAuthenticated, user]);

  // Función para registrar interacción con contenido
  const trackInteraction = useCallback(async (event: TrackingEvent) => {
    if (!isAuthenticated || !user) return;

    try {
      await fetch('/api/tracking/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content_type: event.content_type || 'page',
          content_id: event.content_id || window.location.pathname,
          interaction_type: event.interaction_type || 'view',
          session_id: `session_${Date.now()}`,
          interaction_data: {
            ...event.session_data,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [isAuthenticated, user]);

  // Función para actualizar progreso de práctica
  const trackPracticeProgress = useCallback(async (
    practiceSlug: string,
    practiceTitle: string,
    progressData: {
      status?: 'not_started' | 'in_progress' | 'completed' | 'mastered';
      completion_percentage?: number;
      score?: number;
      time_spent_minutes?: number;
    }
  ) => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await fetch('/api/tracking/practice-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          practice_slug: practiceSlug,
          practice_title: practiceTitle,
          ...progressData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('trackPracticeProgress failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error tracking practice progress:', error);
    }
  }, [isAuthenticated, user]);

  // Función para rastrear tiempo en página
  const trackTimeOnPage = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const startTime = Date.now();
    const currentPath = window.location.pathname;

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutos
      
      if (timeSpent > 0) {
        // Usar sendBeacon para envío confiable al cerrar la página
        navigator.sendBeacon(
          '/api/tracking/time-spent',
          JSON.stringify({
            content_id: currentPath,
            time_spent_minutes: timeSpent,
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user]);

  // Función automática para rastrear vista de página
  const trackPageView = useCallback(async (pageTitle?: string) => {
    await trackInteraction({
      activity_type: 'interaction',
      content_type: 'page',
      content_id: window.location.pathname,
      content_title: pageTitle || document.title,
      interaction_type: 'view',
      session_data: {
        referrer: document.referrer,
        screen_resolution: `${screen.width}x${screen.height}`,
      },
    });
  }, [trackInteraction]);

  // Función para rastrear clics en elementos importantes
  const trackClick = useCallback(async (elementId: string, context?: Record<string, any>) => {
    await trackInteraction({
      activity_type: 'interaction',
      content_type: 'page',
      content_id: window.location.pathname,
      interaction_type: 'click',
      session_data: {
        element_id: elementId,
        ...context,
      },
    });
  }, [trackInteraction]);

  // Función para rastrear progreso de certificación
  const trackCertificationProgress = useCallback(async (
    certificationName: string,
    progressData: {
      status?: 'not_started' | 'in_progress' | 'completed' | 'certified' | 'failed';
      current_score?: number;
      questions_answered?: number;
      total_questions?: number;
      time_remaining_minutes?: number;
      answers_data?: Record<string, any>;
    }
  ) => {
    if (!isAuthenticated || !user) return;

    try {
      await fetch('/api/tracking/certification-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          certification_name: certificationName,
          ...progressData,
        }),
      });
    } catch (error) {
      console.error('Error tracking certification progress:', error);
    }
  }, [isAuthenticated, user]);

  return {
    trackLearningActivity,
    trackInteraction,
    trackPracticeProgress,
    trackTimeOnPage,
    trackPageView,
    trackClick,
    trackCertificationProgress,
    isTrackingEnabled: isAuthenticated,
  };
}