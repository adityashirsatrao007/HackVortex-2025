
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Briefcase, ListChecks, UserCircle, ShoppingCart, LogOut, LogIn, UserPlus, LayoutDashboard, CalendarClock, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/contexts/notification-context';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import type { NotificationType } from '@/lib/types';

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
            : 'hover:text-primary py-3 px-3 rounded-md hover:bg-accent/10 flex items-center text-base gap-2',
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

function NotificationItem({ notification, onMarkRead }: { notification: NotificationType, onMarkRead: (id: string) => void }) {
  return (
    <div className={cn("p-3 border-b border-border/50", !notification.read && "bg-primary/5")}>
      <p className="text-sm font-medium">{notification.message}</p>
      <p className="text-xs text-muted-foreground mb-1">
        For {notification.serviceCategory} by {notification.customerName}
      </p>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
        </p>
        {!notification.read && (
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-primary" onClick={() => onMarkRead(notification.id)}>
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
}


export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentUser, userAppRole, logout, loading, isProfileComplete } = useAuth();
  const { getUnreadNotificationsCount, getNotificationsForWorker, markAsRead, markAllAsRead } = useNotification();
  const router = useRouter();
  const pathname = usePathname();

  const closeSheet = () => setIsSheetOpen(false);

  const handleLogout = async () => {
    closeSheet();
    await logout();
  };

  let navItems = [];
  if (currentUser && isProfileComplete) { // Only show full nav if profile is complete
    if (userAppRole === 'worker') {
      navItems = [
        { href: '/dashboard', label: 'My Jobs', icon: <LayoutDashboard className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/bookings', label: 'Schedule', icon: <CalendarClock className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/profile', label: 'Profile', icon: <UserCircle className="h-4 w-4 mr-2 md:mr-0" /> },
      ];
    } else { // Customer or default
      navItems = [
        { href: '/dashboard', label: 'Find Workers', icon: <Briefcase className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/bookings', label: 'My Bookings', icon: <ListChecks className="h-4 w-4 mr-2 md:mr-0" /> },
        { href: '/profile', label: 'Profile', icon: <UserCircle className="h-4 w-4 mr-2 md:mr-0" /> },
      ];
    }
  } else if (currentUser && !isProfileComplete) { // If profile is not complete, only show Profile link
     navItems = [
        { href: '/profile', label: 'Complete Profile', icon: <UserCircle className="h-4 w-4 mr-2 md:mr-0" /> },
     ];
  }


  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const unreadCount = currentUser && userAppRole === 'worker' ? getUnreadNotificationsCount(currentUser.uid) : 0;
  const workerNotifications = currentUser && userAppRole === 'worker' ? getNotificationsForWorker(currentUser.uid) : [];

  if (loading && !isAuthPage && pathname !== '/profile') { 
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
           <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2" prefetch={false}>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
          </Link>
        </div>
      </header>
    );
  }
  
  if (isAuthPage && !currentUser) {
     return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-center">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
          </Link>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={currentUser && isProfileComplete ? "/dashboard" : (currentUser ? "/profile" : "/")} className="flex items-center gap-2" prefetch={false}>
          <ShoppingCart className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground md:text-2xl">Karigar Kart</span>
        </Link>

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

          {currentUser && userAppRole === 'worker' && isProfileComplete && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Notifications</h4>
                </div>
                <ScrollArea className="h-[300px]">
                  {workerNotifications.length > 0 ? (
                    workerNotifications.map(notif => (
                      <NotificationItem key={notif.id} notification={notif} onMarkRead={markAsRead} />
                    ))
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">No new notifications.</p>
                  )}
                </ScrollArea>
                 {workerNotifications.length > 0 && unreadCount > 0 && (
                    <div className="p-2 border-t">
                        <Button variant="link" size="sm" className="w-full text-primary" onClick={() => markAllAsRead(currentUser.uid)}>
                            Mark all as read
                        </Button>
                    </div>
                 )}
              </PopoverContent>
            </Popover>
          )}

          {currentUser && (
            <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout} disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
           )}

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
                  <Link href={currentUser && isProfileComplete ? "/dashboard" : (currentUser ? "/profile" : "/")} className="flex items-center gap-2" onClick={closeSheet} prefetch={false}>
                      <ShoppingCart className="h-7 w-7 text-primary" />
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
              <SheetClose onClick={closeSheet} /> {/* This should be SheetClose from ui/sheet for proper functionality */}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

