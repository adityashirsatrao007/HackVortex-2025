
'use client';

import { useState, useEffect } from 'react';
import { BookingHistoryItem } from '@/components/booking/booking-history-item';
import type { Booking } from '@/lib/types';
import { MOCK_BOOKINGS, MOCK_WORKERS, MOCK_CUSTOMERS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, CalendarClock, CalendarCheck2, CalendarX2, Briefcase, ClockHistory } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function BookingHistoryPage() {
  const { currentUser, userAppRole } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [pageTitle, setPageTitle] = useState("My Bookings");
  const [pageDescription, setPageDescription] = useState("View and manage your service bookings.");

  useEffect(() => {
    if (!currentUser) return;

    let bookingsToDisplay: Booking[] = [];

    if (userAppRole === 'worker') {
      setPageTitle("My Job Schedule");
      setPageDescription("Manage your assigned jobs and requests.");
      // Mock: Find the worker profile that matches the logged-in user's email
      const currentWorkerProfile = MOCK_WORKERS.find(w => w.email === currentUser.email);
      if (currentWorkerProfile) {
        bookingsToDisplay = MOCK_BOOKINGS.filter(b => b.workerId === currentWorkerProfile.id);
      } else {
        // Fallback if no matching worker email (e.g. user signed up with different email)
        // This indicates a mismatch in mock data setup or a new worker not in MOCK_WORKERS
        console.warn("Worker profile not found for email:", currentUser.email, "Displaying no jobs.");
      }
    } else { // Customer or default
      setPageTitle("My Bookings");
      setPageDescription("View and manage your service bookings.");
      // Mock: Find the customer profile that matches the logged-in user's email
      const currentCustomerProfile = MOCK_CUSTOMERS.find(c => c.email === currentUser.email);
      if (currentCustomerProfile) {
        bookingsToDisplay = MOCK_BOOKINGS.filter(b => b.customerId === currentCustomerProfile.id);
      } else {
         // Fallback: use display name if available and matches a mock customer name (less reliable)
        const customerByName = MOCK_CUSTOMERS.find(c => c.name === currentUser.displayName);
        if (customerByName) {
            bookingsToDisplay = MOCK_BOOKINGS.filter(b => b.customerId === customerByName.id);
        } else {
            console.warn("Customer profile not found for email:", currentUser.email, "Displaying no bookings.");
        }
      }
    }
    setUserBookings(bookingsToDisplay.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
  }, [currentUser, userAppRole]);


  const upcomingBookings = userBookings.filter(b => 
    ['pending', 'accepted', 'in-progress'].includes(b.status) && new Date(b.dateTime) >= new Date()
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastBookings = userBookings.filter(b => 
    b.status === 'completed' || new Date(b.dateTime) < new Date() && !['pending', 'accepted', 'in-progress'].includes(b.status)
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const cancelledRejectedBookings = userBookings.filter(b => 
    ['cancelled', 'rejected'].includes(b.status)
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


  const renderBookingList = (bookings: Booking[]) => {
    if (bookings.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No bookings in this category.</p>;
    }
    return (
      <div className="space-y-6">
        {bookings.map(booking => (
          <BookingHistoryItem key={booking.id} booking={booking} />
        ))}
      </div>
    );
  };

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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming"><CalendarClock className="mr-1 h-4 w-4"/>Upcoming</TabsTrigger>
          <TabsTrigger value="past"><ClockHistory className="mr-1 h-4 w-4"/>Past</TabsTrigger>
          <TabsTrigger value="cancelled"><CalendarX2 className="mr-1 h-4 w-4"/>Cancelled/Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderBookingList(userBookings)}
        </TabsContent>
        <TabsContent value="upcoming">
          {renderBookingList(upcomingBookings)}
        </TabsContent>
        <TabsContent value="past">
          {renderBookingList(pastBookings)}
        </TabsContent>
        <TabsContent value="cancelled">
          {renderBookingList(cancelledRejectedBookings)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
