
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, MapPin, Star, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ReviewForm } from '@/components/booking/review-form'; 
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface BookingHistoryItemProps {
  booking: Booking;
}

const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-500 hover:bg-yellow-600',
  accepted: 'bg-blue-500 hover:bg-blue-600',
  'in-progress': 'bg-indigo-500 hover:bg-indigo-600',
  completed: 'bg-green-500 hover:bg-green-600',
  cancelled: 'bg-slate-500 hover:bg-slate-600', // Neutral for cancelled
  rejected: 'bg-red-500 hover:bg-red-600',
};

export function BookingHistoryItem({ booking }: BookingHistoryItemProps) {
  const { userAppRole } = useAuth();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

  const canReview = userAppRole === 'customer' && booking.status === 'completed' && !booking.review;
  const canCancel = userAppRole === 'customer' && (booking.status === 'pending' || booking.status === 'accepted');
  const workerActions = userAppRole === 'worker'; // Placeholder for future worker actions

  const handleCancelBooking = () => {
    // Mock cancellation
    // In a real app, this would call an API
    booking.status = 'cancelled'; // Mutate mock data directly for demo
    toast({
      title: "Booking Cancelled",
      description: `Your booking with ${booking.workerName} has been cancelled.`,
    });
    // You might need a way to re-render the list or update parent state here
  };
  
  const handleReviewSubmitted = () => {
    setIsReviewDialogOpen(false);
    // Potentially refresh booking data or parent component state here
    // For now, the review form itself handles adding to MOCK_REVIEWS
  };


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl capitalize">{booking.serviceCategory} Service</CardTitle>
            <CardDescription className="text-xs">Booking ID: {booking.id.substring(0,13)}...</CardDescription>
          </div>
          <Badge className={`${statusColors[booking.status]} text-white text-xs px-3 py-1 shadow-sm`}>
            {booking.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm px-5 pb-4">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2.5 text-primary" />
          <span>{format(new Date(booking.dateTime), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2.5 text-primary" />
          {userAppRole === 'customer' && <span>Worker: <Link href={`/workers/${booking.workerId}`} className="text-primary hover:underline font-medium">{booking.workerName}</Link></span>}
          {userAppRole === 'worker' && <span>Customer: <span className="font-medium">{booking.customerName}</span></span>}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2.5 text-primary" />
          <span>Location: {booking.locationPreview}</span>
        </div>
        {booking.notes && (
          <div className="pt-2">
            <h4 className="font-semibold text-xs text-muted-foreground mb-1">Notes/Instructions:</h4>
            <p className="text-xs bg-secondary/50 p-2.5 rounded-md border border-secondary">{booking.notes}</p>
          </div>
        )}
         {booking.review && (
          <div className="pt-3 border-t mt-3">
            <h4 className="font-semibold text-xs flex items-center mb-1.5">
                <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-400 fill-yellow-400"/> Your Review:
            </h4>
            <div className="flex items-center mb-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < booking.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/60'}`} />
                ))}
            </div>
            <p className="text-xs text-muted-foreground italic">{booking.review.comment || "No comment."}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2 px-5 pb-5 pt-0">
        {canReview && (
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent shadow-sm hover:shadow-md">
                <Star className="mr-2 h-4 w-4" /> Rate & Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Review {booking.workerName} for {booking.serviceCategory}</DialogTitle>
              </DialogHeader>
              <ReviewForm bookingId={booking.id} workerName={booking.workerName} onFormSubmit={handleReviewSubmitted} />
            </DialogContent>
          </Dialog>
        )}
        {canCancel && (
          <Button variant="destructive" size="sm" onClick={handleCancelBooking} className="shadow hover:shadow-md">
            <Trash2 className="mr-2 h-4 w-4" /> Cancel Booking
          </Button>
        )}
        {workerActions && booking.status === 'pending' && (
             <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow hover:shadow-md">Accept Job</Button>
        )}
        {workerActions && booking.status === 'accepted' && (
             <Button variant="outline" size="sm" className="shadow hover:shadow-md">Mark In-Progress</Button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary">
            <MessageSquare className="mr-2 h-4 w-4" /> 
            {userAppRole === 'customer' ? 'Contact Worker' : 'Contact Customer'}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
