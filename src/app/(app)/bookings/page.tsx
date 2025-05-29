'use client';

import { useState } from 'react';
import { BookingHistoryItem } from '@/components/booking/booking-history-item';
import type { Booking } from '@/lib/types';
import { MOCK_BOOKINGS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, CalendarClock, CalendarCheck2, CalendarX2 } from 'lucide-react';

export default function BookingHistoryPage() {
  // Assuming current user is 'customer-1' for mock data filtering
  const currentUserBookings = MOCK_BOOKINGS.filter(b => b.customerId === 'customer-1');

  const upcomingBookings = currentUserBookings
    .filter(b => ['pending', 'accepted', 'in-progress'].includes(b.status) && new Date(b.dateTime) >= new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastBookings = currentUserBookings
    .filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status) || new Date(b.dateTime) < new Date())
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const allBookings = [...upcomingBookings, ...pastBookings];


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
            <ListChecks className="mr-3 h-8 w-8 text-primary" />
            My Bookings
        </h1>
        <p className="text-muted-foreground">
          View and manage your service bookings.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming"><CalendarClock className="mr-1 h-4 w-4"/>Upcoming</TabsTrigger>
          <TabsTrigger value="past"><CalendarCheck2 className="mr-1 h-4 w-4"/>Past</TabsTrigger>
          <TabsTrigger value="cancelled"><CalendarX2 className="mr-1 h-4 w-4"/>Cancelled/Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderBookingList(allBookings)}
        </TabsContent>
        <TabsContent value="upcoming">
          {renderBookingList(currentUserBookings.filter(b => ['pending', 'accepted', 'in-progress'].includes(b.status)))}
        </TabsContent>
        <TabsContent value="past">
          {renderBookingList(currentUserBookings.filter(b => b.status === 'completed'))}
        </TabsContent>
        <TabsContent value="cancelled">
          {renderBookingList(currentUserBookings.filter(b => ['cancelled', 'rejected'].includes(b.status)))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
