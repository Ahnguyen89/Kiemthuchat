"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';

interface AuthSectionLayoutProps {
  children: React.ReactNode;
}

export default function AuthSectionLayout({ children }: AuthSectionLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  // Show loading only on server render
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}


