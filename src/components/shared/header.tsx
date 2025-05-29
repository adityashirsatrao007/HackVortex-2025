
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Briefcase, ListChecks, UserCircle, Handshake, LogOut, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isDesktop?: boolean;
}

const NavLink = ({ href, children, className, onClick, isDesktop }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} legacyBehavior passHref>
      <a
        onClick={onClick}
        className={cn(
          'text-sm font-medium transition-colors',
          isDesktop 
            ? 'hover:text-primary hover:bg-accent/10 px-3 py-2 rounded-md' 
            : 'hover:text-primary py-3 px-3 rounded-md hover:bg-accent/10 flex items-center text-base gap-2', // Consistent styling for mobile
          isActive 
            ? (isDesktop ? 'text-primary bg-accent/15 font-semibold' : 'text-primary font-semibold bg-accent/15') 
            : 'text-muted-foreground',
          className
        )}
      >
        {children}
      </a>
    </Link>
  );
};

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const closeSheet = () => setIsSheetOpen(false);

  const handleLogout = async () => {
    closeSheet();
    await logout();
    // router.push('/login'); // Auth context now handles redirect
  };

  const navItems = currentUser
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: <Briefcase className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/bookings', label: 'Bookings', icon: <ListChecks className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/profile', label: 'Profile', icon: <UserCircle className="h-4 w-4 mr-2 md:mr-0" /> },
      ]
    : [];

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (loading && !isAuthPage) { // Show minimal header or loader on protected pages during auth loading
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
           <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2" prefetch={false}>
            <Handshake className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
          </Link>
          {/* Optionally, a small loading indicator here */}
        </div>
      </header>
    );
  }
  
  // If on auth page, show a simplified header
  if (isAuthPage && !currentUser) {
     return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-center">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Handshake className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
          </Link>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2" prefetch={false}>
          <Handshake className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
        </Link>

        {/* Desktop Navigation */}
        {currentUser && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} isDesktop>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
        
        <div className="flex items-center gap-2">
          {!currentUser && !loading && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
              </Button>
            </div>
          )}

          {currentUser && (
            <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout} disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
           )}

          {/* Mobile Navigation Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b mb-2">
                  <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2" onClick={closeSheet} prefetch={false}>
                      <Handshake className="h-7 w-7 text-primary" />
                    <span className="text-lg font-semibold">Karigar Kart</span>
                  </Link>
                </div>
                <nav className="flex-grow p-4 space-y-1">
                  {currentUser ? (
                    navItems.map((item) => (
                      <NavLink 
                        key={item.href} 
                        href={item.href} 
                        onClick={closeSheet}
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ))
                  ) : (
                    <>
                      <NavLink href="/login" onClick={closeSheet}><LogIn className="mr-2 h-4 w-4" />Login</NavLink>
                      <NavLink href="/signup" onClick={closeSheet}><UserPlus className="mr-2 h-4 w-4" />Sign Up</NavLink>
                    </>
                  )}
                </nav>
                {currentUser && (
                  <div className="p-4 border-t mt-auto">
                    <Button variant="outline" className="w-full" onClick={handleLogout} disabled={loading}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                )}
              </div>
              <SheetClose onClick={closeSheet} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
