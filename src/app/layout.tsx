
'use client'; // Add this directive

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { KarigarKartLogoIcon } from '@/components/icons/karigar-kart-logo-icon'; // Using the worker-in-cart logo
import { useState, useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Removed metadata export as it's not allowed in Client Components
// export const metadata: Metadata = {
//   title: 'Karigar Kart',
//   description: 'Find and book verified artisans and workers.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimatingOut, setSplashAnimatingOut] = useState(false);

  useEffect(() => {
    // Timer to start the fade-out animation of the splash screen
    const animationOutTimer = setTimeout(() => {
      setSplashAnimatingOut(true);
    }, 2000); // Start animating out after 2 seconds

    // Timer to remove the splash screen from the DOM after fade-out is complete
    const removeSplashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Total duration: 2s display + 0.5s fade-out

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
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out
                        ${splashAnimatingOut ? 'opacity-0' : 'opacity-100'}`}
          >
            <KarigarKartLogoIcon className="h-20 w-20 text-primary animate-fadeInScaleUp" />
            <p className="mt-4 text-xl font-semibold text-primary animate-fadeInDelay">Karigar Kart</p>
          </div>
        )}

        {!showSplash && ( // Render main content only when splash is completely gone
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
