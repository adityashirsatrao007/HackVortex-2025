
'use client';

import { useState } from 'react';
import { WorkerMap } from '@/components/map/worker-map';
import { MapFilter } from '@/components/map/map-filter';
import type { Worker, ServiceCategory } from '@/lib/types';
import { MOCK_WORKERS } from '@/lib/constants';
import { WorkerCard } from '@/components/worker/worker-card';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { userAppRole, currentUser } = useAuth();
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);

  const handleFilterChange = (filters: { category?: string; query?: string }) => {
    let workers = MOCK_WORKERS;
    if (filters.category) {
      workers = workers.filter(worker => worker.skills.includes(filters.category as ServiceCategory));
    }
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      workers = workers.filter(worker =>
        worker.name.toLowerCase().includes(queryLower) ||
        worker.skills.some(skill => skill.toLowerCase().includes(queryLower))
      );
    }
    setFilteredWorkers(workers);
    setSelectedWorkerId(undefined); 
  };

  const handleWorkerSelectOnMap = (workerId: string) => {
    setSelectedWorkerId(workerId);
  };

  if (userAppRole === 'worker') {
    // Worker Dashboard View
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Worker Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your jobs, schedule, and profile. Welcome, {currentUser?.displayName || 'Worker'}!
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Coming Soon!</AlertTitle>
              <AlertDescription>
                Your personalized worker dashboard with job management, earnings, and more is under construction.
                For now, please use the "Schedule" and "Profile" sections.
              </AlertDescription>
            </Alert>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="text-lg">New Job Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">No new requests currently.</p>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Confirmed Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">0</p>
                         <p className="text-xs text-muted-foreground">Check your schedule for upcoming jobs.</p>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Customer Dashboard View (default)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Local Professionals</h1>
        <p className="text-muted-foreground">
          Discover skilled workers in your area. Use the filters to narrow down your search.
        </p>
      </div>
      
      <MapFilter onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WorkerMap workers={filteredWorkers} selectedWorkerId={selectedWorkerId} onWorkerSelect={handleWorkerSelectOnMap} />
        </div>
        <div className="lg:col-span-1 space-y-4 max-h-[550px] overflow-y-auto pr-2">
            <h2 className="text-xl font-semibold">Available Workers ({filteredWorkers.length})</h2>
            {filteredWorkers.length > 0 ? (
                filteredWorkers.map(worker => (
                    <WorkerCard 
                        key={worker.id} 
                        worker={worker} 
                        isSelected={worker.id === selectedWorkerId}
                        onSelect={() => setSelectedWorkerId(worker.id)}
                    />
                ))
            ) : (
                <p className="text-muted-foreground">No workers found matching your criteria.</p>
            )}
        </div>
      </div>
    </div>
  );
}
