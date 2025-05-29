
'use client';

import Image from 'next/image';
import { MapPin, User, Star, Briefcase } from 'lucide-react'; // Added Star and Briefcase
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import type { Worker } from '@/lib/types';
import { MOCK_WORKERS } from '@/lib/constants'; 
import { Badge } from '@/components/ui/badge'; // Added Badge

interface WorkerMapProps {
  workers?: Worker[]; 
  selectedWorkerId?: string;
  onWorkerSelect?: (workerId: string) => void;
}

const markerPositions = [
  { top: '20%', left: '30%' },
  { top: '50%', left: '60%' },
  { top: '35%', left: '75%' },
  { top: '65%', left: '20%' },
  { top: '45%', left: '45%' },
];


export function WorkerMap({ workers = MOCK_WORKERS, selectedWorkerId, onWorkerSelect }: WorkerMapProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Nearby Workers Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border-2 border-primary/20 bg-secondary/30 shadow-inner">
          <Image
            src="https://placehold.co/1200x600.png" // A generic map background
            alt="Map Placeholder"
            data-ai-hint="city map"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
          />
          {/* Mock worker markers */}
          {workers.slice(0, markerPositions.length).map((worker, index) => (
            <Popover key={worker.id}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => onWorkerSelect?.(worker.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 p-1 transition-transform hover:scale-110"
                  style={{ top: markerPositions[index].top, left: markerPositions[index].left }}
                  aria-label={`View ${worker.name}`}
                >
                  <MapPin
                    className={`h-10 w-10 transition-colors duration-200 drop-shadow-md ${
                      selectedWorkerId === worker.id ? 'text-accent fill-accent/40' : 'text-primary fill-primary/40'
                    } hover:text-accent`}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 shadow-xl border-primary/50">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={worker.avatarUrl || "https://placehold.co/48x48.png"}
                      alt={worker.name}
                      data-ai-hint="person avatar"
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-primary/50"
                    />
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{worker.name}</h4>
                      {worker.isVerified && <Badge variant="default" className="mt-1 text-xs bg-green-600 hover:bg-green-700 text-white">Verified</Badge>}
                    </div>
                  </div>
                  <div className="text-sm space-y-1.5 mb-3">
                    <div className="flex items-center text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        <span>{worker.skills.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />
                        <span>{worker.rating}/5 ({worker.totalJobs || 0} jobs)</span>
                    </div>
                    {worker.hourlyRate && (
                        <p className="font-semibold text-primary">₹{worker.hourlyRate}/hr</p>
                    )}
                  </div>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                    <Link href={`/workers/${worker.id}`}>View Full Profile</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Note: This is a simulated map view. Markers are illustrative.
        </p>
      </CardContent>
    </Card>
  );
}
