
'use client'; // This page uses hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SignupForm } from "@/components/auth/signup-form";
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { currentUser, isProfileComplete, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in and profile is complete, redirect to dashboard
    if (!authLoading && currentUser && isProfileComplete) {
      router.push('/dashboard');
    }
  }, [currentUser, isProfileComplete, authLoading, router]);

  // Show a loading indicator while auth state is being checked,
  // especially if a redirect might occur.
   if (authLoading || (currentUser && isProfileComplete)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and user is not logged in (or profile incomplete), show signup form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4 py-8">
      <SignupForm />
    </div>
  );
}
