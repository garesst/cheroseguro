'use client';

import { useEffect, useRef } from 'react';
import { useTracking } from '@/hooks/use-tracking';
import { useAuth } from '@/contexts/auth-context';

interface ArticleReadTrackerProps {
  articleId: string;
  articleTitle: string;
  difficulty?: string;
}

export function ArticleReadTracker({ articleId, articleTitle, difficulty }: ArticleReadTrackerProps) {
  const { trackLearningActivity, isTrackingEnabled } = useTracking();
  const { refreshProfile } = useAuth();
  const hasTracked = useRef(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isTrackingEnabled || !articleId || hasTracked.current) return;
    hasTracked.current = true;
    startTimeRef.current = Date.now();

    (async () => {
      await trackLearningActivity({
        activity_type: 'learn',
        content_id: articleId,
        content_title: articleTitle,
        time_spent_minutes: 0,
        session_data: { source: 'article_page_view', difficulty: difficulty || 'beginner' },
      });
      await refreshProfile();
    })();

    // On unmount: send actual time spent via sendBeacon (cookies are included automatically)
    return () => {
      const timeSpentMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
      if (timeSpentMinutes < 1) return;
      navigator.sendBeacon(
        '/api/tracking/activities',
        new Blob(
          [JSON.stringify({
            activity_type: 'learn',
            content_id: articleId,
            content_title: articleTitle,
            time_spent_minutes: timeSpentMinutes,
            status: 'completed',
            session_data: { source: 'article_time_spent', difficulty: difficulty || 'beginner' },
          })],
          { type: 'application/json' }
        )
      );
    };
  }, [articleId, articleTitle, difficulty, isTrackingEnabled, trackLearningActivity, refreshProfile]);

  return null;
}
