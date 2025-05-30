
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, ShieldCheck, Briefcase, Phone, MessageSquare, CalendarDays, Building } from 'lucide-react';
import type { Worker, Review as ReviewType } from '@/lib/types';
import { BookingRequestForm } from '@/components/booking/booking-request-form';
import { MOCK_REVIEWS } from '@/lib/constants'; 
import { formatDistanceToNow } from 'date-fns';

function ReviewCard({ review }: { review: ReviewType }) {
  return (
    <Card className="mb-4 bg-secondary/30 shadow-sm">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-semibold">{review.customerName}</CardTitle>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <p className="text-sm text-muted-foreground">{review.comment || "No comment provided."}</p>
      </CardContent>
    </Card>
  );
}


interface WorkerProfileDetailsProps {
  worker: Worker;
}

export function WorkerProfileDetails({ worker }: WorkerProfileDetailsProps) {
  // Simulate fetching reviews for this specific worker
  const workerReviews = MOCK_REVIEWS.filter(r => Math.random() > 0.3).slice(0, Math.floor(Math.random() * 4 + 2)); 
  
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left Column: Worker Info & Actions */}
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="items-center text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <Image
              src={worker.avatarUrl || `https://placehold.co/128x128.png`}
              alt={worker.name}
              data-ai-hint="person avatar"
              width={128}
              height={128}
              className="rounded-full mb-4 border-4 border-primary/60 shadow-lg object-cover"
            />
            <CardTitle className="text-2xl">{worker.name}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
              <span>{worker.rating.toFixed(1)} ({worker.totalJobs || 0} jobs)</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {worker.isVerified && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white shadow">
                  <ShieldCheck className="mr-1 h-4 w-4" /> Verified
                </Badge>
              )}
               {worker.aadhaarVerified && (
                <Badge variant="outline" className="text-green-700 border-green-500 bg-green-500/10 shadow-sm">
                  Aadhaar Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-6 py-6">
             <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow hover:shadow-md">
                  <CalendarDays className="mr-2 h-4 w-4" /> Book Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Request Booking with {worker.name}</DialogTitle>
                </DialogHeader>
                <BookingRequestForm worker={worker} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full shadow-sm hover:shadow-md">
              <MessageSquare className="mr-2 h-4 w-4" /> Message Worker
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
                 <Building className="mr-2 h-5 w-5 text-primary" /> Operating Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">Contact via platform message</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">Serves your general area</span>
            </div>
             {worker.hourlyRate && (
                <div className="flex items-center pt-1">
                    <span className="font-semibold text-primary text-lg">₹{worker.hourlyRate}/hr</span>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: About, Skills, Reviews */}
      <div className="md:col-span-2 space-y-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">About {worker.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {worker.bio || 'This worker has not provided a detailed bio yet. Contact them for more information about their experience and services.'}
            </p>
            {worker.selfieWithGpsUrl && (
                 <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Recent On-Site Selfie:</h4>
                    <Image src={worker.selfieWithGpsUrl} alt="Worker Selfie" data-ai-hint="worker selfie" width={150} height={150} className="rounded-lg border-2 border-secondary shadow-md object-cover" />
                 </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" /> Skills & Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {worker.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-base px-4 py-1.5 shadow-sm">{skill.charAt(0).toUpperCase() + skill.slice(1)}</Badge>
            ))}
            {worker.skills.length === 0 && <p className="text-muted-foreground">No specific skills listed by the worker.</p>}
          </CardContent>
        </Card>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Customer Reviews ({workerReviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {workerReviews.length > 0 ? (
              workerReviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-muted-foreground py-4 text-center">No reviews yet for this worker. Be the first to book and share your experience!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
