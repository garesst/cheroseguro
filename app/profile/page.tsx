'use client';

import { useEffect } from 'react';
import { useRequireAuth } from '@/contexts/auth-context';
import { PageTracker } from '@/components/tracking/page-tracker';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import UserDashboard from '@/components/dashboard/user-dashboard';

export default function ProfilePage() {
  const auth = useRequireAuth();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600">Cargando perfil...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return null; // El hook useRequireAuth maneja la redirección
  }

  return (
    <PageTracker pageTitle={`Perfil de ${auth.user.first_name} - Chero Seguro`}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <main className="flex-1 container mx-auto py-6 px-4">
          <UserDashboard 
            user={auth.user} 
            profile={auth.profile} 
            stats={auth.stats}
            recentActivities={auth.recentActivities}
            practiceProgress={auth.practiceProgress}
            onRefresh={auth.refreshProfile} 
          />
        </main>
        <SiteFooter />
      </div>
    </PageTracker>
  );
}
