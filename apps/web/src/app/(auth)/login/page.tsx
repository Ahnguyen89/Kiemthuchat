"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, verifyEmailSchema, resendVerificationSchema } from '@canvas-llm/shared';
import { useAuth } from '@/hooks/use-auth';
import type { LoginRequest, VerifyEmailRequest, ResendVerificationRequest } from '@canvas-llm/shared';
import { EyeIcon, EyeOffIcon, GitHubIcon, GoogleIcon, UserIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const { 
    login, 
    isLoginLoading, 
    verifyEmail, 
    resendVerification, 
    isVerifyEmailLoading, 
    isResendVerificationLoading 
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const verificationForm = useForm<VerifyEmailRequest>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: userEmail,
    },
  });

  const resendForm = useForm<ResendVerificationRequest>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: userEmail,
    },
  });

  // Update verification form when email changes
  React.useEffect(() => {
    if (userEmail) {
      verificationForm.setValue('email', userEmail);
      resendForm.setValue('email', userEmail);
    }
  }, [userEmail, verificationForm, resendForm]);

  // Handle resend cooldown
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendCooldown]);

  // Show verification form when user needs to verify
  React.useEffect(() => {
    const handleUnverifiedUser = (event: CustomEvent) => {
      setShowVerification(true);
      if (event.detail?.email) {
        setUserEmail(event.detail.email);
      }
    };

    // Listen for unverified user events
    window.addEventListener('unverified-user', handleUnverifiedUser as EventListener);
    
    return () => {
      window.removeEventListener('unverified-user', handleUnverifiedUser as EventListener);
    };
  }, []);

  // Reset verification form when going back to login
  React.useEffect(() => {
    if (!showVerification) {
      setUserEmail('');
    }
  }, [showVerification]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: LoginRequest) => {
    // Store email for potential verification
    setUserEmail(data.email);
    login(data);
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/github`;
  };

  const onVerifyEmail = (data: VerifyEmailRequest) => {
    verifyEmail(data);
  };

  const onResendCode = (data: ResendVerificationRequest) => {
    resendVerification(data);
    setResendCooldown(60); // 60 seconds cooldown
    setIsResendDisabled(true);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="relative w-full flex items-center justify-center font-sans overflow-hidden">

      {/* Login Card - More compact and shadcn-like */}
      <div className="relative w-full max-w-sm p-6 space-y-6 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-zinc-900/50">

        {/* Header section with icon and title - More compact */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
            <UserIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Enter your credentials to sign in</p>
          </div>
        </div>

        {/* Social Login */}
        {!showVerification && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4 mr-4 ml-4">
                <button
                  type="button"
              onClick={handleGithubLogin}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <GitHubIcon />
                  <span className="ml-2">GitHub</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </button>
              </div>

            {/* OR Divider - More subtle */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                  Or continue with
                </span>
              </div>
            </div>
          </>
        )}

        {/* Form - Shadcn style */}
        {!showVerification && (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="john@example.com"
                  {...register('email')}
                className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
              />
              
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-5 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoginLoading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 px-4 py-2 w-full"
            >
              {isLoginLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Email Verification Section */}
        {showVerification && (
          <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Verify Your Email
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                We&apos;ve sent a verification code to <strong>{userEmail}</strong>
              </p>
            </div>

            <form onSubmit={verificationForm.handleSubmit(onVerifyEmail)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verification-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...verificationForm.register('code')}
                  className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-5 text-center text-lg tracking-widest shadow-sm transition-colors placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {verificationForm.formState.errors.code && (
                  <p className="text-sm text-red-600">{verificationForm.formState.errors.code.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyEmailLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 px-4 py-2 w-full"
              >
                {isVerifyEmailLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                  Didn&apos;t receive the code?
                </span>
              </div>
            </div>

            <form onSubmit={resendForm.handleSubmit(onResendCode)}>
              <button
                type="submit"
                disabled={isResendVerificationLoading || isResendDisabled}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
              >
                {isResendVerificationLoading
                  ? 'Sending...'
                  : isResendDisabled
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Verification Code'}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Back to login
              </button>
            </div>
          </div>
        )}

        {/* Footer links - More compact */}
        {!showVerification && (
          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                  href="/register"
                  className="font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Sign up
                </Link>
            </p>
            <a href="#" className="text-sm font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              Forgot your password?
            </a>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}