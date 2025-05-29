
import { WorkerProfileDetails } from '@/components/worker/worker-profile-details';
import { MOCK_WORKERS } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkerProfilePageProps {
  params: {
    workerId: string;
  };
}

async function getWorkerData(workerId: string) {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const worker = MOCK_WORKERS.find(w => w.id === workerId);
  return worker;
}

export default async function WorkerProfilePage({ params }: WorkerProfilePageProps) {
  const worker = await getWorkerData(params.workerId);

  if (!worker) {
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
