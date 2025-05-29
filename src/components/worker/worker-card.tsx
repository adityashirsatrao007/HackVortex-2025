
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ShieldCheck, Briefcase } from 'lucide-react';
import type { Worker } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkerCardProps {
  worker: Worker;
  className?: string;
  isSelected?: boolean;
  onSelect?: (workerId: string) => void;
}

export function WorkerCard({ worker, className, isSelected, onSelect }: WorkerCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out", 
        isSelected && "ring-2 ring-primary shadow-xl", // Increased shadow for selected
        className
      )}
      onClick={() => onSelect?.(worker.id)}
    >
      <CardHeader className="p-0 relative">
        <Image
          src={worker.avatarUrl || `https://placehold.co/300x200.png`}
          alt={worker.name}
          data-ai-hint="person portrait"
          width={300}
          height={200}
          className="w-full h-40 object-cover"
        />
        {worker.isVerified && (
          <Badge variant="default" className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white">
            <ShieldCheck className="mr-1 h-3 w-3" /> Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-1">{worker.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span>{worker.rating.toFixed(1)} ({worker.totalJobs || 0} jobs)</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Briefcase className="h-4 w-4 mr-1 text-primary" />
          <span>{worker.skills.join(', ')}</span>
        </div>
        {worker.hourlyRate && (
          <p className="text-sm font-semibold text-foreground mb-2">
            ₹{worker.hourlyRate}/hr
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 h-8">
          {worker.bio || "No bio available."}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-primary hover:bg-primary/80">
          <Link href={`/workers/${worker.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
