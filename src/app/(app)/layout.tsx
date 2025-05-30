
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
  const searchParams = useSearchParams(); 

  useEffect(() => {
    if (loading) return; 

    if (!currentUser) {
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
      return;
    }

    if (!userAppRole && pathname !== '/profile') {
      router.push('/profile?roleSelection=true'); 
      return;
    }

    if (userAppRole && !isProfileComplete && pathname !== '/profile') {
      router.push('/profile?new=true'); 
      return;
    }

  }, [currentUser, userAppRole, loading, isProfileComplete, router, pathname]);

  const FullPageLoader = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    </div>
  );
  
  if (loading) {
    return <FullPageLoader message="Initializing..." />;
  }

  if (!currentUser) {
    if (pathname !== '/login' && pathname !== '/signup') {
      return <FullPageLoader message="Redirecting to login..." />;
    }
    // Allow login/signup pages to render their own content if !currentUser
  }
  
  if (currentUser && !userAppRole && pathname !== '/profile') {
      return <FullPageLoader message="Redirecting to select role..." />;
  }
  
  if (currentUser && userAppRole && !isProfileComplete && pathname !== '/profile') {
      return <FullPageLoader message="Redirecting to complete profile..." />;
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
