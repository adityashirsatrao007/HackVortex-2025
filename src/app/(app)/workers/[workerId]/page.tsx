import { WorkerProfileDetails } from '@/components/worker/worker-profile-details';
import { MOCK_WORKERS } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkerProfilePageProps {
  params: {
    workerId: string;
  };
}

// This function would typically fetch data from a backend
async function getWorkerData(workerId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const worker = MOCK_WORKERS.find(w => w.id === workerId);
  return worker;
}

export default async function WorkerProfilePage({ params }: WorkerProfilePageProps) {
  const worker = await getWorkerData(params.workerId);

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Worker Not Found</AlertTitle>
          <AlertDescription>
            The worker profile you are looking for does not exist or could not be loaded.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <WorkerProfileDetails worker={worker} />
    </div>
  );
}

// Optional: Generate static paths if you have a known list of workers at build time
// export async function generateStaticParams() {
//   return MOCK_WORKERS.map(worker => ({
//     workerId: worker.id,
//   }));
// }
