
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
        "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02]", 
        isSelected && "ring-2 ring-primary shadow-2xl scale-[1.01]",
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
          className="w-full h-48 object-cover" // Slightly taller image
        />
        {worker.isVerified && (
          <Badge variant="default" className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white shadow-md">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-1.5">{worker.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span>{worker.rating.toFixed(1)} ({worker.totalJobs || 0} jobs)</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Briefcase className="h-4 w-4 mr-1.5 text-primary" />
          <span className="font-medium">{worker.skills.join(', ')}</span>
        </div>
        {worker.hourlyRate && (
          <p className="text-lg font-semibold text-primary mb-2">
            ₹{worker.hourlyRate}/hr
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 h-8">
          {worker.bio || "No bio available."}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md">
          <Link href={`/workers/${worker.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
