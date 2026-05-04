'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthRouteGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export function AuthRouteGuard({ children, requireVerification = true }: AuthRouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (!isAuthenticated) {
        // User is not logged in, redirect to login
        hasRedirected.current = true;
        router.push('/login');
        return;
      }

      if (requireVerification && user && !user.isEmailVerified) {
        // User is logged in but email is not verified, redirect to verification
        hasRedirected.current = true;
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requireVerification, router]);

  // Reset redirect flag when authentication state changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [isAuthenticated, user?.isEmailVerified]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or not verified
  if (!isAuthenticated || (requireVerification && user && !user.isEmailVerified)) {
    return null;
  }

  return <>{children}</>;
}

