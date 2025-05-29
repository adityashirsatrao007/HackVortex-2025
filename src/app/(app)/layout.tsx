
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from "@/components/shared/header";
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, userAppRole, loading, isProfileComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Keep this if used by profile page for query params

  useEffect(() => {
    if (loading) return; // Wait if auth state is still loading

    if (!currentUser) {
      // If not logged in and not on auth pages, redirect to login
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
      return;
    }

    // User is logged in (currentUser exists)
    // If role is not selected yet, and not on profile page, redirect to profile page
    if (!userAppRole && pathname !== '/profile') {
      router.push('/profile?roleSelection=true'); // Indicate role selection is needed
      return;
    }

    // If role is selected, but profile is not complete,
    // and not on profile page, redirect to profile page to complete details.
    if (userAppRole && !isProfileComplete && pathname !== '/profile') {
      router.push('/profile?new=true'); // Indicate profile completion is needed
      return;
    }

  }, [currentUser, userAppRole, loading, isProfileComplete, router, pathname]);

  // Global loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  // If not loading, but no currentUser (should be handled by redirect above, but as a fallback)
  if (!currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }
  
  // If role is not selected and not on profile page yet (pre-redirect moment)
  if (!userAppRole && pathname !== '/profile') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Redirecting to select role...</p>
        </div>
      );
  }
  
  // If profile is not complete and not on profile page yet (pre-redirect moment)
  if (userAppRole && !isProfileComplete && pathname !== '/profile') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Redirecting to complete profile...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Karigar Kart. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
