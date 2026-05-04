"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { AuthRouteGuard } from '@/components/auth-route-guard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [hydrated, setHydrated] = React.useState(
    // Zustand persist helper to know if state is rehydrated
    // This avoids redirect flicker on initial mount/refresh
    (useAuthStore as any).persist?.hasHydrated?.() ?? false
  );

  React.useEffect(() => {
    const unsub = (useAuthStore as any).persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });
    // In case there's no persist middleware available
    if (!(useAuthStore as any).persist) {
      setHydrated(true);
    }
    return () => {
      unsub?.();
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthRouteGuard requireVerification={true}>
      <div className="flex h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </AuthRouteGuard>
  );
}
