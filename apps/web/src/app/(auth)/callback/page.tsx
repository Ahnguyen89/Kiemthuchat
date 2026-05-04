"use client"

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/components/ui/use-toast';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams?.get('token');
    const refreshToken = searchParams?.get('refreshToken');

    if (token && refreshToken) {
      // For OAuth callback, we need to get user info from the tokens
      // Since we're getting tokens directly, we need to decode or fetch user info
      // For now, let's fetch user profile with the access token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      fetch(`${apiUrl}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            setAuth(data.data, token, refreshToken);
            toast({
              title: 'Welcome!',
              description: 'You have been successfully logged in with GitHub.',
            });
            router.push('/dashboard');
          } else {
            throw new Error('Failed to get user profile');
          }
        })
        .catch(error => {
          console.error('Auth callback error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication failed',
            description: 'There was an error logging you in. Please try again.',
          });
          router.push('/login');
        });
    } else {
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: 'Invalid authentication response. Please try again.',
      });
      router.push('/login');
    }
  }, [searchParams, router, setAuth, toast]);

  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing your login...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}