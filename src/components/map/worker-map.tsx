'use client';

import Image from 'next/image';
import { MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import type { Worker } from '@/lib/types';
import { MOCK_WORKERS } from '@/lib/constants'; // Using mock workers for demo

interface WorkerMapProps {
  workers?: Worker[]; // Optional: pass workers or use MOCK_WORKERS
  selectedWorkerId?: string;
  onWorkerSelect?: (workerId: string) => void;
}

// Simplified representation of marker positions. 
// In a real map, these would be calculated based on worker locations and map bounds.
const markerPositions = [
  { top: '20%', left: '30%' },
  { top: '50%', left: '60%' },
  { top: '35%', left: '75%' },
  { top: '65%', left: '20%' },
  { top: '45%', left: '45%' },
];


export function WorkerMap({ workers = MOCK_WORKERS, selectedWorkerId, onWorkerSelect }: WorkerMapProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Nearby Workers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border bg-secondary/30">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="Map Placeholder"
            data-ai-hint="map city"
            layout="fill"
            objectFit="cover"
            className="opacity-70"
          />
          {/* Mock worker markers */}
          {workers.slice(0, markerPositions.length).map((worker, index) => (
            <Popover key={worker.id}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => onWorkerSelect?.(worker.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 p-1"
                  style={{ top: markerPositions[index].top, left: markerPositions[index].left }}
                  aria-label={`View ${worker.name}`}
                >
                  <MapPin
                    className={`h-8 w-8 transition-colors duration-200 ${
                      selectedWorkerId === worker.id ? 'text-accent fill-accent/30' : 'text-primary fill-primary/30'
                    } hover:text-accent`}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={worker.avatarUrl || "https://placehold.co/40x40.png"}
                      alt={worker.name}
                      data-ai-hint="person avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-md">{worker.name}</h4>
                      <p className="text-xs text-muted-foreground">{worker.skills.join(', ')}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-1">Rating: {worker.rating}/5</p>
                  {worker.isVerified && <p className="text-xs text-green-600">Verified</p>}
                  <Button size="sm" className="w-full mt-3" asChild>
                    <Link href={`/workers/${worker.id}`}>View Profile</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Note: This is a simulated map. Markers are illustrative.
        </p>
      </CardContent>
    </Card>
  );
}
