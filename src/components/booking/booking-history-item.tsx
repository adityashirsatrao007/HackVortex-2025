'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, MapPin, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReviewForm } from '@/components/booking/review-form'; // Ensure this component exists or is created

interface BookingHistoryItemProps {
  booking: Booking;
}

const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-500',
  accepted: 'bg-blue-500',
  'in-progress': 'bg-indigo-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-orange-500',
};

export function BookingHistoryItem({ booking }: BookingHistoryItemProps) {
  const canReview = booking.status === 'completed' && !booking.review;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl capitalize">{booking.serviceCategory} Service</CardTitle>
            <CardDescription>Booking ID: {booking.id}</CardDescription>
          </div>
          <Badge className={`${statusColors[booking.status]} text-white`}>
            {booking.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span>{format(new Date(booking.dateTime), "PPP 'at' p")}</span>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-primary" />
          <span>Worker: <Link href={`/workers/${booking.workerId}`} className="text-primary hover:underline">{booking.workerName}</Link></span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>Location: {booking.locationPreview}</span>
        </div>
        {booking.notes && (
          <div className="pt-2">
            <h4 className="font-semibold text-xs text-muted-foreground">Notes:</h4>
            <p className="text-xs bg-secondary/50 p-2 rounded-md">{booking.notes}</p>
          </div>
        )}
         {booking.review && (
          <div className="pt-2 border-t mt-3">
            <h4 className="font-semibold text-xs flex items-center mb-1">
                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400"/> Your Review:
            </h4>
            <div className="flex items-center mb-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < booking.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
            </div>
            <p className="text-xs text-muted-foreground italic">{booking.review.comment || "No comment."}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {canReview && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                <Star className="mr-2 h-4 w-4" /> Rate & Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Review {booking.workerName} for {booking.serviceCategory}</DialogTitle>
              </DialogHeader>
              <ReviewForm bookingId={booking.id} workerName={booking.workerName} />
            </DialogContent>
          </Dialog>
        )}
        {booking.status === 'pending' || booking.status === 'accepted' ? (
          <Button variant="destructiveOutline" size="sm">Cancel Booking</Button>
        ): null}
        <Button variant="ghost" size="sm">
           <MessageSquare className="mr-2 h-4 w-4" /> Contact Worker
        </Button>
      </CardFooter>
    </Card>
  );
}
