
'use client'; // Make it a client component

import { useState, useEffect } from 'react';
import { WorkerProfileDetails } from '@/components/worker/worker-profile-details';
import { MOCK_WORKERS } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Worker } from '@/lib/types';

interface WorkerProfilePageProps {
  params: {
    workerId: string;
  };
}

export default function WorkerProfilePage({ params }: WorkerProfilePageProps) {
  const [worker, setWorker] = useState<Worker | undefined | null>(undefined); // undefined: loading, null: not found

  useEffect(() => {
    // Simulate a small delay and then find the worker
    const timer = setTimeout(() => {
      const foundWorker = MOCK_WORKERS.find(w => w.id === params.workerId);
      setWorker(foundWorker || null); // Set to null if not found, so we can differentiate from loading
    }, 100); // Small delay to mimic async fetch and allow MOCK_WORKERS to potentially initialize

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [params.workerId]);

  if (worker === undefined) { // Loading state
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading worker profile...</p>
      </div>
    );
  }

  if (worker === null) { // Not found state
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-xl">Worker Not Found</AlertTitle>
          <AlertDescription>
            The worker profile you are looking for does not exist or could not be loaded. Please check the ID or try again later.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-6 shadow hover:shadow-md">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Worker found
  return (
    <div className="container mx-auto py-8">
        <Button asChild variant="outline" className="mb-6 shadow hover:shadow-md">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Worker Search
            </Link>
        </Button>
      <WorkerProfileDetails worker={worker} />
    </div>
  );
}
