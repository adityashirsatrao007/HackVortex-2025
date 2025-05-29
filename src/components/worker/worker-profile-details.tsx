'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, ShieldCheck, Briefcase, Phone, MessageSquare, CalendarDays } from 'lucide-react';
import type { Worker, Review as ReviewType } from '@/lib/types';
import { BookingRequestForm } from '@/components/booking/booking-request-form';
import { MOCK_REVIEWS } from '@/lib/constants'; // Using mock reviews
import { ReviewForm } from '@/components/booking/review-form'; // Will create this

function ReviewCard({ review }: { review: ReviewType }) {
  return (
    <Card className="mb-4 bg-secondary/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{review.customerName}</CardTitle>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">{new Date(review.createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-sm text-muted-foreground">{review.comment || "No comment provided."}</p>
      </CardContent>
    </Card>
  );
}


interface WorkerProfileDetailsProps {
  worker: Worker;
}

export function WorkerProfileDetails({ worker }: WorkerProfileDetailsProps) {
  const workerReviews = MOCK_REVIEWS.slice(0, Math.floor(Math.random() * MOCK_REVIEWS.length + 1)); // Random reviews for demo
  
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left Column: Worker Info & Actions */}
      <div className="md:col-span-1 space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center p-6">
            <Image
              src={worker.avatarUrl || `https://placehold.co/128x128.png`}
              alt={worker.name}
              data-ai-hint="person avatar"
              width={128}
              height={128}
              className="rounded-full mb-4 border-4 border-primary/50 shadow-md"
            />
            <CardTitle className="text-2xl">{worker.name}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
              <span>{worker.rating.toFixed(1)} ({worker.totalJobs || 0} jobs completed)</span>
            </div>
            {worker.isVerified && (
              <Badge variant="default" className="mt-2 bg-green-500 hover:bg-green-600 text-white">
                <ShieldCheck className="mr-1 h-4 w-4" /> Verified Professional
              </Badge>
            )}
             {worker.aadhaarVerified && (
              <Badge variant="outline" className="mt-1 text-green-700 border-green-500">
                Aadhaar Verified
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
             <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" /> Book Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Book {worker.name}</DialogTitle>
                </DialogHeader>
                <BookingRequestForm worker={worker} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" /> Message Worker
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              <span>+91 XXXXX-XXXXX (Hidden)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span>Located near you (general area)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: About, Skills, Reviews */}
      <div className="md:col-span-2 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">About {worker.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {worker.bio || 'This worker has not provided a detailed bio yet.'}
            </p>
            {worker.selfieWithGpsUrl && (
                 <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Recent On-Site Selfie:</h4>
                    <Image src={worker.selfieWithGpsUrl} alt="Worker Selfie" data-ai-hint="worker selfie" width={150} height={150} className="rounded-md border" />
                 </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" /> Skills & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {worker.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">{skill.charAt(0).toUpperCase() + skill.slice(1)}</Badge>
            ))}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Customer Reviews ({workerReviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto pr-2">
            {workerReviews.length > 0 ? (
              workerReviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-muted-foreground">No reviews yet for this worker.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
