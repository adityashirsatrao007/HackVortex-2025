
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookingHistoryItem } from '@/components/booking/booking-history-item';
import type { Booking } from '@/lib/types';
import { MOCK_BOOKINGS, MOCK_WORKERS, MOCK_CUSTOMERS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, CalendarClock, CalendarX2, Briefcase, History, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function BookingHistoryPage() {
  const { currentUser, userAppRole } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [pageTitle, setPageTitle] = useState("My Bookings");
  const [pageDescription, setPageDescription] = useState("View and manage your service bookings.");
  // State to trigger re-fetch/re-filter of bookings
  const [bookingUpdateCounter, setBookingUpdateCounter] = useState(0);


  const fetchUserBookings = useCallback(() => {
    if (!currentUser) return;

    let bookingsToDisplay: Booking[] = [];
    const allBookings = [...MOCK_BOOKINGS]; // Use a fresh copy

    if (userAppRole === 'worker') {
      setPageTitle("My Job Schedule");
      setPageDescription("Manage your assigned jobs and requests.");
      const currentWorkerProfile = MOCK_WORKERS.find(w => w.email === currentUser.email || w.id === currentUser.uid);
      if (currentWorkerProfile) {
        bookingsToDisplay = allBookings.filter(b => b.workerId === currentWorkerProfile.id);
      } else {
        console.warn("Worker profile not found for email:", currentUser.email, "Displaying no jobs.");
      }
    } else {
      setPageTitle("My Bookings");
      setPageDescription("View and manage your service bookings.");
      const currentCustomerProfile = MOCK_CUSTOMERS.find(c => c.email === currentUser.email || c.id === currentUser.uid);
      if (currentCustomerProfile) {
        bookingsToDisplay = allBookings.filter(b => b.customerId === currentCustomerProfile.id);
      } else {
         console.warn("Customer profile not found for email:", currentUser.email, "Displaying no bookings.");
      }
    }
    setUserBookings(bookingsToDisplay.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
  }, [currentUser, userAppRole]);


  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings, bookingUpdateCounter]); // Re-fetch when counter changes

  const handleBookingUpdate = () => {
    setBookingUpdateCounter(prev => prev + 1);
  };

  const upcomingBookings = userBookings.filter(b =>
    ['pending', 'accepted', 'in-progress'].includes(b.status) && new Date(b.dateTime) >= new Date()
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastBookings = userBookings.filter(b =>
    b.status === 'completed' || (new Date(b.dateTime) < new Date() && !['pending', 'accepted', 'in-progress', 'cancelled', 'rejected'].includes(b.status))
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const issueBookings = userBookings.filter(b =>
    ['cancelled', 'rejected'].includes(b.status) || (new Date(b.dateTime) < new Date() && ['pending', 'accepted', 'in-progress'].includes(b.status))
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


  const renderBookingList = (bookings: Booking[], emptyMessage: string, icon?: React.ReactNode) => {
    if (bookings.length === 0) {
      return (
        <Card className="shadow-md border-dashed border-muted-foreground/30">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            {icon || <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />}
            <p className="text-muted-foreground">{emptyMessage}</p>
            {userAppRole === 'customer' && (
                <Button asChild variant="default" className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground shadow hover:shadow-md">
                    <Link href="/dashboard">Find a Worker</Link>
                </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-6">
        {bookings.map(booking => (
          <BookingHistoryItem key={booking.id} booking={booking} onBookingUpdate={handleBookingUpdate} />
        ))}
      </div>
    );
  };

  const TABS = [
    { value: "upcoming", label: "Upcoming", icon: <CalendarClock className="mr-1.5 h-4 w-4"/>, data: upcomingBookings, emptyMsg: "No upcoming bookings.", emptyIcon: <CalendarClock className="h-12 w-12 text-muted-foreground/50 mb-4" /> },
    { value: "past", label: "Past & Completed", icon: <History className="mr-1.5 h-4 w-4"/>, data: pastBookings, emptyMsg: "No past or completed bookings.", emptyIcon: <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" /> },
    { value: "issues", label: "Issues/Cancelled", icon: <CalendarX2 className="mr-1.5 h-4 w-4"/>, data: issueBookings, emptyMsg: "No cancelled, rejected or unresolved past bookings.", emptyIcon: <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            {userAppRole === 'worker' ? <Briefcase className="mr-3 h-8 w-8 text-primary" /> : <ListChecks className="mr-3 h-8 w-8 text-primary" />}
            {pageTitle}
        </h1>
        <p className="text-muted-foreground">
          {pageDescription}
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 shadow-sm">
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="py-2.5 text-sm">
              {tab.icon}{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {renderBookingList(tab.data, tab.emptyMsg, tab.emptyIcon)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
