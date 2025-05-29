
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase, ListChecks, UserCircle, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            : 'hover:text-primary',
          isActive 
            ? (isDesktop ? 'text-primary bg-accent/15 font-semibold' : 'text-primary font-semibold') 
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
  const closeSheet = () => setIsSheetOpen(false);

  // Mock authentication state
  const isAuthenticated = true; // Replace with actual auth check

  const navItems = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: <Briefcase className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/bookings', label: 'Bookings', icon: <ListChecks className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/profile', label: 'Profile', icon: <UserCircle className="h-4 w-4 mr-2 md:mr-0" /> },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2" prefetch={false}>
          <Handshake className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-foreground">Karigar Kart</span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex"> {/* Reduced gap for tighter link spacing with padding */}
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} isDesktop>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
        
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          {isAuthenticated && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-1 p-4"> {/* Reduced gap for menu items */}
                  <Link href={isAuthenticated ? "/dashboard" : "/"} className="mb-4 flex items-center gap-2" onClick={closeSheet} prefetch={false}>
                     <Handshake className="h-7 w-7 text-primary" />
                    <span className="text-lg font-semibold">Karigar Kart</span>
                  </Link>
                  {navItems.map((item) => (
                    <NavLink 
                      key={item.href} 
                      href={item.href} 
                      className="flex items-center gap-2 text-base px-3 py-3 rounded-md" // Added padding and rounded for mobile
                      onClick={closeSheet}
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                   <Button variant="outline" className="mt-auto" onClick={() => { console.log("Logout clicked"); closeSheet(); /* router.push('/') */ }}>
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
           {isAuthenticated && (
             <Button variant="outline" className="hidden md:inline-flex" onClick={() => console.log("Logout clicked") /* router.push('/') */}>
              Logout
            </Button>
           )}
        </div>
      </div>
    </header>
  );
}
