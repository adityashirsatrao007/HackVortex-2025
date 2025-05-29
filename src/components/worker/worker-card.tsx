
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ShieldCheck, Briefcase } from 'lucide-react';
import type { Worker } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/30 flex-shrink-0">
            <AvatarImage src={worker.avatarUrl || `https://placehold.co/64x64.png`} alt={worker.name} data-ai-hint="person avatar" />
            <AvatarFallback>{worker.name.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0"> {/* Added min-w-0 for flex child text truncation */}
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg mb-0.5 truncate">{worker.name}</CardTitle>
              {worker.isVerified && (
                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700 text-white shadow-sm whitespace-nowrap px-2 py-0.5">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
              <span>{worker.rating.toFixed(1)} ({worker.totalJobs || 0} jobs)</span>
            </div>
            {worker.hourlyRate && (
              <p className="text-md font-semibold text-primary">
                ₹{worker.hourlyRate}/hr
              </p>
            )}
          </div>
        </div>

        {worker.skills.length > 0 && (
          <div className="pt-1">
            <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Skills:</h4>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1 shadow-sm">{skill.charAt(0).toUpperCase() + skill.slice(1)}</Badge>
              ))}
            </div>
          </div>
        )}

        {worker.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 h-8 pt-1">
            {worker.bio}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md">
          <Link href={`/workers/${worker.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
