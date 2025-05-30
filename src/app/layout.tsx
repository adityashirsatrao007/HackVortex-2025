
'use client'; // Add this directive

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { KarigarKartLogoIcon } from '@/components/icons/karigar-kart-logo-icon';
import { useState, useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimatingOut, setSplashAnimatingOut] = useState(false);

  useEffect(() => {
    const animationOutTimer = setTimeout(() => {
      setSplashAnimatingOut(true);
    }, 2000); 

    const removeSplashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 

    return () => {
      clearTimeout(animationOutTimer);
      clearTimeout(removeSplashTimer);
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {showSplash && (
          <div
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-primary transition-opacity duration-500 ease-in-out
                        ${splashAnimatingOut ? 'opacity-0' : 'opacity-100'}`}
          >
            <KarigarKartLogoIcon className="h-20 w-20 text-primary-foreground animate-fadeInScaleUp" />
            <p className="mt-4 text-3xl font-bold text-primary-foreground animate-fadeInDelay">Karigar Kart</p>
            <p className="mt-1 text-lg text-primary-foreground/80 animate-fadeInDelayLonger">Local help, one tap away</p>
          </div>
        )}

        {!showSplash && ( 
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
