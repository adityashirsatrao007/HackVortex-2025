
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Header from "@/components/shared/header";
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's no current user, redirect to login.
    // Don't redirect if already on an auth page (though this layout is for (app) group)
    if (!loading && !currentUser) {
       if (pathname !== '/login' && pathname !== '/signup') {
         router.push('/login');
       }
    }
  }, [currentUser, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // This check is technically redundant due to useEffect but good for safety.
  // If there's no user and loading is done, children shouldn't render.
  // The redirect should have already happened.
  if (!currentUser) {
     // This path should ideally not be reached if redirection works.
     // You might want to show a specific "Redirecting..." message or null.
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Redirecting to login...</p>
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
