
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
  const { currentUser, loading, isProfileComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
      return;
    }

    // If user is logged in, but profile is not complete,
    // and they are not already on the profile page, redirect them.
    // The `new=true` query param is just indicative, actual check is `isProfileComplete`.
    if (currentUser && !isProfileComplete && pathname !== '/profile') {
      router.push('/profile?new=true');
    }

  }, [currentUser, loading, isProfileComplete, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }
  
  // If profile is not complete and we are not on profile page yet, show loader.
  // This handles the brief moment before redirection effect kicks in.
  if (!isProfileComplete && pathname !== '/profile') {
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
